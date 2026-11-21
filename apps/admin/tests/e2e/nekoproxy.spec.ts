import { expect, type Page, test } from "@playwright/test";
import {
  expectNoPageOverflow,
  mockLayoutApi,
  signInFixture,
} from "../../../../tests/e2e/layout.fixtures";

async function waitForDrawer(page: Page) {
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  // The drawer starts offscreen; clicking a field mid-slide can hit the backdrop.
  await expect
    .poll(() =>
      dialog.evaluate((el) => {
        const { left, right, width } = el.getBoundingClientRect();
        return width > 0 && left >= -1 && right <= innerWidth + 1;
      })
    )
    .toBe(true);
}

async function mockNekoproxy(page: Page, baseURL: string) {
  await page.route("**/*", (route) =>
    new URL(route.request().url()).origin === new URL(baseURL).origin
      ? route.continue()
      : route.abort()
  );
  const writes = await mockLayoutApi(page);
  const bindings: {
    node_id: string;
    api_url: string;
    forward_id: string;
    session_id: string;
    sync_on_save: boolean;
  }[] = [];
  const extraWrites: { path: string; body: unknown }[] = [];
  const apiURL = "https://np.example.test";
  await page.route(
    /\/v1\/admin\/server\/(nekoproxy\/|node\/(list|update))/,
    async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (route.request().method() !== "GET")
        extraWrites.push({ path, body: route.request().postDataJSON() });
      if (path.endsWith("/binding") && route.request().method() === "PUT")
        bindings.push({
          ...route.request().postDataJSON(),
          api_url: apiURL,
          sync_on_save: true,
        });
      let data: unknown = {};
      if (path.endsWith("/binding") && route.request().method() === "GET")
        data = {
          binding: bindings[0],
          address: bindings.length ? "entry.example.test" : "old.example.test",
          port: bindings.length ? 24_003 : 443,
        };
      if (path.endsWith("/sync")) data = { updated: 1, errors: [] };
      if (path.endsWith("/node/update") && bindings[0]) {
        bindings[0].sync_on_save =
          route.request().postDataJSON().nekoproxy_sync_on_save ??
          bindings[0].sync_on_save;
      }
      if (path.endsWith("/node/list"))
        data = {
          total: 1,
          list: [
            {
              id: "1",
              name: "Existing node",
              address: "old.example.test",
              port: 443,
              server_id: "1",
              protocol: "vless",
              protocol_id: "10",
              enabled: true,
              tags: null,
            },
          ],
        };
      if (path.endsWith("/config"))
        data = { api_url: apiURL, has_api_token: true };
      if (path.endsWith("/state"))
        data = {
          api_url: apiURL,
          bindings,
          chains: [{ id: "chain-1", name: "L4 chain" }],
          groups: [
            {
              id: "group-1",
              name: "Entry group",
              listen_host: "entry.example.test",
              port_start: 20_000,
              port_end: 30_000,
            },
          ],
          forwards: [
            {
              id: "l4s-1",
              name: "Available forward",
              chain_id: "chain-1",
              chain_name: "L4 chain",
              protocol: "tcp_udp",
              target_host: "target.example.test",
              target_port: 443,
              enabled: true,
              paused: false,
              sessions: [
                {
                  id: "session-1",
                  address: "entry.example.test",
                  port: 24_003,
                  status: "active",
                  group_id: "group-1",
                },
              ],
            },
          ],
        };
      await route.fulfill({ json: { code: 200, msg: "success", data } });
    }
  );
  return { writes, extraWrites };
}

test("the single full-width settings card opens a right-hand connection sheet", async ({
  page,
  baseURL,
}) => {
  const { extraWrites } = await mockNekoproxy(page, baseURL!);
  await signInFixture(page, baseURL!);
  await page.goto("/dashboard/nodes", { waitUntil: "domcontentloaded" });
  const card = page.getByRole("button", {
    name: "Nekoproxy connection",
    exact: true,
  });
  const hint = card.getByText(
    "Set the API address and token for L4 forwarding."
  );
  await expect(hint).toBeVisible();
  const nodeList = page
    .locator('[data-slot="table"]')
    .filter({ has: page.getByText("Existing node", { exact: true }) });
  await expect(nodeList).toBeVisible();
  const expectFullWidth = () =>
    expect
      .poll(async () => {
        const [cardBox, listBox] = await Promise.all([
          card.boundingBox(),
          nodeList.boundingBox(),
        ]);
        if (!(cardBox && listBox)) return Number.POSITIVE_INFINITY;
        return Math.max(
          Math.abs(cardBox.x - listBox.x),
          Math.abs(cardBox.x + cardBox.width - listBox.x - listBox.width)
        );
      })
      .toBeLessThanOrEqual(1);
  await expectFullWidth();
  const createNode = page.getByRole("button", {
    name: "Create Node",
    exact: true,
  });
  await expect(createNode).toBeVisible();
  const cardBounds = (await card.boundingBox())!;
  expect(cardBounds.y + cardBounds.height).toBeLessThanOrEqual(
    (await createNode.boundingBox())!.y
  );
  await hint.click();
  await waitForDrawer(page);
  const dialog = page.getByRole("dialog", { name: "Nekoproxy connection" });
  const bounds = await dialog.boundingBox();
  expect(bounds!.x).toBeGreaterThan(0);
  expect(Math.round(bounds!.x + bounds!.width)).toBe(
    page.viewportSize()!.width
  );
  await expect(dialog.getByLabel("API address")).toHaveValue(
    "https://np.example.test"
  );
  await expect(dialog.getByLabel("API token")).toHaveValue("");
  await dialog.getByLabel("API token").fill("nkp_discarded");
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  expect(extraWrites).toHaveLength(0);

  await page.setViewportSize({ width: 375, height: 812 });
  await expectFullWidth();
  await card.press("Enter");
  await waitForDrawer(page);
  await expectNoPageOverflow(page);
  await expect(dialog.getByLabel("API token")).toHaveValue("");
  await dialog.getByLabel("API token").fill("nkp_browser_test");
  await dialog.getByRole("button", { name: "Connect and save" }).click();
  await expect(dialog).toHaveCount(0);
  expect(
    extraWrites.find((item) => item.path.endsWith("/config"))?.body
  ).toEqual({
    api_url: "https://np.example.test",
    api_token: "nkp_browser_test",
  });
});

test("a node editor binds, syncs without losing its draft, and remembers opting out on save", async ({
  page,
  baseURL,
}) => {
  const { extraWrites } = await mockNekoproxy(page, baseURL!);
  await signInFixture(page, baseURL!);
  await page.goto("/dashboard/nodes", { waitUntil: "domcontentloaded" });
  const dialog = page.getByRole("dialog");
  await page
    .getByRole("row")
    .filter({ hasText: "Existing node" })
    .getByRole("button", { name: "Edit", exact: true })
    .click();
  await waitForDrawer(page);
  await dialog
    .getByRole("button", { name: "Bind an existing forward" })
    .click();
  await dialog
    .getByRole("group", { name: "Choose an available forward" })
    .click();
  await page.getByRole("option", { name: /Available forward/ }).click();
  await dialog.getByRole("button", { name: "Bind and sync entry" }).click();
  await expect
    .poll(
      () => extraWrites.find((item) => item.path.endsWith("/binding"))?.body
    )
    .toEqual({ node_id: "1", forward_id: "l4s-1", session_id: "session-1" });
  await expect(
    dialog.getByRole("button", { name: "Unbind", exact: true })
  ).toBeVisible();
  await page.setViewportSize({ width: 375, height: 812 });
  await expectNoPageOverflow(page);
  await expect(
    dialog.getByRole("switch", { name: "Sync when saving this node" })
  ).toBeChecked();
  await dialog.locator('input[name="name"]').fill("Unsaved name");
  await dialog.getByRole("button", { name: "Sync this node now" }).click();
  await expect
    .poll(() => extraWrites.find((x) => x.path.endsWith("/sync"))?.body)
    .toEqual({ node_id: "1" });
  await expect(dialog.locator('input[name="name"]')).toHaveValue(
    "Unsaved name"
  );
  await expect(
    dialog.getByRole("button", { name: "Sync this node now" })
  ).toBeEnabled();
  await dialog.getByText("Sync when saving this node", { exact: true }).click();
  await dialog.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect
    .poll(() => extraWrites.find((x) => x.path.endsWith("/node/update"))?.body)
    .toMatchObject({
      id: "1",
      name: "Unsaved name",
      nekoproxy_sync_on_save: false,
    });
  await page
    .getByRole("row")
    .filter({ hasText: "Existing node" })
    .getByRole("button", { name: "Edit", exact: true })
    .click();
  await expect(
    dialog.getByRole("switch", { name: "Sync when saving this node" })
  ).not.toBeChecked();
});

test("node creation sends forwarding allocation settings without a guessed entry port", async ({
  page,
  baseURL,
}) => {
  const { writes } = await mockNekoproxy(page, baseURL!);
  await signInFixture(page, baseURL!);
  await page.goto("/dashboard/nodes", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("row").filter({ hasText: "Existing node" })
  ).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: "Create Node", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await waitForDrawer(page);
  await dialog.getByRole("group", { name: /Select server/ }).click();
  await page.getByRole("option", { name: /Tokyo/ }).click();
  await dialog
    .getByText("Sync forwarding when creating this node", { exact: true })
    .click();
  await dialog
    .getByRole("group", { name: "Choose an L4 chain", exact: true })
    .click();
  await page.getByRole("option", { name: "L4 chain", exact: true }).click();
  await dialog
    .getByRole("group", { name: "Choose an entry group", exact: true })
    .click();
  await page.getByRole("option", { name: /Entry group/ }).click();
  await expect(dialog.getByLabel("Entry port (0 = automatic)")).toHaveValue(
    "0"
  );
  await expect(dialog.getByLabel("Target port", { exact: true })).toHaveValue(
    "443"
  );
  await dialog.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect
    .poll(
      () =>
        writes.find((item) => item.path.endsWith("/server/node/create"))?.body
    )
    .toMatchObject({
      server_id: "1",
      protocol: "vless",
      protocol_id: "10",
      nekoproxy: {
        create: {
          chain_id: "chain-1",
          entry_group_id: "group-1",
          protocol: "tcp_udp",
          target_port: 443,
          requested_port: 0,
        },
      },
    });
});
