import { expect, test } from "@playwright/test";
import {
  mockLayoutApi,
  signInFixture,
} from "../../../../tests/e2e/layout.fixtures";

for (const language of ["en-US", "zh-CN"]) {
  test(`log navigation labels and chevrons stay on one line in ${language}`, async ({
    page,
    baseURL,
  }) => {
    test.setTimeout(120_000);
    await page.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) =>
      route.abort()
    );
    await mockLayoutApi(page);
    await signInFixture(page, baseURL!, language);
    await page.goto("/dashboard/log/login?user_id=101", {
      waitUntil: "domcontentloaded",
    });

    const navigation = page
      .getByText(language === "zh-CN" ? "日志检索" : "Log explorer", {
        exact: true,
      })
      .locator("xpath=../../..");
    const triggers = navigation.locator('[data-slot="dropdown-trigger"]');
    await expect(triggers).toHaveCount(4, { timeout: 30_000 });

    for (const width of [320, 375, 698, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(async () => {
        const layouts = await triggers.evaluateAll((nodes) =>
          nodes.map((node) => {
            const bounds = node.getBoundingClientRect();
            const label = node.querySelector("span")!.getBoundingClientRect();
            const icon = node.querySelector("svg")!.getBoundingClientRect();
            return {
              text: node.textContent,
              centerOffset: Math.abs(
                label.top + label.height / 2 - icon.top - icon.height / 2
              ),
              labelRight: label.right,
              iconLeft: icon.left,
              iconBottom: icon.bottom,
              buttonBottom: bounds.bottom,
            };
          })
        );
        for (const layout of layouts) {
          expect(
            layout.centerOffset,
            layout.text ?? "log source"
          ).toBeLessThanOrEqual(1);
          expect(layout.iconLeft).toBeGreaterThanOrEqual(layout.labelRight);
          expect(layout.iconBottom).toBeLessThanOrEqual(layout.buttonBottom);
        }
      }).toPass();
    }

    await triggers.first().click();
    await expect(page.getByRole("menu")).toBeVisible();
    await page
      .getByRole("menuitem", {
        name: language === "zh-CN" ? "注册" : "Registration",
        exact: true,
      })
      .click({ noWaitAfter: true });
    await page.waitForURL((url) => url.pathname === "/dashboard/log/register", {
      waitUntil: "domcontentloaded",
    });
    expect(new URL(page.url()).searchParams.get("user_id")).toBe("101");
  });
}
