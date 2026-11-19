"use client";

import { SkipLink } from "@workspace/ui/composed/skip-link";
import { LanguageProvider } from "@workspace/ui/integrations/language";
import {
  TanStackQueryContext,
  TanStackQueryProvider,
} from "@workspace/ui/integrations/tanstack-query";
import { ThemeProvider } from "@workspace/ui/integrations/theme";
import { initializeI18n } from "@workspace/ui/lib/i18n";
import { useState } from "react";
import { Notifications } from "@/components/notifications";
import { fallbackLng, supportedLngs } from "@/config";
import { fallbackResources } from "@/config/locale-resources";
import { clearAuthorization } from "@/lib/auth";

// i18next is initialised once. Guarded so React strict-mode double invocation
// and Fast Refresh do not re-run detection/backend setup. It also runs during
// SSR (without the browser-only plugins) so `useTranslation()` finds an instance
// while prerendering instead of warning NO_I18NEXT_INSTANCE.
let i18nReady = false;

function ensureI18n() {
  if (i18nReady) return;
  i18nReady = true;
  initializeI18n({
    fallbackLng,
    supportedLngs: [...supportedLngs],
    defaultNS: "app",
    ns: ["app", "components"],
    react: { useSuspense: false },
    // Bundle the fallback language synchronously so the SSR render and the
    // client's hydration render produce identical text (see the admin app and
    // `scripts/generate-locale-resources.mjs`). Other languages still load from
    // the HTTP backend after mount.
    resources: fallbackResources,
  });
  if (typeof window !== "undefined") {
    window.logout = () => {
      clearAuthorization();
      window.location.reload();
    };
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Lazy state keeps a single QueryClient per browser session (mirrors the
  // previous module-level `TanStackQueryContext()` call in main.tsx).
  const [queryContext] = useState(() => TanStackQueryContext());
  ensureI18n();

  return (
    <TanStackQueryProvider {...queryContext}>
      <LanguageProvider supportedLanguages={supportedLngs}>
        <ThemeProvider>
          <SkipLink />
          {children}
          <Notifications />
        </ThemeProvider>
      </LanguageProvider>
    </TanStackQueryProvider>
  );
}
