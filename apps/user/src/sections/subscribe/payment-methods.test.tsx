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
import PaymentMethods from "./payment-methods";

const mocks = vi.hoisted(() => ({ methods: vi.fn() }));
vi.mock("@workspace/ui/services/user/portal", () => ({
  getAvailablePaymentMethods: mocks.methods,
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

const methods = [
  {
    id: "-1",
    name: "Balance",
    icon: "",
    fee_mode: 0,
    fee_percent: 0,
    fee_amount: 0,
  },
  {
    id: "card",
    name: "Bank Card",
    icon: "",
    fee_mode: 1,
    fee_percent: 6,
    fee_amount: 0,
  },
];

let client: QueryClient;
beforeEach(() => {
  mocks.methods.mockResolvedValue({ data: { data: { list: methods } } });
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});
afterEach(() => {
  cleanup();
  client.clear();
  vi.clearAllMocks();
});

function renderMethods(onChange: (value: string) => void, value = "card") {
  render(
    <QueryClientProvider client={client}>
      <PaymentMethods onChange={onChange} value={value} />
    </QueryClientProvider>
  );
}

describe("payment methods", () => {
  it("changes the selection when another method tile is clicked", async () => {
    const onChange = vi.fn();
    renderMethods(onChange, "card");

    const balance = await screen.findByText("Balance");
    fireEvent.click(balance);

    await waitFor(() => expect(onChange).toHaveBeenCalledWith("-1"));
  });

  it("renders percentage fee chips with warning styling", async () => {
    renderMethods(vi.fn(), "card");

    const feeChip = (await screen.findByText("6%")).closest(
      '[data-slot="chip"]'
    );
    expect(feeChip?.classList.contains("chip--warning")).toBe(true);
    expect(feeChip?.classList.contains("chip--soft")).toBe(true);
  });
});
