import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";
import { configureTestTempDirectory } from "../../tests/vitest/temp-directory";

configureTestTempDirectory(import.meta.url);

const src = fileURLToPath(new URL("./src", import.meta.url));

/**
 * Vitest configuration for `packages/ui`.
 *
 * The `@workspace/ui/*` subpath imports are aliased explicitly rather than left
 * to the package `exports` map. The map declares each subpath as an *array* with
 * both extensions (`"./src/lib/*.ts", "./src/lib/*.tsx"`), and Node/Next/tsc all
 * fall back through that array — but Vite's resolver picks the first matching
 * pattern only and does not fall back, so an extensionless specifier such as
 * `@workspace/ui/lib/slot` (a `.tsx` file) failed to resolve here while building
 * fine in every app. The app configs already alias for the same reason.
 *
 * The other thing this file adds is `setupFiles`: the shared React Aria
 * `getAnimations` stub (see `vitest.setup.ts`). It is needed because this package
 * carries tests for its HeroUI wrappers, and any component built on React Aria
 * (`Tabs.Indicator`, Accordion/Disclosure panels) calls
 * `element.getAnimations()` from a layout effect, which jsdom does not implement.
 */
export default defineConfig({
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: [
      { find: /^@workspace\/ui\/lib\/(.*)$/, replacement: `${src}/lib/$1` },
      {
        find: /^@workspace\/ui\/components\/(.*)$/,
        replacement: `${src}/components/$1`,
      },
      {
        find: /^@workspace\/ui\/composed\/(.*)$/,
        replacement: `${src}/composed/$1`,
      },
      {
        find: /^@workspace\/ui\/integrations\/(.*)$/,
        replacement: `${src}/integrations/$1`,
      },
      { find: /^@workspace\/ui\/utils\/(.*)$/, replacement: `${src}/utils/$1` },
      {
        find: /^@workspace\/ui\/services\/(.*)$/,
        replacement: `${src}/services/$1`,
      },
      { find: /^@workspace\/ui\/hooks\/(.*)$/, replacement: `${src}/hooks/$1` },
    ],
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./vitest.setup.ts"],
    // React Aria collection/selection interactions (ProTable, Tabs, menus) are
    // several seconds per test; on slower CI runners they cross the 5s default
    // and time out non-deterministically. Raise the budget so these stay green
    // without changing any test logic.
    testTimeout: 15_000,
    hookTimeout: 15_000,
  },
});
