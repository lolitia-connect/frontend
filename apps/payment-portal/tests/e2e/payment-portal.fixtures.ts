import { test as base, expect, type Page } from "@playwright/test";

export interface MockOrder {
  amount: number;
  created_at: number;
  fee_amount: number;
  id: number;
  order_no: string;
  payment: { id: string; name: string };
  price: number;
  status: number;
  trade_no: string;
  type: number;
}

interface PortalApi {
  balance: number;
  captcha: boolean;
  captchaRequests: number;
  checkouts: Record<string, unknown>[];
  checkoutType: "qr" | "url";
  credentials: Record<string, unknown>[];
  detailRequests: number;
  failCheckout: boolean;
  failDetails: boolean;
  failLogin: boolean;
  methodsEnabled: boolean;
  order: MockOrder | null;
  paymentMethodName?: string;
  recharges: { amount: number; payment: string }[];
}

const methods = [
  {
    id: "alipay",
    name: "Alipay",
    platform: "alipay",
    fee_mode: 1,
    fee_percent: 3,
    fee_amount: 0,
  },
  {
    id: "wechat",
    name: "WeChat Pay",
    platform: "wechat",
    fee_mode: 2,
    fee_percent: 0,
    fee_amount: 50,
  },
];
const captchaImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='32'%3E%3Ctext x='5' y='22'%3E1234%3C/text%3E%3C/svg%3E";

export const test = base.extend<{ api: PortalApi }>({
  api: [
    async ({ context, page }, use) => {
      const api: PortalApi = {
        balance: 2500,
        failLogin: false,
        failDetails: false,
        failCheckout: false,
        captcha: false,
        captchaRequests: 0,
        methodsEnabled: true,
        checkoutType: "qr",
        order: null,
        credentials: [],
        recharges: [],
        checkouts: [],
        detailRequests: 0,
      };
      const errors: string[] = [];
      const unexpectedRequests: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (
          message.type() === "error" ||
          /PressResponder|hydration|Expected <hr>|does not have a label/.test(
            message.text()
          )
        )
          errors.push(message.text());
      });
      await context.route("**/*", (route) => {
        const url = new URL(route.request().url());
        const ok = (data: unknown) =>
          route.fulfill({ json: { code: 200, msg: "success", data } });
        if (url.hostname === "payment.example.test")
          return route.fulfill({
            contentType: "text/html",
            body: "<h1>Mock payment provider</h1>",
          });
        if (url.pathname.includes("/v1/")) {
          switch (url.pathname) {
            case "/v1/common/site/config":
              return ok({
                site: {
                  site_name: "LoliTia Pay",
                  site_desc: "Test portal",
                  site_logo: "",
                },
                verify: {
                  captcha_type: "local",
                  enable_user_login_captcha: api.captcha,
                  turnstile_site_key: "",
                },
                currency: { currency_symbol: "$", currency_unit: "USD" },
              });
            case "/v1/auth/captcha/generate":
              api.captchaRequests += 1;
              return ok({
                id: `captcha-${api.captchaRequests}`,
                image: captchaImage,
              });
            case "/v1/auth/login":
              api.credentials.push(route.request().postDataJSON());
              if (api.failLogin) {
                api.failLogin = false;
                return route.fulfill({
                  json: { code: 20_003, msg: "Incorrect password" },
                });
              }
              return ok({ token: "portal-e2e-token" });
            case "/v1/public/user/info":
              return ok({
                id: 1,
                balance: api.balance,
                auth_methods: [
                  { auth_type: "email", auth_identifier: "member@portal.test" },
                ],
              });
            case "/v1/public/portal/payment-method":
              return ok({ list: api.methodsEnabled ? methods : [] });
            case "/v1/public/order/list":
              return ok({
                list: api.order ? [api.order] : [],
                total: api.order ? 1 : 0,
              });
            case "/v1/public/order/recharge": {
              const payload = route.request().postDataJSON() as {
                amount: number;
                payment: string;
              };
              api.recharges.push(payload);
              api.order = {
                id: api.recharges.length,
                order_no: `ORDER-${api.recharges.length}`,
                trade_no: "",
                type: 4,
                price: payload.amount,
                amount: payload.amount + 30,
                fee_amount: 30,
                status: 1,
                created_at: 1_800_000_000,
                payment: {
                  id: payload.payment,
                  name:
                    api.paymentMethodName ??
                    methods.find((method) => method.id === payload.payment)
                      ?.name ??
                    "Unknown",
                },
              };
              return ok({ order_no: api.order.order_no });
            }
            case "/v1/public/order/detail":
              api.detailRequests += 1;
              if (api.failDetails)
                return route.fulfill({
                  json: {
                    code: 999_001,
                    msg: "Temporary order refresh failure",
                  },
                });
              return ok(api.order);
            case "/v1/public/portal/order/checkout":
              api.checkouts.push(route.request().postDataJSON());
              if (api.failCheckout) {
                api.failCheckout = false;
                return route.fulfill({
                  json: { code: 999_002, msg: "Temporary checkout failure" },
                });
              }
              return ok({
                type: api.checkoutType,
                checkout_url: `https://payment.example.test/${api.order?.order_no}`,
              });
            default:
              unexpectedRequests.push(url.pathname);
              return route.abort();
          }
        }
        if (!["localhost", "127.0.0.1"].includes(url.hostname)) {
          unexpectedRequests.push(url.href);
          return route.abort();
        }
        if (url.pathname === "/favicon.ico")
          return route.fulfill({ status: 204 });
        return route.continue();
      });
      await use(api);
      expect(
        unexpectedRequests,
        "No unmocked API or external requests"
      ).toEqual([]);
      expect(
        errors,
        "No browser runtime, console, or accessibility warnings"
      ).toEqual([]);
    },
    { auto: true },
  ],
});
export { expect } from "@playwright/test";

export async function signIn(page: Page) {
  await page.goto("/");
  await page.getByLabel("Account / Email").fill("member@portal.test");
  await page.getByLabel("Password", { exact: true }).fill("correct-password");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Recharge Center", exact: true })
  ).toBeVisible();
}
