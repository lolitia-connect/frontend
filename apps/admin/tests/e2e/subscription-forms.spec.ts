import { expect, type Page, test } from "@playwright/test";
import {
  account,
  expectNoPageOverflow,
  mockLayoutApi,
  signInFixture,
} from "../../../../tests/e2e/layout.fixtures";

test.use({ reducedMotion: "reduce" });

const gb = 1024 ** 3;
const subscription = {
  id: "subscription-1",
  user_id: account.id,
  subscribe_id: "plan-1",
  subscribe: { id: "plan-1", name: "Monthly plan" },
  traffic: 100 * gb,
  traffic_unlimited: false,
  upload: 10 * gb,
  download: 20 * gb,
  expire_time: 0,
  status: 1,
  token: "test-token",
  short: "test-short",
  created_at: 1_700_000_000,
};

async function openSubscriptions(page: Page, baseURL: string) {
  const writes = await mockLayoutApi(page);
  await page.route(/\/v1\/admin\/user\/list(?:\?|$)/, (route) =>
    route.fulfill({ json: { code: 200, data: { list: [account], total: 1 } } })
  );
  await page.route(/\/v1\/admin\/subscribe\/list(?:\?|$)/, (route) =>
    route.fulfill({
      json: { code: 200, data: { list: [subscription.subscribe], total: 1 } },
    })
  );
  await page.route(/\/v1\/admin\/user\/subscribe(?:\?|$)/, async (route) => {
    if (route.request().method() !== "GET") {
      writes.push({
        path: new URL(route.request().url()).pathname,
        body: route.request().postDataJSON(),
      });
    }
    await route.fulfill({
      json: { code: 200, data: { list: [subscription], total: 1 } },
    });
  });
  await signInFixture(page, baseURL);
  await page.goto("/dashboard/user", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Subscription", exact: true }).click();
  const list = page.getByRole("dialog", { name: /Subscription List/ });
  await expect(list.locator('[role="grid"]')).not.toHaveAttribute(
    "aria-busy",
    "true"
  );
  await expect(
    list.getByRole("button", { name: "Edit", exact: true })
  ).toBeVisible();
  return {
    writes,
    list,
  };
}

test("subscription creation fields align and the date icon stays inside its button", async ({
  page,
  baseURL,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const { list, writes } = await openSubscriptions(page, baseURL!);
  await list.getByRole("button", { name: "Add", exact: true }).click();
  const dialog = page.getByRole("dialog", {
    name: "Create Subscription",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  for (const width of [1440, 375, 320]) {
    await page.setViewportSize({ width, height: 720 });
    await expect(async () => {
      const bounds = await dialog
        .locator('[data-slot="form-item"]:not(.admin-drawer-wide)')
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getBoundingClientRect().width)
        );
      expect(Math.max(...bounds) - Math.min(...bounds)).toBeLessThanOrEqual(1);
      const date = dialog.getByRole("button", { name: /Permanent/ });
      const button = (await date.boundingBox())!;
      const icon = (await date.locator("svg").boundingBox())!;
      expect(icon.y).toBeGreaterThanOrEqual(button.y);
      expect(icon.y + icon.height).toBeLessThanOrEqual(
        button.y + button.height
      );
      expect(icon.x).toBeGreaterThan(button.x + button.width / 2);
    }).toPass();
    await expectNoPageOverflow(page);
    await expect(
      dialog.getByRole("button", { name: "Confirm", exact: true })
    ).toBeInViewport();
  }
  await dialog
    .getByRole("group", { name: "Select Subscription", exact: true })
    .click();
  await page.getByRole("option", { name: "Monthly plan", exact: true }).click();
  await dialog.locator('input[name="traffic"]').fill("200");
  await dialog.locator('input[name="upload"]').fill("5");
  await dialog.locator('input[name="download"]').fill("7");
  await dialog.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  expect(writes.at(-1)?.body).toMatchObject({
    user_id: account.id,
    subscribe_id: "plan-1",
    traffic: 200 * gb,
    upload: 5 * gb,
    download: 7 * gb,
    expired_at: 0,
  });
});

test("editing a subscription retains the drawer and focused input through typing and reopening", async ({
  page,
  baseURL,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const { list, writes } = await openSubscriptions(page, baseURL!);
  const edit = list.getByRole("button", { name: "Edit", exact: true });
  await edit.click();
  const dialog = page.getByRole("dialog", {
    name: "Edit Subscription",
    exact: true,
  });
  const traffic = dialog.locator('input[name="traffic"]');
  await expect(traffic).toHaveValue("100");
  await traffic.click();
  await traffic.press("ControlOrMeta+A");
  await traffic.pressSequentially("125.5");
  await expect(dialog).toBeVisible();
  await expect(traffic).toBeFocused();
  await expect(traffic).toHaveValue("125.5");
  await dialog.locator('input[name="upload"]').fill("12");
  await dialog.locator('input[name="download"]').fill("23");
  await dialog.getByRole("button", { name: /Permanent/ }).click();
  await expect(
    page.getByRole("dialog", { name: "Details", exact: true })
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await edit.click();
  await expect(traffic).toHaveValue("100");
  await dialog.getByRole("switch").press("Space");
  await expect(traffic).toBeDisabled();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await edit.click();
  await expect(traffic).toBeEnabled();
  await traffic.fill("125.5");
  await dialog.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  expect(writes.at(-1)?.body).toMatchObject({
    user_id: account.id,
    user_subscribe_id: subscription.id,
    subscribe_id: "plan-1",
    traffic: 125.5 * gb,
    traffic_unlimited: false,
    upload: subscription.upload,
    download: subscription.download,
  });
  await expect(list).toBeVisible();
});
