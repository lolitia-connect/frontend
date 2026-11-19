import { defineConfig } from "i18next-cli";

/**
 * i18next CLI configuration
 *
 * Used for extracting translation keys and managing translation files.
 * Mirrors the admin/user apps so the portal takes part in the workspace-wide
 * `turbo i18n:extract | i18n:sync | i18n:status` pipeline.
 *
 * @see https://github.com/i18next/i18next-cli
 */
export default defineConfig({
  locales: ["en-US", "zh-CN", "zh-TW", "zh-HK", "ja-JP"],

  // Extraction configuration
  extract: {
    input: [
      "src/**/*.{js,jsx,ts,tsx}",
      "app/**/*.{js,jsx,ts,tsx}",
      "../../packages/ui/src/**/*.{js,jsx,ts,tsx}",
    ], // Source files to scan
    output: "public/assets/locales/{{language}}/{{namespace}}.json", // Output path template
  },
});
