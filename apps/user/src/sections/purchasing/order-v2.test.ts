import { createV2Order } from "@workspace/ui/services/user/order-v2";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock("@workspace/ui/lib/request", () => ({ default: mocks.request }));
beforeEach(() => {
  mocks.request.mockReset();
});
describe("V2 request serialization", () => {
  it("sends exact Go int64 identifiers and the idempotency header", () => {
    createV2Order(
      {
        type: "purchase",
        payment_id: "9007199254740993123",
        subscribe_id: "9007199254740993999",
      },
      "idempotency-key"
    );
    const options = mocks.request.mock.calls[0]?.[1];
    expect(options.data).toContain('"payment_id":9007199254740993123');
    expect(options.data).toContain('"subscribe_id":9007199254740993999');
    expect(options.headers["Idempotency-Key"]).toBe("idempotency-key");
  });
});
