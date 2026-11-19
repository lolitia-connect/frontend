import { type Browser, expect } from "@playwright/test";

export async function expectInitialContentPaintable(
  browser: Browser,
  baseURL: string
) {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    locale: "en-US",
    reducedMotion: "no-preference",
  });
  try {
    await context.route("https://**", (route) => route.abort());
    const page = await context.newPage();
    await page.route("**/*.css", async (route) => {
      const response = await route.fetch();
      await route.fulfill({
        response,
        body: `${await response.text()}\n.page-transition { animation-play-state: paused !important; }`,
      });
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator(".page-transition")).toHaveCSS(
      "animation-name",
      "page-enter"
    );
    await expect(page.locator(".page-transition")).toHaveCSS("opacity", "1");
    expect(
      await page.getByRole("heading", { level: 1 }).evaluate((heading) => {
        const rect = heading.getBoundingClientRect();
        return heading.contains(
          document.elementFromPoint(
            rect.x + rect.width / 2,
            rect.y + rect.height / 2
          )
        );
      })
    ).toBe(true);
  } finally {
    await context.close();
  }
}
