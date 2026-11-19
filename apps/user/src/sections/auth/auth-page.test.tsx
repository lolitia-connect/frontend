// @vitest-environment jsdom
/**
 * Regression tests for the two reported auth-page defects:
 *
 *  1. TWO captchas rendered on the user login page (should be one).
 *  2. The "invitation code is required" hint shown when it should not be.
 *
 * Both are composition/condition bugs on `sections/auth/index.tsx`, which
 * renders the email/phone auth form and `<OAuthMethods />` as siblings on the
 * same page. Each rendered its own captcha, and the invite hint ignored the
 * hash-form invitation links this app still generates.
 *
 * The bug-existence checks below are asserted against the rendered DOM so the
 * failure mode cannot silently return.
 */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Main from "./index";

const store = vi.hoisted(() => ({ common: {} as any }));
const mocks = vi.hoisted(() => ({ oauthLogin: vi.fn() }));

vi.mock("@/stores/global", () => ({
  useGlobalStore: () => ({ common: store.common, getUserInfo: vi.fn() }),
}));

vi.mock("@workspace/ui/lib/router-compat", () => ({
  Link: ({ children }: any) => <a href="/">{children}</a>,
  useSearch: () => ({}),
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  usePathname: () => "/auth",
  useRouter: () => ({ navigate: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));

vi.mock("@workspace/ui/composed/language-switch", () => ({
  LanguageSwitch: () => <div />,
}));
vi.mock("@workspace/ui/composed/theme-switch", () => ({
  ThemeSwitch: () => <div />,
}));

// The turnstile widget is the challenge users see; its `id` identifies which
// component rendered it: "login"/"register" (auth forms) vs "oauth-turnstile".
vi.mock("react-turnstile", () => ({
  default: (props: any) => <div data-testid="TURNSTILE" id={props.id} />,
}));

vi.mock("@workspace/ui/services/common/auth", () => ({
  generateCaptcha: vi.fn().mockResolvedValue({
    data: { data: { id: "captcha-id", image: "blob:image" } },
  }),
  userLogin: vi.fn(),
  userRegister: vi.fn(),
  resetPassword: vi.fn(),
}));

vi.mock("@workspace/ui/services/common/common", () => ({
  postAuthOauthLogin: mocks.oauthLogin,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string, values?: Record<string, string>) => {
      const template = fallback ?? _key;
      if (!values) return template;
      return Object.entries(values).reduce(
        (text, [name, value]) => text.replace(`{{${name}}}`, String(value)),
        template
      );
    },
    i18n: { language: "en-US" },
  }),
}));

const INVITE_HINT =
  "An invitation code is required. Open your invitation link to continue.";

function config(overrides: Record<string, any> = {}) {
  return {
    site: { site_name: "Site", site_logo: "" },
    auth: {
      email: { enable: true, enable_verify: false },
      mobile: { enable: false },
    },
    verify: {
      captcha_type: "turnstile",
      turnstile_site_key: "site-key",
      enable_user_login_captcha: false,
      enable_user_register_captcha: false,
    },
    invite: {
      forced_invite: false,
      referral_percentage: 0,
      only_first_purchase: false,
    },
    oauth_methods: ["google"],
    ...overrides,
  };
}

beforeEach(() => {
  window.history.replaceState({}, "", "/auth");
  localStorage.clear();
  sessionStorage.clear();
  mocks.oauthLogin.mockResolvedValue({
    data: { data: { redirect: "https://provider.example/authorize" } },
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("auth page captcha composition", () => {
  it("renders exactly ONE captcha when the login form already shows one", async () => {
    // Before the fix this produced two nodes: "login" + "oauth-turnstile",
    // because `OAuthMethods` gated its challenge on a flag that is no longer
    // part of the payload and ignored that a sibling form owned the captcha.
    window.history.replaceState({}, "", "/auth?x=1");
    store.common = config({
      verify: {
        captcha_type: "turnstile",
        turnstile_site_key: "site-key",
        enable_user_login_captcha: true,
        enable_user_register_captcha: true,
      },
    });

    render(<Main />);

    const nodes = await screen.findAllByTestId("TURNSTILE");
    expect(nodes).toHaveLength(1);
    expect(nodes[0]?.id).toBe("login");
  });

  it("still renders a single captcha for the OAuth flow when no auth form is enabled", async () => {
    store.common = config({
      auth: {
        email: { enable: false, enable_verify: false },
        mobile: { enable: false },
      },
      verify: {
        captcha_type: "turnstile",
        turnstile_site_key: "site-key",
        enable_user_login_captcha: false,
        enable_user_register_captcha: true,
      },
    });

    render(<Main />);

    const nodes = await screen.findAllByTestId("TURNSTILE");
    expect(nodes).toHaveLength(1);
    expect(nodes[0]?.id).toBe("oauth-turnstile");
  });

  it("renders no captcha when none is enabled", async () => {
    store.common = config();

    render(<Main />);

    expect(screen.queryAllByTestId("TURNSTILE")).toHaveLength(0);
  });
});

describe("invite hint visibility on the sign-in surface", () => {
  it("does NOT show the hint when forced_invite is off", async () => {
    store.common = config();

    render(<Main />);

    expect(screen.queryByText(INVITE_HINT)).toBeNull();
  });

  it("never shows the registration-only hint, even when forced_invite is on", async () => {
    // The OAuth block sits on the sign-in page. "An invitation code is
    // required" is a registration message, so it must not appear here at all:
    // the backend only enforces forced_invite when it creates a new account,
    // and this page cannot yet know whether the visitor is new.
    store.common = config({
      invite: {
        forced_invite: true,
        referral_percentage: 0,
        only_first_purchase: false,
      },
    });

    render(<Main />);

    await screen.findAllByTestId("TURNSTILE").catch(() => []);
    expect(screen.queryByText(INVITE_HINT)).toBeNull();
  });

  it("never shows the hint for a visitor arriving via a hash invitation link", async () => {
    window.history.replaceState({}, "", "/auth#/auth?invite=HASHCODE");
    store.common = config({
      invite: {
        forced_invite: true,
        referral_percentage: 0,
        only_first_purchase: false,
      },
    });

    render(<Main />);

    await screen.findAllByTestId("TURNSTILE").catch(() => []);
    expect(screen.queryByText(INVITE_HINT)).toBeNull();
  });

  it("does NOT block OAuth sign-in when forced_invite is on and no invite is present", async () => {
    // `forced_invite` is a registration policy. The backend enforces it only
    // when creating a brand-new account (`findOrRegisterUser` -> `register`),
    // never for an existing user signing in. Gating the buttons on it here
    // disabled sign-in for every existing user on a forced-invite site and
    // showed a registration-only message on the login surface.
    store.common = config({
      invite: {
        forced_invite: true,
        referral_percentage: 0,
        only_first_purchase: false,
      },
    });

    render(<Main />);

    const google = await screen.findByRole("button", {
      name: "Continue with google",
    });
    expect((google as HTMLButtonElement).disabled).toBe(false);
    expect(screen.queryByText(INVITE_HINT)).toBeNull();
  });

  it("keeps OAuth sign-in available with forced_invite on and no captcha either", async () => {
    store.common = config({
      auth: {
        email: { enable: false, enable_verify: false },
        mobile: { enable: false },
      },
      invite: {
        forced_invite: true,
        referral_percentage: 0,
        only_first_purchase: false,
      },
    });

    render(<Main />);

    const google = await screen.findByRole("button", {
      name: "Continue with google",
    });
    expect((google as HTMLButtonElement).disabled).toBe(false);
  });

  it("still forwards a hash-link invite code for the registration leg", async () => {
    // Removing the gate must not drop the invite: the backend needs it when the
    // provider identity turns out to be new and the registration path runs.
    window.history.replaceState({}, "", "/auth#/auth?invite=HASHCODE");
    store.common = config({
      auth: {
        email: { enable: false, enable_verify: false },
        mobile: { enable: false },
      },
      invite: {
        forced_invite: true,
        referral_percentage: 0,
        only_first_purchase: false,
      },
    });

    render(<Main />);

    const google = await screen.findByRole("button", {
      name: "Continue with google",
    });
    expect((google as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(google);
    await waitFor(() => {
      expect(sessionStorage.getItem("oauth-invite")).toBe("HASHCODE");
    });
  });
});
