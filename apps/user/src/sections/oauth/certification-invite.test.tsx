// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Certification from "./certification";

const mocks = vi.hoisted(() => ({
  exchangeToken: vi.fn(),
  registerWithInvite: vi.fn(),
  getRedirectUrl: vi.fn(),
  getUserInfo: vi.fn(),
  navigate: vi.fn(),
  setAuthorization: vi.fn(),
  takeOAuthCfToken: vi.fn(),
  takeOAuthInvite: vi.fn(),
  takeOAuthVerification: vi.fn(),
  getTelegramAuthCallback: vi.fn(),
  relayTelegramCallbackToOpener: vi.fn(),
}));

vi.mock("@workspace/ui/lib/router-compat", () => ({
  useNavigate: () => mocks.navigate,
  useSearch: () => ({ code: "oauth-code", state: "oauth-state" }),
}));

vi.mock("@workspace/ui/services/common/common", () => ({
  postAuthOauthLoginToken: mocks.exchangeToken,
  postAuthOauthRegister: mocks.registerWithInvite,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

vi.mock("@workspace/ui/components/button", () => ({
  Button: ({
    children,
    variant: _variant,
    ...rest
  }: Record<string, unknown>) => (
    <button {...rest}>{children as React.ReactNode}</button>
  ),
}));

vi.mock("@workspace/ui/components/input", () => ({
  Input: (props: Record<string, unknown>) => <input {...props} />,
}));

vi.mock("@/stores/global", () => ({
  useGlobalStore: (selector: (state: unknown) => unknown) =>
    selector({ getUserInfo: mocks.getUserInfo }),
}));

vi.mock("@/utils/common", () => ({
  getRedirectUrl: mocks.getRedirectUrl,
  setAuthorization: mocks.setAuthorization,
}));

vi.mock("@/utils/oauth", () => ({
  takeOAuthCfToken: mocks.takeOAuthCfToken,
  takeOAuthInvite: mocks.takeOAuthInvite,
  takeOAuthVerification: mocks.takeOAuthVerification,
}));

vi.mock("@/utils/oauth/telegram-popup", () => ({
  getTelegramAuthCallback: mocks.getTelegramAuthCallback,
  relayTelegramCallbackToOpener: mocks.relayTelegramCallbackToOpener,
}));

beforeEach(() => {
  mocks.getRedirectUrl.mockReturnValue("/dashboard");
  mocks.getUserInfo.mockResolvedValue(undefined);
  mocks.navigate.mockResolvedValue(undefined);
  mocks.takeOAuthCfToken.mockReturnValue(undefined);
  mocks.takeOAuthInvite.mockReturnValue(undefined);
  mocks.takeOAuthVerification.mockReturnValue({});
  mocks.relayTelegramCallbackToOpener.mockReturnValue(false);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("OAuth forced-invite registration", () => {
  it("prompts for an invitation code and registers with the cached ticket", async () => {
    mocks.exchangeToken.mockResolvedValue({
      data: { data: { invite_required: true, oauth_token: "ticket-1" } },
    });
    mocks.registerWithInvite.mockResolvedValue({
      data: { data: { token: "jwt" } },
    });

    render(
      <Certification platform="google">
        <div>Authenticating</div>
      </Certification>
    );

    // No account is created on the first leg; the user is asked for a code.
    const submit = await screen.findByText("Continue");
    expect(mocks.setAuthorization).not.toHaveBeenCalled();
    expect(mocks.registerWithInvite).not.toHaveBeenCalled();

    fireEvent.change(screen.getByPlaceholderText("Enter invitation code..."), {
      target: { value: " INV-123 " },
    });
    fireEvent.click(submit);

    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith({ to: "/dashboard" })
    );
    // Trimmed code and the one-time ticket are sent to the register endpoint.
    expect(mocks.registerWithInvite).toHaveBeenCalledWith({
      oauth_token: "ticket-1",
      invite: "INV-123",
    });
    expect(mocks.setAuthorization).toHaveBeenCalledWith("jwt");
    expect(mocks.getUserInfo).toHaveBeenCalledTimes(1);
  });

  it("stays on the invite prompt when the code is rejected", async () => {
    mocks.exchangeToken.mockResolvedValue({
      data: { data: { invite_required: true, oauth_token: "ticket-2" } },
    });
    mocks.registerWithInvite.mockRejectedValue(new Error("invalid invite"));

    render(
      <Certification platform="google">
        <div>Authenticating</div>
      </Certification>
    );

    const submit = await screen.findByText("Continue");
    fireEvent.change(screen.getByPlaceholderText("Enter invitation code..."), {
      target: { value: "bad-code" },
    });
    fireEvent.click(submit);

    await waitFor(() =>
      expect(mocks.registerWithInvite).toHaveBeenCalledTimes(1)
    );
    // A rejected code keeps the prompt so the user can retry; no redirect.
    expect(await screen.findByText("Continue")).toBeTruthy();
    expect(mocks.setAuthorization).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalledWith({ to: "/dashboard" });
  });
});
