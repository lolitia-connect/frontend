import { LanguageProvider } from "@workspace/ui/integrations/language";
import { ThemeProvider } from "@workspace/ui/integrations/theme";
import { initializeI18n } from "@workspace/ui/lib/i18n";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "sonner";
import App from "./App";
import { fallbackLng, supportedLngs } from "./config";
import { clearAuthorization } from "./lib/auth";
import "@workspace/ui/globals.css";
import "./styles.css";

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

if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <LanguageProvider supportedLanguages={supportedLngs}>
        <ThemeProvider defaultTheme="light">
          <App />
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </LanguageProvider>
    </StrictMode>
  );
}
