"use client";

import { PageLoading } from "@workspace/ui/composed/page-loading";
import dynamic from "next/dynamic";

// Admin is a client-only, auth-gated SPA. Sections read cookies/localStorage,
// drive i18next from browser detection and read table filters from the query
// string via useSearchParams. Mounting them client-side keeps the production
// build free of "window is not defined" and of the useSearchParams CSR
// bailout, matching the original hash-router SPA behaviour.
const Section = dynamic(() => import("@/sections/log/balance"), {
  loading: () => <PageLoading />,
  ssr: false,
});

export default function Page() {
  return <Section />;
}
