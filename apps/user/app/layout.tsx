import { brandFontVariables } from "@workspace/ui/lib/brand-fonts";
import { PortalResourceHints } from "@workspace/ui/lib/portal-resource-hints";
import { getRequestLanguage } from "@workspace/ui/lib/request-language";
import { ThemeScript } from "@workspace/ui/lib/theme-script";
import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
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
        <PortalResourceHints />
        <link href="/site.webmanifest" rel="manifest" />
      </head>
      <body className={`${brandFontVariables} bg-background text-foreground`}>
        <ThemeScript />
        <Providers
          initialLanguage={initialLanguage}
          initialTranslations={initialTranslations}
        >
          <SiteMetadata />
          {children}
        </Providers>
      </body>
    </html>
  );
}
