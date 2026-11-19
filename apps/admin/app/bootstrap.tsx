"use client";

import { getCookie } from "@workspace/ui/lib/cookies";
import { useEffect, useRef } from "react";
import { useGlobalStore } from "@/stores/global";
import { fetchInitialConfig } from "@/utils/bootstrap";
import { Logout } from "@/utils/common";

/**
 * Application bootstrap, migrated from the former root route (`routes/__root.tsx`).
 *
 * Loads the global site config into the store and, when an Authorization cookie
 * is present, refreshes the current admin user. It runs in an effect so
 * `next build` never issues a backend request while prerendering, and it is
 * guarded with a ref so React StrictMode does not refresh the user twice.
 * The config helper shares its in-flight request between effect invocations.
 */
export function Bootstrap() {
  const setCommon = useGlobalStore((state) => state.setCommon);
  const getUserInfo = useGlobalStore((state) => state.getUserInfo);
  const userStarted = useRef(false);

  /**
   * The former entry (`main.tsx`) installed the session-expiry handler with
   * `window.logout = Logout`, which `packages/ui/src/lib/request.ts` calls when
   * the backend answers 40002–40005 (token expired/revoked). Without this the
   * global response interceptor throws `TypeError: window.logout is not a
   * function` instead of clearing the Authorization cookie and redirecting to
   * the login page, so an expired session left every admin request failing.
   *
   * Assigned in an effect (not at module scope) so it never runs while
   * prerendering. Kept in its own effect, like `apps/user/app/app-initializer.tsx`,
   * so it does not re-fire if the bootstrap effect's layout changes.
   */
  useEffect(() => {
    window.logout = Logout;
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchInitialConfig()
      .then((response) => {
        if (!cancelled && response.data?.data) {
          setCommon(response.data.data);
        }
      })
      .catch((error) => {
        if (!cancelled) console.error("Failed to initialize app:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [setCommon]);

  useEffect(() => {
    if (userStarted.current) return;
    userStarted.current = true;

    // Restore the session independently, even if public config is slow or fails.
    if (getCookie("Authorization")) {
      getUserInfo().catch(() => {
        /* handled by the store and request interceptor */
      });
    }
  }, [getUserInfo]);

  return null;
}
