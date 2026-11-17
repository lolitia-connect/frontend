"use client";

import { useSearch } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { Icon } from "@workspace/ui/composed/icon";
import { postAuthOauthLogin as oAuthLogin } from "@workspace/ui/services/common/common";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGlobalStore } from "@/stores/global";
import { setRedirectUrl } from "@/utils/common";
import {
  storeOAuthCfToken,
  storeOAuthInvite,
  storeOAuthVerification,
} from "@/utils/oauth";
import {
  navigateToTelegramCallbackRoute,
  requestTelegramAuthCallback,
} from "@/utils/oauth/telegram-popup";
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
  const { oauth_methods, verify, invite } = common;
  const captchaType = verify.captcha_type || "turnstile";
  const requiresVerification = Boolean(
    verify.enable_user_register_captcha || verify.enable_register_verify
  );
  const invitation =
    searchParams.invite || localStorage.getItem("invite") || "";
  const OAUTH_METHODS = oauth_methods?.filter((method: string) =>
    Object.hasOwn(icons, method)
  );
  return (
    OAUTH_METHODS?.length > 0 && (
      <>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
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
                Boolean(loadingMethod) ||
                (requiresVerification && !challenge) ||
                Boolean(invite?.forced_invite && !invitation)
              }
              key={method}
              onClick={async () => {
                if (searchParams.redirect?.startsWith("/")) {
                  setRedirectUrl(searchParams.redirect);
                }

                setLoadingMethod(method);
                try {
                  const { data } = await oAuthLogin({
                    method,
                    // OAuth providers disallow URL fragments (#) in redirect URIs.
                    // Use a real path (with trailing slash so static hosting can serve /oauth/<provider>/index.html)
                    // which then bridges into our hash-router at /#/oauth/<provider>.
                    redirect: `${window.location.origin}/oauth/${method}/`,
                  });

                  if (!data.data?.redirect) {
                    return;
                  }

                  storeOAuthInvite(invitation);
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
                      data.data.redirect
                    );
                    navigateToTelegramCallbackRoute("login", payload);
                    return;
                  }

                  window.location.href = data.data.redirect;
                } catch {
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
        {invite?.forced_invite && !invitation && (
          <p className="mt-3 text-destructive text-sm">
            {t(
              "oauth.inviteRequired",
              "An invitation code is required. Open your invitation link to continue."
            )}
          </p>
        )}
      </>
    )
  );
}
