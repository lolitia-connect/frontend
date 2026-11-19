"use client";

import { Spinner } from "@heroui/react";
import dynamic from "next/dynamic";

/**
 * The portal is a client-only, auth-gated SPA: it reads cookies/localStorage,
 * polls order state, and drives i18next from browser detection. Rendering it on
 * the server would warn about a missing i18next instance and add no SEO value,
 * so it is mounted client-side only.
 */
const Portal = dynamic(() => import("@/portal-app"), {
  ssr: false,
  loading: () => (
    <div className="grid min-h-screen place-items-center">
      <Spinner aria-label="Loading" color="accent" size="lg" />
    </div>
  ),
});

export function PortalClient() {
  return <Portal />;
}
