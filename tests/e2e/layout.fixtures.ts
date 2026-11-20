import { expect, type Locator, type Page } from "@playwright/test";

export const account = {
  id: "101",
  avatar: "",
  balance: 1000,
  commission: 0,
  gift_amount: 0,
  auth_methods: [
    {
      auth_type: "email",
      auth_identifier: "member@example.test",
      verified: true,
    },
  ],
};
export const siteConfig = {
  site: {
    site_name: "Layout Test",
    site_desc: "Frontend layout regression",
    site_logo: "",
    host: "example.test",
    custom_html: "",
    custom_data: "",
    keywords: "",
  },
  verify: { captcha_type: "turnstile", turnstile_site_key: "" },
  auth: {
    email: { enable: true },
    mobile: { enable: false },
    register: {},
    device: {},
  },
  currency: { currency_unit: "USD", currency_symbol: "$" },
  subscribe: {
    show_tutorial: false,
    subscribe_path: "",
    subscribe_domain: "",
    pan_domain: false,
  },
  invite: {},
  verify_code: {},
  oauth_methods: [],
  web_ad: false,
};
export const servers = ["Tokyo", "Berlin"].map((name, index) => ({
  id: String(index + 1),
  name: `${name} server with a long descriptive name`,
  country: index ? "DE" : "JP",
  city: name,
  sort: index,
  address: `${name.toLowerCase()}-long-network-hostname-for-regression-check.example.test`,
  protocols: [
    {
      id: "10",
      name: "Long protocol instance name",
      type: "vless",
      port: 443,
      ratio: 1.2,
      enable: true,
    },
  ],
  status: { status: "online", cpu: 21.45, mem: 65.33, disk: 33.2, online: [] },
}));
export const documents = [
  {
    id: "d1",
    title: "Desktop connection guide",
    tags: ["Desktop and laptop setup"],
    updated_at: 1_700_000_000,
  },
  {
    id: "d2",
    title: "Mobile connection guide",
    tags: ["Mobile device configuration"],
    updated_at: 1_700_000_000,
  },
  {
    id: "d3",
    title: "Troubleshooting guide",
    tags: ["Advanced troubleshooting and diagnostics"],
    updated_at: 1_700_000_000,
  },
];
export const orders = [
  {
    id: "o1",
    order_no: "20261118000000000001",
    type: 4,
    amount: 1000,
    price: 1000,
    status: 1,
    user_id: account.id,
    updated_at: 1_700_000_000,
  },
  {
    id: "o2",
    order_no: "20261118000000000002",
    type: 4,
    amount: 2000,
    price: 2000,
    status: 5,
    user_id: account.id,
    updated_at: 1_700_000_000,
  },
];

export async function mockLayoutApi(page: Page) {
  const writes: { path: string; body: unknown }[] = [];
  let serverRows = [...servers];
  await page.route(/\/v[12]\//, async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (route.request().method() !== "GET")
      writes.push({ path, body: route.request().postDataJSON() });
    if (path.endsWith("/server/server/sort")) {
      const { sort } = route.request().postDataJSON() as {
        sort: { id: string; sort: number }[];
      };
      serverRows = [...serverRows].sort(
        (a, b) =>
          sort.find((item) => item.id === a.id)!.sort -
          sort.find((item) => item.id === b.id)!.sort
      );
    }
    let data: unknown = { list: [], total: 0 };
    if (path.endsWith("/common/site/config")) data = siteConfig;
    else if (/\/user\/(info|current|detail)$/.test(path)) data = account;
    else if (path.endsWith("/admin/server/list"))
      data = { list: serverRows, total: serverRows.length };
    else if (path.endsWith("/admin/console/server")) data = {};
    else if (path.endsWith("/admin/console/ticket")) data = { count: 0 };
    else if (path.endsWith("/admin/console/revenue"))
      data = {
        today: {
          new_order_amount: 0,
          renewal_order_amount: 0,
          amount_total: 0,
        },
        monthly: {
          list: [],
          new_order_amount: 0,
          renewal_order_amount: 0,
          amount_total: 0,
        },
        all: {
          list: [],
          new_order_amount: 0,
          renewal_order_amount: 0,
          amount_total: 0,
        },
      };
    else if (path.endsWith("/admin/console/user"))
      data = {
        today: { register: 0, new_order_users: 0, renewal_order_users: 0 },
        monthly: {
          list: [],
          register: 0,
          new_order_users: 0,
          renewal_order_users: 0,
        },
        all: {
          list: [],
          register: 0,
          new_order_users: 0,
          renewal_order_users: 0,
        },
      };
    else if (path.endsWith("/admin/tool/version")) data = { version: "test" };
    else if (path.endsWith("/admin/order/list"))
      data = { list: orders, total: orders.length };
    else if (path.endsWith("/admin/group/config"))
      data = { enabled: true, mode: "subscribe" };
    else if (path.endsWith("/admin/group/recalculation/status"))
      data = { state: "idle", progress: 0, total: 0 };
    else if (path.endsWith("/admin/group/subscribe/mapping")) data = [];
    else if (path.endsWith("/admin/auth-method/config"))
      data = {
        id: "email-config",
        method: "email",
        enabled: true,
        config: {
          enable_verify: false,
          enable_domain_suffix: false,
          domain_suffix_list: "",
          platform: "smtp",
          platform_config: {
            host: "mail.example.test",
            port: 587,
            ssl: false,
            user: "",
            pass: "",
            from: "",
            reply_to: "",
          },
          verify_email_subject: "",
          verify_email_template: "",
          expiration_email_subject: "",
          expiration_email_template: "",
          maintenance_email_subject: "",
          maintenance_email_template: "",
          traffic_exceed_email_subject: "",
          traffic_exceed_email_template: "",
        },
      };
    else if (path.endsWith("/public/document/list")) data = { list: documents };
    else if (path.endsWith("/public/document/detail"))
      data = { content: "# Connection guide\nUse your subscription settings." };
    await route.fulfill({ json: { code: 200, msg: "success", data } });
  });
  return writes;
}

export async function mockDashboardApi(page: Page) {
  await page.route(
    /\/v[12]\/(?:public\/user\/subscribe|common\/client|common\/site\/stat|common\/site\/config)(?:\?|$)/,
    async (route) => {
      const path = new URL(route.request().url()).pathname;
      let data: unknown = {};

      if (path.endsWith("/public/user/subscribe")) {
        data = {
          list: [
            {
              id: "dashboard-subscribe",
              expire_time: 0,
              reset_time: 0,
              traffic_unlimited: false,
              traffic: 1_000_000_000,
              upload: 0,
              download: 0,
              status: 1,
              short: "dashboard",
              token: "dashboard-test-token",
              subscribe: {
                name: "Dashboard plan",
                replacement: 0,
                sell: false,
                allow_deduction: false,
              },
            },
          ],
          total: 1,
        };
      } else if (path.endsWith("/common/client")) {
        data = {
          list: ["ios", "android"].map((platform) => ({
            id: platform,
            name: `${platform} client`,
            scheme: "client://import?url=${url}",
            is_default: false,
            download_link: {
              [platform]: `https://example.test/${platform}.apk`,
            },
          })),
          total: 2,
        };
      } else if (path.endsWith("/common/site/stat")) {
        data = { protocol: ["mieru", "vless"] };
      } else if (path.endsWith("/common/site/config")) {
        data = {
          ...siteConfig,
          subscribe: {
            ...siteConfig.subscribe,
            subscribe_domain: "subscribe.example.test",
            subscribe_path: "/subscribe",
          },
        };
      }

      await route.fulfill({ json: { code: 200, msg: "success", data } });
    }
  );
}

export async function signInFixture(
  page: Page,
  baseURL: string,
  language = "en-US"
) {
  await page
    .context()
    .addCookies([
      { name: "Authorization", value: "layout-test-token", url: baseURL },
    ]);
  await page.addInitScript((locale) => {
    localStorage.setItem("language", locale);
    localStorage.setItem("theme", "dark");
  }, language);
}

export async function expectNoPageOverflow(page: Page) {
  await expect(async () => {
    const sizes = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }));
    expect(sizes.document).toBeLessThanOrEqual(sizes.viewport + 1);
    expect(sizes.body).toBeLessThanOrEqual(sizes.viewport + 1);
  }).toPass({ timeout: 5000 });
}

export async function expectFullWidthSidebarLink(link: Locator) {
  await expect(link).toBeVisible();
  const widths = await link.evaluate((node) => ({
    link: node.getBoundingClientRect().width,
    item: node.closest("li")!.getBoundingClientRect().width,
  }));
  expect(widths.link).toBeGreaterThanOrEqual(widths.item - 2);
}

export async function expectSingleRowTabs(tabs: Locator) {
  await expect(async () => {
    const rects = await tabs.evaluateAll((nodes) =>
      nodes.map((node) => {
        const bounds = node.getBoundingClientRect();
        const indicator = node
          .querySelector('[data-slot="tabs-indicator"]')
          ?.getBoundingClientRect();
        return {
          left: bounds.left,
          top: bounds.top,
          height: bounds.height,
          width: bounds.width,
          scroll: node.scrollWidth,
          indicator: indicator && {
            left: indicator.left,
            top: indicator.top,
            width: indicator.width,
            height: indicator.height,
          },
        };
      })
    );
    expect(rects.length).toBeGreaterThan(1);
    expect(
      Math.max(...rects.map((rect) => rect.top)) -
        Math.min(...rects.map((rect) => rect.top))
    ).toBeLessThanOrEqual(1);
    expect(rects.some((rect) => rect.indicator)).toBe(true);
    for (const rect of rects) {
      expect(rect.height).toBeLessThanOrEqual(44);
      expect(rect.scroll).toBeLessThanOrEqual(rect.width + 1);
      if (rect.indicator) {
        expect(Math.abs(rect.indicator.width - rect.width)).toBeLessThanOrEqual(
          1
        );
        expect(Math.abs(rect.indicator.left - rect.left)).toBeLessThanOrEqual(
          1
        );
        expect(rect.indicator.top).toBeGreaterThanOrEqual(rect.top - 1);
        expect(rect.indicator.top + rect.indicator.height).toBeLessThanOrEqual(
          rect.top + rect.height + 1
        );
      }
    }
  }).toPass({ timeout: 5000 });
}
