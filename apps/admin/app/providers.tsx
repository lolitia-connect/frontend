"use client";

import { Toast } from "@heroui/react";
import { PageLoading } from "@workspace/ui/composed/page-loading";
import { SkipLink } from "@workspace/ui/composed/skip-link";
import { LanguageProvider } from "@workspace/ui/integrations/language";
import { ThemeProvider } from "@workspace/ui/integrations/theme";
import { createI18nInstance } from "@workspace/ui/lib/i18n";
import type { Resource } from "i18next";
import { Suspense, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { SWRConfig } from "swr";
import {
  fallbackLng,
  fallbackResources,
  getInitialI18nNamespaces,
  supportedLngs,
} from "@/config";

const clientCache = { dedupingInterval: 30_000 };

export function Providers({
  children,
  initialLanguage,
  initialTranslations,
}: {
  children: React.ReactNode;
  initialLanguage: string;
  initialTranslations: Resource;
}) {
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
      <Suspense fallback={<PageLoading className="min-h-svh" />}>
        <SWRConfig value={clientCache}>
          <LanguageProvider
            defaultLanguage={initialLanguage}
            supportedLanguages={supportedLngs}
          >
            <ThemeProvider>
              <SkipLink />
              {children}
              <Toast.Provider placement="top end" />
            </ThemeProvider>
          </LanguageProvider>
        </SWRConfig>
      </Suspense>
    </I18nextProvider>
  );
}
