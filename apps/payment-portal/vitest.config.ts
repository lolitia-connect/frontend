import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";
import { configureTestTempDirectory } from "../../tests/vitest/temp-directory";

configureTestTempDirectory(import.meta.url);

const uiSrc = fileURLToPath(new URL("../../packages/ui/src", import.meta.url));

export default defineConfig({
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: [
      {
        find: /^@\/(.*)$/,
        replacement: `${fileURLToPath(new URL("./src", import.meta.url))}/$1`,
      },
      { find: /^@workspace\/ui\/lib\/(.*)$/, replacement: `${uiSrc}/lib/$1` },
      {
        find: /^@workspace\/ui\/composed\/(.*)$/,
        replacement: `${uiSrc}/composed/$1`,
      },
      {
        find: /^@workspace\/ui\/components\/(.*)$/,
        replacement: `${uiSrc}/components/$1`,
      },
      {
        find: /^@workspace\/ui\/integrations\/(.*)$/,
        replacement: `${uiSrc}/integrations/$1`,
      },
      {
        find: /^@workspace\/ui\/utils\/(.*)$/,
        replacement: `${uiSrc}/utils/$1`,
      },
      {
        find: /^@workspace\/ui\/services\/(.*)$/,
        replacement: `${uiSrc}/services/$1`,
      },
      {
        find: /^@workspace\/ui\/hooks\/(.*)$/,
        replacement: `${uiSrc}/hooks/$1`,
      },
    ],
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
