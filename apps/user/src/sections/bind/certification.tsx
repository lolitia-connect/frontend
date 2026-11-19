"use client";

import { useNavigate, useSearch } from "@workspace/ui/lib/router-compat";
import { postV1PublicUserBindOauthCallback as bindOAuthCallback } from "@workspace/ui/services/user/user";
import { useEffect, useRef } from "react";
import { useGlobalStore } from "@/stores/global";

interface CertificationProps {
  children: React.ReactNode;
  platform: string;
}

export default function Certification({
  platform,
  children,
}: CertificationProps) {
  const navigate = useNavigate();
  const getUserInfo = useGlobalStore((state) => state.getUserInfo);
  const submitted = useRef(false);
  const searchParams = useSearch({
    strict: false,
  }) as Record<string, unknown>;

  useEffect(() => {
    if (submitted.current) return;
    submitted.current = true;
    const callback =
      platform === "telegram" && typeof searchParams.tgAuthResult === "string"
        ? { tgAuthResult: searchParams.tgAuthResult }
        : (searchParams as Record<string, string>);

    bindOAuthCallback({
      method: platform,
      callback,
    })
      .then(async () => {
        await getUserInfo();
        navigate({ to: "/profile" });
      })
      .catch(() => {
        navigate({ to: "/profile" });
      });
  }, [platform, navigate, searchParams, getUserInfo]);

  return children;
}
