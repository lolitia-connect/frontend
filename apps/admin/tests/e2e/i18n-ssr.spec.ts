import { expect, test } from "@playwright/test";
import { expectInitialContentPaintable } from "../../../../tests/e2e/first-paint";
import { mockLayoutApi } from "../../../../tests/e2e/layout.fixtures";

test("keeps SSR content visible before hydration and the first animation frame", async ({
  browser,
  baseURL,
}) => {
  await expectInitialContentPaintable(browser, baseURL!);
});

test.use({ locale: "zh-CN" });

test("renders supported request languages and falls back independently", async ({
  request,
}) => {
  const cases = [
    { header: "en-US", language: "en-US", heading: "Login" },
    { header: "en-US;q=0.2,zh-CN;q=0.9", language: "zh-CN", heading: "登录" },
    { header: "ja-JP,zh-HK;q=0.8", language: "zh-CN", heading: "登录" },
    { header: "de-DE", language: "en-US", heading: "Login" },
  ];
  await Promise.all(
    cases.map(async ({ header, language, heading }) => {
      const response = await request.get("/", {
        headers: { "Accept-Language": header },
      });
      expect(response.ok()).toBe(true);
      const html = await response.text();
      expect(html).toContain(`<html lang="${language}"`);
      expect(html).toMatch(new RegExp(`<h1[^>]*>${heading}</h1>`));
    })
  );
});

test("restores a saved language without a hydration mismatch or discarded preference", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await mockLayoutApi(page);
  await page.addInitScript(() => localStorage.setItem("language", "en-US"));
  const response = await page.goto("/", { waitUntil: "domcontentloaded" });
  const html = await response!.text();
  expect(html).toContain('<html lang="zh-CN"');
  expect(html).toMatch(/<h1[^>]*>登录<\/h1>/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Login");
  expect(await page.evaluate(() => localStorage.getItem("language"))).toBe(
    "en-US"
  );
  expect(errors).toEqual([]);
});
