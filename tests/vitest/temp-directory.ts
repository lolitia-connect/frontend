import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Initialize before Vitest starts workers; setupFiles runs too late for their caches.
export function configureTestTempDirectory(configUrl: string) {
  const directory = fileURLToPath(new URL("./.tmp-vitest/", configUrl));
  mkdirSync(directory, { recursive: true });
  process.env.TEMP = directory;
  process.env.TMP = directory;
  process.env.TMPDIR = directory;
}
