import { expect, type Locator, type Page, test } from "@playwright/test";
import {
  account,
  expectNoPageOverflow,
  mockLayoutApi,
  signInFixture,
} from "../../../../tests/e2e/layout.fixtures";

async function expectPanelFits(page: Page, dialog: Locator) {
  await expect(dialog).toBeVisible();
  await expect(async () => {
    const size = await dialog.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return {
        width: rect.width,
        right: rect.right,
        viewport: innerWidth,
        scroll: node.scrollWidth,
      };
    });
    expect(size.width).toBeGreaterThanOrEqual(
      Math.min(900, size.viewport - 16)
    );
    expect(size.right, JSON.stringify(size)).toBeLessThanOrEqual(
      size.viewport + 1
    );
    expect(size.scroll).toBeLessThanOrEqual(size.width + 1);
    const scrollers = await dialog
      .locator(
        ':scope > [data-slot="scroll-area"], :scope > .admin-drawer-body'
      )
      .evaluateAll((nodes) =>
        nodes.map((node) => ({
          width: node.clientWidth,
          scroll: node.scrollWidth,
        }))
      );
    for (const scroller of scrollers)
      expect(scroller.scroll).toBeLessThanOrEqual(scroller.width + 1);
  }).toPass({ timeout: 5000 });
  const buttons = dialog.locator('[data-slot="sheet-footer"] button');
  for (const button of await buttons.all())
    await expect(button).toBeInViewport();
  await expectNoPageOverflow(page);
}

async function closePanel(dialog: Locator) {
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await expect(dialog).toHaveCount(0);
}

test("create drawers share roomy widths and keep actions visible on small screens", async ({
  page,
  baseURL,
}) => {
  test.setTimeout(180_000);
  await mockLayoutApi(page);
  await signInFixture(page, baseURL!);
  for (const section of [
    "ads",
    "announcement",
    "coupon",
    "document",
    "redemption",
    "product",
    "payment",
    "user",
  ]) {
    await test.step(section, async () => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`/dashboard/${section}`, {
        waitUntil: "domcontentloaded",
      });
      await page
        .getByRole("button", {
          name: section === "payment" ? "Add Payment Method" : "Create",
          exact: true,
        })
        .click();
      const dialog = page.getByRole("dialog");
      await expectPanelFits(page, dialog);
      for (const width of [375, 320]) {
        await page.setViewportSize({ width, height: 600 });
        await expectPanelFits(page, dialog);
      }
      await closePanel(dialog);
    });
  }
});

test("server fields reflow, protocol actions fit, and multiplier values still save", async ({
  page,
  baseURL,
}) => {
  const writes = await mockLayoutApi(page);
  await signInFixture(page, baseURL!);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/dashboard/servers", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Create", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expectPanelFits(page, dialog);
  const name = dialog.locator('input[name="name"]');
  await expect
    .poll(async () => (await name.boundingBox())!.width)
    .toBeGreaterThan(350);
  const addProtocol = dialog.getByRole("button", {
    name: "Add Protocol",
    exact: true,
  });
  await expect(async () => {
    const layout = await addProtocol.evaluate((node) => {
      const range = document.createRange();
      range.selectNodeContents(node);
      return {
        text: range.getBoundingClientRect().height,
        button: node.clientHeight,
      };
    });
    expect(layout.text).toBeLessThanOrEqual(layout.button);
  }).toPass();
  await addProtocol.click();
  await page.getByRole("menuitem", { name: "vless", exact: true }).click();
  await dialog
    .locator('input[name="protocols.0.name"]')
    .fill("LongProtocolNameWithoutSpaces".repeat(8));
  await page.setViewportSize({ width: 375, height: 600 });
  await expectPanelFits(page, dialog);
  const topFields = dialog.locator(
    'input[name="name"], input[name="address"], input[name="country"], input[name="city"]'
  );
  const positions = await topFields.evaluateAll((nodes) =>
    nodes.map((node) => node.getBoundingClientRect().top)
  );
  expect(
    positions.every((top, index) => index === 0 || top > positions[index - 1]!)
  ).toBe(true);
  await closePanel(dialog);

  let release!: () => void;
  const settingsResponse = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/system/get_node_multiplier*", async (route) => {
    await settingsResponse;
    await route.fallback();
  });
  try {
    await page.getByRole("button", { name: /Dynamic multiplier/ }).click();
    await expect(dialog.getByRole("status", { name: "Loading" })).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: "Save", exact: true })
    ).toBeDisabled();
    await expect(dialog.locator('input[type="time"]')).toHaveCount(0);
  } finally {
    release();
  }
  await expectPanelFits(page, dialog);
  await dialog.locator('input[type="time"]').nth(0).fill("09:00:00");
  await dialog.locator('input[type="time"]').nth(1).fill("18:00:00");
  const multiplier = dialog.locator('input[type="number"]');
  await multiplier.fill("1.5");
  expect((await multiplier.boundingBox())!.width).toBeGreaterThan(140);
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect
    .poll(
      () =>
        writes.find((write) =>
          write.path.endsWith("/system/set_node_multiplier")
        )?.body
    )
    .toEqual({
      periods: [
        { start_time: "09:00:00", end_time: "18:00:00", multiplier: 1.5 },
      ],
    });
});

test("node fields and long tags fit without changing create payloads", async ({
  page,
  baseURL,
}) => {
  const writes = await mockLayoutApi(page);
  await signInFixture(page, baseURL!);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/dashboard/nodes", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /Create/, exact: false }).click();
  const dialog = page.getByRole("dialog");
  await expectPanelFits(page, dialog);
  await dialog.getByRole("group", { name: /Select server/ }).click();
  await page.getByRole("option", { name: /Tokyo/ }).click();
  const tag = "long-node-tag-without-spaces-".repeat(8);
  await dialog.locator('[data-slot="tag-input"] input').fill(tag);
  await dialog.locator('[data-slot="tag-input"] input').press("Enter");
  await page.setViewportSize({ width: 320, height: 640 });
  await expectPanelFits(page, dialog);
  const nodeFields = dialog.locator(
    'input[name="name"], input[name="address"]'
  );
  const nodeFieldBounds = await nodeFields.evaluateAll((nodes) =>
    nodes.map((node) => ({
      top: node.getBoundingClientRect().top,
      width: node.getBoundingClientRect().width,
    }))
  );
  expect(nodeFieldBounds[1]!.top).toBeGreaterThan(nodeFieldBounds[0]!.top);
  expect(nodeFieldBounds[0]!.width).toBeGreaterThan(220);
  await dialog.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect
    .poll(
      () =>
        writes.find((write) => write.path.endsWith("/server/node/create"))?.body
    )
    .toMatchObject({
      server_id: "1",
      protocol: "vless",
      protocol_id: "10",
      port: 443,
      tags: [tag],
    });
});

test("mobile navigation sizes its outer sheet independently of business drawers", async ({
  page,
  baseURL,
}) => {
  await mockLayoutApi(page);
  await signInFixture(page, baseURL!);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/dashboard/group", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /Toggle Sidebar/ }).click();
  const sidebar = page.locator('[data-sidebar="sidebar"][data-mobile="true"]');
  await expect(sidebar).toBeVisible();
  for (const width of [320, 375, 430, 767]) {
    await page.setViewportSize({ width, height: 812 });
    await expect(async () => {
      const dimensions = await sidebar.evaluate((node) => ({
        dialog: node.getBoundingClientRect().width,
        content: Number.parseFloat(getComputedStyle(node.parentElement!).width),
      }));
      expect(dimensions.content).toBe(288);
      expect(dimensions.dialog).toBe(288);
    }).toPass();
    await expectNoPageOverflow(page);
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.mouse.click(350, 400);
  await expect(sidebar).toBeHidden();
});

test("nested subscription drawers scroll locally and the mobile sidebar stays compact", async ({
  page,
  baseURL,
}) => {
  await mockLayoutApi(page);
  await page.route(/\/v1\/admin\/user\/list(?:\?|$)/, (route) =>
    route.fulfill({ json: { code: 200, data: { list: [account], total: 1 } } })
  );
  await signInFixture(page, baseURL!);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/dashboard/user", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Subscription", exact: true }).click();
  const list = page.getByRole("dialog", { name: /Subscription List/ });
  await expectPanelFits(page, list);
  await list.getByRole("button", { name: "Add", exact: true }).click();
  const nested = page.getByRole("dialog", {
    name: "Create Subscription",
    exact: true,
  });
  await expectPanelFits(page, nested);
  await page.setViewportSize({ width: 375, height: 600 });
  await expectPanelFits(page, nested);
  await closePanel(nested);
  await expectPanelFits(page, list);
  await closePanel(list);
  await page.getByRole("button", { name: /Toggle Sidebar/ }).click();
  const sidebar = page.locator('[data-sidebar="sidebar"][data-mobile="true"]');
  await expect(sidebar).toBeVisible();
  expect((await sidebar.boundingBox())!.width).toBeLessThan(
    page.viewportSize()!.width
  );
});

test("ticket conversations wrap long content and keep reply controls outside the scroll area", async ({
  page,
  baseURL,
}) => {
  await mockLayoutApi(page);
  const ticket = {
    id: "ticket-layout",
    title: `Connection question ${"long-title-".repeat(8)}`,
    user_id: account.id,
    status: 1,
    created_at: 1_700_000_000,
    updated_at: 1_700_000_000,
    description: `https://example.test/${"long-path".repeat(80)}\nSecond line`,
    follow: Array.from({ length: 15 }, (_, index) => ({
      id: String(index),
      type: 1,
      from: index % 2 ? "System" : "User",
      content: `Message ${index}: ${"content-".repeat(40)}`,
      created_at: 1_700_000_000,
    })),
  };
  const replies: unknown[] = [];
  await page.route(/\/v1\/admin\/ticket\//, async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/follow")) {
      const body = route.request().postDataJSON();
      replies.push(body);
      ticket.follow.push({ ...body, id: "new", created_at: 1_700_000_001 });
    }
    await route.fulfill({
      json: {
        code: 200,
        data: path.endsWith("/list") ? { list: [ticket], total: 1 } : ticket,
      },
    });
  });
  await signInFixture(page, baseURL!);
  await page.setViewportSize({ width: 375, height: 600 });
  await page.goto("/dashboard/ticket", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Reply", exact: true }).click();
  const dialog = page.getByRole("dialog");
  const scroller = dialog.locator('[data-slot="scroll-area"]');
  await expect(dialog.getByRole("heading")).toHaveText(ticket.title);
  await expect(async () => {
    const sizes = await scroller.evaluate((node) => ({
      client: node.clientWidth,
      scroll: node.scrollWidth,
      top: node.scrollTop,
      height: node.clientHeight,
      scrollHeight: node.scrollHeight,
    }));
    expect(sizes.scroll).toBeLessThanOrEqual(sizes.client + 1);
    expect(sizes.scrollHeight).toBeGreaterThan(sizes.height);
    expect(sizes.top + sizes.height).toBeGreaterThanOrEqual(
      sizes.scrollHeight - 2
    );
  }).toPass();
  const reply = dialog.getByRole("textbox");
  await expect(reply).toBeInViewport();
  await reply.fill("Reply after responsive layout change");
  await dialog.locator('button[type="submit"]').click();
  await expect
    .poll(() => replies)
    .toEqual([
      {
        ticket_id: ticket.id,
        from: "System",
        type: 1,
        content: "Reply after responsive layout change",
      },
    ]);
  await expect(reply).toHaveValue("");
  await expect(
    dialog.getByText("Reply after responsive layout change", { exact: true })
  ).toBeInViewport();
  await expectNoPageOverflow(page);
  await closePanel(dialog);
  ticket.status = 4;
  await page.reload();
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(dialog.getByRole("heading")).toHaveText(ticket.title);
  await expect(dialog.getByRole("textbox")).toHaveCount(0);
});
