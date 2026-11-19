// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  extractTelegramAuthCallbackPayload,
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
