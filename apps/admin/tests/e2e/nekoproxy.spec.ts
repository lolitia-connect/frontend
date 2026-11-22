import { expect, type Page, test } from "@playwright/test";
import {
  expectNoPageOverflow,
  mockLayoutApi,
  servers,
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
  let node = {
    id: "1",
    name: "Existing node",
    address: "old.example.test",
    port: 443,
    server_id: "1",
    protocol: "vless",
    protocol_id: "10",
    enabled: true,
    tags: null,
  };
  await page.route(
    /\/v1\/admin\/server\/(nekoproxy\/|node\/(list|update))/,
    async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (route.request().method() !== "GET")
        extraWrites.push({ path, body: route.request().postDataJSON() });
      let data: unknown = {};
      if (path.endsWith("/binding") && route.request().method() === "GET")
        data = { binding: bindings[0], address: node.address, port: node.port };
      if (path.endsWith("/node/update")) {
        const {
          nekoproxy_binding: change,
          nekoproxy_sync_on_save: preference,
          name,
          address,
          port,
        } = route.request().postDataJSON();
        node = { ...node, name, address, port };
        if (change?.action === "bind") {
          bindings[0] = {
            node_id: node.id,
            forward_id: change.forward_id,
            session_id: change.session_id,
            api_url: apiURL,
            sync_on_save: bindings[0]?.sync_on_save ?? true,
          };
        } else if (change?.action === "unbind") {
          bindings.length = 0;
        }
        if (bindings[0]) {
          bindings[0].sync_on_save = preference ?? bindings[0].sync_on_save;
          if (
            bindings[0].sync_on_save ||
            change?.action === "bind" ||
            change?.action === "sync"
          ) {
            node.address = "entry.example.test";
            node.port =
              bindings[0].session_id === "session-2" ? 24_004 : 24_003;
          }
        }
      }
      if (path.endsWith("/node/list")) data = { total: 1, list: [node] };
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
                {
                  id: "session-2",
                  address: "entry.example.test",
                  port: 24_004,
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

test("the node editor saves forwarding changes together with node fields and discards drafts on cancel", async ({
  page,
  baseURL,
}) => {
  const { extraWrites } = await mockNekoproxy(page, baseURL!);
  await signInFixture(page, baseURL!);
  await page.goto("/dashboard/nodes", { waitUntil: "domcontentloaded" });
  const dialog = page.getByRole("dialog");
  const editNode = async (name: string) => {
    await page
      .getByRole("row")
      .filter({ hasText: name })
      .getByRole("button", { name: "Edit", exact: true })
      .click();
    await waitForDrawer(page);
  };
  const pickForward = async () => {
    await dialog
      .getByRole("group", { name: "Choose an available forward" })
      .click();
    await page.getByRole("option", { name: /Available forward/ }).click();
  };
  const save = async () => {
    await dialog.getByRole("button", { name: "Save", exact: true }).click();
    await expect(dialog).toHaveCount(0);
  };
  const cancel = async () => {
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(dialog).toHaveCount(0);
  };
  const name = dialog.locator('input[name="name"]');
  const toggle = dialog.getByRole("switch", {
    name: "Sync when saving this node",
  });

  await editNode("Existing node");
  await pickForward();
  await expect(
    dialog.getByText(
      "The selected forwarding entry will be used when you save."
    )
  ).toBeVisible();
  await cancel();
  expect(extraWrites).toHaveLength(0);

  await editNode("Existing node");
  await expect(
    dialog.getByText("This node is not bound to a Nekoproxy forward.")
  ).toBeVisible();
  await name.fill("Bound node");
  await pickForward();
  await save();
  expect(extraWrites[0]?.body).toMatchObject({
    id: "1",
    name: "Bound node",
    nekoproxy_binding: {
      action: "bind",
      forward_id: "l4s-1",
      session_id: "session-1",
    },
  });

  await editNode("Bound node");
  await expect(dialog.getByText("session-1", { exact: true })).toBeVisible();
  await expect(toggle).toBeChecked();
  await dialog.getByRole("group", { name: "Choose an active entry" }).click();
  await page.getByRole("option", { name: /session-2/ }).click();
  await dialog.getByText("Sync when saving this node", { exact: true }).click();
  await save();
  expect(extraWrites[1]?.body).toMatchObject({
    id: "1",
    nekoproxy_binding: {
      action: "bind",
      forward_id: "l4s-1",
      session_id: "session-2",
    },
    nekoproxy_sync_on_save: false,
  });

  await editNode("Bound node");
  await expect(dialog.getByText("session-2", { exact: true })).toBeVisible();
  await expect(toggle).not.toBeChecked();
  await dialog.getByRole("button", { name: "Sync entry on next save" }).click();
  await expect(
    dialog.getByText("The entry will be synchronized when you save.")
  ).toBeVisible();
  expect(extraWrites).toHaveLength(2);
  await save();
  expect(extraWrites[2]?.body).toMatchObject({
    id: "1",
    nekoproxy_binding: { action: "sync" },
  });

  await editNode("Bound node");
  await dialog.getByRole("button", { name: "Unbind", exact: true }).click();
  await expect(
    dialog.getByText("The binding will be removed when you save.")
  ).toBeVisible();
  await cancel();
  expect(extraWrites).toHaveLength(3);
  await editNode("Bound node");
  await expect(dialog.getByText("session-2", { exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Unbind", exact: true }).click();
  await save();
  expect(extraWrites[3]?.body).toMatchObject({
    id: "1",
    nekoproxy_binding: { action: "unbind" },
  });
  expect(extraWrites.map(({ path }) => path)).toEqual(
    new Array<string>(4).fill("/v1/admin/server/node/update")
  );
});

test("node creation sends forwarding allocation settings without a guessed entry port", async ({
  page,
  baseURL,
}) => {
  const { writes } = await mockNekoproxy(page, baseURL!);
  const server = servers[0]!;
  await page.route(/\/v1\/admin\/server\/list(?:\?|$)/, (route) =>
    route.fulfill({
      json: {
        code: 200,
        data: {
          total: 1,
          list: [
            {
              ...server,
              protocols: [
                ...server.protocols,
                {
                  ...server.protocols[0],
                  id: "11",
                  name: "Second listener",
                  port: 8443,
                },
              ],
            },
          ],
        },
      },
    })
  );
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
  const targetPort = dialog.getByLabel("Target port", { exact: true });
  await expect(targetPort).toHaveValue("443");
  await dialog.getByRole("group", { name: /Select protocol/ }).click();
  await page.getByRole("option", { name: /Second listener/ }).click();
  await expect(targetPort).toHaveValue("8443");
  const fields = dialog.locator('[data-slot="form-item"]').filter({
    has: page.getByRole("switch", {
      name: "Sync forwarding when creating this node",
    }),
  });
  for (const width of [1280, 375]) {
    await page.setViewportSize({ width, height: 812 });
    const [formBox, fieldsBox] = await Promise.all([
      dialog.locator("form").boundingBox(),
      fields.boundingBox(),
    ]);
    expect(fieldsBox!.width).toBeCloseTo(formBox!.width, 0);
  }
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
      protocol_id: "11",
      nekoproxy: {
        create: {
          chain_id: "chain-1",
          entry_group_id: "group-1",
          protocol: "tcp_udp",
          target_port: 8443,
          requested_port: 0,
        },
      },
    });
});
