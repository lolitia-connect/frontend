import { expect, test } from "@playwright/test";
import {
  account,
  expectNoPageOverflow,
  mockLayoutApi,
  signInFixture,
} from "../../../../tests/e2e/layout.fixtures";

for (const language of ["en-US", "zh-CN"]) {
  test(`commission withdrawal keeps currency units and fills all available commission in ${language}`, async ({
    page,
    baseURL,
  }) => {
    test.setTimeout(120_000);
    const labels =
      language === "zh-CN"
        ? {
            withdraw: "提现",
            all: "全部提现",
            amount: "提现金额",
            info: "提现信息",
            submit: "提交提现",
          }
        : {
            withdraw: "Withdraw",
            all: "Withdraw All",
            amount: "Withdrawal Amount",
            info: "Withdrawal Info",
            submit: "Submit Withdrawal",
          };
    const errors: string[] = [];
    const withdrawals: { amount: number; content: string }[] = [];
    let commission = 12_345;
    page.on("pageerror", (error) => errors.push(error.message));
    await mockLayoutApi(page);
    await signInFixture(page, baseURL!, language);
    await page.route(/\/public\/user\/info(?:\?|$)/, (route) =>
      route.fulfill({
        json: {
          code: 200,
          data: { ...account, commission, refer_code: "test-invite" },
        },
      })
    );
    await page.route(/\/public\/user\/affiliate\/count(?:\?|$)/, (route) =>
      route.fulfill({
        json: { code: 200, data: { total_commission: 99_999, registers: 0 } },
      })
    );
    await page.route(/\/public\/user\/commission_withdraw$/, async (route) => {
      const body = route.request().postDataJSON();
      withdrawals.push(body);
      commission -= body.amount;
      await route.fulfill({ json: { code: 200, data: body } });
    });
    await page.goto("/affiliate");
    await page
      .getByRole("button", { name: labels.withdraw, exact: true })
      .click();

    const input = page.getByRole("spinbutton", { name: labels.amount });
    await page.getByRole("button", { name: labels.all, exact: true }).click();
    await expect(input).toHaveValue("123.45");
    expect(withdrawals).toEqual([]);
    for (const width of [375, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expectNoPageOverflow(page);
      await expect(
        page.getByRole("button", { name: labels.all, exact: true })
      ).toBeInViewport();
    }

    await input.fill("123.46");
    await page
      .getByLabel(labels.info, { exact: true })
      .fill("test payment account");
    await page
      .getByRole("button", { name: labels.submit, exact: true })
      .click();
    expect(
      await input.evaluate(
        (node: HTMLInputElement) => node.validity.rangeOverflow
      )
    ).toBe(true);
    expect(withdrawals).toEqual([]);

    await input.fill("0.29");
    await page
      .getByRole("button", { name: labels.submit, exact: true })
      .click();
    await expect(page.getByRole("dialog")).toBeHidden();
    expect(withdrawals).toEqual([
      { amount: 29, content: "test payment account" },
    ]);

    await page
      .getByRole("button", { name: labels.withdraw, exact: true })
      .click();
    await page.getByRole("button", { name: labels.all, exact: true }).click();
    await expect(input).toHaveValue("123.16");
    await page
      .getByLabel(labels.info, { exact: true })
      .fill("test payment account");
    await page
      .getByRole("button", { name: labels.submit, exact: true })
      .click();
    await expect(page.getByRole("dialog")).toBeHidden();
    expect(withdrawals).toEqual([
      { amount: 29, content: "test payment account" },
      { amount: 12_316, content: "test payment account" },
    ]);
    await expect(
      page.getByRole("button", { name: labels.withdraw, exact: true })
    ).toBeDisabled();
    expect(errors).toEqual([]);
  });
}
