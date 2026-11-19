"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import LoadingBar, { type LoadingBarRef } from "react-top-loading-bar";

/**
 * Route-change progress bar.
 *
 * The previous implementation read TanStack Router's `pending` status. Next.js
 * App Router has no equivalent global flag, so this drives itself from location
 * changes instead: it starts the bar on navigation and completes it once the
 * new route has rendered. This preserves the original UX (a thin top bar while
 * navigating) without depending on the removed router.
 */
export function NavigationProgress() {
  const ref = useRef<LoadingBarRef>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  // Key that changes on every navigation (path or query).
  const routeKey = `${pathname}?${searchParams.toString()}`;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    ref.current?.continuousStart();
    const timer = window.setTimeout(() => ref.current?.complete(), 250);
    return () => window.clearTimeout(timer);
  }, [routeKey]);

  return (
    <LoadingBar color="var(--accent)" height={2} ref={ref} shadow={true} />
  );
}
