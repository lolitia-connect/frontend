// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OAuthMethods } from "./oauth-methods";

const mocks = vi.hoisted(() => ({
  oauthLogin: vi.fn(),
}));

// Mutable so individual tests can vary the global config the component reads.
const store = vi.hoisted(() => ({
  common: {
    oauth_methods: ["google"],
    // `enable_register_verify` was removed from the global-config payload and
    // is no longer read. The OAuth block's challenge is now keyed off
    // `enable_user_register_captcha`, and only applies when no email/phone form
    // shares the page (both disabled here) — that is this file's default case.
    verify: {
      enable_user_register_captcha: true,
      turnstile_site_key: "site-key",
    },
    auth: { email: { enable: false }, mobile: { enable: false } },
  } as any,
}));

vi.mock("@workspace/ui/services/common/common", () => ({
  postAuthOauthLogin: mocks.oauthLogin,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string, values?: Record<string, string>) =>
      fallback.replace("{{method}}", values?.method ?? ""),
  }),
}));

vi.mock("@workspace/ui/lib/router-compat", () => ({
  useSearch: () => ({ invite: "invite-code" }),
}));

vi.mock("@/stores/global", () => ({
  useGlobalStore: () => ({ common: store.common }),
}));

vi.mock("./turnstile", () => ({
  default: ({ onChange }: { onChange: (token: string) => void }) => (
    <button onClick={() => onChange("turnstile-token")} type="button">
      Solve challenge
    </button>
  ),
}));

beforeEach(() => {
  mocks.oauthLogin.mockResolvedValue({ data: { data: {} } });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("OAuth methods", () => {
  it("requires registration verification before starting the provider round trip", async () => {
    render(<OAuthMethods />);

    const google = screen.getByRole("button", {
      name: "Continue with google",
    }) as HTMLButtonElement;
    expect(google.disabled).toBe(true);
    fireEvent.click(google);
    expect(mocks.oauthLogin).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Solve challenge" }));
    expect(google.disabled).toBe(false);
    fireEvent.click(google);

    await waitFor(() => {
      expect(mocks.oauthLogin).toHaveBeenCalledWith({
        method: "google",
        redirect: "http://localhost:3000/oauth/google/",
      });
    });
  });

  it("does not render a second challenge when an auth form already shows one", async () => {
    // The reported defect: the email/phone form and this OAuth block each
    // rendered a captcha on the same login page. When a form is present and a
    // login/register captcha is enabled, the form owns the challenge.
    store.common = {
      ...store.common,
      verify: {
        ...store.common.verify,
        enable_user_login_captcha: true,
        enable_user_register_captcha: true,
      },
      auth: { email: { enable: true }, mobile: { enable: false } },
    };
    render(<OAuthMethods />);
    expect(
      screen.queryByRole("button", { name: "Solve challenge" })
    ).toBeNull();
  });
});
