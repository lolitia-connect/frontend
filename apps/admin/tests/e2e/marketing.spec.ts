import { expect, test } from "@playwright/test";
import {
  mockLayoutApi,
  signInFixture,
} from "../../../../tests/e2e/layout.fixtures";

test("email send settings render without a client error", async ({
  page,
  baseURL,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  // Keep the unrelated editor loading so this regression is independent of its CDN.
  await page.route(
    "https://cdn.jsdelivr.net/npm/monaco-editor@*/min/vs/loader.js",
    (route) =>
      route.fulfill({
        contentType: "application/javascript",
        body: "window.require = Object.assign(() => {}, { config() {} });",
      })
  );
  await mockLayoutApi(page);
  await signInFixture(page, baseURL!);
  await page.goto("/dashboard/marketing", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /Email Broadcast/ }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("tab", { name: "Send Settings" }).click();
  const scope = dialog.getByRole("button", { name: /Select send scope/ });
  await expect(scope).toBeVisible();
  await expect(scope).toContainText("All Users");
  await expect(
    dialog.getByLabel("Additional recipient emails", { exact: true })
  ).toBeVisible();
  await expect(
    dialog.getByLabel("Registration Start Date", { exact: true })
  ).toBeEnabled();
  await expect(
    dialog.getByLabel("Registration End Date", { exact: true })
  ).toBeEnabled();
  expect(errors).toEqual([]);
});
