"use client";

import { LoadingBar } from "@workspace/ui/components/progress";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import {
  completeNavigationProgress,
  getNavigationProgress,
  isLanguageProgressPending,
  subscribeNavigationProgress,
} from "../lib/navigation-progress";

/** Starts at navigation intent; location changes only complete the bar. */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navigation = useSyncExternalStore(
    subscribeNavigationProgress,
    getNavigationProgress,
    () => null
  );
  const languagePending = useSyncExternalStore(
    subscribeNavigationProgress,
    isLanguageProgressPending,
    () => false
  );
  const routeKey = `${pathname}?${searchParams.toString()}`;

  const routePending = navigation?.pending && navigation.from === routeKey;

  useEffect(() => {
    if (navigation?.pending && navigation.from !== routeKey) {
      completeNavigationProgress(navigation.id);
    }
  }, [navigation, routeKey]);

  if (!(routePending || languagePending)) return null;

  return <LoadingBar className="fixed inset-x-0 top-0 z-[9999]" />;
}
