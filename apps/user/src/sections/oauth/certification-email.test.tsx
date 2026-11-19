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
  useSearch: () => ({ tgAuthResult: "signed-payload" }),
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

// A lightweight stand-in so the email step renders without the real send-code
// component reaching into the global store.
vi.mock("../auth/send-code", () => ({
  default: () => <button type="button">Get Code</button>,
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
  mocks.getTelegramAuthCallback.mockReturnValue(undefined);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("OAuth registration without a provider email", () => {
  it("asks for a real email and never fabricates a placeholder address", async () => {
    mocks.exchangeToken.mockResolvedValue({
      data: { data: { email_required: true, oauth_token: "ticket-email" } },
    });
    mocks.registerWithInvite.mockResolvedValue({
      data: { data: { token: "jwt" } },
    });

    render(
      <Certification platform="telegram">
        <div>Authenticating</div>
      </Certification>
    );

    const submit = await screen.findByText("Continue");
    expect(mocks.setAuthorization).not.toHaveBeenCalled();
    expect(mocks.registerWithInvite).not.toHaveBeenCalled();

    fireEvent.change(screen.getByPlaceholderText("Enter your email..."), {
      target: { value: " real-user@example.com " },
    });
    fireEvent.click(submit);

    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith({ to: "/dashboard" })
    );
    expect(mocks.registerWithInvite).toHaveBeenCalledWith({
      oauth_token: "ticket-email",
      email: "real-user@example.com",
    });
    expect(mocks.setAuthorization).toHaveBeenCalledWith("jwt");
  });

  it("collects a verification code when the panel requires it", async () => {
    mocks.exchangeToken.mockResolvedValue({
      data: {
        data: {
          email_required: true,
          email_verify: true,
          oauth_token: "ticket-verify",
        },
      },
    });
    mocks.registerWithInvite.mockResolvedValue({
      data: { data: { token: "jwt" } },
    });

    render(
      <Certification platform="telegram">
        <div>Authenticating</div>
      </Certification>
    );

    const submit = await screen.findByText("Continue");
    fireEvent.change(screen.getByPlaceholderText("Enter your email..."), {
      target: { value: "verify-me@example.com" },
    });
    // Submitting without the required code should be blocked.
    fireEvent.click(submit);
    expect(mocks.registerWithInvite).not.toHaveBeenCalled();

    fireEvent.change(screen.getByPlaceholderText("Enter code..."), {
      target: { value: "123456" },
    });
    fireEvent.click(submit);

    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith({ to: "/dashboard" })
    );
    expect(mocks.registerWithInvite).toHaveBeenCalledWith({
      oauth_token: "ticket-verify",
      email: "verify-me@example.com",
      code: "123456",
    });
  });
});
