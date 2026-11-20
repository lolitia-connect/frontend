import { expect, test } from "@playwright/test";
import { expectInitialContentPaintable } from "../../../../tests/e2e/first-paint";
import {
  mockLayoutApi,
  siteConfig,
} from "../../../../tests/e2e/layout.fixtures";

test("keeps SSR content visible before hydration and the first animation frame", async ({
  browser,
  baseURL,
}) => {
  await expectInitialContentPaintable(browser, baseURL!);
});

test.use({ locale: "zh-CN" });

for (const { language, heading, systemLabel, menuLabel, contentLanguage } of [
  {
    language: "ja-x-pseudo",
    heading: "貴方歓迎",
    systemLabel: "端末設定追従",
    menuLabel: "🀄 偽中国語",
    contentLanguage: "ja-JP",
  },
  {
    language: "en-x-emoji",
    heading: "👋🎉",
    systemLabel: "💻🔄",
    menuLabel: "😀 Emoji",
    contentLanguage: "en-US",
  },
]) {
  test(`switches to ${language}, persists after reload, and returns to system language`, async ({
    page,
  }) => {
    const errors: string[] = [];
    const contentLanguages: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.pathname.endsWith("/public/portal/subscribe")) {
        contentLanguages.push(url.searchParams.get("language") ?? "");
      }
    });
    await mockLayoutApi(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("link", { name: siteConfig.site.site_name, exact: true })
    ).toBeVisible();
    await page.getByTestId("language-switch-trigger").click();
    await page.getByRole("menuitem", { name: menuLabel }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      heading
    );
    await expect.poll(() => contentLanguages).toContain(contentLanguage);
    expect(contentLanguages).not.toContain(language);
    expect(await page.evaluate(() => localStorage.getItem("language"))).toBe(
      language
    );

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      heading
    );
    await page.getByTestId("language-switch-trigger").click();
    if (language === "en-x-emoji") {
      await expect(page.getByRole("menuitem")).toHaveText([
        systemLabel,
        "🇺🇸 English",
        "🇨🇳 简体中文",
        "🇨🇳 繁體中文（台灣）",
        "🇭🇰 繁體中文（香港）",
        "🇯🇵 日本語",
        "🀄 偽中国語",
        "😀 Emoji",
      ]);
    }
    await page.getByRole("menuitem").filter({ hasText: systemLabel }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "欢迎来到"
    );
    expect(
      await page.evaluate(() => localStorage.getItem("language"))
    ).toBeNull();
    expect(errors).toEqual([]);
  });
}

test("renders each request language in HTML without leaking between requests", async ({
  request,
}) => {
  const cases = [
    { header: "en-US", language: "en-US", heading: "Welcome to" },
    {
      header: "zh-CN;q=0.3, ja-JP;q=0.9",
      language: "ja-JP",
      heading: "ようこそ",
    },
    { header: "zh-Hant-HK, en;q=0.8", language: "zh-HK", heading: "歡迎來到" },
    { header: "ja-x-pseudo", language: "ja-x-pseudo", heading: "貴方歓迎" },
    { header: "en-x-emoji", language: "en-x-emoji", heading: "👋🎉" },
    { header: "de-DE", language: "en-US", heading: "Welcome to" },
  ];
  await Promise.all(
    cases.map(async ({ header, language, heading }) => {
      const response = await request.get("/", {
        headers: { "Accept-Language": header },
      });
      expect(response.ok()).toBe(true);
      const html = await response.text();
      expect(html).toContain(`<html lang="${language}"`);
      expect(html).toMatch(new RegExp(`<h1[^>]*>${heading}`));
    })
  );
});

test("hydrates the request language before restoring the saved browser choice", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await mockLayoutApi(page);
  await page.addInitScript(() => localStorage.setItem("language", "ja-JP"));
  const response = await page.goto("/", { waitUntil: "domcontentloaded" });
  const html = await response!.text();
  expect(html).toContain('<html lang="zh-CN"');
  expect(html).toMatch(/<h1[^>]*>欢迎来到/);
  await expect(page.locator("html")).toHaveAttribute("lang", "ja-JP");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "ようこそ"
  );
  expect(await page.evaluate(() => localStorage.getItem("language"))).toBe(
    "ja-JP"
  );
  expect(errors).toEqual([]);
});
