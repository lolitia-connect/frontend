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
  session: vi.fn(),
}));

vi.mock("@workspace/ui/lib/router-compat", () => ({
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
  queryPurchaseOrder: mocks.queryOrder,
}));

vi.mock("@workspace/ui/services/user/order-v2", () => ({
  checkoutV2Order: mocks.checkout,
  exchangeOrderSession: mocks.session,
}));
vi.mock("./order-events", () => ({ watchOrderEvents: () => () => undefined }));
vi.mock("./create-order", () => ({
  takeOrderPayment: () => undefined,
  recentCheckoutOrder: () => undefined,
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
  mocks.checkout.mockResolvedValue({
    data: { data: { payment: { type: "balance" } } },
  });
  mocks.session.mockResolvedValue({
    data: { data: { access_token: "account-session" } },
  });
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
    expect(mocks.checkout).toHaveBeenCalledWith(
      mocks.search.order_no,
      "checkout-capability"
    );
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
    expect(
      await screen.findByRole("link", { name: "Subscribe Now" })
    ).toBeTruthy();
    expect(mocks.setAuthorization).toHaveBeenCalledWith("account-session");
    expect(mocks.getUserInfo).toHaveBeenCalledTimes(1);
    expect(getCheckoutToken(mocks.search.order_no)).toBeUndefined();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("waits for fulfillment before restoring a session or offering the subscription", async () => {
    localStorage.setItem(
      mocks.search.order_no,
      JSON.stringify({ checkout_token: "checkout-capability" })
    );
    mocks.queryOrder.mockResolvedValue(orderResponse(2));
    renderOrder();

    expect(
      await screen.findByRole("heading", { name: "Payment received" })
    ).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("being activated");
    expect(screen.queryByRole("link", { name: "Subscribe Now" })).toBeNull();
    expect(mocks.session).not.toHaveBeenCalled();
    expect(getCheckoutToken(mocks.search.order_no)).toBe("checkout-capability");
  });

  it("retains the checkout capability and offers an explicit session retry after a failure", async () => {
    localStorage.setItem(
      mocks.search.order_no,
      JSON.stringify({ checkout_token: "checkout-capability" })
    );
    mocks.queryOrder.mockResolvedValue(orderResponse(5));
    mocks.session.mockRejectedValueOnce(new Error("temporary session failure"));
    renderOrder();

    const retry = await screen.findByRole("button", { name: "Retry sign-in" });
    expect(mocks.session).toHaveBeenCalledTimes(1);
    expect(getCheckoutToken(mocks.search.order_no)).toBe("checkout-capability");
    expect(screen.queryByRole("link", { name: "Subscribe Now" })).toBeNull();
    fireEvent.click(retry);

    expect(
      await screen.findByRole("link", { name: "Subscribe Now" })
    ).toBeTruthy();
    expect(mocks.session).toHaveBeenCalledTimes(2);
    expect(getCheckoutToken(mocks.search.order_no)).toBeUndefined();
  });
});
