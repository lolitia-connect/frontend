import { getRequestLanguage } from "@workspace/ui/lib/request-language";
import { ThemeScript } from "@workspace/ui/lib/theme-script";
import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import { fallbackLng, supportedLngs } from "@/config/i18n";
import { loadInitialTranslations } from "@/config/i18n-server";
import { Bootstrap } from "./bootstrap";
import { NavigationProgressClient } from "./navigation-progress";
import { Providers } from "./providers";
import { SiteMetadata } from "./site-metadata";
// Shared design system entry: Tailwind v4 + HeroUI v3 (pink theme overrides).
import "@workspace/ui/globals.css";
import "./drawers.css";

/**
 * Build-time fallback only. The operator-configured values are applied after
 * mount by `<SiteMetadata />` (they come from `GET /public/config`, which is
 * browser-only) — this restores what `main`'s `routes/__root.tsx` did.
 */
export const metadata: Metadata = {
  description: "Ppanel administration console.",
  title: "Admin Portal",
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { color: "#F4F4F5", media: "(prefers-color-scheme: light)" },
    { color: "#18181B", media: "(prefers-color-scheme: dark)" },
  ],
};

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
        <ThemeScript />
      </head>
      <body className="admin-shell bg-background text-foreground">
        <Suspense fallback={null}>
          <Providers
            initialLanguage={initialLanguage}
            initialTranslations={initialTranslations}
          >
            <Bootstrap />
            <SiteMetadata />
            <NavigationProgressClient />
            {children}
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}
