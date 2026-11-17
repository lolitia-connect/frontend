// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCreateOrder } from "./create-order";

const mocks = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("@workspace/ui/services/user/order-v2", () => ({
  createV2Order: mocks.create,
}));
beforeEach(() => {
  mocks.create.mockResolvedValue({
    data: {
      data: { order: { order_no: "new-order" }, checkout_token: "capability" },
    },
  });
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  vi.resetAllMocks();
});

describe("V2 order idempotency", () => {
  it("reuses the key after a transport failure and replaces it when the payload changes", async () => {
    const { result } = renderHook(() => useCreateOrder());
    const body = {
      type: "purchase" as const,
      payment_id: "1",
      subscribe_id: "9007199254740993123",
    };
    mocks.create.mockRejectedValueOnce(new Error("network"));
    await act(async () => {
      await expect(result.current(body)).rejects.toThrow("network");
    });
    await act(async () => {
      await result.current(body);
    });
    expect(mocks.create.mock.calls[0]?.[1]).toBe(
      mocks.create.mock.calls[1]?.[1]
    );
    expect(sessionStorage.getItem("recent-checkout-order")).toBe("new-order");
    await act(async () => {
      await result.current({ ...body, quantity: 2 });
    });
    expect(mocks.create.mock.calls[2]?.[1]).not.toBe(
      mocks.create.mock.calls[1]?.[1]
    );
  });
});
