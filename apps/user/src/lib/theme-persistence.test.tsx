/**
 * @vitest-environment jsdom
 *
 * Regression coverage for the theme choice NOT being persisted.
 *
 * Before this fix `ThemeProvider.setTheme` only called `useState`'s setter and
 * `theme.tsx` contained zero `localStorage` reads/writes, so a picked theme was
 * lost on every reload while the language choice (which has its own explicit
 * persistence) survived. These tests lock in the same contract the language
 * switcher has:
 *  - an explicit choice is stored and restored across a remount,
 *  - "follow system" clears the stored choice,
 *  - merely mounting never writes a preference.
 *
 * jsdom implements no `matchMedia`, and `resolveTheme("system")` reads it, so it
 * is stubbed here rather than in the shared setup (only this file needs it).
 */
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@workspace/ui/integrations/theme";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type PrefersDark = boolean;

function stubMatchMedia(prefersDark: PrefersDark) {
  const listeners = new Set<() => void>();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: query.includes("prefers-color-scheme: dark")
        ? prefersDark
        : false,
      media: query,
      onchange: null,
      addEventListener: (_: string, cb: () => void) => listeners.add(cb),
      removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
      addListener: (cb: () => void) => listeners.add(cb),
      removeListener: (cb: () => void) => listeners.delete(cb),
      dispatchEvent: () => false,
    }),
  });
}

/** Exposes the context so tests can drive it like the switcher does. */
function Probe() {
  const { theme, setTheme, resetTheme, resolvedTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button
        data-testid="set-dark"
        onClick={() => setTheme("dark")}
        type="button"
      >
        dark
      </button>
      <button
        data-testid="set-light"
        onClick={() => setTheme("light")}
        type="button"
      >
        light
      </button>
      <button data-testid="follow-system" onClick={resetTheme} type="button">
        system
      </button>
    </div>
  );
}

function renderProvider() {
  return render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>
  );
}

// React 19 warns "not configured to support act(...)" unless this flag is set.
// `@testing-library/react` normally handles it, but these tests drive the
// context through raw `act()`, so declare the environment explicitly.
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

beforeEach(() => {
  cleanup(); // this suite renders several times; do not accumulate DOM
  window.localStorage.clear();
  document.documentElement.className = "";
  stubMatchMedia(false);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("theme persistence", () => {
  it("restores the saved theme before marking the document ready", async () => {
    window.localStorage.setItem("theme", "dark");
    document.head.innerHTML = '<meta name="color-scheme" content="dark light">';

    renderProvider();
    await act(async () => {
      await Promise.resolve();
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("theme-ready")).toBe(
      true
    );
    expect(
      document
        .querySelector('meta[name="color-scheme"]')
        ?.getAttribute("content")
    ).toBe("dark light");
  });

  it("persists an explicit choice to localStorage", async () => {
    renderProvider();

    await act(async () => {
      screen.getByTestId("set-dark").click();
    });

    // Regression: `setTheme` used to update state only, so this stayed null.
    expect(window.localStorage.getItem("theme")).toBe("dark");
    expect(screen.getByTestId("theme").textContent).toBe("dark");
  });

  it("restores the stored choice on a fresh mount (simulated reload)", async () => {
    window.localStorage.setItem("theme", "dark");
    stubMatchMedia(false); // OS prefers light, so only the stored value can win

    renderProvider();

    // Mounts as the default, then the effect applies the stored choice.
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(screen.getByTestId("resolved").textContent).toBe("dark");
    expect(window.localStorage.getItem("theme")).toBe("dark");
  });

  it("does NOT write a preference merely by mounting", async () => {
    renderProvider();

    await act(async () => {
      await Promise.resolve();
    });

    // Regression: detection-on-mount must not create a choice, otherwise
    // "follow system" silently becomes a pin (same bug class as the language one).
    expect(window.localStorage.getItem("theme")).toBeNull();
  });

  it("ignores an invalid stored value", async () => {
    window.localStorage.setItem("theme", "neon");

    renderProvider();
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByTestId("theme").textContent).toBe("system");
  });

  it("resetTheme (follow system) clears the stored choice", async () => {
    renderProvider();

    await act(async () => {
      screen.getByTestId("set-dark").click();
    });
    expect(window.localStorage.getItem("theme")).toBe("dark");

    await act(async () => {
      screen.getByTestId("follow-system").click();
    });

    expect(window.localStorage.getItem("theme")).toBeNull();
    expect(screen.getByTestId("theme").textContent).toBe("system");
  });

  it("follows the OS preference once the choice is cleared", async () => {
    window.localStorage.setItem("theme", "light");
    stubMatchMedia(true); // OS prefers dark

    renderProvider();
    await act(async () => {
      await Promise.resolve();
    });
    // The stored explicit choice wins over the OS.
    expect(screen.getByTestId("resolved").textContent).toBe("light");

    await act(async () => {
      screen.getByTestId("follow-system").click();
    });

    // Now the OS preference is what applies.
    expect(screen.getByTestId("resolved").textContent).toBe("dark");
    expect(window.localStorage.getItem("theme")).toBeNull();
  });

  it("applies the resolved theme class to <html>", async () => {
    document.head.innerHTML = '<meta name="color-scheme" content="light dark">';
    renderProvider();

    await act(async () => {
      screen.getByTestId("set-dark").click();
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("light")).toBe(false);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(
      document
        .querySelector('meta[name="color-scheme"]')
        ?.getAttribute("content")
    ).toBe("light dark");
  });
});
