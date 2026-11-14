"use client";

import { useRouter, useSearch } from "@tanstack/react-router";
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
  const router = useRouter();
  const getUserInfo = useGlobalStore((state) => state.getUserInfo);
  const submitted = useRef(false);
  const searchParams = useSearch({
    strict: false,
    structuralSharing: false,
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
        router.navigate({ to: "/profile" });
      })
      .catch(() => {
        router.navigate({ to: "/profile" });
      });
  }, [platform, router, searchParams, getUserInfo]);

  return children;
}
