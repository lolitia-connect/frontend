/**
 * GENERATED FILE — do not edit by hand.
 * Regenerate with: bun scripts/generate-locale-resources.mjs payment-portal en-US
 *
 * Synchronous en-US resources for the fallback language. Bundling these makes
 * the server render and the client's hydration render produce identical text;
 * without them SSR falls back to inline `defaultValue` strings while the client
 * hydrates real translations, which React reports as a hydration mismatch.
 */
import app from "../../public/assets/locales/en-US/app.json";
import components from "../../public/assets/locales/en-US/components.json";

export const fallbackResources = {
  "en-US": {
    app,
    components,
  },
} as const;

/** Namespaces available synchronously for the fallback language. */
export const fallbackNamespaces = ["app", "components"] as const;
