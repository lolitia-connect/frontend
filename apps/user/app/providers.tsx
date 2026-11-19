"use client";

import { Toaster } from "@workspace/ui/components/sonner";
import { SkipLink } from "@workspace/ui/composed/skip-link";
import { LanguageProvider } from "@workspace/ui/integrations/language";
import {
  TanStackQueryContext,
  TanStackQueryProvider,
} from "@workspace/ui/integrations/tanstack-query";
import { ThemeProvider } from "@workspace/ui/integrations/theme";
import { createI18nInstance } from "@workspace/ui/lib/i18n";
import type { Resource } from "i18next";
import dynamic from "next/dynamic";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import {
  fallbackLng,
  fallbackResources,
  getInitialI18nNamespaces,
  supportedLngs,
} from "@/config";
import { AppInitializer } from "./app-initializer";

/**
 * Route-change progress bar.
 *
 * `main` rendered `<NavigationProgress />` in `routes/__root.tsx`, so every route
 * showed the thin top bar while navigating. The App Router port dropped it: the
 * ported root (`app/layout.tsx`) only composes Providers and SiteMetadata, so
 * the user app had no navigation feedback at all while `apps/admin` kept its
 * equivalent (`app/navigation-progress.tsx`). Restored here rather than in
 * `app/layout.tsx` so the root layout stays a Server Component.
 *
 * Mounted with `ssr: false` because the bar reads `useSearchParams()` through the
 * router shim. Under a Suspense boundary that hook does not error during static
 * generation — it resolves the boundary — so server-rendering this would replace
 * the entire prerendered shell with the loading fallback. Deferring it to the
 * client keeps the static HTML intact, exactly as `apps/admin` does.
 */
const NavigationProgress = dynamic(
  () =>
    import("@workspace/ui/composed/navigation-progress").then(
      (module) => module.NavigationProgress
    ),
  { ssr: false }
);

export function Providers({
  children,
  initialLanguage,
  initialTranslations,
}: {
  children: React.ReactNode;
  initialLanguage: string;
  initialTranslations: Resource;
}) {
  const [queryContext] = useState(() => TanStackQueryContext());
  const [i18n] = useState(() =>
    createI18nInstance({
      fallbackLng,
      lng: initialLanguage,
      supportedLngs: [...supportedLngs],
      ns: getInitialI18nNamespaces(
        typeof window === "undefined" ? "/" : window.location.pathname
      ),
      resources: { ...fallbackResources, ...initialTranslations },
    })
  );

  return (
    <I18nextProvider i18n={i18n}>
      <TanStackQueryProvider {...queryContext}>
        <LanguageProvider
          defaultLanguage={initialLanguage}
          supportedLanguages={supportedLngs}
        >
          <ThemeProvider>
            <SkipLink />
            <AppInitializer />
            <NavigationProgress />
            {children}
            <Toaster closeButton richColors />
          </ThemeProvider>
        </LanguageProvider>
      </TanStackQueryProvider>
    </I18nextProvider>
  );
}
