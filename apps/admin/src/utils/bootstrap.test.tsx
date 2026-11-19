// @vitest-environment jsdom

import { act, cleanup, render } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Bootstrap } from "../../app/bootstrap";

const mocks = vi.hoisted(() => ({
  config: vi.fn(),
  cookie: vi.fn(),
  logout: vi.fn(),
  store: { getUserInfo: vi.fn(), setCommon: vi.fn() },
}));

vi.mock("@workspace/ui/lib/cookies", () => ({ getCookie: mocks.cookie }));
vi.mock("@/utils/bootstrap", () => ({ fetchInitialConfig: mocks.config }));
vi.mock("@/utils/common", () => ({ Logout: mocks.logout }));
vi.mock("@/stores/global", () => ({
  useGlobalStore: (selector: (state: typeof mocks.store) => unknown) =>
    selector(mocks.store),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.cookie.mockReturnValue("session");
  mocks.store.getUserInfo.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("admin startup", () => {
  it("restores the session while config is pending without duplicate StrictMode requests", async () => {
    let resolveConfig!: (response: object) => void;
    mocks.config.mockReturnValue(
      new Promise((resolve) => {
        resolveConfig = resolve;
      })
    );
    mocks.store.getUserInfo.mockImplementation(async () => {
      expect(window.logout).toBe(mocks.logout);
    });

    render(
      <StrictMode>
        <Bootstrap />
      </StrictMode>
    );
    expect(mocks.store.getUserInfo).toHaveBeenCalledTimes(1);
    expect(mocks.store.setCommon).not.toHaveBeenCalled();

    const config = { site: { site_name: "Example" } };
    await act(async () => resolveConfig({ data: { data: config } }));
    expect(mocks.store.setCommon).toHaveBeenCalledExactlyOnceWith(config);
  });

  it("still refreshes the admin when site config fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.config.mockRejectedValue(new Error("Config unavailable"));
    await act(async () => render(<Bootstrap />));
    expect(mocks.store.getUserInfo).toHaveBeenCalledTimes(1);
    expect(mocks.store.setCommon).not.toHaveBeenCalled();
  });

  it("does not refresh guests or apply config after unmount", async () => {
    mocks.cookie.mockReturnValue(undefined);
    let resolveConfig!: (response: object) => void;
    mocks.config.mockReturnValue(
      new Promise((resolve) => {
        resolveConfig = resolve;
      })
    );
    const { unmount } = render(<Bootstrap />);
    unmount();
    await act(async () => resolveConfig({ data: { data: {} } }));
    expect(mocks.store.getUserInfo).not.toHaveBeenCalled();
    expect(mocks.store.setCommon).not.toHaveBeenCalled();
  });
});
