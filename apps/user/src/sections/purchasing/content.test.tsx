// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Content from "./content";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  navigate: vi.fn(),
  user: undefined as { id: string } | undefined,
}));
vi.mock("@tanstack/react-router", () => ({
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
  prePurchaseOrder: async () => ({ data: { data: {} } }),
}));
vi.mock("@/sections/subscribe/billing", () => ({
  SubscribeBilling: () => null,
}));
vi.mock("@/sections/subscribe/detail", () => ({ SubscribeDetail: () => null }));
vi.mock("@/sections/subscribe/duration-selector", () => ({
  default: () => null,
}));
vi.mock("@/sections/subscribe/coupon-input", () => ({ default: () => null }));
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

let client: QueryClient;
function renderPurchase() {
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <Content
        subscription={
          {
            id: "9007199254740993123",
            name: "Plan",
            description: "",
            unit_time: "Month",
            unit_price: 100,
          } as API.Subscribe
        }
      />
    </QueryClientProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Card" }));
}
beforeEach(() => {
  mocks.user = undefined;
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
        return_url: `${window.location.origin}${window.location.pathname}#/payment`,
      })
    );
    expect(mocks.navigate).toHaveBeenCalledWith({
      to: "/payment",
      search: { order_no: "created-order" },
    });
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
        return_url: `${window.location.origin}${window.location.pathname}#/purchasing/order`,
      })
    );
    expect(mocks.navigate).toHaveBeenCalledWith({
      to: "/purchasing/order",
      search: { order_no: "created-order" },
    });
  });
});
