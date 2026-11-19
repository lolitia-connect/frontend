"use client";

import dynamic from "next/dynamic";

/**
 * Route-change progress bar. It reads the current search params through the
 * router shim, so it is mounted client-side only to keep static prerendering of
 * the root layout free of the useSearchParams CSR bailout.
 */
const Progress = dynamic(
  () =>
    import("@workspace/ui/composed/navigation-progress").then(
      (m) => m.NavigationProgress
    ),
  { ssr: false }
);

export function NavigationProgressClient() {
  return <Progress />;
}
