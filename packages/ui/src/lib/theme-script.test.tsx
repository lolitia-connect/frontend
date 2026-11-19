import { JSDOM } from "jsdom";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { ThemeScript } from "./theme-script";

it.each([
  { stored: "dark", systemDark: false, expected: "dark" },
  { stored: "light", systemDark: true, expected: "light" },
  { stored: "system", systemDark: true, expected: "dark" },
  { stored: "invalid", systemDark: false, expected: "light" },
])("applies $stored with systemDark=$systemDark before hydration", ({
  stored,
  systemDark,
  expected,
}) => {
  const dom = new JSDOM(
    `<html><head>${renderToStaticMarkup(<ThemeScript />)}</head><body>Content</body></html>`,
    {
      url: "https://example.test",
      runScripts: "dangerously",
      beforeParse(window) {
        window.localStorage.setItem("theme", stored);
        Object.defineProperty(window, "matchMedia", {
          value: () => ({ matches: systemDark }),
        });
      },
    }
  );
  try {
    expect(dom.window.document.documentElement.dataset.theme).toBe(expected);
    expect(
      dom.window.document.documentElement.classList.contains(expected)
    ).toBe(true);
    expect(dom.window.localStorage.getItem("theme")).toBe(stored);
  } finally {
    dom.window.close();
  }
});

it("follows the system when preference storage is blocked", () => {
  const dom = new JSDOM(
    `<html><head>${renderToStaticMarkup(<ThemeScript />)}</head></html>`,
    {
      runScripts: "dangerously",
      beforeParse(window) {
        Object.defineProperty(window, "localStorage", {
          get: () => {
            throw new Error("Blocked");
          },
        });
        Object.defineProperty(window, "matchMedia", {
          value: () => ({ matches: true }),
        });
      },
    }
  );
  try {
    expect(dom.window.document.documentElement.dataset.theme).toBe("dark");
  } finally {
    dom.window.close();
  }
});
