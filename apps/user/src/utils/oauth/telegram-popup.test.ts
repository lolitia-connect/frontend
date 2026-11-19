// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  extractTelegramAuthCallbackPayload,
  relayTelegramCallbackToOpener,
  requestTelegramAuthCallback,
} from "./telegram-popup";

type MockPopup = Window & {
  closed: boolean;
  location: { replace: ReturnType<typeof vi.fn> };
  focus: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
};

function createPopup(): MockPopup {
  return {
    closed: false,
    focus: vi.fn(),
    close: vi.fn(),
    location: { replace: vi.fn() },
  } as unknown as MockPopup;
}

function toBase64(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64");
}

describe("extractTelegramAuthCallbackPayload", () => {
  it("decodes a tgAuthResult wrapper object into the signed fields", () => {
    const fields = {
      id: 42,
      first_name: "Ada",
      auth_date: 1_700_000_000,
      hash: "signature",
    };

    const payload = extractTelegramAuthCallbackPayload({
      tgAuthResult: toBase64(fields),
    });

    expect(payload).toEqual({
      id: "42",
      first_name: "Ada",
      auth_date: "1700000000",
      hash: "signature",
    });
  });

  it("reads individual query-style fields the bridge forwards", () => {
    const payload = extractTelegramAuthCallbackPayload({
      id: "7",
      auth_date: "1700000000",
      hash: "xyz",
    });

    expect(payload).toMatchObject({ id: "7", hash: "xyz" });
  });

  it("ignores messages that are not Telegram auth payloads", () => {
    expect(extractTelegramAuthCallbackPayload({ foo: "bar" })).toBeNull();
  });
});

describe("requestTelegramAuthCallback", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("drives the popup to the OAuth url and resolves on a trusted bridge message", async () => {
    const popup = createPopup();
    const url = "https://oauth.telegram.org/auth?bot_id=1";

    const promise = requestTelegramAuthCallback(url, popup);
    expect(popup.location.replace).toHaveBeenCalledWith(url);

    window.dispatchEvent(
      new MessageEvent("message", {
        data: {
          id: 5,
          first_name: "Grace",
          auth_date: 1_700_000_000,
          hash: "s",
        },
        origin: window.location.origin,
      })
    );

    await expect(promise).resolves.toMatchObject({ id: "5", hash: "s" });
    expect(popup.close).toHaveBeenCalled();
  });

  it("resolves on Telegram's native auth_result message trusted by source", async () => {
    const popup = createPopup();
    const promise = requestTelegramAuthCallback(
      "https://oauth.telegram.org/auth?bot_id=1",
      popup
    );

    // Telegram posts a JSON string from its own origin (not ours) and
    // identifies itself only by being the window we opened.
    const event = new MessageEvent("message", {
      data: JSON.stringify({
        event: "auth_result",
        result: {
          id: 5,
          first_name: "Grace",
          auth_date: 1_700_000_000,
          hash: "s",
        },
      }),
      origin: "https://oauth.telegram.org",
    });
    Object.defineProperty(event, "source", { value: popup });
    window.dispatchEvent(event);

    await expect(promise).resolves.toMatchObject({ id: "5", hash: "s" });
    expect(popup.close).toHaveBeenCalled();
  });

  it("falls back to /auth/get when the popup closes without a message", async () => {
    vi.useFakeTimers();
    const popup = createPopup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        origin: "https://oauth.telegram.org",
        user: { id: 8, first_name: "Max", auth_date: 1, hash: "z" },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const promise = requestTelegramAuthCallback(
      "https://oauth.telegram.org/auth?bot_id=42",
      popup
    );
    popup.closed = true;

    await vi.advanceTimersByTimeAsync(1100);

    await expect(promise).resolves.toMatchObject({ id: "8", hash: "z" });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://oauth.telegram.org/auth/get",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: "bot_id=42",
      })
    );
  });

  it("rejects when the popup closes and /auth/get yields nothing", async () => {
    vi.useFakeTimers();
    const popup = createPopup();
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ user: false }) });
    vi.stubGlobal("fetch", fetchMock);

    const promise = requestTelegramAuthCallback(
      "https://oauth.telegram.org/auth?bot_id=7",
      popup
    );
    const tracked = promise.catch((error: Error) => error.message);
    popup.closed = true;

    await vi.advanceTimersByTimeAsync(1100);

    await expect(tracked).resolves.toBe(
      "Telegram auth popup was closed before completing"
    );
  });

  it("ignores messages that arrive from an untrusted origin", async () => {
    const popup = createPopup();
    const promise = requestTelegramAuthCallback(
      "https://oauth.telegram.org/auth",
      popup
    );

    let resolved = false;
    const tracked = promise.then((value) => {
      resolved = true;
      return value;
    });

    window.dispatchEvent(
      new MessageEvent("message", {
        data: { id: 1, auth_date: 1, hash: "h" },
        origin: "https://evil.example.com",
      })
    );
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(resolved).toBe(false);

    // Resolve from a trusted origin to clean up the pending listener/timer.
    window.dispatchEvent(
      new MessageEvent("message", {
        data: { id: 1, auth_date: 1, hash: "h" },
        origin: window.location.origin,
      })
    );
    await tracked;
  });
});

describe("relayTelegramCallbackToOpener", () => {
  const originalOpener = Object.getOwnPropertyDescriptor(window, "opener");

  function setOpener(value: unknown) {
    Object.defineProperty(window, "opener", {
      value,
      configurable: true,
      writable: true,
    });
  }

  afterEach(() => {
    if (originalOpener) {
      Object.defineProperty(window, "opener", originalOpener);
    } else {
      setOpener(null);
    }
    window.history.replaceState({}, "", "/");
    vi.restoreAllMocks();
  });

  it("relays query-style fields to the opener and reports success", () => {
    const postMessage = vi.fn();
    const focus = vi.fn();
    setOpener({ closed: false, postMessage, focus });
    window.history.replaceState(
      {},
      "",
      "/oauth/telegram?id=9&auth_date=1&hash=h"
    );

    expect(relayTelegramCallbackToOpener()).toBe(true);
    expect(postMessage).toHaveBeenCalledWith(
      { id: "9", auth_date: "1", hash: "h" },
      window.location.origin
    );
    expect(focus).toHaveBeenCalled();
  });

  it("relays a tgAuthResult blob carried in the hash fragment", () => {
    const postMessage = vi.fn();
    setOpener({ closed: false, postMessage, focus: vi.fn() });
    const blob = toBase64({ id: 9, auth_date: 1, hash: "h" })
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
    window.history.replaceState({}, "", `/oauth/telegram#tgAuthResult=${blob}`);

    expect(relayTelegramCallbackToOpener()).toBe(true);
    expect(postMessage).toHaveBeenCalledWith(
      { tgAuthResult: blob },
      window.location.origin
    );
  });

  it("does nothing when there is no opener (main window)", () => {
    setOpener(null);
    window.history.replaceState(
      {},
      "",
      "/oauth/telegram?id=9&auth_date=1&hash=h"
    );

    expect(relayTelegramCallbackToOpener()).toBe(false);
  });

  it("does nothing when the location has no Telegram payload", () => {
    const postMessage = vi.fn();
    setOpener({ closed: false, postMessage, focus: vi.fn() });
    window.history.replaceState({}, "", "/oauth/telegram?foo=bar");

    expect(relayTelegramCallbackToOpener()).toBe(false);
    expect(postMessage).not.toHaveBeenCalled();
  });
});
