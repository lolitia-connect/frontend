import { expect, test } from "@playwright/test";
import {
  expectFullWidthSidebarLink,
  expectNoPageOverflow,
  expectSingleRowTabs,
  mockLayoutApi,
  servers,
  signInFixture,
} from "../../../../tests/e2e/layout.fixtures";

test("sidebar navigation starts progress before the route response arrives", async ({
  page,
  baseURL,
}) => {
  await mockLayoutApi(page);
  await signInFixture(page, baseURL!);
  await page.goto("/dashboard/group", { waitUntil: "domcontentloaded" });
  const bar = page.getByRole("progressbar", { name: "Loading", exact: true });
  await expect(bar).toBeHidden();

  let release!: () => void;
  let requested = false;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(
    (url) => url.pathname === "/dashboard/servers",
    async (route) => {
      requested = true;
      await gate;
      await route.continue();
    }
  );

  const serverLink = page.locator(
    '[data-sidebar="sidebar"] a[href="/dashboard/servers"]'
  );
  try {
    await serverLink.click();
    await expect.poll(() => requested).toBe(true);
    await expect(bar).toBeVisible();
    await expect(bar).not.toHaveAttribute("aria-valuenow");
    // Keep the response blocked beyond the old 250 ms completion timer.
    await page.waitForTimeout(1000);
    await expect(bar).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard\/group$/);
  } finally {
    release();
  }

  await expect(page).toHaveURL(/\/dashboard\/servers$/);
  await expect(bar).toBeHidden();
  await serverLink.click();
  await expect(bar).toBeHidden();
});

test("server table and editor stay within mobile viewport", async ({
  page,
  baseURL,
}) => {
  await mockLayoutApi(page);
  await signInFixture(page, baseURL!);
  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/v1/admin/server/list") && response.ok()
    ),
    page.goto("/dashboard/servers", { waitUntil: "domcontentloaded" }),
  ]);
  const grid = page.getByRole("grid");
  await expect(grid.getByText(servers[0]!.name, { exact: true })).toBeVisible();
  const shortcuts = page.locator("main .settings-option");
  await expect(shortcuts).toHaveCount(2);
  const shortcutBackgrounds = await shortcuts.evaluateAll((nodes) =>
    nodes.map((node) => getComputedStyle(node).backgroundColor)
  );
  expect(shortcutBackgrounds[0]).not.toBe("rgba(0, 0, 0, 0)");
  expect(shortcutBackgrounds[1]).toBe(shortcutBackgrounds[0]);
  const toolbar = page
    .getByRole("button", { name: "Sort by Name", exact: true })
    .locator("xpath=../..");
  for (const width of [320, 375, 407, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await expectNoPageOverflow(page);
    const toolbarBounds = await toolbar.boundingBox();
    expect(toolbarBounds).not.toBeNull();
    expect(toolbarBounds!.x + toolbarBounds!.width).toBeLessThanOrEqual(
      width + 1
    );
    for (const button of [
      page.getByRole("button", { name: "Sort by Name", exact: true }),
      page.getByRole("button", { name: "Create", exact: true }),
    ]) {
      const bounds = await button.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
    }
  }
  const columnToggle = page.getByRole("button", { name: "Choose columns" });
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expectNoPageOverflow(page);
    const insets = await columnToggle.evaluate((button) => {
      const bounds = button.getBoundingClientRect();
      const icon = button.querySelector("svg")!.getBoundingClientRect();
      return {
        left: icon.left - bounds.left,
        right: bounds.right - icon.right,
        top: icon.top - bounds.top,
        bottom: bounds.bottom - icon.bottom,
      };
    });
    expect(Math.min(...Object.values(insets))).toBeGreaterThanOrEqual(0);
    expect(insets.left).toBeCloseTo(insets.right, 0);
    expect(insets.top).toBeCloseTo(insets.bottom, 0);
    const scroller = grid.locator("..");
    const bounds = await scroller.boundingBox();
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
    await scroller.evaluate((node) => {
      node.scrollLeft = node.scrollWidth;
    });
    await expect(
      grid
        .getByRole("row")
        .filter({ hasText: servers[0]!.name })
        .getByRole("button", { name: /Copy|复制/ })
    ).toBeInViewport();
  }
  await page.setViewportSize({ width: 320, height: 600 });
  await page.getByRole("button", { name: "Create", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(async () => {
    const dimensions = await dialog.evaluate((node) => ({
      right: node.getBoundingClientRect().right,
      client: node.clientWidth,
      scroll: node.scrollWidth,
    }));
    expect(dimensions.right).toBeLessThanOrEqual(321);
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
  }).toPass();
  for (const button of await dialog
    .locator('[data-slot="sheet-footer"] button')
    .all())
    await expect(button).toBeInViewport();
  await expectNoPageOverflow(page);
});

test("server addresses sit below location and reveal ellipsized text on hover or focus", async ({
  page,
  baseURL,
}) => {
  await mockLayoutApi(page);
  await signInFixture(page, baseURL!);
  await page.goto("/dashboard/servers", { waitUntil: "domcontentloaded" });
  const row = page.getByRole("row").filter({ hasText: servers[0]!.name });
  const region = row.getByText("JP / Tokyo", { exact: true });
  const address = row.getByText(servers[0]!.address, { exact: true });
  const tooltip = page.getByRole("tooltip");
  await expect(address).toBeVisible();

  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await address.scrollIntoViewIfNeeded();
    const regionBounds = await region.boundingBox();
    const addressBounds = await address.boundingBox();
    expect(addressBounds!.y).toBeGreaterThanOrEqual(
      regionBounds!.y + regionBounds!.height
    );
    expect(addressBounds!.x).toBeCloseTo(regionBounds!.x, 0);
    const dimensions = await address.evaluate((node) => ({
      client: node.clientWidth,
      scroll: node.scrollWidth,
    }));
    expect(dimensions.scroll).toBeGreaterThan(dimensions.client);
    await expect(address).toHaveCSS("text-overflow", "ellipsis");
    await expect(address).toHaveCSS("overflow", "hidden");
    await expect(address).toHaveCSS("white-space", "nowrap");
    await address.hover();
    await expect(tooltip).toHaveText(servers[0]!.address);
    await region.hover();
    await expect(tooltip).toHaveCount(0);
    await expectNoPageOverflow(page);
  }

  await address.focus();
  await expect(tooltip).toHaveText(servers[0]!.address);
  await address.press("Tab");
  await expect(tooltip).toHaveCount(0);
});

test("dashboard summary cards have consistent heights across grid rows", async ({
  page,
  baseURL,
}) => {
  await mockLayoutApi(page);
  await signInFixture(page, baseURL!);
  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/common/site/config") && response.ok()
    ),
    page.goto("/dashboard", { waitUntil: "domcontentloaded" }),
  ]);
  const grid = page.locator("main [class~='grid-cols-1']").first();
  await expect
    .poll(() => grid.evaluate((node) => node.children.length))
    .toBe(6);

  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const measurements = await grid.evaluate((node) =>
      Array.from(node.children, (child) => {
        const card = child.querySelector(".card") ?? child;
        const bounds = card.getBoundingClientRect();
        const header = card.querySelector(".card__header");
        const content = card.querySelector(".card__content");
        const contentBounds =
          header && content
            ? {
                top: header.getBoundingClientRect().top,
                bottom: content.getBoundingClientRect().bottom,
              }
            : content?.firstElementChild?.getBoundingClientRect();
        return {
          height: bounds.height,
          centerOffset: contentBounds
            ? Math.abs(
                (contentBounds.top + contentBounds.bottom) / 2 -
                  (bounds.top + bounds.bottom) / 2
              )
            : Number.POSITIVE_INFINITY,
        };
      })
    );
    const heights = measurements.map(({ height }) => height);
    expect(
      heights.every((height) => height > 0),
      JSON.stringify(measurements)
    ).toBe(true);
    expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(1);
    expect(
      measurements.every(({ centerOffset }) => centerOffset <= 1),
      JSON.stringify(measurements)
    ).toBe(true);
  }
});

for (const { title, endpoint, metrics } of [
  {
    title: "Revenue Statistics",
    endpoint: "revenue",
    metrics: {
      new_order_amount: 12_000,
      renewal_order_amount: 3000,
      recharge_order_amount: 5000,
      redemption_order_amount: 0,
      amount_total: 20_000,
    },
  },
  {
    title: "User Statistics",
    endpoint: "user",
    metrics: {
      register: 12,
      new_order_users: 6,
      renewal_order_users: 3,
      recharge_order_users: 5,
      redemption_order_users: 0,
    },
  },
]) {
  test(`dashboard ${title} charts render across tabs and viewport sizes`, async ({
    page,
    baseURL,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await mockLayoutApi(page);
    await page.route(`**/admin/console/${endpoint}`, (route) =>
      route.fulfill({
        json: {
          code: 200,
          msg: "success",
          data: {
            today: metrics,
            monthly: {
              ...metrics,
              list: [
                { ...metrics, date: "2026-11-18" },
                { ...metrics, date: "2026-11-19" },
              ],
            },
            all: {
              ...metrics,
              list: [
                { ...metrics, date: "2026-10" },
                { ...metrics, date: "2026-11" },
              ],
            },
          },
        },
      })
    );
    await signInFixture(page, baseURL!);
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    const card = page.locator(".card").filter({
      has: page.getByRole("heading", { name: title, exact: true }),
    });
    await expect(card).toBeVisible({ timeout: 30_000 });

    for (const width of [1280, 375, 768]) {
      await page.setViewportSize({ width, height: 900 });
      for (const { tab, shape } of [
        { tab: "Today", shape: ".recharts-sector" },
        { tab: "Month", shape: ".recharts-rectangle" },
        { tab: "Total", shape: ".recharts-area-area" },
        { tab: "Today", shape: ".recharts-sector" },
      ]) {
        await card.getByRole("tab", { name: tab, exact: true }).click();
        const panel = card.getByRole("tabpanel", { name: tab, exact: true });
        const chart = panel.locator('[data-slot="chart"]');
        await expect(chart.locator("svg.recharts-surface")).toBeVisible();
        await expect(chart.locator(shape).first()).toBeVisible();
        await expect(chart.locator(".recharts-legend-wrapper")).toBeVisible();
        await expect(
          chart.locator(".recharts-legend-wrapper").getByText("Recharge", {
            exact: true,
          })
        ).toBeVisible();
        await expect(
          panel.locator(".card__footer").getByText("Recharge", { exact: true })
        ).toBeVisible();
        await expect(async () => {
          const chartBounds = await chart.boundingBox();
          const contentBounds = await panel
            .locator(".card__content")
            .boundingBox();
          expect(chartBounds!.width).toBeGreaterThan(0);
          expect(chartBounds!.height).toBeGreaterThan(0);
          expect(chartBounds!.x).toBeGreaterThanOrEqual(contentBounds!.x - 1);
          expect(chartBounds!.x + chartBounds!.width).toBeLessThanOrEqual(
            contentBounds!.x + contentBounds!.width + 1
          );
          expect(chartBounds!.y + chartBounds!.height).toBeLessThanOrEqual(
            contentBounds!.y + contentBounds!.height + 1
          );
        }).toPass();
      }
      await expectNoPageOverflow(page);
    }
    expect(errors).toEqual([]);
  });
}

test("sidebar toggle divider stays thin, short and centered", async ({
  page,
  baseURL,
}) => {
  await mockLayoutApi(page);
  await signInFixture(page, baseURL!);
  await page.goto("/dashboard/group");
  const toggle = page.locator('header [data-sidebar="trigger"]');
  const divider = page.locator(
    'header [data-slot="separator"][data-orientation="vertical"]'
  );
  const expectDividerGeometry = async () => {
    await expect(divider).toBeVisible();
    await expect(async () => {
      const line = await divider.boundingBox();
      const button = await toggle.boundingBox();
      expect(line).not.toBeNull();
      expect(button).not.toBeNull();
      expect(line!.width).toBe(1);
      expect(line!.height).toBe(16);
      expect(
        Math.abs(line!.y + line!.height / 2 - button!.y - button!.height / 2)
      ).toBeLessThanOrEqual(1);
      expect(line!.x).toBeGreaterThanOrEqual(button!.x + button!.width);
    }).toPass();
  };

  await expectDividerGeometry();
  const sidebar = page.locator('[data-slot="sidebar"][data-state]');
  await expect(sidebar).toHaveAttribute("data-state", "expanded");
  await toggle.click();
  await expect(sidebar).toHaveAttribute("data-state", "collapsed");
  await expectDividerGeometry();
  await toggle.click();
  await expect(sidebar).toHaveAttribute("data-state", "expanded");
  await expectDividerGeometry();
  await page.setViewportSize({ width: 375, height: 812 });
  await expectDividerGeometry();
});

for (const language of ["en-US", "zh-CN"]) {
  test(`sidebar hit area and group tabs stay usable in ${language}`, async ({
    page,
    baseURL,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await mockLayoutApi(page);
    await signInFixture(page, baseURL!, language);
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/v1/admin/group/config") && response.ok()
      ),
      page.goto("/dashboard/group"),
    ]);
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    const groupLink = page.locator(
      '[data-sidebar="menu-button"][href="/dashboard/group"]'
    );
    await expectFullWidthSidebarLink(groupLink);
    const tabs = page.getByRole("tablist").first().getByRole("tab");
    await expect(tabs).toHaveCount(7);
    await expectSingleRowTabs(tabs);
    await expectNoPageOverflow(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await expectSingleRowTabs(tabs);
    await tabs.first().focus();
    await page.keyboard.press("End");
    await page.keyboard.press("Enter");
    await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
    await expect(tabs.last()).toBeInViewport();
    await expect(page.getByRole("tabpanel")).toBeVisible();
    await expectNoPageOverflow(page);
    expect(errors).toEqual([]);
  });
}

for (const language of ["en-US", "zh-CN"]) {
  test(`breadcrumbs scroll without displacing header controls in ${language}`, async ({
    page,
    baseURL,
  }) => {
    await mockLayoutApi(page);
    await signInFixture(page, baseURL!, language);
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/common/site/config") && response.ok()
      ),
      page.goto("/dashboard/auth-control"),
    ]);
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    const breadcrumb = page.locator('header [data-slot="breadcrumb"]');
    const currentPage = breadcrumb.locator('[aria-current="page"]');
    await expect(currentPage).toBeVisible();
    const title = await currentPage.textContent();
    const controls = page.locator("header > div").last();

    for (const width of [320, 375, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await expectNoPageOverflow(page);
      const bounds = await controls.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      const sizes = await breadcrumb.evaluate((node) => ({
        client: node.clientWidth,
        scroll: node.scrollWidth,
      }));
      if (width === 320) {
        expect(sizes.scroll).toBeGreaterThan(sizes.client);
        await breadcrumb.evaluate((node) => {
          node.scrollLeft = node.scrollWidth;
        });
        expect(
          await breadcrumb.evaluate((node) => node.scrollLeft)
        ).toBeGreaterThan(0);
        await expect(currentPage).toBeInViewport();
      }
      await expect(currentPage).toHaveText(title!);
    }
    await breadcrumb.locator('[data-slot="breadcrumb-link"]').first().click();
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 });
  });
}

test("server columns and actions stay separate, with local scrolling and keyboard reordering", async ({
  page,
  baseURL,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const writes = await mockLayoutApi(page);
  await signInFixture(page, baseURL!, "zh-CN");
  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/v1/admin/server/list") && response.ok()
    ),
    page.goto("/dashboard/servers"),
  ]);
  const grid = page.getByRole("grid");
  const tokyo = grid.getByRole("row").filter({ hasText: servers[0]!.name });
  await expect(tokyo).toBeVisible();
  const cells = tokyo.locator("td, th");
  const actions = cells.last();
  await expect(actions.getByRole("button")).toHaveCount(5);
  const bounds = await cells.evaluateAll((nodes) =>
    nodes.map((node) => ({
      left: node.getBoundingClientRect().left,
      right: node.getBoundingClientRect().right,
    }))
  );
  for (let index = 1; index < bounds.length; index++)
    expect(bounds[index]!.left).toBeGreaterThanOrEqual(
      bounds[index - 1]!.right - 1
    );
  const labels = await actions.getByRole("button").evaluateAll((nodes) =>
    nodes.map((node) => {
      const range = document.createRange();
      range.selectNodeContents(node);
      return {
        text: node.textContent,
        height: range.getBoundingClientRect().height,
        lineHeight: Number.parseFloat(getComputedStyle(node).lineHeight),
      };
    })
  );
  for (const label of labels)
    expect(label.height, label.text ?? "action").toBeLessThanOrEqual(
      label.lineHeight + 2
    );
  await expectNoPageOverflow(page);

  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  const handle = tokyo.getByRole("button", { name: /Reorder|排序/ });
  await handle.press("Space");
  await expect(handle).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("status")).toContainText("droppable area 1");
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("status")).toContainText("droppable area 2");
  await page.keyboard.press("Space");
  await expect
    .poll(
      () =>
        writes.filter((write) => write.path.endsWith("/server/server/sort"))
          .length
    )
    .toBe(1);
  await expect(grid.getByRole("row").nth(1)).toContainText(servers[1]!.name);
  const reorderedTokyo = grid
    .getByRole("row")
    .filter({ hasText: servers[0]!.name });
  await reorderedTokyo.getByRole("button", { name: /连接|Connect/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.setViewportSize({ width: 375, height: 812 });
  await expectNoPageOverflow(page);
  const scroller = grid.locator("..");
  const sizes = await scroller.evaluate((node) => ({
    client: node.clientWidth,
    scroll: node.scrollWidth,
  }));
  expect(sizes.scroll).toBeGreaterThan(sizes.client);
  await scroller.evaluate((node) => {
    node.scrollLeft = node.scrollWidth;
  });
  await expect(
    reorderedTokyo.getByRole("button", { name: /复制|Copy/ })
  ).toBeInViewport();
  expect(errors).toEqual([]);
});

test("order table preserves its status update payload and narrow-screen controls", async ({
  page,
  baseURL,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const writes = await mockLayoutApi(page);
  await signInFixture(page, baseURL!);
  await page.goto("/dashboard/order");
  const row = page.getByRole("row").filter({ hasText: "20261118000000000001" });
  const status = row.getByRole("group", { name: "Status", exact: true });
  await status.click();
  await page.getByRole("option", { name: "Cancelled", exact: true }).click();
  await expect
    .poll(
      () => writes.find((write) => write.path.endsWith("/order/status"))?.body
    )
    .toEqual({ id: "o1", status: 3 });
  await page.setViewportSize({ width: 320, height: 800 });
  await expectNoPageOverflow(page);
  await expect(
    page.getByRole("button", { name: /next page/i })
  ).toBeInViewport();
  expect(errors).toEqual([]);
});

for (const language of ["en-US", "zh-CN"]) {
  test(`settings options wrap on mobile and retain native feedback in ${language}`, async ({
    page,
    baseURL,
  }) => {
    test.setTimeout(180_000);
    await mockLayoutApi(page);
    await signInFixture(page, baseURL!, language);

    for (const route of [
      "servers",
      "auth-control",
      "system",
      "marketing",
      "subscribe",
    ]) {
      await page.goto(`/dashboard/${route}`);
      const options = page.locator(".settings-option");
      await expect(options.first()).toBeVisible({ timeout: 60_000 });
      if (route === "servers") await expect(options).toHaveCount(2);

      for (const theme of ["light", "dark"]) {
        await page.evaluate((value) => {
          document.documentElement.classList.toggle("dark", value === "dark");
          document.documentElement.setAttribute("data-theme", value);
        }, theme);
        for (const width of [320, 375, 768, 1280]) {
          await page.setViewportSize({ width, height: 900 });
          await expectNoPageOverflow(page);
          await expect(async () => {
            const overflow = await options.evaluateAll((nodes) =>
              nodes.flatMap((node) => {
                const bounds = node.getBoundingClientRect();
                return Array.from(node.querySelectorAll("span"))
                  .filter((span) => {
                    if (span.children.length) return false;
                    const range = document.createRange();
                    range.selectNodeContents(span);
                    const text = range.getBoundingClientRect();
                    return (
                      text.left < bounds.left - 1 ||
                      text.right > bounds.right + 1 ||
                      text.bottom > bounds.bottom + 1
                    );
                  })
                  .map((span) => span.textContent);
              })
            );
            expect(overflow).toEqual([]);
          }).toPass();
        }
        if (route === "servers") {
          expect(
            await options.evaluateAll((nodes) =>
              nodes.every(
                (node) =>
                  getComputedStyle(node).color ===
                  getComputedStyle(document.body).color
              )
            )
          ).toBe(true);
        }
      }

      if (route === "servers" || route === "auth-control") {
        const count = route === "servers" ? 2 : 1;
        for (let index = 0; index < count; index++) {
          const option = options.nth(index);
          await page.mouse.move(0, 0);
          await expect(option).not.toHaveAttribute("data-hovered", "true");
          const background = await option.evaluate(
            (node) => getComputedStyle(node).backgroundColor
          );
          await option.hover();
          await expect
            .poll(() =>
              option.evaluate((node) => getComputedStyle(node).backgroundColor)
            )
            .not.toBe(background);
          const idle = (await option.boundingBox())!;
          await page.mouse.down();
          await expect(option).toHaveAttribute("data-pressed", "true");
          await expect
            .poll(async () => (await option.boundingBox())!.width)
            .toBeLessThan(idle.width - 1);
          await page.mouse.up();
          const dialog = page.getByRole("dialog");
          await expect(dialog).toBeVisible();
          await expect(dialog).toBeFocused();
          await page.keyboard.press("Escape");
          await expect(dialog).toHaveCount(0);
        }
      }
    }
  });
}

test("settings lists open their native sheets by keyboard and keep long tabs scrollable", async ({
  page,
  baseURL,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await mockLayoutApi(page);
  await signInFixture(page, baseURL!);
  await page.goto("/dashboard/auth-control");
  const trigger = page.getByRole("button", { name: /Email Settings/ });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", {
    name: "Email Settings",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  const tabs = dialog.getByRole("tablist").getByRole("tab");
  await expect(tabs).toHaveCount(6);
  await expectSingleRowTabs(tabs);
  await page.setViewportSize({ width: 375, height: 812 });
  await expectSingleRowTabs(tabs);
  await tabs.first().focus();
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
  await expect(tabs.last()).toBeInViewport();
  await expect(dialog.getByRole("tabpanel")).toBeVisible();
  await expectNoPageOverflow(page);
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  expect(errors).toEqual([]);
});
