import { expect, test } from "@playwright/test";
import {
  account,
  mockLayoutApi,
  signInFixture,
} from "../../../../tests/e2e/layout.fixtures";

function userFixture() {
  return {
    ...account,
    avatar: "https://avatars.example.test/oauth-user.png",
    balance: 1200,
    gift_amount: 300,
    commission: 500,
    enable: true,
    is_admin: true,
    refer_code: "referral",
    referer_id: "3",
    referral_percentage: 15,
    only_first_purchase: true,
    telegram: 0,
    created_at: 1_700_000_000,
  };
}

test("account can be disabled and re-enabled without changing profile or funds", async ({
  page,
  baseURL,
}) => {
  await mockLayoutApi(page);
  const user = userFixture();
  const writes: Record<string, unknown>[] = [];
  await page.route("**/v1/admin/user/list?*", (route) =>
    route.fulfill({ json: { code: 200, data: { list: [user], total: 1 } } })
  );
  await page.route("**/v1/admin/user/basic", async (route) => {
    const body = route.request().postDataJSON();
    writes.push(body);
    user.enable = body.enable;
    await route.fulfill({ json: { code: 200 } });
  });
  await signInFixture(page, baseURL!);
  await page.goto("/dashboard/user");
  const row = page.getByRole("row").filter({ hasText: "member@example.test" });
  const toggle = row.getByRole("switch");
  const control = row.locator('[data-slot="switch-control"]');
  await expect(toggle).toBeChecked({ timeout: 30_000 });
  for (const enable of [false, true]) {
    await control.click();
    await expect.poll(() => writes.at(-1)?.enable).toBe(enable);
    expect(writes.at(-1)).toMatchObject({
      user_id: user.id,
      avatar: user.avatar,
      balance: 1200,
      gift_amount: 300,
      commission: 500,
      is_admin: true,
      refer_code: "referral",
      referer_id: "3",
      referral_percentage: 15,
      only_first_purchase: true,
    });
    await expect(toggle).toBeEnabled();
    await expect(toggle).toBeChecked({ checked: enable });
    await page.reload();
    await expect(toggle).toBeChecked({ checked: enable, timeout: 30_000 });
  }
  expect(writes).toHaveLength(2);
});

test("failed account update keeps the saved state and can be retried", async ({
  page,
  baseURL,
}) => {
  await mockLayoutApi(page);
  const user = userFixture();
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/v1/admin/user/list?*", (route) =>
    route.fulfill({ json: { code: 200, data: { list: [user], total: 1 } } })
  );
  let attempts = 0;
  let release: () => void = () => undefined;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/v1/admin/user/basic", async (route) => {
    attempts += 1;
    if (attempts === 1) {
      await pending;
      await route.fulfill({
        json: { code: 500, msg: "Internal Server Error" },
      });
      return;
    }
    user.enable = route.request().postDataJSON().enable;
    await route.fulfill({ json: { code: 200 } });
  });
  await signInFixture(page, baseURL!);
  await page.goto("/dashboard/user");
  const row = page.getByRole("row").filter({ hasText: "member@example.test" });
  const toggle = row.getByRole("switch");
  const control = row.locator('[data-slot="switch-control"]');
  await expect(toggle).toBeChecked({ timeout: 30_000 });
  await control.click();
  await expect.poll(() => attempts).toBe(1);
  try {
    await expect(toggle).toBeDisabled();
    await expect(toggle).toBeChecked();
  } finally {
    release();
  }
  await expect(toggle).toBeEnabled();
  await expect(toggle).toBeChecked();
  await control.click();
  await expect.poll(() => attempts).toBe(2);
  await expect(toggle).not.toBeChecked();
  await expect(toggle).toBeEnabled();
  expect(errors).toEqual([]);
});
