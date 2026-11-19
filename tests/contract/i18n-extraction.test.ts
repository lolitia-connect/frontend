import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, expect, it } from "vitest";
import adminConfig from "../../apps/admin/i18next.config";
import paymentPortalConfig from "../../apps/payment-portal/i18next.config";
import userConfig from "../../apps/user/i18next.config";

const fixture = mkdtempSync(join(tmpdir(), "frontend-i18n-"));
const app = join(fixture, "apps", "web");
const write = (path: string, source: string) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, source);
};

for (const [source, key] of [
  [join(app, "src"), "app"],
  [join(fixture, "packages", "ui", "src"), "shared"],
] as const) {
  write(join(source, "heading.tsx"), `t("components:${key}");`);
  for (const extension of ["js", "jsx", "ts", "tsx"]) {
    for (const kind of ["test", "spec"]) {
      write(
        join(source, `heading.${kind}.${extension}`),
        't("components:testOnly");'
      );
    }
  }
  write(
    join(source, "__tests__", "heading.tsx"),
    't("components:fixtureOnly");'
  );
}
write(join(app, "app", "page.tsx"), 't("components:route");');
write(join(app, "app", "page.spec.tsx"), 't("components:testOnly");');

afterAll(() => rmSync(fixture, { recursive: true, force: true }));

const cli = pathToFileURL(
  createRequire(import.meta.url).resolve("i18next-cli/esm")
).href;
const extract = `
import { findKeys } from ${JSON.stringify(cli)};
const { allKeys } = await findKeys(JSON.parse(process.argv[1]));
console.log(JSON.stringify([...allKeys.keys()]));
`;

it.each([
  {
    name: "user",
    config: userConfig,
    keys: ["components:app", "components:shared"],
  },
  {
    name: "admin",
    config: adminConfig,
    keys: ["components:app", "components:shared"],
  },
  {
    name: "payment portal",
    config: paymentPortalConfig,
    keys: ["components:app", "components:route", "components:shared"],
  },
])("$name extracts production keys without test fixtures", ({
  config,
  keys,
}) => {
  const output = execFileSync(
    process.execPath,
    ["--input-type=module", "--eval", extract, JSON.stringify(config)],
    { cwd: app, encoding: "utf8" }
  );

  expect(JSON.parse(output).sort()).toEqual(keys);
});
