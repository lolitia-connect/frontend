#!/usr/bin/env node
/**
 * Writes `public/version.lock` for an app, mirroring the `versionLockPlugin` that
 * the pre-migration `vite.config.ts` ran on `closeBundle`.
 *
 * Why: `docs/guide/separation/frontend.md` documents `curl https://<host>/version.lock`
 * as the way to read the currently deployed frontend version, and the Vite build
 * emitted `dist/version.lock` from the workspace root `package.json` version. The
 * Next.js migration dropped that step, so the documented endpoint 404'd.
 *
 * Next.js serves `public/` verbatim, so writing the file there restores the
 * endpoint. The file is generated, hence git-ignored.
 *
 * Usage: node scripts/write-version-lock.mjs <app-dir>
 *   e.g. node scripts/write-version-lock.mjs apps/user
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const appDir = process.argv[2];
if (!appDir) {
  console.error("usage: node scripts/write-version-lock.mjs <app-dir>");
  process.exit(1);
}

const rootPkgPath = join(root, "package.json");
if (!existsSync(rootPkgPath)) {
  console.error(`root package.json not found at ${rootPkgPath}`);
  process.exit(1);
}

const version =
  JSON.parse(readFileSync(rootPkgPath, "utf8")).version || "0.0.0";

const publicDir = join(root, appDir, "public");
mkdirSync(publicDir, { recursive: true });

const target = join(publicDir, "version.lock");
writeFileSync(target, version);

console.log(`wrote ${target.replace(`${root}\\`, "")} = ${version}`);
