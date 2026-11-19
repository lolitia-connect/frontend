"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { useNavigate, useSearch } from "@workspace/ui/lib/router-compat";
import {
  postAuthOauthLoginToken as oAuthLoginGetToken,
  postAuthOauthRegister as oAuthRegister,
} from "@workspace/ui/services/common/common";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGlobalStore } from "@/stores/global";
import { getRedirectUrl, setAuthorization } from "@/utils/common";
import {
  takeOAuthCfToken,
  takeOAuthInvite,
  takeOAuthVerification,
} from "@/utils/oauth";
import {
  getTelegramAuthCallback,
  relayTelegramCallbackToOpener,
} from "@/utils/oauth/telegram-popup";
import SendCode from "../auth/send-code";

interface CertificationProps {
  children: React.ReactNode;
  platform: string;
}

export default function Certification({
  platform,
  children,
}: CertificationProps) {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const searchParams = useSearch({
    strict: false,
  }) as Record<string, unknown>;
  const getUserInfo = useGlobalStore((state) => state.getUserInfo);
  const submitted = useRef(false);
  // Set when the provider identity was verified but registration still needs
  // input from the user. Holding the one-time ticket lets the user supply that
  // input without repeating the provider round trip, and no account is created
  // until it is accepted.
  const [oauthToken, setOauthToken] = useState<string>();
  // The panel enforces invitation-only registration and no code was supplied.
  const [inviteRequired, setInviteRequired] = useState(false);
  // The provider returned no email (e.g. Telegram); a real address is needed.
  const [emailRequired, setEmailRequired] = useState(false);
  // The collected email must be proven with a verification code.
  const [emailVerify, setEmailVerify] = useState(false);
  const [invite, setInvite] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const completeLogin = async (token: string) => {
    setAuthorization(token);
    await getUserInfo();
    navigate({ to: getRedirectUrl() });
  };

  useEffect(() => {
    if (submitted.current) return;
    submitted.current = true;

    // Running inside the Telegram OAuth popup: hand the signed payload back to
    // the window that opened it and stop. The opener performs the token
    // exchange in the main window, so doing it here would strand the sign-in.
    if (platform === "telegram" && relayTelegramCallbackToOpener()) {
      return;
    }

    const callback =
      platform === "telegram"
        ? (getTelegramAuthCallback() ??
          (searchParams as Record<string, string>))
        : (searchParams as Record<string, string>);

    oAuthLoginGetToken({
      method: platform,
      callback,
      cf_token: takeOAuthCfToken(),
      invite: takeOAuthInvite(),
      ...takeOAuthVerification(),
    } as API.OAuthLoginGetTokenRequest)
      .then(async (res) => {
        const data = res?.data?.data;
        if (data?.token) {
          await completeLogin(data.token);
          return;
        }
        // Deferred registration: the backend verified the provider identity
        // and is asking for the data it could not obtain from the provider (an
        // invitation code and/or a real email) before creating the account.
        if (
          data?.oauth_token &&
          (data.invite_required || data.email_required)
        ) {
          setOauthToken(data.oauth_token);
          setInviteRequired(Boolean(data.invite_required));
          setEmailRequired(Boolean(data.email_required));
          setEmailVerify(Boolean(data.email_verify));
          return;
        }
        throw new Error("Invalid token");
      })
      .catch(() => {
        navigate({ to: "/auth" });
      });
  }, [platform, navigate, searchParams, getUserInfo]);

  const canSubmit =
    !submitting &&
    !!oauthToken &&
    (!inviteRequired || invite.trim().length > 0) &&
    (!emailRequired || email.trim().length > 0) &&
    (!(emailRequired && emailVerify) || code.trim().length > 0);

  const handleSubmit = async () => {
    if (!(canSubmit && oauthToken)) {
      return;
    }
    setSubmitting(true);
    try {
      const payload: API.OAuthRegisterRequest = { oauth_token: oauthToken };
      if (inviteRequired) {
        payload.invite = invite.trim();
      }
      if (emailRequired) {
        payload.email = email.trim();
        if (emailVerify) {
          payload.code = code.trim();
        }
      }
      const res = await oAuthRegister(payload);
      const token = res?.data?.data?.token;
      if (!token) {
        throw new Error("Invalid token");
      }
      await completeLogin(token);
    } catch {
      // The request interceptor already surfaces the error (e.g. invalid
      // invitation code or verification code); let the user correct the input
      // and retry.
      setSubmitting(false);
    }
  };

  if (oauthToken) {
    return (
      <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background p-6">
        <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-border p-6 shadow-sm">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="font-bold text-xl">
              {emailRequired
                ? t("oauth.completePrompt", "Complete your registration")
                : t("oauth.invitePrompt", "Enter your invitation code")}
            </h1>
            <p className="text-muted text-sm">
              {emailRequired
                ? t(
                    "oauth.emailDescription",
                    "Your sign-in provider did not share an email address. Enter a valid email to finish creating your account."
                  )
                : t(
                    "oauth.inviteDescription",
                    "Registration requires an invitation code. Enter it to finish creating your account."
                  )}
            </p>
          </div>
          {emailRequired && (
            <>
              <Input
                autoFocus
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit();
                  }
                }}
                placeholder={t("placeholders.email", "Enter your email...")}
                type="email"
                value={email}
              />
              {emailVerify && (
                <div className="flex items-center gap-2">
                  <Input
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSubmit();
                      }
                    }}
                    placeholder={t("placeholders.code", "Enter code...")}
                    type="text"
                    value={code}
                  />
                  <SendCode
                    params={{ email: email.trim(), type: 1 }}
                    type="email"
                  />
                </div>
              )}
            </>
          )}
          {inviteRequired && (
            <Input
              autoFocus={!emailRequired}
              onChange={(e) => setInvite(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit();
                }
              }}
              placeholder={t(
                "oauth.invitePlaceholder",
                "Enter invitation code..."
              )}
              value={invite}
            />
          )}
          <div className="flex gap-3">
            <Button
              className="flex-1"
              disabled={submitting}
              onClick={() => navigate({ to: "/auth" })}
              type="button"
              variant="ghost"
            >
              {t("oauth.inviteCancel", "Cancel")}
            </Button>
            <Button
              className="flex-1"
              disabled={!canSubmit}
              onClick={() => {
                handleSubmit();
              }}
              type="button"
            >
              {t("oauth.inviteSubmit", "Continue")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
