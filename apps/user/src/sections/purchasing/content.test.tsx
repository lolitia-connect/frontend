// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@workspace/ui/hooks/query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Purchase from "@/sections/subscribe/purchase";
import Renewal from "@/sections/subscribe/renewal";
import Content from "./content";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  navigate: vi.fn(),
  preview: vi.fn(),
  user: undefined as { id: string } | undefined,
}));
vi.mock("@workspace/ui/lib/router-compat", () => ({
  useNavigate: () => mocks.navigate,
}));
vi.mock("./create-order", () => ({ useCreateOrder: () => mocks.create }));
vi.mock("@/stores/global", () => ({
  useGlobalStore: () => ({
    user: mocks.user,
    common: {
      site: { site_name: "Store" },
      auth: {
        email: {
          enable_domain_suffix: true,
          domain_suffix_list: "example.com",
        },
      },
    },
  }),
}));
vi.mock("@workspace/ui/services/user/portal", () => ({
  prePurchaseOrder: mocks.preview,
}));
vi.mock("@workspace/ui/services/user/order", () => ({
  preCreateOrder: mocks.preview,
}));
vi.mock("@/sections/subscribe/billing", () => ({
  SubscribeBilling: () => null,
}));
vi.mock("@/sections/subscribe/detail", () => ({ SubscribeDetail: () => null }));
vi.mock("@/sections/subscribe/duration-selector", () => ({
  default: () => null,
}));
vi.mock("@/sections/subscribe/payment-methods", () => ({
  default: ({ onChange }: { onChange: (value: string) => void }) => (
    <button onClick={() => onChange("2")} type="button">
      Card
    </button>
  ),
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));

const subscription = {
  id: "9007199254740993123",
  name: "Plan",
  description: "",
  unit_time: "Month",
  unit_price: 100,
} as API.Subscribe;

let client: QueryClient;
function renderCheckout(checkout: React.ReactNode, retry: number | false) {
  client = new QueryClient({
    defaultOptions: { queries: { retry, retryDelay: 0 } },
  });
  render(<QueryClientProvider client={client}>{checkout}</QueryClientProvider>);
}

function renderPurchase() {
  renderCheckout(<Content subscription={subscription} />, false);
  fireEvent.click(screen.getByRole("button", { name: "Card" }));
}
beforeEach(() => {
  mocks.user = undefined;
  mocks.preview.mockResolvedValue({ data: { data: {} } });
  mocks.create.mockResolvedValue({
    data: { data: { order: { order_no: "created-order" } } },
  });
});
afterEach(() => {
  cleanup();
  client?.clear();
  localStorage.clear();
  vi.resetAllMocks();
});

describe("checkout coupon validation", () => {
  it.each([
    ["public purchase", () => <Content subscription={subscription} />],
    [
      "subscription purchase",
      () => <Purchase setSubscribe={vi.fn()} subscribe={subscription} />,
    ],
    [
      "subscription renewal",
      () => <Renewal id="instance-1" subscribe={subscription} />,
    ],
  ])("shows an invalid coupon after one request in %s", async (name, checkout) => {
    mocks.user = { id: "1" };
    mocks.preview.mockImplementation(
      async ({ coupon }: { coupon?: string }) => {
        if (coupon === "INVALID") {
          throw new Error("Coupon not found");
        }
        return { data: { data: {} } };
      }
    );

    renderCheckout(checkout(), 3);
    if (name === "subscription renewal") {
      fireEvent.click(screen.getByRole("button", { name: "Renew" }));
    }
    const input = await screen.findByPlaceholderText("Enter Coupon Code");
    fireEvent.change(input, { target: { value: "INVALID" } });
    fireEvent.blur(input);

    expect(await screen.findByText("Coupon code is invalid.")).toBeTruthy();
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(
      mocks.preview.mock.calls.filter(
        ([request]) => request.coupon === "INVALID"
      )
    ).toHaveLength(1);

    fireEvent.change(input, { target: { value: "VALID" } });
    fireEvent.blur(input);
    expect(await screen.findByText("Coupon code is valid.")).toBeTruthy();
    expect(input.getAttribute("aria-invalid")).toBe("false");
  });
});

describe("public purchase identity", () => {
  it("uses the authenticated order route without collecting guest identity", async () => {
    mocks.user = { id: "1" };
    renderPurchase();
    expect(screen.queryByPlaceholderText("Email")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Buy Now" }));
    await waitFor(() => expect(mocks.create).toHaveBeenCalledOnce());
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        guest: undefined,
        payment_id: "2",
        subscribe_id: "9007199254740993123",
        return_url: `${window.location.origin}/payment`,
      })
    );
    expect(mocks.navigate).toHaveBeenCalledWith({
      to: "/payment",
      search: { order_no: "created-order" },
    });
  });

  it("generates a guest password when none is provided", async () => {
    renderPurchase();
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "guest@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Buy Now" }));
    await waitFor(() => expect(mocks.create).toHaveBeenCalledOnce());
    const request = mocks.create.mock.calls[0]?.[0];
    expect(request.guest).toEqual({
      auth_type: "email",
      identifier: "guest@example.com",
      password: expect.any(String),
      invite_code: undefined,
    });
    expect(request.guest.password).toHaveLength(36);
  });

  it("accepts a whitelisted guest email and enforces optional password length", async () => {
    renderPurchase();
    const buy = screen.getByRole("button", {
      name: "Buy Now",
    }) as HTMLButtonElement;
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "invalid-email" },
    });
    expect(buy.disabled).toBe(true);
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "guest@other.com" },
    });
    expect(buy.disabled).toBe(true);
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "guest@example.com" },
    });
    expect(buy.disabled).toBe(false);
    const password = screen.getByPlaceholderText(
      "Password (at least 8 characters, optional)"
    );
    fireEvent.change(password, { target: { value: "short" } });
    expect(buy.disabled).toBe(true);
    fireEvent.change(password, { target: { value: "guest-password" } });
    fireEvent.click(buy);
    await waitFor(() => expect(mocks.create).toHaveBeenCalledOnce());
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        guest: {
          auth_type: "email",
          identifier: "guest@example.com",
          password: "guest-password",
          invite_code: undefined,
        },
        return_url: `${window.location.origin}/purchasing/order`,
      })
    );
    expect(mocks.navigate).toHaveBeenCalledWith({
      to: "/purchasing/order",
      search: { order_no: "created-order" },
    });
  });
});
