// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DurationSelector from "./duration-selector";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

afterEach(cleanup);

const discounts = [
  { quantity: 1, discount: 100 },
  { quantity: 3, discount: 90 },
  { quantity: 12, discount: 80 },
];

describe("duration selector", () => {
  it("selects a duration when its tile is clicked", () => {
    const onChange = vi.fn();
    render(
      <DurationSelector
        discounts={discounts}
        onChange={onChange}
        quantity={1}
        unitTime="Month"
      />
    );

    fireEvent.click(screen.getByText("3 / Month"));

    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("marks the current quantity's tile as selected", () => {
    render(
      <DurationSelector
        discounts={discounts}
        onChange={vi.fn()}
        quantity={12}
        unitTime="Month"
      />
    );

    const selected = screen
      .getByText("12 / Month")
      .closest('[data-slot="radio-content"]');
    expect(selected?.getAttribute("data-selected")).toBe("true");
  });
});
