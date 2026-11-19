// @vitest-environment jsdom

import { cleanup, render, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BindCertification from "../bind/certification";
import LoginCertification from "./certification";

const mocks = vi.hoisted(() => ({
  exchangeToken: vi.fn(),
  bindCallback: vi.fn(),
  getUserInfo: vi.fn(),
  navigate: vi.fn(),
  takeOAuthCfToken: vi.fn(),
  takeOAuthInvite: vi.fn(),
  takeOAuthVerification: vi.fn(),
}));

vi.mock("@workspace/ui/lib/router-compat", () => ({
  useNavigate: () => mocks.navigate,
  useSearch: () =>
    Object.fromEntries(new URLSearchParams(window.location.search)),
}));
vi.mock("@workspace/ui/services/common/common", () => ({
  postAuthOauthLoginToken: mocks.exchangeToken,
  postAuthOauthRegister: vi.fn(),
}));
vi.mock("@workspace/ui/services/user/user", () => ({
  postV1PublicUserBindOauthCallback: mocks.bindCallback,
}));
vi.mock("@/stores/global", () => ({
  useGlobalStore: (selector: (state: unknown) => unknown) =>
    selector({ getUserInfo: mocks.getUserInfo }),
}));
vi.mock("@/utils/common", () => ({
  getRedirectUrl: () => "/wallet",
  setAuthorization: vi.fn(),
}));
vi.mock("@/utils/oauth", () => ({
  takeOAuthCfToken: mocks.takeOAuthCfToken,
  takeOAuthInvite: mocks.takeOAuthInvite,
  takeOAuthVerification: mocks.takeOAuthVerification,
}));

beforeEach(() => {
  vi.stubGlobal("opener", null);
  mocks.exchangeToken.mockResolvedValue({ data: { data: { token: "jwt" } } });
  mocks.bindCallback.mockResolvedValue(undefined);
  mocks.getUserInfo.mockResolvedValue(undefined);
  mocks.takeOAuthCfToken.mockReturnValue("turnstile-token");
  mocks.takeOAuthInvite.mockReturnValue("invite-code");
  mocks.takeOAuthVerification.mockReturnValue({ slider_token: "slider-token" });
});

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/");
  vi.unstubAllGlobals();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe.each([
  { path: "oauth", Certification: LoginCertification, destination: "/wallet" },
  { path: "bind", Certification: BindCertification, destination: "/profile" },
])("Next.js Telegram $path callback", ({
  path,
  Certification,
  destination,
}) => {
  it.each([
    "query",
    "hash",
    "fields",
    "query-priority",
  ])("exchanges a full-page %s callback once", async (source) => {
    const fields = {
      id: 42,
      first_name: "小明",
      auth_date: 1_700_000_000,
      hash: "signature",
    };
    const blob = Buffer.from(JSON.stringify(fields)).toString("base64");
    const params = new URLSearchParams(
      source === "fields"
        ? Object.fromEntries(
            Object.entries(fields).map(([key, value]) => [key, String(value)])
          )
        : { tgAuthResult: blob }
    );
    const suffix =
      source === "query-priority"
        ? `?${params}#tgAuthResult=invalid`
        : `${source === "query" ? "?" : "#"}${params}`;
    window.history.replaceState({}, "", `/${path}/telegram/${suffix}`);

    render(
      <StrictMode>
        <Certification platform="telegram">
          <div>Authenticating</div>
        </Certification>
      </StrictMode>
    );

    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith({ to: destination })
    );
    const exchange =
      path === "oauth" ? mocks.exchangeToken : mocks.bindCallback;
    expect(exchange).toHaveBeenCalledTimes(1);
    const request = exchange.mock.calls[0]?.[0];
    expect(request.method).toBe("telegram");
    expect(
      JSON.parse(
        Buffer.from(request.callback.tgAuthResult, "base64").toString()
      )
    ).toEqual(fields);
    expect(mocks.getUserInfo).toHaveBeenCalledTimes(1);
    if (path === "oauth") {
      expect(request).toMatchObject({
        cf_token: "turnstile-token",
        invite: "invite-code",
        slider_token: "slider-token",
      });
    }
  });

  it("relays a popup without exchanging or consuming login context", () => {
    const postMessage = vi.fn();
    vi.stubGlobal("opener", { closed: false, postMessage, focus: vi.fn() });
    vi.useFakeTimers();
    const blob = Buffer.from(
      JSON.stringify({ id: 42, auth_date: 1, hash: "signature" })
    ).toString("base64");
    window.history.replaceState(
      {},
      "",
      `/${path}/telegram/#${new URLSearchParams({ tgAuthResult: blob })}`
    );

    render(
      <StrictMode>
        <Certification platform="telegram">
          <div>Authenticating</div>
        </Certification>
      </StrictMode>
    );

    expect(postMessage).toHaveBeenCalledExactlyOnceWith(
      { tgAuthResult: blob },
      window.location.origin
    );
    expect(mocks.exchangeToken).not.toHaveBeenCalled();
    expect(mocks.bindCallback).not.toHaveBeenCalled();
    expect(mocks.takeOAuthCfToken).not.toHaveBeenCalled();
    expect(mocks.takeOAuthInvite).not.toHaveBeenCalled();
    expect(mocks.takeOAuthVerification).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});
