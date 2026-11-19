import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";
import { configureTestTempDirectory } from "../../tests/vitest/temp-directory";

configureTestTempDirectory(import.meta.url);

const uiSrc = fileURLToPath(new URL("../../packages/ui/src", import.meta.url));

/**
 * Vitest configuration for the App Router app.
 *
 * This replaced `vite.config.ts` when the app moved off Vite. It keeps only what
 * the test suite needs: the `@/` path alias, the automatic JSX runtime, and a
 * direct mapping for `@workspace/ui/*` subpath imports.
 *
 * The explicit `@workspace/ui` alias exists because Vite's resolver does not
 * apply the package `exports` array fallback (`["./src/lib/*.ts",
 * "./src/lib/*.tsx"]`) that lets `lib/router-compat.tsx` resolve under Next's
 * bundler; Vitest would otherwise fail to find the `.tsx` file.
 */
export default defineConfig({
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: [
      {
        find: /^@\/(.*)$/,
        replacement: `${fileURLToPath(new URL("./src", import.meta.url))}/$1`,
      },
      {
        find: /^@workspace\/ui\/lib\/(.*)$/,
        replacement: `${uiSrc}/lib/$1`,
      },
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
    // jsdom lacks Element.getAnimations, which React Aria calls from its
    // SharedElementTransition (Tabs indicator, Accordion/Disclosure panels).
    // Without the stub the call throws inside act() and the interaction never
    // completes. See vitest.setup.ts.
    setupFiles: ["./vitest.setup.ts"],
    // React Aria collection/selection interactions (ProTable, node config) take
    // several seconds per test; on slower CI runners they cross the 5s default
    // and time out non-deterministically. Raise the budget without changing any
    // test logic.
    testTimeout: 15_000,
    hookTimeout: 15_000,
  },
});
