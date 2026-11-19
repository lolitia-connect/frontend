import { defineConfig } from "vitest/config";
import { configureTestTempDirectory } from "./tests/vitest/temp-directory";

configureTestTempDirectory(import.meta.url);

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/{contract,functions}/**/*.test.ts"],
  },
});
