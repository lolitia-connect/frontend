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
  // Set when the provider identity was verified but registration is
  // invitation-only and no code was supplied yet. Holding the one-time ticket
  // lets the user enter a code without repeating the provider round trip, and
  // no account is created until that code is accepted.
  const [oauthToken, setOauthToken] = useState<string>();
  const [invite, setInvite] = useState("");
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
        // Forced-invite registration: the backend verified the provider
        // identity and is asking for an invitation code before creating the
        // account. Switch to the invite prompt instead of failing.
        if (data?.invite_required && data.oauth_token) {
          setOauthToken(data.oauth_token);
          return;
        }
        throw new Error("Invalid token");
      })
      .catch(() => {
        navigate({ to: "/auth" });
      });
  }, [platform, navigate, searchParams, getUserInfo]);

  const handleInviteSubmit = async () => {
    const code = invite.trim();
    if (submitting || !(oauthToken && code)) {
      return;
    }
    setSubmitting(true);
    try {
      const res = await oAuthRegister({
        oauth_token: oauthToken,
        invite: code,
      });
      const token = res?.data?.data?.token;
      if (!token) {
        throw new Error("Invalid token");
      }
      await completeLogin(token);
    } catch {
      // The request interceptor already surfaces the error (e.g. invalid
      // invitation code); let the user correct the code and retry.
      setSubmitting(false);
    }
  };

  if (oauthToken) {
    return (
      <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background p-6">
        <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-border p-6 shadow-sm">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="font-bold text-xl">
              {t("oauth.invitePrompt", "Enter your invitation code")}
            </h1>
            <p className="text-muted text-sm">
              {t(
                "oauth.inviteDescription",
                "Registration requires an invitation code. Enter it to finish creating your account."
              )}
            </p>
          </div>
          <Input
            autoFocus
            onChange={(e) => setInvite(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleInviteSubmit();
              }
            }}
            placeholder={t(
              "oauth.invitePlaceholder",
              "Enter invitation code..."
            )}
            value={invite}
          />
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
              disabled={!invite.trim() || submitting}
              onClick={() => {
                handleInviteSubmit();
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
