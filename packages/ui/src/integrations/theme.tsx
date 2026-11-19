import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "dark" | "light" | "system";
type ResolvedTheme = Exclude<Theme, "system">;

const DEFAULT_THEME = "system";

/**
 * localStorage key holding the user's explicit theme choice.
 *
 * Mirrors the language preference (`LANGUAGE_STORAGE_KEY` in `lib/i18n.ts`): the
 * stored value is the CHOICE, including `"system"`. It is never auto-written by
 * detection, so "follow the system" stays distinguishable from an explicit pick.
 */
export const THEME_STORAGE_KEY = "theme";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

type ThemeProviderState = {
  defaultTheme: Theme;
  resolvedTheme: ResolvedTheme;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resetTheme: () => void;
};

const initialState: ThemeProviderState = {
  defaultTheme: DEFAULT_THEME,
  resolvedTheme: "light",
  theme: DEFAULT_THEME,
  setTheme: () => null,
  resetTheme: () => null,
};

const ThemeContext = createContext<ThemeProviderState>(initialState);

function isTheme(value: unknown): value is Theme {
  return value === "dark" || value === "light" || value === "system";
}

/**
 * Read the stored theme choice, or `undefined` when the user has never chosen.
 *
 * `undefined` (not `"system"`) is the "never chosen" state, so a future
 * migration can tell them apart. Unreadable/invalid values fall back to
 * `undefined` rather than throwing — localStorage can be blocked entirely
 * (private mode, disabled cookies).
 */
export function getStoredTheme(): Theme | undefined {
  if (typeof window === "undefined") return;
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : undefined;
  } catch {
    return;
  }
}

function persistTheme(theme: Theme): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // localStorage can be unavailable (private mode, blocked cookies).
  }
}

function resolveTheme(theme: Theme): ResolvedTheme {
  // SSR / static prerender has no `window`; fall back to the light theme and
  // let the post-hydration effect correct it. Reading the media query during
  // render would crash `next build` for any page inside ThemeProvider.
  if (typeof window === "undefined") return "light";
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
}

export function ThemeProvider({
  children,
  defaultTheme = DEFAULT_THEME,
  ...props
}: ThemeProviderProps) {
  const [theme, _setTheme] = useState<Theme>(defaultTheme);

  // `null` until mounted: the first client render must match the server render
  // ("light") to avoid a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  const resolvedTheme = useMemo(() => resolveTheme(theme), [theme]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Restore the stored choice AFTER mount.
  //
  // This must not run during render/SSR: the server cannot read localStorage, so
  // applying it earlier would render a different theme than the server and cause
  // a hydration mismatch. Same pattern (and reason) as the language provider's
  // post-mount `applyDetectedLanguage()`.
  useEffect(() => {
    const stored = getStoredTheme();
    if (stored) _setTheme(stored);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (currentResolvedTheme: ResolvedTheme) => {
      root.classList.remove("light", "dark");
      root.classList.add(currentResolvedTheme);
      root.dataset.theme = currentResolvedTheme;
      root.classList.add("theme-ready");
    };

    const handleChange = () => {
      if (theme === "system") {
        const systemTheme = mediaQuery.matches ? "dark" : "light";
        applyTheme(systemTheme);
      }
    };

    applyTheme(resolvedTheme);

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, resolvedTheme, mounted]);

  // Persist an explicit choice so it survives a reload.
  //
  // Guarded by `mounted` so the restore effect above (and the initial mount)
  // cannot write the default back over a stored value before it is read.
  const setTheme = (nextTheme: Theme) => {
    _setTheme(nextTheme);
    persistTheme(nextTheme);
  };

  const resetTheme = () => {
    // Back to following the system AND forget the stored choice, so the next
    // load starts clean rather than pinning whatever was stored.
    _setTheme(DEFAULT_THEME);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(THEME_STORAGE_KEY);
      } catch {
        // localStorage can be unavailable (private mode, blocked cookies).
      }
    }
  };

  const contextValue = {
    defaultTheme,
    resolvedTheme,
    resetTheme,
    theme,
    setTheme,
  };

  return (
    <ThemeContext value={contextValue} {...props}>
      {children}
    </ThemeContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
