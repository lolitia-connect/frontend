import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ui = join(root, "packages/ui");
const snapshotPath = join(ui, "backend-contract.json");
const backend = resolve(root, process.env.BACKEND_PATH || "../backend");

if (process.argv.includes("--refresh")) {
  const go =
    process.env.GO_BINARY ||
    (process.platform === "win32" &&
    existsSync("C:/Program Files/Go/bin/go.exe")
      ? "C:/Program Files/Go/bin/go.exe"
      : "go");
  const output = execFileSync(
    go,
    ["run", join(root, "scripts/backend-contract.go"), backend],
    { encoding: "utf8" }
  );
  const snapshot = JSON.parse(output);
  snapshot.backendCommit = execFileSync(
    "git",
    ["-C", backend, "rev-parse", "HEAD"],
    { encoding: "utf8" }
  ).trim();
  snapshot.backendDirty = Boolean(
    execFileSync(
      "git",
      ["-C", backend, "status", "--porcelain", "--untracked-files=normal"],
      { encoding: "utf8" }
    ).trim()
  );
  writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);
}

const contract = JSON.parse(
  readFileSync(snapshotPath, "utf8").replace(/^\uFEFF/, "")
);
const tags = (tag = "") =>
  Object.fromEntries(
    [...tag.matchAll(/(\w+):"([^"]*)"/g)].map((match) => [match[1], match[2]])
  );
const reference = (name) => ({ $ref: `#/components/schemas/${name}` });

function schemaFor(type, tag = "") {
  if (type.startsWith("*"))
    return { ...schemaFor(type.slice(1), tag), nullable: true };
  if (type.startsWith("[]"))
    return { type: "array", items: schemaFor(type.slice(2)) };
  if (type.startsWith("map["))
    return {
      type: "object",
      additionalProperties: schemaFor(type.slice(type.indexOf("]") + 1)),
    };
  if (
    tag.split(",").includes("string") ||
    type === "string" ||
    type === "time.Time"
  )
    return { type: "string" };
  if (type === "bool") return { type: "boolean" };
  if (/^(?:u?int\d*|byte)$/.test(type))
    return { type: "integer", format: "int64" };
  if (/^float/.test(type)) return { type: "number" };
  if (contract.types[type]) return reference(type);
  return {};
}

function fieldsFor(name) {
  return (contract.types[name] || []).flatMap((field) =>
    field.embedded ? fieldsFor(field.type.replace(/^\*/, "")) : [field]
  );
}

const schemas = {};
for (const name of Object.keys(contract.types).sort()) {
  const properties = {};
  const required = [];
  for (const field of fieldsFor(name)) {
    const tag = tags(field.tag);
    const annotation = tag.json || tag.form || tag.path || field.name;
    const property = annotation.split(",")[0];
    if (property === "-") continue;
    properties[property] = schemaFor(field.type, annotation);
    if (
      !(/(?:optional|omitempty)/.test(annotation) || field.type.startsWith("*"))
    )
      required.push(property);
  }
  schemas[name] = {
    type: "object",
    properties,
    ...(required.length ? { required } : {}),
  };
}

const paths = {};
const canonicalPath = (path) =>
  path.replace(/\/$/, "").replace(/:[^/]+|\{[^}]+\}/g, "{}");
const browserEndpoints = contract.endpoints.filter((endpoint) =>
  /^\/v[12]\/(admin|public|common|auth)\b/.test(endpoint.path)
);
for (const endpoint of browserEndpoints) {
  const path = endpoint.path.replace(/:([^/]+)/g, "{$1}");
  const parameters = [...path.matchAll(/\{([^}]+)\}/g)].map((match) => ({
    name: match[1],
    in: "path",
    required: true,
    schema: { type: "string" },
  }));
  const requestFields = fieldsFor(endpoint.request);
  const queryRequest = ["GET", "HEAD"].includes(endpoint.method);
  for (const field of requestFields) {
    const tag = tags(field.tag);
    if (tag.path || !(queryRequest || tag.form)) continue;
    const annotation = tag.form || tag.json || field.name;
    parameters.push({
      name: annotation.split(",")[0],
      in: "query",
      required: !(
        /(?:optional|omitempty)/.test(annotation) || field.type.startsWith("*")
      ),
      schema: schemaFor(field.type, annotation),
    });
  }
  const response = {
    type: "object",
    properties: {
      code: { type: "integer" },
      msg: { type: "string" },
      ...(endpoint.response
        ? { data: reference(endpoint.response) }
        : { data: {} }),
    },
  };
  const operation = {
    tags: ["backend"],
    parameters,
    responses: {
      200: {
        description:
          endpoint.contentType === "text/event-stream"
            ? "Order event stream"
            : "Local backend result envelope",
        content: {
          [endpoint.contentType || "application/json"]: {
            schema:
              endpoint.contentType === "text/event-stream"
                ? { type: "string" }
                : response,
          },
        },
      },
    },
  };
  if (!queryRequest && requestFields.some((field) => tags(field.tag).json))
    operation.requestBody = {
      required: true,
      content: { "application/json": { schema: reference(endpoint.request) } },
    };
  paths[path] ||= {};
  paths[path][endpoint.method.toLowerCase()] = operation;
}
const openapi = {
  openapi: "3.0.3",
  info: {
    title: "Lolitia local backend",
    version: contract.backendCommit || "local",
  },
  paths,
  components: { schemas },
};
const openapiPath = join(ui, "backend-openapi.json");
const formattedOpenapi = execFileSync(
  process.execPath,
  [
    join(root, "node_modules/@biomejs/biome/bin/biome"),
    "format",
    `--stdin-file-path=${openapiPath}`,
  ],
  { cwd: root, encoding: "utf8", input: JSON.stringify(openapi) }
);
if (process.argv.includes("--verify-generated")) {
  if (readFileSync(openapiPath, "utf8") !== formattedOpenapi)
    throw new Error("Backend OpenAPI is stale. Run bun run api:refresh.");
} else writeFileSync(openapiPath, formattedOpenapi);

function filesIn(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? filesIn(path)
      : /\.[cm]?[jt]sx?$/.test(entry.name)
        ? [path]
        : [];
  });
}

const known = new Set(
  contract.endpoints.map(
    (endpoint) => `${endpoint.method} ${canonicalPath(endpoint.path)}`
  )
);
const usedImports = new Set();
const reachable = new Set();
function visitModule(path, appRoot) {
  if (reachable.has(path)) return;
  reachable.add(path);
  const source = ts.createSourceFile(
    path,
    readFileSync(path, "utf8"),
    ts.ScriptTarget.Latest,
    true
  );
  const inspect = (node) => {
    const specifier =
      ts.isImportDeclaration(node) || ts.isExportDeclaration(node)
        ? node.moduleSpecifier
        : ts.isCallExpression(node) &&
            node.expression.kind === ts.SyntaxKind.ImportKeyword
          ? node.arguments[0]
          : undefined;
    if (specifier && ts.isStringLiteral(specifier)) {
      const value = specifier.text;
      const base = value.startsWith("@/")
        ? join(appRoot, value.slice(2))
        : value.startsWith(".")
          ? resolve(dirname(path), value)
          : undefined;
      if (base) {
        const dependency = [
          base,
          `${base}.tsx`,
          `${base}.ts`,
          join(base, "index.tsx"),
          join(base, "index.ts"),
        ].find(
          (candidate) => existsSync(candidate) && /\.[jt]sx?$/.test(candidate)
        );
        if (dependency) visitModule(dependency, appRoot);
      }
    }
    ts.forEachChild(node, inspect);
  };
  inspect(source);
}
for (const app of ["admin", "user"]) {
  const appRoot = join(root, "apps", app, "src");
  // Next.js has no single entry module (the Vite-era `src/main.tsx`); every
  // file under the `app/` router directory is an entry point.
  for (const entry of filesIn(join(root, "apps", app, "app")))
    visitModule(entry, appRoot);
}
for (const app of ["admin", "user"]) {
  for (const path of [
    ...filesIn(join(root, "apps", app, "app")),
    ...filesIn(join(root, "apps", app, "src")),
  ]) {
    if (/\.(test|spec)\./.test(path) || !reachable.has(path)) continue;
    const source = ts.createSourceFile(
      path,
      readFileSync(path, "utf8"),
      ts.ScriptTarget.Latest,
      true
    );
    for (const declaration of source.statements) {
      if (
        !(
          ts.isImportDeclaration(declaration) &&
          ts.isStringLiteral(declaration.moduleSpecifier)
        )
      )
        continue;
      const modulePath = declaration.moduleSpecifier.text;
      const bindings = declaration.importClause?.namedBindings;
      if (
        !(
          modulePath.startsWith("@workspace/ui/services/") &&
          bindings &&
          ts.isNamedImports(bindings)
        )
      )
        continue;
      for (const binding of bindings.elements)
        usedImports.add(
          `${modulePath.slice("@workspace/ui/".length)}:${binding.propertyName?.text || binding.name.text}`
        );
    }
  }
}
const mismatches = [];
const unusedMismatches = [];
for (const path of filesIn(join(ui, "src/services")).filter(
  (path) => !path.includes(`${join("services", "backend")}`)
)) {
  if (path.endsWith(".d.ts")) continue;
  const source = ts.createSourceFile(
    path,
    readFileSync(path, "utf8"),
    ts.ScriptTarget.Latest,
    true
  );
  const inspect = (node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "request"
    ) {
      const [url, options] = node.arguments;
      const raw = url?.getText(source) || "";
      const routeStart = raw.search(/\/v[12]\//);
      const route =
        routeStart >= 0
          ? raw
              .slice(routeStart)
              .replace(/[`'"]$/, "")
              .replace(/\$\{[^}]+\}/g, "{}")
          : undefined;
      const methodProperty =
        options && ts.isObjectLiteralExpression(options)
          ? options.properties.find(
              (property) => property.name?.getText(source) === "method"
            )
          : undefined;
      const method =
        methodProperty &&
        ts.isPropertyAssignment(methodProperty) &&
        ts.isStringLiteral(methodProperty.initializer)
          ? methodProperty.initializer.text
          : "GET";
      if (
        route &&
        !known.has(`${method.toUpperCase()} ${canonicalPath(route)}`)
      ) {
        let owner = node.parent;
        while (owner && !ts.isFunctionDeclaration(owner)) owner = owner.parent;
        const modulePath = path
          .slice(join(ui, "src").length + 1)
          .replaceAll("\\", "/")
          .replace(/\.ts$/, "");
        const item = {
          method: method.toUpperCase(),
          route,
          message: `${path.slice(root.length + 1)}:${owner?.name?.text || "unknown"}: ${method} ${route}`,
        };
        (usedImports.has(`${modulePath}:${owner?.name?.text}`)
          ? mismatches
          : unusedMismatches
        ).push(item);
      }
    }
    ts.forEachChild(node, inspect);
  };
  inspect(source);
}

// Endpoints the UI already calls but the backend has not registered yet. They
// are tracked explicitly so a typo or an accidental removal still fails the
// check, while the parallel backend port can land them without breaking CI.
const pendingPath = join(ui, "backend-pending.json");
const pendingEntries = existsSync(pendingPath)
  ? JSON.parse(readFileSync(pendingPath, "utf8").replace(/^\uFEFF/, ""))
  : [];
const pendingKeys = new Set(
  pendingEntries.map((entry) => `${entry.method} ${canonicalPath(entry.path)}`)
);
const pending = [];
const unexpected = [];
for (const item of mismatches) {
  (pendingKeys.has(`${item.method} ${canonicalPath(item.route)}`)
    ? pending
    : unexpected
  ).push(item);
}
const stalePending = pendingEntries.filter((entry) =>
  known.has(`${entry.method} ${canonicalPath(entry.path)}`)
);

console.log(
  `Backend ${contract.backendCommit}: ${browserEndpoints.length} browser routes, ${Object.keys(schemas).length} types.`
);
console.log(
  `${usedImports.size} imported service functions checked; ${unusedMismatches.length} unused legacy/callback endpoints excluded.`
);
if (pending.length) {
  console.warn(
    `Awaiting backend routes (${pending.length}):\n${pending.map((item) => `${item.message} - ${pendingEntries.find((entry) => `${entry.method} ${canonicalPath(entry.path)}` === `${item.method} ${canonicalPath(item.route)}`)?.reason || "no reason recorded"}`).join("\n")}`
  );
}
for (const entry of stalePending) {
  console.warn(
    `Pending route is now available, remove it from backend-pending.json: ${entry.method} ${entry.path}`
  );
}
if (unexpected.length) {
  console.error(
    `Legacy/unsupported routes requiring review:\n${unexpected.map((item) => item.message).join("\n")}`
  );
  if (process.argv.includes("--check")) process.exitCode = 1;
}
