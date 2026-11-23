// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PaymentMethod } from "@/types";
import { RechargeScreen } from "./recharge-screen";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string | Record<string, unknown>) =>
      typeof fallback === "string" ? fallback : _key,
    i18n: { language: "en-US" },
  }),
}));

vi.mock("@/stores/global", () => ({
  usePortalStore: () => ({ common: { currency: { currency_symbol: "$" } } }),
}));

vi.mock("@/components/preferences", () => ({ Preferences: () => null }));

const methods: PaymentMethod[] = [
  {
    id: "m1",
    name: "Alipay",
    platform: "alipay",
    fee_mode: 1,
    fee_percent: 3,
    fee_amount: 0,
  },
  {
    id: "m2",
    name: "WeChat",
    platform: "wechat",
    fee_mode: 2,
    fee_percent: 0,
    fee_amount: 1,
  },
];

function renderScreen(
  overrides: Partial<Parameters<typeof RechargeScreen>[0]> = {}
) {
  const props = {
    activeOrder: null,
    amounts: [10, 20, 50],
    customAmountEnabled: false,
    customAmountInput: "",
    hasPendingOrder: false,
    loadingData: false,
    methods,
    minimumCustomAmount: 1,
    onAmountSelect: vi.fn(),
    onContinuePayment: vi.fn(),
    onCustomAmountChange: vi.fn(),
    onLogout: vi.fn(),
    onMethodSelect: vi.fn(),
    onOpenConfirm: vi.fn(),
    onRefresh: vi.fn(),
    onRefreshCheckout: vi.fn(),
    onRefreshOrder: vi.fn(),
    records: [],
    selectedAmount: 10,
    selectedMethodId: "m1",
    submitting: false,
    userBalance: 25,
    userEmail: "member@example.test",
    ...overrides,
  };
  render(<RechargeScreen {...props} />);
  return props;
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("RechargeScreen (HeroUI)", () => {
  it("shows the initial wait without reporting empty records, and keeps loaded values during refresh", () => {
    renderScreen({ loadingData: true, userBalance: null, methods: [] });
    expect(screen.queryByText("暂无充值记录")).toBeNull();
    expect(screen.queryByText("$0.00")).toBeNull();
    cleanup();
    renderScreen({ loadingData: true });
    expect(screen.getByText("$25.00")).toBeTruthy();
    expect(screen.getByText("Alipay")).toBeTruthy();
    expect(screen.getByText("暂无充值记录")).toBeTruthy();
  });

  it("renders the balance, email and available method count", () => {
    renderScreen();

    expect(screen.getByText("$25.00")).toBeTruthy();
    expect(screen.getByText("member@example.test")).toBeTruthy();
    // method count plate
    expect(screen.getByText("2")).toBeTruthy();
  });

  it("renders warning-styled fee chips for each method's fee mode", () => {
    renderScreen();

    const percentageChip = screen.getByText("3%").closest('[data-slot="chip"]');
    // fee_amount 100 cents -> "+$1.00" (rendered as a single chip label)
    const fixedAmountChip = screen
      .getByText("+$1.00")
      .closest('[data-slot="chip"]');

    for (const chip of [percentageChip, fixedAmountChip]) {
      expect(chip?.classList.contains("chip--warning")).toBe(true);
      expect(chip?.classList.contains("chip--soft")).toBe(true);
    }
  });

  it("calls onMethodSelect when a payment tile is clicked", () => {
    const props = renderScreen();

    fireEvent.click(screen.getByText("WeChat"));

    expect(props.onMethodSelect).toHaveBeenCalledWith("m2");
  });

  it("calls onAmountSelect with the preset amount when pressed", () => {
    const props = renderScreen();

    fireEvent.click(screen.getByRole("radio", { name: "$20.00" }));

    expect(props.onAmountSelect).toHaveBeenCalledWith("20");
  });

  it("calls onAmountSelect with 'custom' when the custom option is pressed", () => {
    const props = renderScreen();

    fireEvent.click(screen.getByRole("radio", { name: "自定义金额" }));

    expect(props.onAmountSelect).toHaveBeenCalledWith("custom");
  });

  it("shows the custom amount field and reports its value as a string", () => {
    const props = renderScreen({
      customAmountEnabled: true,
      customAmountInput: "15",
    });

    const field = screen.getByRole("spinbutton", { name: "请输入自定义金额" });
    fireEvent.change(field, { target: { value: "42" } });

    expect(props.onCustomAmountChange).toHaveBeenCalledWith("42");
  });

  it.each([
    { loadingData: true },
    { submitting: true },
  ])("keeps selection editable while only submit is blocked: %o", (state) => {
    const props = renderScreen({
      ...state,
      customAmountEnabled: true,
      customAmountInput: "100",
    });
    fireEvent.click(screen.getByText("WeChat"));
    fireEvent.click(screen.getByRole("radio", { name: "$20.00" }));
    fireEvent.change(
      screen.getByRole("spinbutton", { name: "请输入自定义金额" }),
      { target: { value: "150" } }
    );
    expect(props.onMethodSelect).toHaveBeenCalledWith("m2");
    expect(props.onAmountSelect).toHaveBeenCalledWith("20");
    expect(props.onCustomAmountChange).toHaveBeenCalledWith("150");
    const submit = screen.getByRole("button", {
      name: state.submitting ? "创建订单中..." : "确认充值",
    }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
  });

  it("disables the submit action when no method is selected", () => {
    renderScreen({ selectedMethodId: null });

    const submit = screen.getByRole("button", {
      name: "确认充值",
    }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
  });

  it("opens the confirm flow when the submit action is pressed", () => {
    const props = renderScreen();

    fireEvent.click(screen.getByRole("button", { name: "确认充值" }));

    expect(props.onOpenConfirm).toHaveBeenCalledTimes(1);
  });

  it("renders the active order status card with a pay-now action", () => {
    const props = renderScreen({
      activeOrder: {
        id: 1,
        orderNo: "ORD-1",
        tradeNo: "",
        rechargeAmount: 10,
        amount: 10,
        createdAt: 0,
        status: 1,
        paymentId: "m1",
        paymentName: "Alipay",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "立即支付" }));
    expect(props.onContinuePayment).toHaveBeenCalledTimes(1);
  });
});
