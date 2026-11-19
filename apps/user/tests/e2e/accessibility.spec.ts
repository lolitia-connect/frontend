import { expect, test } from "@playwright/test";
import {
  expectAccessible,
  expectSkipLink,
} from "../../../../tests/e2e/accessibility";
import {
  mockLayoutApi,
  signInFixture,
} from "../../../../tests/e2e/layout.fixtures";

test.beforeEach(async ({ page }) => {
  await page.route("https://**", (route) => route.abort());
  await mockLayoutApi(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const theme of ["light", "dark"] as const) {
  for (const path of [
    "/",
    "/auth",
    "/profile",
    "/ticket",
    "/traffic",
    "/affiliate",
    "/subscribe",
  ]) {
    test(`${theme} ${path} exposes labelled controls and valid landmarks`, async ({
      page,
      baseURL,
    }) => {
      if (path !== "/" && path !== "/auth") await signInFixture(page, baseURL!);
      await page.addInitScript(
        (value) => localStorage.setItem("theme", value),
        theme
      );
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.locator("html")).toHaveClass(new RegExp(theme));
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expectAccessible(page);
    });
  }
}

test("keyboard users skip navigation and password tabs own their panels", async ({
  page,
  baseURL,
}) => {
  await signInFixture(page, baseURL!);
  await page.goto("/profile", { waitUntil: "domcontentloaded" });
  await expectSkipLink(page);
  const tab = page.getByRole("tab", { name: "Current password", exact: true });
  await tab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "No password set", exact: true })
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("tabpanel", { name: "No password set" })
  ).toBeVisible();
  await expect(
    page.getByLabel("Code sent to member@example.test", { exact: true })
  ).toBeVisible();
});
