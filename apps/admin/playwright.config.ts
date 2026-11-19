import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const adminAppPort = Number(process.env.ADMIN_E2E_PORT || 3014);
const appDirectory = fileURLToPath(new URL("./", import.meta.url));
const temporaryDirectory = fileURLToPath(
  new URL("./.tmp-e2e", import.meta.url)
);
mkdirSync(temporaryDirectory, { recursive: true });
process.env.TEMP = temporaryDirectory;
process.env.TMP = temporaryDirectory;

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.spec.ts",
  outputDir: "./test-results",
  globalSetup: "./tests/e2e/global-setup.ts",
  workers: 1,
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ["list"],
    [
      "html",
      {
        open: "never",
        outputFolder: fileURLToPath(
          new URL("./playwright-report", import.meta.url)
        ),
      },
    ],
  ],
  use: {
    baseURL: `http://127.0.0.1:${adminAppPort}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `bun run dev -- --port ${adminAppPort}`,
    cwd: appDirectory,
    url: `http://127.0.0.1:${adminAppPort}/favicon.svg`,
    env: {
      NEXT_DIST_DIR: process.env.NEXT_DIST_DIR || ".next-playwright",
      NEXT_PUBLIC_API_BASE_URL: "http://127.0.0.1:9",
      NEXT_PUBLIC_API_PREFIX: "",
    },
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
