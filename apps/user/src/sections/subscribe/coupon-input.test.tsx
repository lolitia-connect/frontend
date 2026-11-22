/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CouponInput from "./coupon-input";

vi.mock("@workspace/ui/components/input", () => ({
  Input: (props: React.ComponentProps<"input">) => <input {...props} />,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

afterEach(cleanup);

describe("CouponInput", () => {
  it("commits the coupon only after the input loses focus", () => {
    const onChange = vi.fn();
    render(<CouponInput onChange={onChange} />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: " SAVE10 " } });
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith("SAVE10");
  });

  it("shows the validation status", () => {
    render(<CouponInput onChange={vi.fn()} status="invalid" />);
    expect(screen.getByText("Coupon code is invalid.")).toBeTruthy();
    expect(screen.getByRole("textbox").getAttribute("aria-invalid")).toBe(
      "true"
    );
  });
});
