import {
  applyDetectedLanguage,
  followSystemLanguage,
  getStoredLanguage,
  setLanguagePreference,
} from "@workspace/ui/lib/i18n";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

type Language = string;

interface LanguageContextType {
  changeLanguage: (lng: Language) => void;
  /** Forget the saved choice and re-apply the browser's language. */
  followSystem: () => void;
  /**
   * True while no explicit choice is stored, i.e. the app is following the
   * browser. False once the user has picked a language.
   *
   * Always `true` during SSR and the hydration render (storage is unreadable
   * server-side), then corrected by an effect — the same pattern the theme
   * provider uses, so the markup stays hydration-stable.
   */
  isFollowingSystem: boolean;
  isLoading: boolean;
  language: Language;
  supportedLanguages: readonly Language[];
}

const LanguageContext = createContext<LanguageContextType | null>(null);

interface LanguageProviderProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
  supportedLanguages?: readonly Language[];
}

export function LanguageProvider({
  children,
  supportedLanguages = ["en-US", "zh-CN"] as const,
  defaultLanguage = "en-US",
}: LanguageProviderProps) {
  const { i18n } = useTranslation();

  // Initialise with fallback, will be updated when i18n is ready.
  const [language, setLanguage] = useState<Language>(defaultLanguage);

  const [isLoading, setIsLoading] = useState(false);

  // `undefined` means "no explicit choice" (follow the browser). Starts as
  // `undefined` so SSR and the hydration render agree; the mount effect below
  // replaces it with the real stored value.
  const [storedPreference, setStoredPreference] = useState<
    Language | undefined
  >(undefined);

  const changeLanguage = useCallback(async (lng: Language) => {
    setIsLoading(true);
    try {
      // Persists the choice (unlike the automatic detection path), so it
      // survives a reload and stops following the browser.
      await setLanguagePreference(lng);
      setStoredPreference(getStoredLanguage());
      setLanguage(lng);
    } catch (error) {
      console.error("Failed to change language:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const followSystem = useCallback(() => {
    // Clears the stored key and re-applies the browser preference. The result is
    // deliberately NOT persisted, otherwise "follow system" would immediately
    // become an explicit choice again.
    followSystemLanguage();
    setStoredPreference(undefined);
  }, []);

  // Handle i18n initialization and language changes
  useEffect(() => {
    const updateLanguage = () => {
      const currentLang = i18n.language as Language;
      if (currentLang && supportedLanguages.includes(currentLang)) {
        setLanguage(currentLang);
        // Update HTML lang attribute
        document.documentElement.lang = currentLang;
      }
    };

    const handleLanguageChanged = (lng: string) => {
      const languageCode = lng as Language;
      setLanguage(languageCode);
      // Update HTML lang attribute when language changes
      document.documentElement.lang = languageCode;
    };

    // Set up language change listener
    i18n.on("languageChanged", handleLanguageChanged);

    // Initialize language if i18n is already ready
    if (i18n.isInitialized) {
      updateLanguage();
    } else {
      // Wait for i18n to initialize
      const handleInitialized = () => {
        updateLanguage();
      };
      i18n.on("initialized", handleInitialized);

      return () => {
        i18n.off("languageChanged", handleLanguageChanged);
        i18n.off("initialized", handleInitialized);
      };
    }

    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, [i18n, supportedLanguages]);

  // Adopt the browser's preferred language only AFTER mount.
  //
  // i18next is deliberately initialised with a fixed language so the server HTML
  // and React's hydration render match. Detection therefore has to happen here,
  // in an effect, so it triggers a normal re-render instead of a hydration
  // mismatch. Runs once.
  //
  // This also resolves the stored preference for the UI. The listener effect
  // above is declared first, so it is already subscribed when this runs and the
  // resulting `languageChanged` is not missed.
  useEffect(() => {
    // Honour an explicit choice, otherwise fall back to the browser.
    applyDetectedLanguage();
    setStoredPreference(getStoredLanguage());
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        isLoading,
        supportedLanguages,
        isFollowingSystem: storedPreference === undefined,
        followSystem,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
