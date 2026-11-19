"use client";

import { Button } from "@workspace/ui/components/button";
import { Icon } from "@workspace/ui/composed/icon";
import { useSearch } from "@workspace/ui/lib/router-compat";
import { postAuthOauthLogin as oAuthLogin } from "@workspace/ui/services/common/common";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGlobalStore } from "@/stores/global";
import { setRedirectUrl } from "@/utils/common";
import {
  storeOAuthCfToken,
  storeOAuthInvite,
  storeOAuthVerification,
} from "@/utils/oauth";
import {
  closePopup,
  navigateToTelegramCallbackRoute,
  openTelegramAuthPopup,
  requestTelegramAuthCallback,
} from "@/utils/oauth/telegram-popup";
import { resolveInviteCode } from "./invite";
import LocalCaptcha, { type LocalCaptchaRef } from "./local-captcha";
import SliderCaptcha, { type SliderCaptchaRef } from "./slider-captcha";
import CloudFlareTurnstile, { type TurnstileRef } from "./turnstile";

const icons = {
  apple: "uil:apple",
  google: "logos:google-icon",
  facebook: "logos:facebook",
  github: "uil:github",
  telegram: "logos:telegram",
};

export function OAuthMethods() {
  const { t } = useTranslation("auth");
  const { common } = useGlobalStore();
  const [loadingMethod, setLoadingMethod] = useState<string>();
  const [challenge, setChallenge] = useState("");
  const [captchaId, setCaptchaId] = useState("");
  const turnstile = useRef<TurnstileRef>(null);
  const localCaptcha = useRef<LocalCaptchaRef>(null);
  const sliderCaptcha = useRef<SliderCaptchaRef>(null);
  const searchParams = useSearch({ strict: false }) as {
    redirect?: string;
    invite?: string;
  };
  const { oauth_methods, verify, auth } = common;
  const captchaType = verify.captcha_type || "turnstile";
  // The email/phone auth form rendered above owns the captcha for this page:
  // `email/register-form.tsx` and `phone/register-form.tsx` render one when
  // `enable_user_register_captcha` is set, and the login forms render one when
  // `enable_user_login_captcha` is set. The OAuth block is a sibling on the very
  // same page, so rendering its own challenge as well is what produced the two
  // captchas users reported. Only stand in with a challenge when no auth form
  // shares the page (email and mobile both disabled).
  //
  // `enable_register_verify` is deliberately not consulted: that key no longer
  // exists in the global-config payload (migration `02132_update_verify_config`
  // deletes it and `VeifyConfig` exposes only the four `enable_*_captcha`
  // flags), so reading it silently evaluated to `undefined`.
  const authFormShowsCaptcha =
    Boolean(auth?.email?.enable || auth?.mobile?.enable) &&
    Boolean(
      verify.enable_user_login_captcha || verify.enable_user_register_captcha
    );
  const requiresVerification =
    Boolean(verify.enable_user_register_captcha) && !authFormShowsCaptcha;
  // `null` = not resolved yet. Resolved after mount so the server-rendered
  // markup stays deterministic (the invite can come from `localStorage`, which
  // does not exist on the server). Before this change the value was read during
  // render, which both missed hash-form invitation links and could disagree
  // with the SSR output.
  const [invitation, setInvitation] = useState<string | null>(null);
  useEffect(() => {
    setInvitation(resolveInviteCode(searchParams.invite));
  }, [searchParams.invite]);
  // Invitation codes are a *registration* policy (`invite.forced_invite`), not a
  // gate on signing in. The backend applies it inside its own registration path
  // and only to accounts that do not exist yet — `findOrRegisterUser` returns an
  // existing user's record directly and calls `register` (the only place
  // `ForcedInvite` is enforced) solely when the provider identity is unseen. So
  // an existing user signing in through a provider must never be blocked by it,
  // and this page cannot know which of the two applies until after the provider
  // round trip. The buttons therefore do not consult `forced_invite`; an invite
  // code the visitor arrived with is still forwarded for the registration leg.
  const OAUTH_METHODS = oauth_methods?.filter((method: string) =>
    Object.hasOwn(icons, method)
  );
  return (
    OAUTH_METHODS?.length > 0 && (
      <>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
          <span className="relative z-10 bg-background px-2 text-muted">
            {t("oauth.continue", "Or continue with")}
          </span>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          {OAUTH_METHODS?.map((method: string) => (
            <Button
              aria-label={t("oauth.provider", "Continue with {{method}}", {
                method,
              })}
              className="size-12 p-2"
              disabled={
                Boolean(loadingMethod) || (requiresVerification && !challenge)
              }
              key={method}
              onClick={async () => {
                if (searchParams.redirect?.startsWith("/")) {
                  setRedirectUrl(searchParams.redirect);
                }

                // Open the Telegram window synchronously inside the click
                // gesture; opening it after the awaited backend call below is
                // rejected by popup blockers.
                const telegramPopup =
                  method === "telegram" ? openTelegramAuthPopup("login") : null;

                setLoadingMethod(method);
                try {
                  const { data } = await oAuthLogin({
                    method,
                    // OAuth providers disallow URL fragments (#) in redirect
                    // URIs, so we use a real path. The trailing slash is
                    // REQUIRED: it must match the redirect URI registered with
                    // each provider (e.g. Google Console: `<origin>/oauth/
                    // google/`). The old infinite-redirect loop came from the
                    // static bridge pages under `public/oauth/<provider>/`
                    // shadowing the App Router route and bouncing to
                    // themselves; those have been removed, so `/oauth/<provider>/`
                    // now resolves straight to the `/oauth/[platform]` route.
                    redirect: `${window.location.origin}/oauth/${method}/`,
                  });

                  if (!data.data?.redirect) {
                    closePopup(telegramPopup);
                    return;
                  }

                  storeOAuthInvite(invitation ?? undefined);
                  storeOAuthCfToken(
                    captchaType === "turnstile" ? challenge : undefined
                  );
                  storeOAuthVerification(
                    captchaType === "local"
                      ? { captcha_id: captchaId, captcha_code: challenge }
                      : captchaType === "slider"
                        ? { slider_token: challenge }
                        : undefined
                  );

                  if (method === "telegram") {
                    const payload = await requestTelegramAuthCallback(
                      data.data.redirect,
                      telegramPopup
                    );
                    navigateToTelegramCallbackRoute("login", payload);
                    return;
                  }

                  window.location.href = data.data.redirect;
                } catch {
                  closePopup(telegramPopup);
                  storeOAuthCfToken();
                  storeOAuthInvite();
                  storeOAuthVerification();
                  setChallenge("");
                  turnstile.current?.reset();
                  localCaptcha.current?.reset();
                  sliderCaptcha.current?.reset();
                } finally {
                  setLoadingMethod(undefined);
                }
              }}
              size="icon"
              title={t("oauth.provider", "Continue with {{method}}", {
                method,
              })}
              type="button"
              variant="ghost"
            >
              <Icon
                className="size-8"
                icon={icons[method as keyof typeof icons]}
              />
            </Button>
          ))}
        </div>
        {requiresVerification && (
          <div className="mt-4">
            {captchaType === "turnstile" && (
              <CloudFlareTurnstile
                id="oauth-turnstile"
                onChange={(value) => setChallenge(value || "")}
                ref={turnstile}
                value={challenge}
              />
            )}
            {captchaType === "local" && (
              <LocalCaptcha
                onCaptchaIdChange={setCaptchaId}
                onChange={setChallenge}
                ref={localCaptcha}
                value={challenge}
              />
            )}
            {captchaType === "slider" && (
              <SliderCaptcha
                onChange={setChallenge}
                ref={sliderCaptcha}
                value={challenge}
              />
            )}
          </div>
        )}
      </>
    )
  );
}
