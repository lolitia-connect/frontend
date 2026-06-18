import {
  TanStackQueryContext,
  TanStackQueryProvider,
} from "@workspace/ui/integrations/tanstack-query";
import { LanguageProvider } from "@workspace/ui/integrations/language";
import { ThemeProvider } from "@workspace/ui/integrations/theme";
import { initializeI18n } from "@workspace/ui/lib/i18n";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "sonner";
import { clearAuthorization } from "@/lib/auth";
import App from "./App";
import { fallbackLng, supportedLngs } from "./config";
import "@workspace/ui/globals.css";

initializeI18n({
  fallbackLng,
  supportedLngs: [...supportedLngs],
  defaultNS: "app",
  ns: ["app", "components"],
  react: {
    useSuspense: false,
  },
});

window.logout = () => {
  clearAuthorization();
  window.location.reload();
};

const rootElement = document.getElementById("app");
const TanStackQueryProviderContext = TanStackQueryContext();

if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <TanStackQueryProvider {...TanStackQueryProviderContext}>
        <LanguageProvider supportedLanguages={supportedLngs}>
          <ThemeProvider>
            <App />
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </LanguageProvider>
      </TanStackQueryProvider>
    </StrictMode>
  );
}
