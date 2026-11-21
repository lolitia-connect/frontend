import { getRequestLanguage } from "@workspace/ui/lib/request-language";
import { ThemeScript } from "@workspace/ui/lib/theme-script";
import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import { fallbackLng, supportedLngs } from "@/config/i18n";
import { loadInitialTranslations } from "@/config/i18n-server";
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

/** Keep route-level client suspension behind a stable loading shell. */
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialLanguage = getRequestLanguage(
    (await headers()).get("accept-language"),
    supportedLngs,
    fallbackLng
  );
  const initialTranslations = await loadInitialTranslations(initialLanguage);

  return (
    <html lang={initialLanguage} suppressHydrationWarning>
      <head>
        {/* Establish the font-CDN connections and discover the stylesheet in
            the document head, so font CSS loads in parallel with the app CSS
            instead of waiting for a globals.css @import (improves FCP). */}
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link
          crossOrigin="anonymous"
          href="https://fonts.gstatic.com"
          rel="preconnect"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&family=Sen:wght@400..800&display=swap"
          precedence="fonts"
          rel="stylesheet"
        />
        <link href="/site.webmanifest" rel="manifest" />
      </head>
      <body className="bg-background text-foreground">
        <ThemeScript />
        <Suspense fallback={<RouteFallback />}>
          <Providers
            initialLanguage={initialLanguage}
            initialTranslations={initialTranslations}
          >
            <SiteMetadata />
            {children}
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}
