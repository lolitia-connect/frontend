// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConfirmRechargeDialog } from "./confirm-recharge-dialog";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
    i18n: { language: "en-US" },
  }),
}));

vi.mock("@/stores/global", () => ({
  usePortalStore: () => ({
    common: { currency: { currency_symbol: "$" } },
  }),
}));

function renderDialog(
  overrides: Partial<Parameters<typeof ConfirmRechargeDialog>[0]> = {}
) {
  const props = {
    breakdown: { amount: 10, fee: 0.5, total: 10.5 },
    loading: false,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    open: true,
    paymentMethodName: "Alipay",
    ...overrides,
  };
  render(<ConfirmRechargeDialog {...props} />);
  return props;
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ConfirmRechargeDialog (HeroUI)", () => {
  it("renders the dialog content when open", () => {
    renderDialog();

    expect(screen.getByText("确认充值")).toBeTruthy();
    expect(screen.getByText("Alipay")).toBeTruthy();
  });

  it("renders the fee breakdown formatted as currency", () => {
    renderDialog();

    // amount 1000 cents -> $10.00, fee 50 cents -> $0.50, total 1050 -> $10.50
    expect(screen.getByText("$10.00")).toBeTruthy();
    expect(screen.getByText("$0.50")).toBeTruthy();
    expect(screen.getByText("$10.50")).toBeTruthy();
  });

  it("does not render the dialog content when closed", () => {
    renderDialog({ open: false });

    expect(screen.queryByText("确认充值")).toBeNull();
  });

  it("invokes onConfirm when the confirm button is pressed", () => {
    const props = renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "确认并支付" }));

    expect(props.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("disables the confirm button and shows the loading label while loading", () => {
    renderDialog({ loading: true });

    const confirm = screen.getByRole("button", {
      name: "处理中...",
    }) as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);
  });

  it("keeps Cancel and close available while confirmation is pending, as on main", () => {
    const props = renderDialog({ loading: true });
    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(props.onClose).toHaveBeenCalledTimes(2);
    expect(props.onConfirm).not.toHaveBeenCalled();
  });

  it("falls back to a dash when no payment method name is provided", () => {
    renderDialog({ paymentMethodName: undefined });

    expect(screen.getByText("-")).toBeTruthy();
  });
});
