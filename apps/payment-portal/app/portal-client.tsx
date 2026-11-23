"use client";

import { PageLoading } from "@workspace/ui/composed/page-loading";
import dynamic from "next/dynamic";

/**
 * The portal is an auth-gated SPA: it reads cookies/localStorage, polls order
 * state, and drives i18next from browser detection. It is server-rendered (its
 * body ends up in the SSR HTML); only the browser-only bootstrap runs after
 * mount. `initialAuthenticated` is resolved from the auth cookie on the server
 * so the first client render matches the SSR output.
 */
const Portal = dynamic(() => import("@/portal-app"), {
  loading: () => <PageLoading className="min-h-svh" />,
});

export function PortalClient({
  initialAuthenticated,
}: {
  initialAuthenticated: boolean;
}) {
  return <Portal initialAuthenticated={initialAuthenticated} />;
}
