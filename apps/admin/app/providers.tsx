"use client";

import { LanguageProvider } from "@workspace/ui/integrations/language";
import {
  TanStackQueryContext,
  TanStackQueryProvider,
} from "@workspace/ui/integrations/tanstack-query";
import { ThemeProvider } from "@workspace/ui/integrations/theme";
import { initializeI18n } from "@workspace/ui/lib/i18n";
import { useState } from "react";
import { Toaster } from "sonner";
import { fallbackLng, fallbackResources, supportedLngs } from "@/config";

// Every namespace the admin app references via `useTranslation("<ns>")`.
// Loading them up-front avoids a flash of untranslated keys on first paint.
const NAMESPACES = [
  "ads",
  "announcement",
  "auth",
  "auth-control",
  "components",
  "coupon",
  "dashboard",
  "document",
  "group",
  "log",
  "marketing",
  "menu",
  "nodes",
  "order",
  "payment",
  "plugin",
  "product",
  "redemption",
  "servers",
  "subscribe",
  "system",
  "ticket",
  "tool",
  "user",
  "withdrawal",
];

// i18next is initialised once. Guarded so React strict-mode double invocation
// and Fast Refresh do not re-run detection/backend setup. It also runs during
// SSR (without the browser-only plugins) so `useTranslation()` finds an instance
// while prerendering instead of warning NO_I18NEXT_INSTANCE.
let i18nReady = false;

function ensureI18n() {
  if (i18nReady) return;
  i18nReady = true;
  initializeI18n({
    defaultNS: "components",
    fallbackLng,
    ns: NAMESPACES,
    react: { useSuspense: false },
    supportedLngs: [...supportedLngs],
    // Bundle the fallback language synchronously so the server HTML and the
    // client's hydration render produce identical text. Without it, SSR falls
    // back to each call's inline defaultValue while the client hydrates real
    // translations → React hydration mismatch. Other languages are applied
    // after mount by LanguageProvider.
    resources: fallbackResources,
  });
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
          {children}
          <Toaster closeButton position="top-right" richColors />
        </ThemeProvider>
      </LanguageProvider>
    </TanStackQueryProvider>
  );
}
