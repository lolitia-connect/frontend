// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCheckoutToken } from "./checkout-token";
import Order from "./order";

const mocks = vi.hoisted(() => ({
  checkout: vi.fn(),
  getUserInfo: vi.fn(),
  queryOrder: vi.fn(),
  search: { order_no: "guest-order" },
  setAuthorization: vi.fn(),
  setRedirectUrl: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    to: string;
    children: ReactNode;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useSearch: () => mocks.search,
}));

vi.mock("@workspace/ui/services/user/portal", () => ({
  purchaseCheckout: mocks.checkout,
  queryPurchaseOrder: mocks.queryOrder,
}));

vi.mock("@/stores/global", () => ({
  useGlobalStore: () => ({
    getUserInfo: mocks.getUserInfo,
    isLoadingUser: false,
  }),
}));

vi.mock("@/utils/common", () => ({
  setAuthorization: mocks.setAuthorization,
  setRedirectUrl: mocks.setRedirectUrl,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));

vi.mock("ahooks", () => ({
  useCountDown: () => [60_000, { hours: 0, minutes: 1, seconds: 0 }],
}));

vi.mock("@workspace/ui/composed/icon", () => ({ Icon: () => null }));
vi.mock("@/sections/subscribe/billing", () => ({
  SubscribeBilling: () => null,
}));
vi.mock("@/sections/subscribe/detail", () => ({ SubscribeDetail: () => null }));

let queryClient: QueryClient;

function renderOrder() {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <Order />
    </QueryClientProvider>
  );
}

function orderResponse(status = 1, token?: string) {
  return {
    data: {
      data: {
        order_no: mocks.search.order_no,
        status,
        token,
        created_at: Date.now(),
        payment: { name: "Payment", platform: "epay" },
        subscribe: {},
        quantity: 1,
      },
    },
  };
}

beforeEach(() => {
  localStorage.clear();
  mocks.search.order_no = `guest-order-${crypto.randomUUID()}`;
  mocks.queryOrder.mockResolvedValue(orderResponse());
  mocks.checkout.mockResolvedValue({ data: { data: { type: "balance" } } });
  mocks.getUserInfo.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  queryClient?.clear();
  vi.useRealTimers();
  vi.resetAllMocks();
});

describe("guest order capability", () => {
  it("does not request an order without a checkout token and offers account recovery", async () => {
    renderOrder();

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(mocks.queryOrder).not.toHaveBeenCalled();
    expect(mocks.checkout).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("link", { name: "Sign in" }));
    expect(mocks.setRedirectUrl).toHaveBeenCalledWith("/order");
  });

  it("ignores legacy identity-only storage", async () => {
    localStorage.setItem(
      mocks.search.order_no,
      JSON.stringify({ auth_type: "email", identifier: "guest@example.com" })
    );
    renderOrder();

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(mocks.queryOrder).not.toHaveBeenCalled();
  });

  it("restores the stored token and creates checkout only after a click", async () => {
    localStorage.setItem(
      mocks.search.order_no,
      JSON.stringify({ checkout_token: "checkout-capability" })
    );
    renderOrder();

    const payButton = await screen.findByRole("button", {
      name: "Go to Payment",
    });
    expect(mocks.queryOrder).toHaveBeenCalledWith(
      {
        order_no: mocks.search.order_no,
        checkout_token: "checkout-capability",
      },
      { skipErrorHandler: true }
    );
    expect(mocks.checkout).not.toHaveBeenCalled();

    fireEvent.click(payButton);
    await waitFor(() => expect(mocks.checkout).toHaveBeenCalledTimes(1));
    expect(mocks.checkout).toHaveBeenCalledWith({
      orderNo: mocks.search.order_no,
      checkout_token: "checkout-capability",
      returnUrl: window.location.href,
    });
  });

  it("stops polling after failure and retries only on request", async () => {
    localStorage.setItem(
      mocks.search.order_no,
      JSON.stringify({ checkout_token: "checkout-capability" })
    );
    mocks.queryOrder.mockRejectedValueOnce(new Error("expired capability"));
    renderOrder();

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(mocks.queryOrder).toHaveBeenCalledTimes(1);
    vi.useFakeTimers();
    await act(() => vi.advanceTimersByTimeAsync(9000));
    expect(mocks.queryOrder).toHaveBeenCalledTimes(1);
    vi.useRealTimers();

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(
      await screen.findByRole("button", { name: "Go to Payment" })
    ).toBeTruthy();
    expect(mocks.queryOrder).toHaveBeenCalledTimes(2);
  });

  it("keeps the successful order visible after restoring the account and clearing its token", async () => {
    localStorage.setItem(
      mocks.search.order_no,
      JSON.stringify({ checkout_token: "checkout-capability" })
    );
    mocks.queryOrder.mockResolvedValue(orderResponse(5, "account-session"));
    renderOrder();

    expect(
      await screen.findByRole("heading", { name: "Payment Successful" })
    ).toBeTruthy();
    expect(mocks.setAuthorization).toHaveBeenCalledWith("account-session");
    expect(mocks.getUserInfo).toHaveBeenCalledTimes(1);
    expect(getCheckoutToken(mocks.search.order_no)).toBeUndefined();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
