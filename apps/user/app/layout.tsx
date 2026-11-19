import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Providers } from "./providers";
import { SiteMetadata } from "./site-metadata";
// Shared design system entry: Tailwind v4 + HeroUI v3 (pink theme overrides).
import "@workspace/ui/globals.css";

/**
 * Build-time fallback only. The operator-configured values are applied after
 * mount by `<SiteMetadata />` (they come from `GET /public/config`, which is
 * browser-only) — this restores what `main`'s `routes/__root.tsx` did.
 */
export const metadata: Metadata = {
  description: "User portal for subscription management and purchasing.",
  title: "User Portal",
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { color: "#F4F4F5", media: "(prefers-color-scheme: light)" },
    { color: "#18181B", media: "(prefers-color-scheme: dark)" },
  ],
};

/**
 * The shared router shim reads `useSearchParams()` through `useSearch()` /
 * `useLocation()`. Next.js requires any such client component to sit under a
 * Suspense boundary, otherwise the whole route bails out of static prerendering
 * ("useSearchParams() should be wrapped in a suspense boundary"). This single
 * root boundary covers every route instead of repeating one per page.
 */
function RouteFallback() {
  return (
    <div className="grid min-h-screen place-items-center">
      <div
        aria-label="Loading"
        className="size-8 animate-spin rounded-full border-3 border-default border-t-accent"
        role="status"
      />
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-US" suppressHydrationWarning>
      <head>
        <link href="/site.webmanifest" rel="manifest" />
      </head>
      <body className="bg-background text-foreground">
        <Suspense fallback={<RouteFallback />}>
          <Providers>
            <SiteMetadata />
            {children}
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}
