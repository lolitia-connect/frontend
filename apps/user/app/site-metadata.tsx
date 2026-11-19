"use client";

import { useSiteMetadata } from "@workspace/ui/lib/site-metadata";
import { usePathname } from "next/navigation";
import { useFindNavByUrl } from "@/layout/navs";
import { useGlobalStore } from "@/stores/global";

/**
 * Applies the operator's site branding to the document head.
 *
 * `main` did this inside `routes/__root.tsx`; the App Router port kept only the
 * static `metadata` export in `app/layout.tsx`, so the configured site name,
 * description, keywords and logo no longer reached the document. Kept as its own
 * client component so `app/layout.tsx` can stay a Server Component.
 */
export function SiteMetadata() {
  const { site } = useGlobalStore((state) => state.common);
  const pathname = usePathname();
  const pageTitle = useFindNavByUrl(pathname).at(-1)?.title;

  useSiteMetadata({
    title: site?.site_name || "User Portal",
    pageTitle,
    description: site?.site_desc,
    keywords: site?.keywords,
    logo: site?.site_logo,
    pathname,
  });

  return null;
}
