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
  test(`${theme} authentication and tables have accessible names and structure`, async ({
    page,
    baseURL,
  }) => {
    test.setTimeout(120_000);
    await page.addInitScript(
      (value) => localStorage.setItem("theme", value),
      theme
    );
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByLabel("Enter your email...", { exact: true })
    ).toBeVisible();
    await expectAccessible(page);
    await signInFixture(page, baseURL!);
    await page.addInitScript(
      (value) => localStorage.setItem("theme", value),
      theme
    );
    await page.goto("/dashboard/user", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("button", { name: "Refresh", exact: true })
    ).toBeVisible();
    await expectAccessible(page);
  });
}

test("collapsed navigation works with keyboard and returns focus on Escape", async ({
  page,
  baseURL,
}) => {
  await signInFixture(page, baseURL!);
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  await expectSkipLink(page);
  await page.locator("main .grid.gap-3").last().scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("heading", { name: "Node Traffic", exact: true })
  ).toBeVisible();
  await expectAccessible(page);
  const toggle = page.getByRole("button", {
    name: "Toggle Sidebar",
    exact: true,
  });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  const trigger = page.getByRole("button", { name: "Commerce", exact: true });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Commerce", exact: true });
  await expect(dialog).toBeVisible();
  const link = dialog.getByRole("link").first();
  await expect(link).toBeVisible();
  await expectAccessible(page);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Enter");
  await dialog
    .getByRole("link", { name: "Order Management", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/dashboard\/order$/);
  await expect(dialog).toBeHidden();
});
