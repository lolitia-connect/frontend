import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { watchOrderEvents } from "./order-events";

const mocks = vi.hoisted(() => ({
  ticket: vi.fn(),
  order: vi.fn(),
  reconcile: vi.fn(),
}));
vi.mock("@workspace/ui/services/user/order-v2", () => ({
  reconcileStripeReturn: mocks.reconcile,
  getOrderEventTicket: mocks.ticket,
  getV2Order: mocks.order,
  orderEventUrl: (_orderNo: string, _ticket: unknown, cursor?: string) =>
    `https://example.com/events?ticket=short-lived${cursor ? `&after=${cursor}` : ""}`,
}));

class Stream extends EventTarget {
  static instances: Stream[] = [];
  onopen?: () => void;
  onerror?: () => void;
  close = vi.fn();
  url: string;
  constructor(url: string) {
    super();
    this.url = url;
    Stream.instances.push(this);
  }
  emit(type: string, data: unknown, id = "") {
    this.dispatchEvent(
      Object.assign(new Event(type), {
        data: JSON.stringify(data),
        lastEventId: id,
      })
    );
  }
}

const initial = {
  order_no: "order",
  state_version: 1,
  status: "pending_payment",
  payment_status: "pending",
  fulfillment_status: "not_started",
  amount: 100,
  currency: "USD",
  expires_at: 123,
};
let stop: (() => void) | undefined;
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("EventSource", Stream);
  Stream.instances = [];
  mocks.ticket.mockResolvedValue({
    data: {
      data: {
        url: "/events?ticket=short-lived",
        ticket_expires_at: Date.now() / 1000 + 600,
      },
    },
  });
  mocks.order.mockResolvedValue({ data: { data: { order: initial } } });
});
afterEach(() => {
  stop?.();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("V2 order stream", () => {
  it("reconciles once on return and ignores a stale pending event after payment", async () => {
    const onSnapshot = vi.fn();
    mocks.reconcile.mockResolvedValueOnce({
      data: {
        data: {
          order: {
            ...initial,
            status: "paid",
            payment_status: "paid",
            state_version: 2,
          },
        },
      },
    });
    stop = watchOrderEvents({
      orderNo: "order",
      checkoutToken: "cap",
      stripeReturn: true,
      onSnapshot,
      onError: vi.fn(),
    });
    await vi.advanceTimersByTimeAsync(0);
    Stream.instances[0]?.emit("order.snapshot", initial);
    await vi.advanceTimersByTimeAsync(5000);
    expect(mocks.reconcile).toHaveBeenCalledOnce();
    expect(mocks.reconcile).toHaveBeenCalledWith("order", "cap");
    expect(onSnapshot.mock.lastCall?.[0].status).toBe("paid");
  });

  it("stops all recovery requests after access is rejected", async () => {
    const onError = vi.fn();
    mocks.order.mockRejectedValueOnce({ code: 40_004 });
    stop = watchOrderEvents({ orderNo: "order", onSnapshot: vi.fn(), onError });
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(onError).toHaveBeenCalledOnce();
    expect(mocks.order).toHaveBeenCalledOnce();
  });
  it("ignores replayed state, reconnects with the exact int64 cursor and stops on fulfillment", async () => {
    const onSnapshot = vi.fn();
    stop = watchOrderEvents({
      orderNo: "order",
      checkoutToken: "capability",
      onSnapshot,
      onError: vi.fn(),
    });
    await vi.advanceTimersByTimeAsync(0);
    const first = Stream.instances[0]!;
    first.emit(
      "order.payment_paid",
      {
        order_no: "order",
        state_version: 2,
        payment_status: "paid",
        fulfillment_status: "pending",
      },
      "9007199254740993999"
    );
    first.emit("order.snapshot", initial);
    first.emit("order.created", initial, "9007199254740993000");
    expect(onSnapshot).toHaveBeenCalledTimes(2);
    first.onerror?.();
    await vi.advanceTimersByTimeAsync(1000);
    expect(Stream.instances[1]?.url).toContain("after=9007199254740993999");
    Stream.instances[1]!.emit("order.fulfilled", {
      order_no: "order",
      state_version: 3,
      payment_status: "paid",
      fulfillment_status: "finished",
    });
    expect(onSnapshot.mock.lastCall?.[0].status).toBe("finished");
    expect(Stream.instances[1]!.close).toHaveBeenCalled();
    const count = mocks.order.mock.calls.length;
    await vi.advanceTimersByTimeAsync(30_000);
    expect(mocks.order).toHaveBeenCalledTimes(count);
  });

  it("refreshes expiring tickets and keeps polling when streams fail", async () => {
    stop = watchOrderEvents({
      orderNo: "order",
      onSnapshot: vi.fn(),
      onError: vi.fn(),
    });
    await vi.advanceTimersByTimeAsync(0);
    Stream.instances[0]!.emit("stream.expiring", {});
    await vi.advanceTimersByTimeAsync(1000);
    expect(mocks.ticket).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(5000);
    expect(mocks.order.mock.calls.length).toBeGreaterThan(1);
  });
});
