"use client";

import { useNavigate, useSearch } from "@workspace/ui/lib/router-compat";
import { postAuthOauthLoginToken as oAuthLoginGetToken } from "@workspace/ui/services/common/common";
import { useEffect, useRef } from "react";
import { useGlobalStore } from "@/stores/global";
import { getRedirectUrl, setAuthorization } from "@/utils/common";
import {
  takeOAuthCfToken,
  takeOAuthInvite,
  takeOAuthVerification,
} from "@/utils/oauth";
import { relayTelegramCallbackToOpener } from "@/utils/oauth/telegram-popup";

interface CertificationProps {
  children: React.ReactNode;
  platform: string;
}

export default function Certification({
  platform,
  children,
}: CertificationProps) {
  const navigate = useNavigate();
  const searchParams = useSearch({
    strict: false,
  }) as Record<string, unknown>;
  const getUserInfo = useGlobalStore((state) => state.getUserInfo);
  const submitted = useRef(false);

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
      platform === "telegram" && typeof searchParams.tgAuthResult === "string"
        ? { tgAuthResult: searchParams.tgAuthResult }
        : (searchParams as Record<string, string>);

    oAuthLoginGetToken({
      method: platform,
      callback,
      cf_token: takeOAuthCfToken(),
      invite: takeOAuthInvite(),
      ...takeOAuthVerification(),
    } as API.OAuthLoginGetTokenRequest)
      .then(async (res) => {
        const token = res?.data?.data?.token;
        if (!token) {
          throw new Error("Invalid token");
        }
        setAuthorization(token);
        await getUserInfo();
        navigate({ to: getRedirectUrl() });
      })
      .catch(() => {
        navigate({ to: "/auth" });
      });
  }, [platform, navigate, searchParams, getUserInfo]);

  return children;
}
