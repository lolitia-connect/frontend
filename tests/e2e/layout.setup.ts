import { chromium } from "@playwright/test";
import { mockLayoutApi } from "./layout.fixtures";

export async function warmLayoutRoutes(baseURL: string, paths: string[]) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await mockLayoutApi(page);
    // ssr:false sections compile only when the browser loads their client chunks.
    for (const path of paths) {
      const url = new URL(path, baseURL).href;
      const response = await page.goto(url, { timeout: 120_000 });
      if (!response?.ok())
        throw new Error(`Could not prepare ${url}: ${response?.status()}`);
      if (url.endsWith("/auth-control")) {
        await page
          .getByRole("button", { name: /Email Settings/ })
          .waitFor({ timeout: 60_000 });
      } else {
        await page
          .locator('main [role="tablist"], main [role="grid"]')
          .first()
          .waitFor({ timeout: 60_000 });
      }
    }
  } finally {
    await browser.close();
  }
}
