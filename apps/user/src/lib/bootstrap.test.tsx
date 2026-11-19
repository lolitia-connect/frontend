// @vitest-environment jsdom

import { act, cleanup, render } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppInitializer } from "../../app/app-initializer";

const mocks = vi.hoisted(() => ({
  config: vi.fn(),
  cookie: vi.fn(),
  errorToast: vi.fn(),
  logout: vi.fn(),
  store: {
    common: { site: { custom_html: "" } },
    clearUserLoading: vi.fn(),
    getUserInfo: vi.fn(),
    setCommon: vi.fn(),
    setCommonError: vi.fn(),
  },
}));

vi.mock("@workspace/ui/lib/cookies", () => ({ getCookie: mocks.cookie }));
vi.mock("@/utils/bootstrap", () => ({ fetchInitialConfig: mocks.config }));
vi.mock("@/utils/common", () => ({ Logout: mocks.logout }));
vi.mock("sonner", () => ({ toast: { error: mocks.errorToast } }));
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

describe("application startup", () => {
  it("restores the session before config completes and only once in StrictMode", async () => {
    let resolveConfig!: (config: object) => void;
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
        <AppInitializer />
      </StrictMode>
    );
    expect(mocks.store.getUserInfo).toHaveBeenCalledTimes(1);
    expect(mocks.store.setCommon).not.toHaveBeenCalled();

    const config = { site: { site_name: "Example" } };
    await act(async () => resolveConfig(config));
    expect(mocks.store.setCommon).toHaveBeenCalledExactlyOnceWith(config);
  });

  it("finishes guest detection without waiting for config", () => {
    mocks.cookie.mockReturnValue(undefined);
    mocks.config.mockReturnValue(new Promise(() => {}));
    render(<AppInitializer />);
    expect(mocks.store.clearUserLoading).toHaveBeenCalledTimes(1);
    expect(mocks.store.getUserInfo).not.toHaveBeenCalled();
  });

  it("settles authentication independently of config failure", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.config.mockRejectedValue(new Error("Config unavailable"));
    mocks.store.getUserInfo.mockRejectedValue(new Error("Session expired"));
    await act(async () => render(<AppInitializer />));
    expect(mocks.store.getUserInfo).toHaveBeenCalledTimes(1);
    expect(mocks.store.clearUserLoading).toHaveBeenCalledTimes(1);
    expect(mocks.store.setCommonError).toHaveBeenCalledWith(
      "Config unavailable"
    );
    expect(mocks.errorToast).toHaveBeenCalledTimes(1);
  });
});
