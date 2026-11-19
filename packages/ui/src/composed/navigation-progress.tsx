"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import LoadingBar, { type LoadingBarRef } from "react-top-loading-bar";
import {
  completeNavigationProgress,
  getNavigationProgress,
  subscribeNavigationProgress,
} from "../lib/navigation-progress";

/** Starts at navigation intent; location changes only complete the bar. */
export function NavigationProgress() {
  const ref = useRef<LoadingBarRef>(null);
  const started = useRef<number | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navigation = useSyncExternalStore(
    subscribeNavigationProgress,
    getNavigationProgress,
    () => null
  );
  const routeKey = `${pathname}?${searchParams.toString()}`;

  useEffect(() => {
    if (!navigation) return;
    if (navigation.pending && navigation.from === routeKey) {
      if (started.current !== navigation.id) {
        started.current = navigation.id;
        ref.current?.continuousStart();
      }
      return;
    }

    if (started.current !== null) {
      started.current = null;
      ref.current?.complete();
    }
    completeNavigationProgress(navigation.id);
  }, [navigation, routeKey]);

  return (
    <LoadingBar
      className="navigation-progress"
      color="var(--accent)"
      height={2}
      key={navigation?.id ?? 0}
      ref={ref}
      shadow={true}
    />
  );
}
