"use client";

import { SkipLink } from "@workspace/ui/composed/skip-link";
import { LanguageProvider } from "@workspace/ui/integrations/language";
import {
  TanStackQueryContext,
  TanStackQueryProvider,
} from "@workspace/ui/integrations/tanstack-query";
import { ThemeProvider } from "@workspace/ui/integrations/theme";
import { createI18nInstance } from "@workspace/ui/lib/i18n";
import type { Resource } from "i18next";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { Toaster } from "sonner";
import {
  fallbackLng,
  fallbackResources,
  getInitialI18nNamespaces,
  supportedLngs,
} from "@/config";

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
      defaultNS: "components",
      fallbackLng,
      lng: initialLanguage,
      ns: getInitialI18nNamespaces(
        typeof window === "undefined" ? "/" : window.location.pathname
      ),
      react: { useSuspense: false },
      supportedLngs: [...supportedLngs],
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
            {children}
            <Toaster closeButton position="top-right" richColors />
          </ThemeProvider>
        </LanguageProvider>
      </TanStackQueryProvider>
    </I18nextProvider>
  );
}
