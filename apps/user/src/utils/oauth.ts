const OAUTH_CF_TOKEN_KEY = "oauth-cf-token";
const OAUTH_INVITE_KEY = "oauth-invite";
const OAUTH_VERIFICATION_KEY = "oauth-verification";

type OAuthVerification = {
  captcha_id?: string;
  captcha_code?: string;
  slider_token?: string;
};

export function storeOAuthVerification(value?: OAuthVerification): void {
  if (typeof window === "undefined") return;
  if (value)
    window.sessionStorage.setItem(
      OAUTH_VERIFICATION_KEY,
      JSON.stringify(value)
    );
  else window.sessionStorage.removeItem(OAUTH_VERIFICATION_KEY);
}

export function takeOAuthVerification(): OAuthVerification {
  if (typeof window === "undefined") return {};
  const stored = window.sessionStorage.getItem(OAUTH_VERIFICATION_KEY);
  window.sessionStorage.removeItem(OAUTH_VERIFICATION_KEY);
  try {
    const value = JSON.parse(stored || "{}");
    return Object.fromEntries(
      ["captcha_id", "captcha_code", "slider_token"]
        .filter((key) => typeof value?.[key] === "string")
        .map((key) => [key, value[key]])
    );
  } catch {
    return {};
  }
}

export function storeOAuthCfToken(token?: string): void {
  if (typeof window === "undefined") return;

  if (token) {
    window.sessionStorage.setItem(OAUTH_CF_TOKEN_KEY, token);
    return;
  }
  window.sessionStorage.removeItem(OAUTH_CF_TOKEN_KEY);
}

export function takeOAuthCfToken(): string | undefined {
  if (typeof window === "undefined") return;

  const token = window.sessionStorage.getItem(OAUTH_CF_TOKEN_KEY) || undefined;
  window.sessionStorage.removeItem(OAUTH_CF_TOKEN_KEY);
  return token;
}

export function storeOAuthInvite(invite?: string): void {
  if (typeof window === "undefined") return;

  if (invite) {
    window.sessionStorage.setItem(OAUTH_INVITE_KEY, invite);
    return;
  }
  window.sessionStorage.removeItem(OAUTH_INVITE_KEY);
}

export function takeOAuthInvite(): string | undefined {
  if (typeof window === "undefined") return;

  const invite = window.sessionStorage.getItem(OAUTH_INVITE_KEY) || undefined;
  window.sessionStorage.removeItem(OAUTH_INVITE_KEY);
  return invite;
}
