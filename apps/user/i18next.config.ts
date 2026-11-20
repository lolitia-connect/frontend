import { defineConfig } from "i18next-cli";
import { supportedLngs } from "./src/config/i18n";

/**
 * i18next CLI configuration
 *
 * Used for extracting translation keys and managing translation files.
 * Inherits language settings from the shared i18n configuration.
 *
 * @see https://github.com/i18next/i18next-cli
 */
export default defineConfig({
  // Use supported languages from shared config
  locales: [...supportedLngs],

  // Extraction configuration
  extract: {
    input: [
      "src/**/*.{js,jsx,ts,tsx}",
      "../../packages/ui/src/**/*.{js,jsx,ts,tsx}",
    ], // Source files to scan
    ignore: [
      "**/*.{test,spec}.{js,jsx,ts,tsx}",
      "**/__tests__/**",
      // Globstars do not match the parent segments in shared package paths.
      "../../packages/ui/src/**/*.{test,spec}.{js,jsx,ts,tsx}",
      "../../packages/ui/src/**/__tests__/**",
    ],
    output: "public/assets/locales/{{language}}/{{namespace}}.json", // Output path template
  },
});
