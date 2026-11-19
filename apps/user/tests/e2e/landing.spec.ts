import { expect, type Page, test } from "@playwright/test";

const globalConfig = {
  site: {
    host: "example.test",
    site_name: "LoliTia Connect",
    site_desc: "Secure global connectivity for every device.",
    site_logo: "",
    keywords: "LoliTia",
    custom_html: "",
    custom_data: "",
  },
  verify: {
    captcha_type: "turnstile",
    turnstile_site_key: "",
    enable_login_verify: false,
    enable_register_verify: false,
    enable_reset_password_verify: false,
    enable_user_login_captcha: false,
    enable_user_register_captcha: false,
    enable_user_reset_password_captcha: false,
    enable_admin_login_captcha: false,
  },
  auth: {
    mobile: { enable: false, enable_whitelist: false, whitelist: [] },
    email: {
      enable: true,
      enable_verify: false,
      enable_domain_suffix: false,
      domain_suffix_list: "",
    },
    register: {
      stop_register: false,
      enable_ip_register_limit: false,
      ip_register_limit: 0,
      ip_register_limit_duration: 0,
    },
    device: {
      enable: false,
      show_ads: false,
      enable_security: false,
      only_real_device: false,
    },
  },
  invite: {
    forced_invite: false,
    referral_percentage: 0,
    only_first_purchase: false,
  },
  currency: { currency_unit: "USD", currency_symbol: "$" },
  subscribe: {
    single_model: false,
    subscribe_path: "",
    subscribe_domain: "",
    pan_domain: false,
    user_agent_limit: false,
    user_agent_list: "",
  },
  verify_code: {
    verify_code_expire_time: 5,
    verify_code_limit: 15,
    verify_code_interval: 60,
  },
  oauth_methods: [],
  web_ad: false,
};

async function mockUserApi(page: Page) {
  await page.route("**/common/site/config**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ code: 200, msg: "success", data: globalConfig }),
    });
  });

  await page.route("**/v1/public/portal/subscribe**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ code: 200, msg: "success", data: { list: [] } }),
    });
  });
}

const pageErrors = new WeakMap<Page, string[]>();

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  pageErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  await mockUserApi(page);
});

test.afterEach(({ page }) => {
  expect(pageErrors.get(page), "Uncaught browser errors").toEqual([]);
});

test("resolves scoped globe CSS colors and refreshes them on theme changes", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
  await page.addInitScript(() => {
    const getImageData = CanvasRenderingContext2D.prototype.getImageData;
    CanvasRenderingContext2D.prototype.getImageData = function (...args) {
      const image = getImageData.apply(this, args);
      const samples = new Set<string>(
        JSON.parse(document.documentElement.dataset.globeColorSamples ?? "[]")
      );
      samples.add(Array.from(image.data.slice(0, 3)).join(","));
      document.documentElement.dataset.globeColorSamples = JSON.stringify([
        ...samples,
      ]);
      return image;
    };
    document.addEventListener("DOMContentLoaded", () => {
      const style = document.createElement("style");
      style.textContent = `
        :root .landing-globe {
          --globe-land: color-mix(in srgb, rgb(20, 120, 160) 50%, rgb(40, 160, 200));
          --globe-route-yellow: rgb(215, 160, 30);
          --globe-route-green: rgb(80, 160, 40);
          --globe-route-blue: rgb(40, 100, 215);
        }
        :root[data-theme="dark"] .landing-globe {
          --globe-land: color-mix(in srgb, rgb(160, 120, 60) 50%, rgb(200, 160, 100));
          --globe-route-yellow: rgb(235, 185, 50);
          --globe-route-green: rgb(100, 200, 80);
          --globe-route-blue: rgb(90, 140, 245);
        }
      `;
      document.head.append(style);
    });
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const globe = page.locator(".landing-globe");
  await expect(globe).toHaveAttribute("data-state", "ready", {
    timeout: 30_000,
  });
  const bounds = await globe.boundingBox();

  for (const [theme, colors] of [
    ["light", ["30,140,180", "215,160,30", "80,160,40", "40,100,215"]],
    ["dark", ["180,140,80", "235,185,50", "100,200,80", "90,140,245"]],
    ["light", ["30,140,180", "215,160,30", "80,160,40", "40,100,215"]],
  ] as const) {
    if ((await page.locator("html").getAttribute("data-theme")) !== theme) {
      const previousCanvas = await globe.locator("canvas").elementHandle();
      await page.evaluate(() => {
        document.documentElement.dataset.globeColorSamples = "[]";
      });
      await page
        .getByRole("button", { name: "Toggle theme", exact: true })
        .click();
      await page
        .getByRole("menuitem", {
          name: theme === "dark" ? "Dark" : "Light",
          exact: true,
        })
        .click();
      await expect
        .poll(() => previousCanvas!.evaluate((canvas) => canvas.isConnected))
        .toBe(false);
    }
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(globe).toHaveAttribute("data-state", "ready");
    await expect(globe.locator("canvas")).toHaveCount(1);
    await expect
      .poll(() =>
        page.evaluate(() =>
          JSON.parse(document.documentElement.dataset.globeColorSamples ?? "[]")
        )
      )
      .toEqual(expect.arrayContaining([...colors]));
    expect(await globe.boundingBox()).toEqual(bounds);
  }
});

test("preserves the API site title after client navigation settles", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page).toHaveTitle("LoliTia Connect");

  // The landing page renders a WebGL globe whose per-frame GPU compositing
  // measurably delays the client-navigation transition under `next dev`
  // (the navigation commits correctly, it is just slow in dev — a production
  // build is compiled and far faster). Allow for that latency on the client
  // navigations below; every assertion otherwise stays strict so a genuine
  // navigation or title regression still fails the test.
  const clientNav = 20_000;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    await page.locator('header a[href="/auth"]').click();
    await expect(page).toHaveURL(/\/auth$/, { timeout: clientNav });
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveTitle("LoliTia Connect");

    await page.goBack({ waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/$/, { timeout: clientNav });
    await expect(page).toHaveTitle("LoliTia Connect");
  }
});

test("changes the active language and updates translated hero content", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const languageTrigger = page.getByTestId("language-switch-trigger");
  await expect(page).toHaveTitle("LoliTia Connect");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Welcome to"
  );
  await languageTrigger.click();
  await expect(page.getByRole("menu")).toBeVisible();
  await page.getByRole("menuitem", { name: /简体中文/ }).click();

  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "欢迎来到"
  );
  await expect(page.getByText("开始使用", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await languageTrigger.click();
  await page.getByRole("menuitem", { name: "系统默认", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
  expect(
    await page.evaluate(() => localStorage.getItem("language"))
  ).toBeNull();
});

test("uses regional CJK faces without replacing Latin typography", async ({
  page,
  context,
}) => {
  test.setTimeout(120_000);
  // CJK must not take over Latin glyphs even when Google Fonts is unavailable.
  await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
  await page.goto("/auth", { waitUntil: "domcontentloaded" });
  const languageTrigger = page.getByTestId("language-switch-trigger");
  await expect(languageTrigger).toBeVisible();

  const weights = [400, 500, 600, 700, 800, 900];
  await page.evaluate((weights) => {
    const probes = document.createElement("div");
    probes.id = "typography-probes";
    for (const weight of weights) {
      const probe = document.createElement("span");
      probe.id = `cjk-${weight}`;
      probe.style.fontWeight = String(weight);
      probe.textContent = "漢あ。Ａ";
      probes.append(probe);
    }
    const latin = document.createElement("span");
    latin.id = "latin-probe";
    latin.textContent = "English 0123456789";
    probes.append(latin);
    document.body.append(probes);
  }, weights);

  const cdp = await context.newCDPSession(page);
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");
  const renderedFonts = async (selector: string) => {
    const { root } = await cdp.send("DOM.getDocument");
    const { nodeId } = await cdp.send("DOM.querySelector", {
      nodeId: root.nodeId,
      selector,
    });
    const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
    return fonts.map((font) => font.postScriptName);
  };
  const originalLatin = await renderedFonts("#latin-probe");
  expect(originalLatin.length).toBeGreaterThan(0);

  for (const [code, variant, label] of [
    ["zh-CN", "sc", /简体中文/],
    ["ja-JP", "jp", /日本語/],
    ["zh-TW", "tc", /繁體中文（台灣）/],
    ["zh-HK", "tc", /繁體中文（香港）/],
    ["en-US", "sc", /English/],
  ] as const) {
    await languageTrigger.click();
    const languageOption = page.getByRole("menuitem", { name: label });
    await expect(languageOption.locator("span[lang]")).toHaveAttribute(
      "lang",
      code
    );
    if (code !== "en-US") {
      await languageOption.locator("span[lang]").evaluate(async (probe) => {
        const style = getComputedStyle(probe);
        await document.fonts.load(
          `${style.fontWeight} 16px ${style.fontFamily}`,
          probe.textContent ?? ""
        );
      });
      expect(await renderedFonts(`span[lang="${code}"]`)).toEqual(
        expect.arrayContaining([
          expect.stringMatching(new RegExp(`^SweiGothicCJK${variant}-`)),
        ])
      );
    }
    await languageOption.click();
    await expect(page.locator("html")).toHaveAttribute("lang", code);
    await page.evaluate(async () => {
      await Promise.all(
        [
          ...document.querySelectorAll<HTMLElement>("#typography-probes span"),
        ].map((probe) => {
          const style = getComputedStyle(probe);
          return document.fonts.load(
            `${style.fontWeight} 16px ${style.fontFamily}`,
            probe.textContent ?? ""
          );
        })
      );
    });
    for (const [index, face] of [
      "Regular",
      "Medium",
      "Bold",
      "Bold",
      "Black",
      "Black",
    ].entries()) {
      expect(await renderedFonts(`#cjk-${weights[index]}`)).toEqual([
        `SweiGothicCJK${variant}-${face}`,
      ]);
    }
    expect(await renderedFonts("#latin-probe")).toEqual(originalLatin);
  }
  await cdp.detach();
});

test("submits login credentials, allows retry, and preserves authorization", async ({
  page,
  context,
}) => {
  const credentials: unknown[] = [];
  await page.route("**/v1/auth/login", async (route) => {
    credentials.push(route.request().postDataJSON());
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(
        credentials.length === 1
          ? { code: 20_003, msg: "Incorrect password" }
          : { code: 200, msg: "success", data: { token: "e2e-session-token" } }
      ),
    });
  });
  await page.route("**/v1/public/user/info", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        code: 200,
        data: { id: 1, email: "member@example.test" },
      }),
    })
  );
  await page.goto("/auth?redirect=/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Verify Your Account"
  );
  const email = page.locator('input[name="email"]');
  const password = page.locator('input[name="password"]');
  const submit = page.getByRole("button", { name: "Login", exact: true });
  await email.fill("member@example.test");
  await password.fill("incorrect-password");
  await submit.click();
  await expect(page.getByText(/Incorrect password/)).toBeVisible();
  await expect(submit).toBeEnabled();
  await expect(password).toHaveValue("incorrect-password");
  await password.fill("correct-password");
  await submit.click();
  await expect(page).toHaveURL(/\/$/);
  expect(credentials).toEqual([
    {
      email: "member@example.test",
      password: "incorrect-password",
      cf_token: "",
      captcha_code: "",
      slider_token: "",
    },
    {
      email: "member@example.test",
      password: "correct-password",
      cf_token: "",
      captcha_code: "",
      slider_token: "",
    },
  ]);
  expect(
    (await context.cookies()).find((cookie) => cookie.name === "Authorization")
      ?.value
  ).toBe("e2e-session-token");
});

test("keeps plan cards readable in both themes and preserves purchase links", async ({
  page,
}) => {
  const planName = "GlobalConnectivity".repeat(5);
  await page.route("**/v1/public/portal/subscribe**", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        code: 200,
        data: {
          list: [
            {
              id: 42,
              name: planName,
              description: JSON.stringify({
                description: "A plan for every device.",
                features: [
                  {
                    label: "WorldwideConnectivity".repeat(5),
                    type: "default",
                  },
                ],
              }),
              unit_price: 1000,
              unit_time: "Month",
              traffic: 107_374_182_400,
              speed_limit: 100,
              device_limit: 5,
              discount: [],
            },
          ],
        },
      }),
    })
  );
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const plans = page.getByRole("region", { name: "Choose Your Package" });
  await expect(plans).toBeVisible();
  await page.getByRole("link", { name: "View plans", exact: true }).click();
  await expect(plans).toBeInViewport();
  await expect(plans.getByText(planName, { exact: true })).toBeVisible();
  await expect(
    plans.getByRole("link", { name: "Subscribe", exact: true })
  ).toHaveAttribute("href", "/purchasing?id=42");

  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme });
    await expect(page.locator("html")).toHaveClass(new RegExp(colorScheme));
    const layout = await plans.evaluate((element) => {
      const card = element.querySelector(".card")!;
      const title = card.querySelector(".card__title")!;
      return {
        cardWidth: card.clientWidth,
        cardScrollWidth: card.scrollWidth,
        titleWidth: title.clientWidth,
        titleScrollWidth: title.scrollWidth,
        background: getComputedStyle(card).backgroundColor,
      };
    });
    expect(layout.cardScrollWidth).toBeLessThanOrEqual(layout.cardWidth + 1);
    expect(layout.titleScrollWidth).toBeLessThanOrEqual(layout.titleWidth + 1);
    expect(layout.background).not.toBe("rgba(0, 0, 0, 0)");
  }
});

test("keeps the landing page inside the viewport for long translated labels", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const languageTrigger = page.getByTestId("language-switch-trigger");
  await expect(page).toHaveTitle("LoliTia Connect");

  for (const locale of ["zh-CN", "zh-TW", "ja-JP"]) {
    if (locale !== "en-US") {
      await languageTrigger.click();
      await expect(page.locator('[role="menu"]')).toBeVisible();
      const languageName =
        locale === "zh-CN"
          ? "简体中文"
          : locale === "zh-TW"
            ? "繁體中文（台灣）"
            : "日本語";
      await page.getByRole("menuitem", { name: languageName }).click();
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
    }

    const dimensions = await page.evaluate(() => ({
      bodyScrollWidth: document.body.scrollWidth,
      documentClientWidth: document.documentElement.clientWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
    }));

    expect(dimensions.bodyScrollWidth).toBeLessThanOrEqual(
      dimensions.documentClientWidth + 1
    );
    expect(dimensions.documentScrollWidth).toBeLessThanOrEqual(
      dimensions.documentClientWidth + 1
    );
  }
});
