// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Display } from "@/components/display";
import { toMinorUnits } from "@/lib/fees";
import { usePortalStore } from "./global";

const api = vi.hoisted(() => ({
  user: vi.fn(),
  methods: vi.fn(),
  orders: vi.fn(),
  detail: vi.fn(),
  checkout: vi.fn(),
}));
vi.mock("@workspace/ui/services/user/user", () => ({
  queryUserInfo: api.user,
}));
vi.mock("@workspace/ui/services/user/order", () => ({
  queryOrderList: api.orders,
  queryOrderDetail: api.detail,
}));
vi.mock("@workspace/ui/services/user/portal", () => ({
  getAvailablePaymentMethods: api.methods,
  purchaseCheckout: api.checkout,
}));

const order = {
  id: 1,
  order_no: "ORDER-1",
  type: 4,
  status: 1,
  price: 1000,
  amount: 1050,
  fee_amount: 50,
  payment: { id: "card", name: "Card" },
};
const response = (data: unknown) => ({ data: { data } });

beforeEach(() => {
  usePortalStore.getState().reset();
  api.user.mockResolvedValue(response({ balance: 2500 }));
  api.methods.mockResolvedValue(
    response({
      list: [{ id: "card", name: "Card", fee_mode: 2, fee_amount: 50 }],
    })
  );
  api.orders.mockResolvedValue(response({ list: [order] }));
  api.detail.mockResolvedValue(response(order));
  api.checkout.mockResolvedValue(
    response({
      type: "qr",
      checkout_url: "https://checkout.example.test/ORDER-1",
    })
  );
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it("renders backend cents exactly once and submits the displayed amount in cents", async () => {
  await usePortalStore.getState().refreshPortal();
  const state = usePortalStore.getState();
  render(
    <>
      <Display type="currency" value={state.userBalance} />
      <Display type="currency" value={state.activeOrder?.rechargeAmount} />
      <Display type="currency" value={state.paymentMethods[0]?.fee_amount} />
    </>
  );
  expect(screen.getByText("$25.00$10.00$0.50")).toBeTruthy();
  expect(state.records[0]?.amount).toBe(10);
  expect(toMinorUnits(state.selectedAmount)).toBe(1000);
});

it("does not mark an empty checkout response as completed and allows another request", async () => {
  api.checkout.mockResolvedValueOnce(response({}));
  await usePortalStore
    .getState()
    .refreshActiveOrder("ORDER-1", { requestCheckout: true });
  expect(usePortalStore.getState().checkoutRequestedForOrderNo).toBeNull();
  await usePortalStore
    .getState()
    .refreshActiveOrder("ORDER-1", { requestCheckout: true });
  expect(api.checkout).toHaveBeenCalledTimes(2);
  expect(usePortalStore.getState().activeOrder?.checkout?.checkoutUrl).toBe(
    "https://checkout.example.test/ORDER-1"
  );
});

it("keeps checkout deferred and retains the QR code across refreshes without requesting it twice", async () => {
  await usePortalStore.getState().refreshPortal();
  expect(api.checkout).not.toHaveBeenCalled();
  await usePortalStore
    .getState()
    .refreshActiveOrder("ORDER-1", { requestCheckout: true });
  await usePortalStore.getState().refreshPortal();
  await usePortalStore
    .getState()
    .refreshActiveOrder("ORDER-1", { requestCheckout: true });
  expect(api.checkout).toHaveBeenCalledTimes(1);
  expect(usePortalStore.getState().activeOrder?.checkout?.checkoutUrl).toBe(
    "https://checkout.example.test/ORDER-1"
  );
});
