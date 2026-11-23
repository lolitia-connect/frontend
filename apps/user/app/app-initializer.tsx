"use client";

import { toast } from "@heroui/react";
import { getCookie } from "@workspace/ui/lib/cookies";
import { useEffect, useRef } from "react";
import { useGlobalStore } from "@/stores/global";
import { fetchInitialConfig } from "@/utils/bootstrap";
import { Logout } from "@/utils/common";

/**
 * Replaces the bootstrap side effects that used to live in `routes/__root.tsx`:
 * global store hydration, user info refresh, `window.logout`, and the
 * operator-supplied `custom_html` block. Kept as a dedicated client component so
 * `app/layout.tsx` can stay a Server Component.
 */
export function AppInitializer() {
  const common = useGlobalStore((state) => state.common);
  const setCommon = useGlobalStore((state) => state.setCommon);
  const setCommonError = useGlobalStore((state) => state.setCommonError);
  const getUserInfo = useGlobalStore((state) => state.getUserInfo);
  const clearUserLoading = useGlobalStore((state) => state.clearUserLoading);
  const userStarted = useRef(false);

  useEffect(() => {
    window.logout = Logout;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const initializeApp = async () => {
      try {
        const config = await fetchInitialConfig();
        if (!cancelled) setCommon(config);
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to initialize app:", error);
        setCommonError(
          error instanceof Error ? error.message : "Unknown configuration error"
        );
        toast.danger(
          "Failed to load site configuration. Please refresh and try again."
        );
      }
    };

    initializeApp();

    return () => {
      cancelled = true;
    };
  }, [setCommon, setCommonError]);

  useEffect(() => {
    if (userStarted.current) return;
    userStarted.current = true;

    // Session recovery must not wait for the public config request or its retries.
    if (getCookie("Authorization")) {
      getUserInfo().catch(clearUserLoading);
    } else {
      clearUserLoading();
    }
  }, [clearUserLoading, getUserInfo]);

  return (
    <div
      dangerouslySetInnerHTML={{ __html: common?.site.custom_html || "" }}
      id="custom_html"
    />
  );
}
