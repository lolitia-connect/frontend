"use client";

import { Spinner } from "@heroui/react";
import dynamic from "next/dynamic";

/**
 * The portal is an auth-gated SPA: it reads cookies/localStorage, polls order
 * state, and drives i18next from browser detection. It is server-rendered (its
 * body ends up in the SSR HTML); only the browser-only bootstrap runs after
 * mount. `initialAuthenticated` is resolved from the auth cookie on the server
 * so the first client render matches the SSR output.
 */
const Portal = dynamic(() => import("@/portal-app"), {
  loading: () => (
    <div className="grid min-h-screen place-items-center">
      <Spinner aria-label="Loading" color="accent" size="lg" />
    </div>
  ),
});

export function PortalClient({
  initialAuthenticated,
}: {
  initialAuthenticated: boolean;
}) {
  return <Portal initialAuthenticated={initialAuthenticated} />;
}
