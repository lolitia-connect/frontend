"use client";

import { PageLoading } from "@workspace/ui/composed/page-loading";
import dynamic from "next/dynamic";

// Server-rendered. This section has no render-time browser reads and does not
// read search params, so it prerenders into the HTML instead of mounting
// client-only. `next/dynamic` still code-splits the section bundle and shows
// `loading` while that chunk streams on the client.
const Section = dynamic(() => import("@/sections/servers"), {
  loading: () => <PageLoading />,
});

export default function Page() {
  return <Section />;
}
