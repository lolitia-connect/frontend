import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

const packageRoot = fileURLToPath(new URL("../", import.meta.url));
const { exports: exportsMap } = JSON.parse(
  readFileSync(join(packageRoot, "package.json"), "utf8")
) as { exports: Record<string, string | string[]> };

function moduleFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      return moduleFiles(join(directory, entry.name)).map(
        (file) => `${entry.name}/${file}`
      );
    }
    return /\.tsx?$/.test(entry.name) &&
      !/\.(test|spec)\.tsx?$/.test(entry.name)
      ? [entry.name]
      : [];
  });
}

describe("UI package exports", () => {
  for (const [subpath, target] of Object.entries(exportsMap)) {
    test(`${subpath} resolves to existing files with reachable extensions`, () => {
      const targets = Array.isArray(target) ? target : [target];
      if (!subpath.includes("*")) {
        expect(
          targets.some((path) => existsSync(join(packageRoot, path)))
        ).toBe(true);
        return;
      }

      const directory = join(packageRoot, targets[0]!.split("*")[0]!);
      expect(
        existsSync(directory),
        `Missing export directory: ${directory}`
      ).toBe(true);
      const files = moduleFiles(directory);
      const extensions = targets.map((path) =>
        path.slice(path.lastIndexOf("*") + 1)
      );
      expect(files.length, `Empty export pattern: ${subpath}`).toBeGreaterThan(
        0
      );
      expect(
        files.filter(
          (file) => !extensions.some((extension) => file.endsWith(extension))
        ),
        `Modules unreachable through ${subpath}`
      ).toEqual([]);
    });
  }
});
