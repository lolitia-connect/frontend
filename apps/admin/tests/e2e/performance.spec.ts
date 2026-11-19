import { expect, test } from "@playwright/test";
import {
  mockLayoutApi,
  signInFixture,
} from "../../../../tests/e2e/layout.fixtures";

test("loads only login translations initially and loads dashboard translations after login", async ({
  page,
}) => {
  const namespaces = new Set<string>();
  const errors: string[] = [];
  page.on("request", (request) => {
    const match = new URL(request.url()).pathname.match(
      /\/assets\/locales\/zh-CN\/([^/]+)\.json$/
    );
    if (match?.[1]) namespaces.add(match[1]);
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await mockLayoutApi(page);
  await page.addInitScript(() => localStorage.setItem("language", "zh-CN"));
  await page.route("**/v1/auth/admin/login", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ code: 200, data: { token: "e2e-session-token" } }),
    })
  );

  // Compile the request-rendered destination without loading it into this browser page.
  expect((await page.request.get("/dashboard")).ok()).toBe(true);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("登录");
  expect([...namespaces].sort()).toEqual(["auth", "components", "menu"]);

  await page.locator('input[name="email"]').fill("admin@example.test");
  await page.locator('input[name="password"]').fill("test-password");
  await page.getByRole("button", { name: "登录", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.locator('header [aria-current="page"]')).toHaveText(
    "仪表盘"
  );
  await expect.poll(() => namespaces.has("dashboard")).toBe(true);
  expect(namespaces.has("menu")).toBe(true);
  expect(namespaces.has("marketing")).toBe(false);
  expect(errors).toEqual([]);
});

test("defers offscreen charts and preserves traffic selection and focus", async ({
  page,
  baseURL,
}) => {
  const requests: string[] = [];
  const errors: string[] = [];
  page.on("request", (request) =>
    requests.push(new URL(request.url()).pathname)
  );
  page.on("pageerror", (error) => errors.push(error.message));
  await mockLayoutApi(page);
  await signInFixture(page, baseURL!);
  await page.route("**/v1/admin/console/server", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        code: 200,
        data: {
          online_users: 7,
          server_traffic_ranking_today: [
            { name: "Today Node", download: 1024, upload: 1024 },
          ],
          server_traffic_ranking_yesterday: [
            { name: "Yesterday Node", download: 2048, upload: 1024 },
          ],
          user_traffic_ranking_today: [
            { sid: "201", uid: "101", download: 1024, upload: 0 },
          ],
          user_traffic_ranking_yesterday: [
            { sid: "202", uid: "101", download: 2048, upload: 0 },
          ],
        },
      }),
    })
  );
  await page.setViewportSize({ width: 375, height: 600 });
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Online Users", { exact: true })).toBeVisible();
  expect(requests.some((path) => path.endsWith("/console/revenue"))).toBe(
    false
  );
  expect(requests.some((path) => path.endsWith("/console/user"))).toBe(false);

  const chartRows = page.locator("main .grid.gap-3");
  await chartRows.first().scrollIntoViewIfNeeded();
  await expect(
    page.getByText("Revenue Statistics", { exact: true })
  ).toBeVisible();
  await expect
    .poll(() => requests.some((path) => path.endsWith("/console/revenue")))
    .toBe(true);

  await chartRows.last().scrollIntoViewIfNeeded();
  const nodeCard = page
    .locator(".card")
    .filter({ has: page.getByText("Node Traffic", { exact: true }) });
  const userCard = page
    .locator(".card")
    .filter({ has: page.getByText("User Traffic", { exact: true }) });
  await expect(nodeCard).toBeAttached();
  await expect(userCard).toBeAttached();
  const yesterday = nodeCard.getByRole("tab", {
    name: "Yesterday",
    exact: true,
  });
  await yesterday.click();
  await expect(yesterday).toBeFocused();
  await expect(yesterday).toHaveAttribute("aria-selected", "true");
  await expect(
    userCard.getByRole("tab", { name: "Yesterday", exact: true })
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    nodeCard.getByText("Yesterday Node", { exact: true })
  ).toBeVisible();
  expect(errors).toEqual([]);
});
