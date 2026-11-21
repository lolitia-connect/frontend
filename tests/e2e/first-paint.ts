import { type Browser, expect, type Page } from "@playwright/test";

export async function expectHydrationWithHostingComment(page: Page) {
  const errors: string[] = [];
  const record = (message: string) => {
    if (/hydrat|Minified React error #418\b/i.test(message))
      errors.push(message);
  };
  page.on("pageerror", (error) => record(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") record(message.text());
  });

  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ contentType: "text/css", body: "" })
  );
  await page.addInitScript(() => {
    // Reproduce the two DOM nodes Netlify inserts while parsing the head.
    const observer = new MutationObserver(insertHostingComment);
    function insertHostingComment() {
      const charset = document.head?.querySelector("meta[charset]");
      if (charset) {
        observer.disconnect();
        charset.after("\n", document.createComment("Hosting provider comment"));
      }
    }
    observer.observe(document, { childList: true, subtree: true });
    insertHostingComment();
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveClass(/\btheme-ready\b/);
  expect(await page.locator("head").innerHTML()).toContain(
    "\n<!--Hosting provider comment-->"
  );
  expect(errors).toEqual([]);
}

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
