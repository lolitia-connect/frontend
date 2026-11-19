"use client";

import { Toaster } from "@workspace/ui/components/sonner";
import { LanguageProvider } from "@workspace/ui/integrations/language";
import {
  TanStackQueryContext,
  TanStackQueryProvider,
} from "@workspace/ui/integrations/tanstack-query";
import { ThemeProvider } from "@workspace/ui/integrations/theme";
import { initializeI18n } from "@workspace/ui/lib/i18n";
import dynamic from "next/dynamic";
import { useState } from "react";
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

// i18next is initialised once per bundle. Guarded so React strict-mode double
// invocation and Fast Refresh do not re-run detection/backend setup. It also
// runs during SSR (without the browser-only plugins) so `useTranslation()`
// finds an instance while prerendering instead of warning NO_I18NEXT_INSTANCE.
let i18nReady = false;

function ensureI18n() {
  if (i18nReady) return;
  i18nReady = true;
  // Route-specific namespaces for the entry route; deeper navigation loads the
  // rest on demand (same behaviour as the previous hash-based lookup).
  const initialPath =
    typeof window === "undefined" ? "/" : window.location.pathname || "/";
  initializeI18n({
    fallbackLng,
    supportedLngs: [...supportedLngs],
    ns: getInitialI18nNamespaces(initialPath),
    // Bundle the fallback language synchronously so the server HTML and the
    // client's hydration render produce identical text. Without this, SSR falls
    // back to each call's inline defaultValue while the client hydrates real
    // translations → React hydration mismatch. Other languages are applied
    // after mount by LanguageProvider (a normal re-render, not a mismatch).
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
          <AppInitializer />
          <NavigationProgress />
          {children}
          <Toaster closeButton richColors />
        </ThemeProvider>
      </LanguageProvider>
    </TanStackQueryProvider>
  );
}
