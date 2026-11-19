import { expect, test } from "@playwright/test";
import { mockLayoutApi } from "../../../../tests/e2e/layout.fixtures";

test.use({ locale: "zh-CN" });

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
