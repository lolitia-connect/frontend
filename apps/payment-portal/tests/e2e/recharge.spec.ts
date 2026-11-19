import { expect, signIn, test } from "./payment-portal.fixtures";

test("long payment names fit confirmation and QR checkout at mobile widths", async ({
  page,
  api,
}) => {
  const name = "PaymentProvider".repeat(12);
  api.paymentMethodName = name;
  await page.route("**/v1/public/portal/payment-method", (route) =>
    route.fulfill({
      json: {
        code: 200,
        data: {
          list: [
            { id: "alipay", name, fee_mode: 1, fee_percent: 3, fee_amount: 0 },
          ],
        },
      },
    })
  );
  await page.setViewportSize({ width: 320, height: 740 });
  await signIn(page);
  await page
    .getByRole("button", { name: "Confirm Recharge", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  for (const width of [320, 375, 768, 1280]) {
    await page.setViewportSize({ width, height: 740 });
    await expect(dialog.getByText(name, { exact: true })).toBeVisible();
    await expect(async () => {
      const sizes = await dialog.evaluate((node) => ({
        client: node.clientWidth,
        scroll: node.scrollWidth,
      }));
      expect(sizes.scroll).toBeLessThanOrEqual(sizes.client + 1);
    }).toPass();
    await expect(
      dialog.getByRole("button", { name: "Confirm and Pay", exact: true })
    ).toBeInViewport();
  }
  await dialog
    .getByRole("button", { name: "Confirm and Pay", exact: true })
    .click();
  await page.getByRole("button", { name: "Pay Now", exact: true }).click();
  await expect(page.locator("canvas")).toBeVisible();
  for (const width of [320, 375, 768, 1280]) {
    await page.setViewportSize({ width, height: 740 });
    await expect(async () => {
      const sizes = await page.evaluate(() => ({
        width: innerWidth,
        root: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
      }));
      expect(sizes.root).toBeLessThanOrEqual(sizes.width + 1);
      expect(sizes.body).toBeLessThanOrEqual(sizes.width + 1);
      const qr = page.locator("canvas");
      const bounds = await qr.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    }).toPass();
  }
});

test("uses the shared responsive login shell without a mobile card and keeps form controls aligned", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Sign in to continue" })
  ).toBeVisible();
  const panel = page.getByRole("main").locator(":scope > div");
  const desktop = await panel.boundingBox();
  if (!desktop) throw new Error("Missing login panel");
  expect(desktop.x + desktop.width / 2).toBeCloseTo(640, 0);
  expect(
    await panel.evaluate((element) => getComputedStyle(element).boxShadow)
  ).not.toBe("none");
  for (const width of [375, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(panel).toHaveCSS("box-shadow", "none");
    await expect(panel).toHaveCSS("border-radius", "0px");
    const field = await page.getByLabel("Account / Email").boundingBox();
    const submit = await page
      .getByRole("button", { name: "Sign In", exact: true })
      .boundingBox();
    if (!(field && submit)) throw new Error("Missing login controls");
    expect(field.x).toBeCloseTo(submit.x, 0);
    expect(field.height).toBeCloseTo(submit.height, 0);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth)
    ).toBeLessThanOrEqual(width);
  }
  await page.getByRole("button", { name: "Toggle theme", exact: true }).click();
  await page.getByRole("menuitemradio", { name: "Dark", exact: true }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.getByLabel("Account / Email")).toBeVisible();
});

test("shows a HeroUI error, permits login retry, persists authorization, and logs out", async ({
  page,
  context,
  api,
}) => {
  api.failLogin = true;
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Sign in to continue" })
  ).toBeVisible();
  await page.getByLabel("Account / Email").fill("member@portal.test");
  await page.getByLabel("Password", { exact: true }).fill("incorrect-password");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page.getByText(/Incorrect password/)).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toHaveValue(
    "incorrect-password"
  );
  await page.getByLabel("Password", { exact: true }).fill("correct-password");
  await expect(
    page.getByRole("button", { name: "Sign In", exact: true })
  ).toBeEnabled();
  await page.getByLabel("Password", { exact: true }).press("Enter");
  await expect.poll(() => api.credentials.length).toBe(2);
  await expect(
    page.getByRole("heading", { name: "Recharge Center" })
  ).toBeVisible();
  await expect(page.getByText("$25.00", { exact: true })).toBeVisible();
  expect(api.credentials).toEqual([
    { email: "member@portal.test", password: "incorrect-password" },
    { email: "member@portal.test", password: "correct-password" },
  ]);
  expect(
    (await context.cookies()).find((cookie) => cookie.name === "Authorization")
      ?.value
  ).toBe("portal-e2e-token");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Recharge Center" })
  ).toBeVisible();
  expect(api.credentials).toHaveLength(2);
  await page.getByRole("button", { name: "Logout", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Sign in to continue" })
  ).toBeVisible();
  expect(
    (await context.cookies()).find((cookie) => cookie.name === "Authorization")
  ).toBeUndefined();
});

test("supports keyboard selection and custom decimals, validates the minimum, and cancels confirmation", async ({
  page,
  api,
}) => {
  await signIn(page);
  const methods = page.getByRole("radiogroup", {
    name: "Payment Method",
    exact: true,
  });
  await methods.getByRole("radio", { name: /^Alipay/ }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    methods.getByRole("radio", { name: /^WeChat Pay/ })
  ).toBeChecked();
  const amounts = page.getByRole("radiogroup", {
    name: "Recharge Amount",
    exact: true,
  });
  await amounts.getByRole("radio", { name: "$10.00", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    amounts.getByRole("radio", { name: "$20.00", exact: true })
  ).toBeChecked();
  await amounts.getByText("Custom Amount", { exact: true }).click();
  const custom = page.getByRole("spinbutton", {
    name: "Enter a custom amount",
    exact: true,
  });
  await expect(custom).toHaveValue("1");
  await custom.fill("");
  await page
    .getByRole("button", { name: "Confirm Recharge", exact: true })
    .click();
  await expect(
    page.getByText("Choose both a payment method and a recharge amount first.")
  ).toBeVisible();
  expect(api.recharges).toHaveLength(0);
  await custom.fill("0.50");
  await expect(custom).toHaveValue("1");
  expect(api.recharges).toHaveLength(0);
  await custom.fill("150.34");
  await custom.press("ArrowUp");
  await expect(custom).toHaveValue("150.35");
  await custom.press("ArrowDown");
  await expect(custom).toHaveValue("150.34");
  await page
    .getByRole("button", { name: "Confirm Recharge", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Confirm Recharge",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("WeChat Pay", { exact: true })).toBeVisible();
  await expect(dialog.getByText("$150.34", { exact: true })).toBeVisible();
  await expect(dialog.getByText("$0.30", { exact: true })).toBeVisible();
  await expect(dialog.getByText("$150.64", { exact: true })).toBeVisible();
  expect(api.recharges).toEqual([{ amount: 15_034, payment: "wechat" }]);
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Payment Pending", exact: true })
  ).toBeDisabled();
  await amounts.getByText("$20.00", { exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Confirm Recharge", exact: true })
  ).toBeEnabled();
  expect(api.checkouts).toHaveLength(0);
});

test("confirms server totals, defers checkout until Pay Now, retains QR on refresh, and polls completion", async ({
  page,
  api,
}) => {
  await signIn(page);
  await page
    .getByRole("button", { name: "Confirm Recharge", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Confirm Recharge",
    exact: true,
  });
  await expect(dialog.getByText("$10.00", { exact: true })).toBeVisible();
  await expect(dialog.getByText("$0.30", { exact: true })).toBeVisible();
  await expect(dialog.getByText("$10.30", { exact: true })).toBeVisible();
  expect(api.recharges).toEqual([{ amount: 1000, payment: "alipay" }]);
  expect(api.checkouts).toHaveLength(0);
  await dialog
    .getByRole("button", { name: "Confirm and Pay", exact: true })
    .click();
  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Payment Pending", exact: true })
  ).toBeDisabled();
  expect(api.checkouts).toHaveLength(0);
  await page.getByRole("button", { name: "Pay Now", exact: true }).click();
  const qr = page.locator("canvas");
  await expect(qr).toBeVisible();
  expect(api.checkouts).toHaveLength(1);
  expect(api.checkouts[0]).toMatchObject({
    orderNo: "ORDER-1",
    returnUrl: page.url(),
  });
  await page.getByRole("button", { name: "Refresh", exact: true }).click();
  await page.getByRole("button", { name: "Pay Now", exact: true }).click();
  await expect(qr).toBeVisible();
  expect(api.checkouts).toHaveLength(1);
  await page
    .getByRole("button", { name: "Refresh payment link", exact: true })
    .click();
  await expect.poll(() => api.checkouts.length).toBe(2);
  const detailCount = api.detailRequests;
  api.balance = 3500;
  if (!api.order) throw new Error("Expected a pending order");
  api.order.status = 2;
  await expect(
    page.getByText("Payment Completed", { exact: true })
  ).toBeVisible({ timeout: 10_000 });
  expect(api.detailRequests).toBeGreaterThan(detailCount);
  await expect(page.getByText("$35.00", { exact: true })).toBeVisible();
  await expect(page.getByText("Paid", { exact: true })).toHaveCount(2);
  await expect(qr).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Pay Now", exact: true })
  ).toBeHidden();
});

test("recovers from checkout and order refresh failures without blocking retry or losing the pending order", async ({
  page,
  api,
}) => {
  await signIn(page);
  await page
    .getByRole("button", { name: "Confirm Recharge", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Confirm and Pay", exact: true })
    .click();
  const pay = page.getByRole("button", { name: "Pay Now", exact: true });
  api.failCheckout = true;
  await pay.click();
  await expect(
    page.getByText("Temporary checkout failure", { exact: true })
  ).toBeVisible();
  expect(api.checkouts).toHaveLength(1);
  await pay.click();
  await expect(page.locator("canvas")).toBeVisible();
  expect(api.checkouts).toHaveLength(2);

  api.failDetails = true;
  const previousDetails = api.detailRequests;
  await page
    .getByRole("button", { name: "Refresh status", exact: true })
    .click();
  await expect(
    page.getByText("Temporary order refresh failure", { exact: true }).first()
  ).toBeVisible();
  await expect
    .poll(() => api.detailRequests)
    .toBeGreaterThan(previousDetails + 1);
  await expect(page.locator("canvas")).toBeVisible();
  api.failDetails = false;
  api.balance = 3500;
  if (!api.order) throw new Error("Expected pending order");
  api.order.status = 2;
  await page
    .getByRole("button", { name: "Refresh status", exact: true })
    .click();
  await expect(
    page.getByText("Payment Completed", { exact: true })
  ).toBeVisible();
  await expect(page.getByText("$35.00", { exact: true })).toBeVisible();
});

test("opens URL checkout only after an explicit payment action", async ({
  page,
  api,
}) => {
  api.checkoutType = "url";
  await signIn(page);
  await page
    .getByRole("button", { name: "Confirm Recharge", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Confirm and Pay", exact: true })
    .click();
  expect(api.checkouts).toHaveLength(0);
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Pay Now", exact: true }).click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL("https://payment.example.test/ORDER-1");
  await expect(
    popup.getByRole("heading", { name: "Mock payment provider" })
  ).toBeVisible();
  await popup.close();
  expect(api.checkouts).toHaveLength(1);
});

test("prevents recharge when no payment methods are available", async ({
  page,
  api,
}) => {
  api.methodsEnabled = false;
  await signIn(page);
  await expect(
    page
      .getByRole("radiogroup", { name: "Payment Method", exact: true })
      .getByRole("radio")
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Confirm Recharge", exact: true })
  ).toBeDisabled();
  await expect(
    page.getByText("No recharge records yet", { exact: true })
  ).toBeVisible();
  expect(api.recharges).toHaveLength(0);
});

test("persists native HeroUI theme/language choices and fits a 320px viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await signIn(page);
  for (const theme of ["Dark", "Light"]) {
    await page
      .getByRole("button", { name: "Toggle theme", exact: true })
      .click();
    await page.getByRole("menuitemradio", { name: theme, exact: true }).click();
    await expect(page.locator("html")).toHaveClass(
      new RegExp(theme.toLowerCase())
    );
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Recharge Center" })
    ).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe(
      theme.toLowerCase()
    );
    const dimensions = await page.evaluate(() => ({
      width: innerWidth,
      body: document.body.scrollWidth,
      root: document.documentElement.scrollWidth,
    }));
    expect(dimensions.body).toBeLessThanOrEqual(dimensions.width);
    expect(dimensions.root).toBeLessThanOrEqual(dimensions.width);
  }
  await page.getByRole("button", { name: /^Language:/ }).click();
  await page
    .getByRole("menuitemradio", { name: "简体中文", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("充值");
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual(320);
  await page.getByRole("button", { name: /简体中文/ }).click();
  await page
    .getByRole("menuitemradio", { name: "系统默认", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
  expect(
    await page.evaluate(() => localStorage.getItem("language"))
  ).toBeNull();
  await page.getByRole("button", { name: "Toggle theme", exact: true }).click();
  await page
    .getByRole("menuitemradio", { name: "System default", exact: true })
    .click();
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBeNull();
});

test("requires the image captcha and regenerates it after a failed login", async ({
  page,
  api,
}) => {
  api.captcha = true;
  api.failLogin = true;
  await page.goto("/");
  await page.getByLabel("Account / Email").fill("member@portal.test");
  await page.getByLabel("Password", { exact: true }).fill("incorrect-password");
  const code = page.getByRole("textbox", {
    name: "Image captcha",
    exact: true,
  });
  await expect(code).toBeVisible();
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(
    page.getByText("Complete the verification first.")
  ).toBeVisible();
  expect(api.credentials).toHaveLength(0);
  await code.fill("1234");
  const previousChallenge = api.captchaRequests;
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect
    .poll(() => api.captchaRequests)
    .toBeGreaterThan(previousChallenge);
  await expect(code).toHaveValue("");
  expect(api.credentials[0]).toMatchObject({
    captcha_code: "1234",
    captcha_id: `captcha-${previousChallenge}`,
  });
  await page.getByLabel("Password", { exact: true }).fill("correct-password");
  await code.fill("1234");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Recharge Center" })
  ).toBeVisible();
  expect(api.credentials[1]).toMatchObject({
    captcha_code: "1234",
    captcha_id: `captcha-${api.captchaRequests}`,
  });
});
