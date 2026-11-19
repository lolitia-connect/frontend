/** @vitest-environment jsdom */
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Switch } from "./switch";

afterEach(cleanup);

/**
 * Regression guard for the Radix-era `Switch` prop vocabulary.
 *
 * `packages/ui`'s migration contract is "public API unchanged", but the Radix
 * `Switch` this replaced accepted `checked` / `disabled` / `onChange(checked)`.
 * HeroUI's `Switch` is a React Aria field whose prop names are `isSelected` /
 * `isDisabled` / `onChange(isSelected)`. The wrapper must keep translating the
 * old names, or every `<Switch disabled onChange={...}>` call site silently
 * stops being disabled / stops reporting changes — a runtime failure that a
 * typecheck alone cannot catch.
 *
 * There are ~67 `<Switch` usages in `apps/**`; this pins the contract they rely
 * on so a future refactor of the adapter cannot quietly drop it.
 */
describe("Switch legacy prop mapping", () => {
  it("maps `checked` onto the real switch state", () => {
    const { container } = render(<Switch checked onCheckedChange={() => {}} />);
    const input = container.querySelector<HTMLInputElement>(
      'input[type="checkbox"], input[type="switch"]'
    );
    if (!input) throw new Error("switch input not rendered");
    expect(input.checked).toBe(true);
  });

  it("maps `defaultChecked` onto the real switch state", () => {
    const { container } = render(<Switch defaultChecked />);
    const input = container.querySelector<HTMLInputElement>(
      'input[type="checkbox"], input[type="switch"]'
    );
    if (!input) throw new Error("switch input not rendered");
    expect(input.checked).toBe(true);
  });

  it("maps `disabled` onto the real switch state", () => {
    const { container } = render(<Switch disabled />);
    const input = container.querySelector<HTMLInputElement>(
      'input[type="checkbox"], input[type="switch"]'
    );
    if (!input) throw new Error("switch input not rendered");
    // React Aria renders the field disabled through the input itself.
    expect(input.disabled).toBe(true);
  });

  it("accepts the legacy `onChange(checked)` callback", () => {
    const onChange = vi.fn();
    const { container } = render(<Switch onChange={onChange} />);
    const input = container.querySelector<HTMLInputElement>(
      'input[type="checkbox"], input[type="switch"]'
    );
    if (!input) throw new Error("switch input not rendered");

    fireEvent.click(input);

    expect(onChange).toHaveBeenCalledTimes(1);
    // The legacy Radix contract passed the boolean, not a DOM event.
    // (`noUncheckedIndexedAccess` is on in this package, so the first call is
    // read through `at(0)` and narrowed rather than indexed directly.)
    const firstCall = onChange.mock.calls.at(0);
    expect(firstCall?.[0]).toBe(true);
  });

  it("accepts the `onCheckedChange(checked)` callback", () => {
    const onCheckedChange = vi.fn();
    const { container } = render(<Switch onCheckedChange={onCheckedChange} />);
    const input = container.querySelector<HTMLInputElement>(
      'input[type="checkbox"], input[type="switch"]'
    );
    if (!input) throw new Error("switch input not rendered");

    fireEvent.click(input);

    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    const firstCall = onCheckedChange.mock.calls.at(0);
    expect(firstCall?.[0]).toBe(true);
  });
});
