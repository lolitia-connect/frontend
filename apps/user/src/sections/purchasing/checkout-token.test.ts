import { describe, expect, it } from "vitest";
import {
  clearCheckoutToken,
  getCheckoutToken,
  readCheckoutToken,
  saveCheckoutToken,
} from "./checkout-token";

describe("guest checkout capability", () => {
  it("restores only the capability for the requested order", () => {
    const storage = {
      getItem: (key: string) =>
        key === "ORDER-1"
          ? JSON.stringify({
              checkout_token: "capability",
              password: "ignored",
            })
          : null,
    };
    expect(readCheckoutToken(storage, "ORDER-1")).toBe("capability");
    expect(readCheckoutToken(storage, "ORDER-2")).toBeUndefined();
  });

  it.each([
    null,
    "{broken",
    "null",
    "[]",
    '"token"',
    '{"auth_type":"email","identifier":"buyer@example.com"}',
    '{"checkout_token":123}',
    '{"checkout_token":""}',
  ])("does not treat legacy or malformed data as authorization: %s", (value) => {
    expect(
      readCheckoutToken({ getItem: () => value }, "ORDER")
    ).toBeUndefined();
  });

  it("handles unavailable browser storage", () => {
    expect(
      readCheckoutToken(
        {
          getItem: () => {
            throw new Error("storage unavailable");
          },
        },
        "ORDER"
      )
    ).toBeUndefined();
  });

  it("keeps the capability in memory when storage is unavailable and clears it", () => {
    saveCheckoutToken("MEMORY-ORDER", "capability");
    expect(getCheckoutToken("MEMORY-ORDER")).toBe("capability");
    clearCheckoutToken("MEMORY-ORDER");
    expect(getCheckoutToken("MEMORY-ORDER")).toBeUndefined();
  });
});
