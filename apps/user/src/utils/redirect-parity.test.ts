/** @vitest-environment jsdom */
/**
 * Regression guard for `utils/common.ts` redirect handling after the App Router
 * migration.
 *
 * `main` routed on TanStack *hash* history (`createHashHistory()`), so
 * `getRedirectUrl()` read the `redirect` from the query string OR the hash query,
 * and `Logout()` sent the user to `/#/auth`. Under the App Router a fragment is
 * not a route, so:
 *
 *   1. `Logout()` writing `/#/auth` sent the user to a dead URL;
 *   2. the hash branch of `Logout()` mis-detected the current page.
 *
 * The query-string path and the sessionStorage fallback are still load-bearing
 * (they are how a signed-out user is returned to the page they wanted), so both
 * the fixed behaviour and the preserved behaviour are pinned here.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@workspace/ui/lib/cookies", () => ({
  getCookie: () => undefined,
  removeCookie: vi.fn(),
  setCookie: vi.fn(),
}));

const { Logout, getRedirectUrl, setRedirectUrl } = await import("./common");

beforeEach(() => {
  window.history.replaceState({}, "", "/");
  window.sessionStorage.clear();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("getRedirectUrl", () => {
  it("reads the redirect from the query string", () => {
    window.history.replaceState({}, "", "/auth?redirect=/wallet");
    expect(getRedirectUrl()).toBe("/wallet");
  });

  it("falls back to /dashboard when nothing was requested", () => {
    window.history.replaceState({}, "", "/auth");
    expect(getRedirectUrl()).toBe("/dashboard");
  });

  it("rejects an off-site redirect (no open redirect)", () => {
    window.history.replaceState({}, "", "/auth?redirect=https://evil.example");
    // Not an internal path -> ignored, so the default is used.
    expect(getRedirectUrl()).toBe("/dashboard");
  });

  it("rejects a protocol-relative redirect", () => {
    window.history.replaceState({}, "", "/auth?redirect=//evil.example");
    expect(getRedirectUrl()).toBe("/dashboard");
  });

  it("uses the stored redirect when the URL carries none", () => {
    window.history.replaceState({}, "", "/auth");
    setRedirectUrl("/ticket");
    expect(getRedirectUrl()).toBe("/ticket");
  });

  it("consumes the stored redirect by default but can keep it", () => {
    window.history.replaceState({}, "", "/auth");
    setRedirectUrl("/order");

    expect(getRedirectUrl()).toBe("/order");
    // Consumed: a second read no longer sees it.
    expect(sessionStorage.getItem("redirect-url")).toBeNull();

    setRedirectUrl("/order");
    expect(getRedirectUrl({ consumeStored: false })).toBe("/order");
    expect(sessionStorage.getItem("redirect-url")).toBe("/order");
  });
});

describe("setRedirectUrl ignores unusable values", () => {
  it("stores only internal paths", () => {
    window.history.replaceState({}, "", "/auth");

    // Each of these is rejected by the internal-path guard, so nothing is stored
    // and the default redirect is used. Verifiable through the public API only.
    setRedirectUrl("https://evil.example");
    expect(getRedirectUrl()).toBe("/dashboard");

    setRedirectUrl("//evil.example");
    expect(getRedirectUrl()).toBe("/dashboard");

    setRedirectUrl("/\\evil.example");
    expect(getRedirectUrl()).toBe("/dashboard");

    setRedirectUrl(undefined);
    expect(getRedirectUrl()).toBe("/dashboard");

    // A legitimate internal path is still stored.
    setRedirectUrl("/wallet");
    expect(getRedirectUrl()).toBe("/wallet");
  });
});

describe("Logout", () => {
  it("preserves the current page and redirects to the real /auth route", async () => {
    // The pre-migration code wrote `/#/auth`, which is no longer a route.
    window.history.replaceState({}, "", "/wallet");

    // `location.href = ...` is a jsdom navigation; capture it instead of
    // performing it.
    const assigned: string[] = [];
    const original = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...original,
        get pathname() {
          return "/wallet";
        },
        get hash() {
          return "";
        },
        get href() {
          return "http://localhost/wallet";
        },
        set href(value: string) {
          assigned.push(value);
        },
      },
    });

    try {
      Logout();
      expect(assigned).toEqual(["/auth"]);
      // The page the user wanted is remembered for after they log back in.
      expect(sessionStorage.getItem("redirect-url")).toBe("/wallet");
    } finally {
      Object.defineProperty(window, "location", {
        configurable: true,
        value: original,
      });
    }
  });

  it("does NOT redirect away from a public page", () => {
    const assigned: string[] = [];
    const original = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...original,
        get pathname() {
          return "/auth";
        },
        get hash() {
          return "";
        },
        get href() {
          return "http://localhost/auth";
        },
        set href(value: string) {
          assigned.push(value);
        },
      },
    });

    try {
      Logout();
      expect(assigned).toEqual([]);
    } finally {
      Object.defineProperty(window, "location", {
        configurable: true,
        value: original,
      });
    }
  });
});
