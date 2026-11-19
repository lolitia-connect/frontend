import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const userAppPort = Number(process.env.E2E_PORT || 3010);
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
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  timeout: 60_000,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    [process.env.CI ? "line" : "list"],
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
    baseURL: `http://127.0.0.1:${userAppPort}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  workers: 1,
  webServer: {
    command: `bun run dev -- --port ${userAppPort}`,
    cwd: appDirectory,
    env: {
      NEXT_DIST_DIR: process.env.NEXT_DIST_DIR || ".next-playwright",
      NEXT_PUBLIC_API_BASE_URL: "http://127.0.0.1:9",
      NEXT_PUBLIC_API_PREFIX: "",
    },
    url: `http://127.0.0.1:${userAppPort}/favicon.svg`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
