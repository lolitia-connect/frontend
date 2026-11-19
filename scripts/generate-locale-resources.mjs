#!/usr/bin/env node
/**
 * Generate a synchronous locale-resources module for an app's fallback language.
 *
 * Why this is needed: `i18next-http-backend` is browser-only, so during SSR
 * `t()` falls back to each call's inline `defaultValue`. The client, however, may
 * already have the real strings (HTTP cache) when it hydrates — so the two
 * renders disagree and React reports a hydration mismatch.
 *
 * Bundling the fallback language's namespaces makes the FIRST render identical on
 * both sides. Any other language is still applied after mount (see
 * `applyDetectedLanguage`), which is a normal re-render, not a mismatch.
 *
 * Usage: node scripts/generate-locale-resources.mjs <app> [lang]
 *   node scripts/generate-locale-resources.mjs user en-US
 */
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [app, lang = "en-US"] = process.argv.slice(2);

if (!app) {
  console.error(
    "usage: node scripts/generate-locale-resources.mjs <app> [lang]"
  );
  process.exit(1);
}

const localeDir = join(root, "apps", app, "public", "assets", "locales", lang);
if (!existsSync(localeDir)) {
  console.error(`no locale dir: ${localeDir}`);
  process.exit(1);
}

const namespaces = readdirSync(localeDir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(/\.json$/, ""))
  .sort();

if (namespaces.length === 0) {
  console.error(`no locale JSON files in ${localeDir}`);
  process.exit(1);
}

const imports = namespaces
  .map(
    (ns) =>
      `import ${ns.replace(/[^A-Za-z0-9_]/g, "_")} from "../../public/assets/locales/${lang}/${ns}.json";`
  )
  .join("\n");

const entries = namespaces
  .map((ns) => {
    const identifier = ns.replace(/[^A-Za-z0-9_]/g, "_");
    return ns === identifier
      ? `    ${identifier},`
      : `    ${JSON.stringify(ns)}: ${identifier},`;
  })
  .join("\n");

const out = `/**
 * GENERATED FILE — do not edit by hand.
 * Regenerate with: bun scripts/generate-locale-resources.mjs ${app} ${lang}
 *
 * Synchronous ${lang} resources for the fallback language. Bundling these makes
 * the server render and the client's hydration render produce identical text;
 * without them SSR falls back to inline \`defaultValue\` strings while the client
 * hydrates real translations, which React reports as a hydration mismatch.
 */
${imports}

export const fallbackResources = {
  "${lang}": {
${entries}
  },
} as const;

/** Namespaces available synchronously for the fallback language. */
export const fallbackNamespaces = ${JSON.stringify(namespaces)} as const;
`;

const outPath = join(root, "apps", app, "src", "config", "locale-resources.ts");
writeFileSync(outPath, out);
console.log(`wrote ${outPath}`);
console.log(`  language:   ${lang}`);
console.log(`  namespaces: ${namespaces.length} (${namespaces.join(", ")})`);
