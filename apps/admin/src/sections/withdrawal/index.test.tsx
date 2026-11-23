// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReviewActions } from "./index";

const mocks = vi.hoisted(() => ({ review: vi.fn() }));
vi.mock("@workspace/ui/services/admin/admin", () => ({
  putWithdrawalStatus: mocks.review,
}));
vi.mock("@workspace/ui/composed/confirm-button", () => ({
  ConfirmButton: ({
    onConfirm,
    trigger,
  }: {
    onConfirm: () => void;
    trigger: ReactNode;
  }) => (
    <div>
      {trigger}
      <button onClick={onConfirm} type="button">
        Confirm approval
      </button>
    </div>
  ),
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));
vi.mock("@heroui/react", async (importOriginal) => {
  const heroui = await importOriginal<typeof import("@heroui/react")>();
  return { ...heroui, toast: { ...heroui.toast, success: vi.fn() } };
});
const withdrawal = {
  id: 123,
  user_id: 1,
  amount: 100,
  content: "Payment account",
  status: 0,
  reason: "",
  created_at: 1,
  updated_at: 1,
};
beforeEach(() => {
  mocks.review.mockResolvedValue({});
});
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe("withdrawal reviews", () => {
  it("requires a trimmed rejection reason before reviewing", async () => {
    const onReviewed = vi.fn();
    render(<ReviewActions onReviewed={onReviewed} withdrawal={withdrawal} />);
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    const confirm = screen.getByRole("button", {
      name: "Confirm Reject",
    }) as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText("Rejection Reason"), {
      target: { value: "  invalid account  " },
    });
    fireEvent.click(confirm);
    await waitFor(() =>
      expect(mocks.review).toHaveBeenCalledWith({
        id: 123,
        status: 2,
        reason: "invalid account",
      })
    );
    expect(onReviewed).toHaveBeenCalledOnce();
  });

  it("does not send concurrent or already reviewed approvals", async () => {
    let finish: (() => void) | undefined;
    mocks.review.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        })
    );
    const { rerender } = render(
      <ReviewActions onReviewed={vi.fn()} withdrawal={withdrawal} />
    );
    const confirm = screen.getByRole("button", { name: "Confirm approval" });
    fireEvent.click(confirm);
    fireEvent.click(confirm);
    expect(mocks.review).toHaveBeenCalledTimes(1);
    finish?.();
    await waitFor(() =>
      expect(
        (screen.getByRole("button", { name: "Approve" }) as HTMLButtonElement)
          .disabled
      ).toBe(false)
    );
    rerender(
      <ReviewActions
        onReviewed={vi.fn()}
        withdrawal={{ ...withdrawal, status: 1 }}
      />
    );
    fireEvent.click(confirm);
    expect(mocks.review).toHaveBeenCalledTimes(1);
  });
});
