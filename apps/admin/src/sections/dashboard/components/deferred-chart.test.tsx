// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DeferredChart } from "./deferred-chart";

let notify: IntersectionObserverCallback;
const disconnect = vi.fn();

beforeEach(() => {
  disconnect.mockClear();
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: IntersectionObserverCallback) {
        notify = callback;
      }
      observe = vi.fn();
      disconnect = disconnect;
    }
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function setIntersecting(isIntersecting: boolean) {
  act(() =>
    notify(
      [{ isIntersecting } as IntersectionObserverEntry],
      {} as IntersectionObserver
    )
  );
}

function StatefulChart() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)} type="button">
      Period {count}
    </button>
  );
}

describe("viewport-deferred charts", () => {
  it("does not mount chart work offscreen and keeps chart state after reveal", () => {
    const { rerender } = render(
      <DeferredChart>
        <StatefulChart />
      </DeferredChart>
    );
    expect(screen.queryByRole("button")).toBeNull();
    setIntersecting(false);
    expect(screen.queryByRole("button")).toBeNull();
    setIntersecting(true);
    fireEvent.click(screen.getByRole("button"));
    expect(disconnect).toHaveBeenCalled();

    setIntersecting(false);
    rerender(
      <DeferredChart>
        <StatefulChart />
      </DeferredChart>
    );
    expect(screen.getByRole("button").textContent).toBe("Period 1");
  });

  it("disconnects observation when unmounted before reveal", () => {
    const { unmount } = render(
      <DeferredChart>
        <StatefulChart />
      </DeferredChart>
    );
    unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it("renders charts if intersection observation is unavailable", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    render(
      <DeferredChart>
        <StatefulChart />
      </DeferredChart>
    );
    expect(screen.getByRole("button")).toBeTruthy();
  });
});
