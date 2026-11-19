import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

/** Isolated Next.js server for the portal. Run via `bun run test:e2e:payment-portal`. */
const paymentPortalPort = Number(process.env.PAYMENT_PORTAL_E2E_PORT || 3013);
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
  expect: { timeout: 10_000 },
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
    baseURL: `http://127.0.0.1:${paymentPortalPort}`,
    locale: "en-US",
    colorScheme: "light",
    actionTimeout: 10_000,
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
    command: `bun run dev -- --port ${paymentPortalPort}`,
    cwd: appDirectory,
    env: {
      NEXT_DIST_DIR: process.env.NEXT_DIST_DIR || ".next-playwright",
      NEXT_PUBLIC_API_BASE_URL: `http://127.0.0.1:${paymentPortalPort}`,
      NEXT_PUBLIC_API_PREFIX: "",
      NEXT_PUBLIC_PAYMENT_PORTAL_AMOUNTS: "10,20,50,100",
      NEXT_PUBLIC_PAYMENT_PORTAL_MIN_CUSTOM_AMOUNT: "1",
    },
    url: `http://127.0.0.1:${paymentPortalPort}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
