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
import Affiliate from "./index";

const mocks = vi.hoisted(() => ({
  commission: 12_345,
  getUserInfo: vi.fn(),
  queryAffiliate: vi.fn(),
  withdraw: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock("@workspace/ui/services/user/user", () => ({
  postV1PublicUserCommissionWithdraw: mocks.withdraw,
  getV1PublicUserAffiliateCount: mocks.queryAffiliate,
  getV1PublicUserAffiliateList: vi.fn(),
}));
vi.mock("@workspace/ui/composed/pro-list/pro-list", () => ({
  ProList: () => null,
}));
vi.mock("@/stores/global", () => ({
  useGlobalStore: () => ({
    user: { commission: mocks.commission, refer_code: "test-invite" },
    common: { currency: { currency_symbol: "$" }, invite: {} },
    getUserInfo: mocks.getUserInfo,
  }),
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));
vi.mock("@heroui/react", async (importOriginal) => {
  const heroui = await importOriginal<typeof import("@heroui/react")>();
  return {
    ...heroui,
    toast: { ...heroui.toast, success: mocks.success, danger: mocks.error },
  };
});

let queryClient: QueryClient;

function renderAffiliate() {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <Affiliate />
    </QueryClientProvider>
  );
}

async function openWithdrawal() {
  renderAffiliate();
  fireEvent.click(screen.getByRole("button", { name: "Withdraw" }));
  const input = await screen.findByRole<HTMLInputElement>("spinbutton", {
    name: "Withdrawal Amount",
  });
  fireEvent.change(screen.getByLabelText("Withdrawal Info"), {
    target: { value: "  test payment account  " },
  });
  return input;
}

beforeEach(() => {
  mocks.commission = 12_345;
  mocks.queryAffiliate.mockResolvedValue({
    data: { data: { total_commission: 99_999, registers: 0 } },
  });
  mocks.withdraw.mockResolvedValue({ data: { data: {} } });
  mocks.getUserInfo.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  queryClient.clear();
  vi.resetAllMocks();
});

describe("commission withdrawals", () => {
  it.each([
    ["100", 10_000],
    ["12.34", 1234],
    ["0.29", 29],
    ["0.01", 1],
  ])("submits %s currency units as %i integer cents", async (value, cents) => {
    const input = await openWithdrawal();
    fireEvent.change(input, { target: { value } });
    fireEvent.click(screen.getByRole("button", { name: "Submit Withdrawal" }));

    await waitFor(() => expect(mocks.withdraw).toHaveBeenCalledOnce());
    expect(mocks.withdraw.mock.calls[0]?.[0]).toEqual({
      amount: cents,
      content: "test payment account",
    });
    await waitFor(() => expect(mocks.getUserInfo).toHaveBeenCalledOnce());
    expect(mocks.queryAffiliate).toHaveBeenCalledTimes(2);
    expect(mocks.success).toHaveBeenCalledWith("Withdrawal request submitted");
  });

  it("rejects amounts exceeding the current balance even below the total commission", async () => {
    const input = await openWithdrawal();
    fireEvent.change(input, { target: { value: "123.46" } });
    fireEvent.submit(input.closest("form")!);

    expect(mocks.withdraw).not.toHaveBeenCalled();
    expect(mocks.error).toHaveBeenCalledWith(
      "Amount exceeds available commission"
    );
  });

  it("rejects invalid amounts and fractions smaller than one cent", async () => {
    const input = await openWithdrawal();
    for (const value of [
      "",
      "0",
      "-1",
      "0.001",
      "1.234",
      "90071992547409.92",
    ]) {
      fireEvent.change(input, { target: { value } });
      fireEvent.submit(input.closest("form")!);
      expect(mocks.withdraw).not.toHaveBeenCalled();
      expect(mocks.error).toHaveBeenLastCalledWith(
        "Please enter a valid amount"
      );
    }
  });

  it("fills the current available balance without submitting and submits all cents exactly", async () => {
    const input = await openWithdrawal();
    fireEvent.click(screen.getByRole("button", { name: "Withdraw All" }));

    expect(input.value).toBe("123.45");
    expect(mocks.withdraw).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Submit Withdrawal" }));
    await waitFor(() => expect(mocks.withdraw).toHaveBeenCalledOnce());
    expect(mocks.withdraw.mock.calls[0]?.[0]).toEqual({
      amount: 12_345,
      content: "test payment account",
    });
  });

  it("does not use total commission when the current balance is zero", async () => {
    mocks.commission = 0;
    renderAffiliate();
    await waitFor(() => expect(mocks.queryAffiliate).toHaveBeenCalledOnce());

    expect(
      screen.getByRole<HTMLButtonElement>("button", {
        name: "Withdraw",
      }).disabled
    ).toBe(true);
    expect(mocks.withdraw).not.toHaveBeenCalled();
  });

  it("requires withdrawal information and disables the fill action while submitting", async () => {
    mocks.withdraw.mockImplementation(() => new Promise(() => {}));
    const input = await openWithdrawal();
    fireEvent.change(input, { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("Withdrawal Info"), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit Withdrawal" }));
    expect(mocks.withdraw).not.toHaveBeenCalled();
    expect(mocks.error).toHaveBeenCalledWith("Please enter withdrawal info");

    fireEvent.change(screen.getByLabelText("Withdrawal Info"), {
      target: { value: "test payment account" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit Withdrawal" }));
    await waitFor(() => {
      expect(
        screen.getByRole<HTMLButtonElement>("button", { name: "Withdraw All" })
          .disabled
      ).toBe(true);
    });
    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Submitting..." })
        .disabled
    ).toBe(true);
  });
});
