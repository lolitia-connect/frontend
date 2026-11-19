// @vitest-environment jsdom

import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DeferredGlobe } from "./deferred-globe";

vi.mock("next/dynamic", () => ({
  default: () => () => <div data-testid="globe" />,
}));

let idleCallback: (() => void) | undefined;
const cancelIdle = vi.fn();

beforeEach(() => {
  vi.useFakeTimers();
  idleCallback = undefined;
  cancelIdle.mockClear();
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
    setTimeout(() => callback(0), 16)
  );
  vi.stubGlobal("cancelAnimationFrame", clearTimeout);
  vi.stubGlobal("requestIdleCallback", (callback: () => void) => {
    idleCallback = callback;
    return 1;
  });
  vi.stubGlobal("cancelIdleCallback", cancelIdle);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("decorative globe loading", () => {
  it("waits for startup readiness, a paint, and an idle slot", () => {
    const { rerender } = render(<DeferredGlobe enabled={false} />);
    act(() => vi.runAllTimers());
    expect(idleCallback).toBeUndefined();
    expect(screen.queryByTestId("globe")).toBeNull();

    rerender(<DeferredGlobe enabled />);
    act(() => vi.advanceTimersByTime(16));
    expect(idleCallback).toBeUndefined();
    act(() => vi.advanceTimersByTime(16));
    expect(screen.queryByTestId("globe")).toBeNull();
    act(() => idleCallback?.());
    expect(screen.getByTestId("globe")).toBeTruthy();
  });

  it("cancels queued work when navigating away", () => {
    const { unmount } = render(<DeferredGlobe enabled />);
    act(() => vi.advanceTimersByTime(32));
    unmount();
    expect(cancelIdle).toHaveBeenCalledWith(1);
  });

  it("still loads when requestIdleCallback is unavailable", () => {
    vi.stubGlobal("requestIdleCallback", undefined);
    render(<DeferredGlobe enabled />);
    act(() => vi.runAllTimers());
    expect(screen.getByTestId("globe")).toBeTruthy();
  });
});
