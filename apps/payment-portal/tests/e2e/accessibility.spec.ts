import {
  expectAccessible,
  expectSkipLink,
} from "../../../../tests/e2e/accessibility";
import { expect, signIn, test } from "./payment-portal.fixtures";

for (const theme of ["light", "dark"] as const) {
  test(`${theme} login, recharge and confirmation are accessible`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(
      (value) => localStorage.setItem("theme", value),
      theme
    );
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByLabel("Account / Email")).toBeVisible();
    await expectAccessible(page);
    await expectSkipLink(page);
    await signIn(page);
    await expectAccessible(page);
    const trigger = page.getByRole("button", {
      name: "Confirm Recharge",
      exact: true,
    });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expectAccessible(page);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(
      page.getByRole("button", { name: "Pay Now", exact: true })
    ).toBeFocused();
  });
}
