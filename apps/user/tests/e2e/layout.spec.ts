import { expect, test } from "@playwright/test";
import {
  documents,
  expectFullWidthSidebarLink,
  expectNoPageOverflow,
  expectSingleRowTabs,
  mockLayoutApi,
  signInFixture,
} from "../../../../tests/e2e/layout.fixtures";

test("payment bill and completed-order actions fit mobile widths", async ({
  page,
  baseURL,
}) => {
  await mockLayoutApi(page);
  await signInFixture(page, baseURL!);
  const orderNo = "ORDER".repeat(25);
  await page.route(/\/public\/order\/detail(?:\?|$)/, (route) =>
    route.fulfill({
      json: {
        code: 200,
        data: {
          order_no: orderNo,
          status: 5,
          type: 4,
          created_at: 1_800_000_000,
          amount: 12_345_678_900,
          price: 12_345_678_900,
          fee_amount: 12_345,
          payment: { name: "Provider".repeat(30), platform: "alipay" },
        },
      },
    })
  );
  await page.goto(`/payment?order_no=${orderNo}`);
  await expect(page.getByText(orderNo, { exact: true })).toBeVisible();
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expectNoPageOverflow(page);
    for (const card of await page.locator("main .card").all()) {
      const sizes = await card.evaluate((node) => ({
        client: node.clientWidth,
        scroll: node.scrollWidth,
      }));
      expect(sizes.scroll).toBeLessThanOrEqual(sizes.client + 1);
    }
  }
});

test("profile cards and document content fit narrow screens without clipping", async ({
  page,
  baseURL,
}) => {
  test.setTimeout(180_000);
  await mockLayoutApi(page);
  await signInFixture(page, baseURL!);
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/profile");
    await expect(
      page.getByRole("button", { name: "Save", exact: true })
    ).toBeVisible();
    await expectNoPageOverflow(page);
    const cards = page.locator("main .card");
    for (const card of await cards.all()) {
      const sizes = await card.evaluate((node) => ({
        client: node.clientWidth,
        scroll: node.scrollWidth,
      }));
      expect(sizes.scroll).toBeLessThanOrEqual(sizes.client + 1);
    }
  }
  const title = "ConnectionGuide".repeat(15);
  const content = [
    "# Long content",
    `https://example.test/${"long-path".repeat(80)}`,
    `| ${new Array(12).fill("Column").join(" | ")} |`,
    `| ${new Array(12).fill("---").join(" | ")} |`,
    `| ${new Array(12).fill("Wide table content").join(" | ")} |`,
    "",
    "```text",
    "command".repeat(100),
    "```",
  ].join("\n");
  await page.route(/\/public\/document\/list(?:\?|$)/, (route) =>
    route.fulfill({
      json: { code: 200, data: { list: [{ ...documents[0], title }] } },
    })
  );
  await page.route(/\/public\/document\/detail(?:\?|$)/, (route) =>
    route.fulfill({ json: { code: 200, data: { content } } })
  );
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/document");
  await expect(page.getByText(title, { exact: true })).toBeVisible();
  await expectNoPageOverflow(page);
  await page.getByRole("button", { name: "Read", exact: true }).click();
  const table = page.locator('[data-slot="markdown-table-scroll"]');
  await expect(table).toBeVisible();
  for (const width of [320, 375, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await expectNoPageOverflow(page);
    const sizes = await table.evaluate((node) => ({
      client: node.clientWidth,
      scroll: node.scrollWidth,
      right: node.getBoundingClientRect().right,
    }));
    expect(sizes.right).toBeLessThanOrEqual(width);
    if (width < 500) {
      expect(sizes.scroll).toBeGreaterThan(sizes.client);
      await table.evaluate((node) => {
        node.scrollLeft = node.scrollWidth;
      });
      expect(await table.evaluate((node) => node.scrollLeft)).toBeGreaterThan(
        0
      );
    }
  }
});

for (const language of ["en-US", "zh-CN"]) {
  test(`main empty states match ticket support in ${language}`, async ({
    page,
    baseURL,
  }) => {
    test.setTimeout(180_000);
    const ready = expect.configure({ timeout: 30_000 });
    await mockLayoutApi(page);
    await signInFixture(page, baseURL!, language);
    await page.addInitScript(() => {
      Math.random = () => 0;
    });
    await page.route(/\/public\/document\/list(?:\?|$)/, (route) =>
      route.fulfill({ json: { code: 200, msg: "success", data: { list: [] } } })
    );

    for (const width of [1440, 375]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/ticket", { waitUntil: "domcontentloaded" });
      const ticketEmpty = page.locator('main [data-slot="empty"]').first();
      await ready(ticketEmpty).toBeVisible();
      const description =
        language === "zh-CN" ? "想象一下" : "Imagine this space";
      await ready(
        ticketEmpty.locator('[data-slot="empty-description"]')
      ).toContainText(description);
      const reference = await ticketEmpty.locator("../../..").boundingBox();
      expect(reference).not.toBeNull();

      for (const path of ["/document", "/subscribe", "/servers"]) {
        await page.goto(path, { waitUntil: "domcontentloaded" });
        const empty = page.locator('main [data-slot="empty"]').first();
        await ready(empty).toBeVisible();
        await ready(
          empty.locator('[data-slot="empty-description"]')
        ).toContainText(description);
        const panel =
          path === "/servers" ? empty.locator("../..") : empty.locator("..");
        const bounds = await panel.boundingBox();
        expect(bounds).not.toBeNull();
        expect(
          Math.abs(bounds!.height - reference!.height),
          `${path} at ${width}px`
        ).toBeLessThanOrEqual(2);
        const centerOffset = await empty.evaluate((node, isServer) => {
          const container = isServer
            ? node.parentElement!.parentElement!
            : node.parentElement!;
          const contentBounds = node.getBoundingClientRect();
          const containerBounds = container.getBoundingClientRect();
          return Math.abs(
            contentBounds.y +
              contentBounds.height / 2 -
              containerBounds.y -
              containerBounds.height / 2
          );
        }, path === "/servers");
        expect(centerOffset).toBeLessThanOrEqual(1);
        await expectNoPageOverflow(page);
      }
    }
  });
}

for (const language of ["en-US", "zh-CN", "zh-TW", "zh-HK", "ja-JP"]) {
  test(`user sidebar and document tabs remain usable in ${language}`, async ({
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
          response.url().includes("/v1/public/document/list") && response.ok()
      ),
      page.goto("/document"),
    ]);
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    await expectFullWidthSidebarLink(
      page.locator('[data-sidebar="menu-button"][href="/document"]')
    );
    const tabs = page.getByRole("tablist").first().getByRole("tab");
    await expect(tabs).toHaveCount(4);
    await expectSingleRowTabs(tabs);
    for (const width of [375, 320]) {
      await page.setViewportSize({ width, height: 812 });
      await expectSingleRowTabs(tabs);
      await tabs.first().focus();
      await page.keyboard.press("End");
      await page.keyboard.press("Enter");
      await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
      await expect(tabs.last()).toBeInViewport();
      await expect(
        page.getByRole("tabpanel").getByText(documents[2]!.title)
      ).toBeVisible();
      await expect(
        page.getByRole("tabpanel").getByText(documents[0]!.title)
      ).toHaveCount(0);
      await expectNoPageOverflow(page);
    }
    expect(errors).toEqual([]);
  });
}
