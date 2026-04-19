"use client";

import { useRouter, useSearch } from "@tanstack/react-router";
import { bindOAuthCallback } from "@workspace/ui/services/user/user";
import { useEffect } from "react";
import { useGlobalStore } from "@/stores/global";

interface CertificationProps {
  platform: string;
  children: React.ReactNode;
}

export default function Certification({
  platform,
  children,
}: CertificationProps) {
  const router = useRouter();
  const { getUserInfo } = useGlobalStore();
  const searchParams = useSearch({
    strict: false,
    structuralSharing: false,
  }) as Record<string, unknown>;

  useEffect(() => {
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
        router.navigate({ to: "/auth" });
      });
  }, [platform, router, searchParams, getUserInfo]);

  return children;
}
