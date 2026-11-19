"use client";

import { getCookie } from "@workspace/ui/lib/cookies";
import { useEffect } from "react";
import { toast } from "sonner";
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
  const { clearUserLoading, common, getUserInfo, setCommon, setCommonError } =
    useGlobalStore();

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
        toast.error(
          "Failed to load site configuration. Please refresh and try again."
        );
      }

      try {
        if (getCookie("Authorization")) {
          await getUserInfo();
        } else {
          clearUserLoading();
        }
      } catch {
        clearUserLoading();
      }
    };

    initializeApp();

    return () => {
      cancelled = true;
    };
  }, [clearUserLoading, getUserInfo, setCommon, setCommonError]);

  useEffect(() => {
    window.logout = Logout;
  }, []);

  return (
    <div
      dangerouslySetInnerHTML={{ __html: common?.site.custom_html || "" }}
      id="custom_html"
    />
  );
}
