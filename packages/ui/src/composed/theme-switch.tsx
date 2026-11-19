import { Dropdown } from "@heroui/react";
import { buttonVariants } from "@workspace/ui/components/button";

import { useTheme } from "@workspace/ui/integrations/theme";
import { getFollowSystemLabel } from "@workspace/ui/lib/i18n";
import { cn } from "@workspace/ui/lib/utils";
import { Check, Moon, Sun } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * Theme picker, structured the same way as `LanguageSwitch`:
 *
 *   1. "System default" — the MODE row. Choosing it returns to the OS
 *      preference and forgets any explicit choice.
 *   2. the explicit choices (Light, Dark), each with the trailing check when
 *      active.
 *
 * Deliberately kept in step with `language-switch.tsx`: both menus sit side by
 * side in the header, so rows, order and check placement must match.
 */
export function ThemeSwitch() {
  const { t, i18n } = useTranslation("components");
  const { theme, setTheme, resetTheme, resolvedTheme } = useTheme();

  /* Update theme-color meta tag when the RESOLVED theme changes.
   * Uses `resolvedTheme` (not `theme`) so "system" reports the colour that is
   * actually on screen rather than always falling back to white.
   *
   * The values mirror each theme's `--background` token so the browser chrome
   * blends into the app canvas instead of the old pure white/black. */
  useEffect(() => {
    const themeColor = resolvedTheme === "dark" ? "#18181B" : "#F4F4F5";
    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    if (metaThemeColor) metaThemeColor.setAttribute("content", themeColor);
  }, [resolvedTheme]);

  // "System default", translated for the active UI language — the same resolver
  // the language switcher uses, so both menus read identically. A catalog entry
  // (`theme.followSystem`) wins when an app provides one.
  const catalogLabel = t("theme.followSystem", { defaultValue: "" });
  const systemLabel =
    catalogLabel && catalogLabel !== "theme.followSystem"
      ? catalogLabel
      : getFollowSystemLabel(i18n.language);

  // Light/Dark are the explicit choices; "system" is the follow-system mode
  // and is rendered as its own row above the explicit choices.
  const explicitThemes: {
    value: "light" | "dark";
    label: string;
    Icon: typeof Sun;
  }[] = [
    { value: "light", label: t("theme.light", "Light"), Icon: Sun },
    { value: "dark", label: t("theme.dark", "Dark"), Icon: Moon },
  ];

  return (
    <Dropdown>
      <Dropdown.Trigger
        aria-label={t("theme.toggle", "Toggle theme")}
        className={buttonVariants({
          className:
            "inline-flex scale-95 items-center justify-center rounded-full",
          size: "icon",
          variant: "ghost",
        })}
      >
        <Sun className="size-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute size-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Dropdown.Trigger>
      <Dropdown.Popover placement="bottom end">
        <Dropdown.Menu aria-label="Actions">
          {/*
          Follow-system is a MODE, not a stored value: `resetTheme` clears the
          stored choice and returns to the OS preference — the exact semantics of
          the language menu's "System default" row. No leading icon, matching it.
        */}
          <Dropdown.Item onAction={resetTheme}>
            {systemLabel}
            <Check
              className={cn("ms-auto", theme !== "system" && "hidden")}
              size={14}
            />
          </Dropdown.Item>
          {explicitThemes.map((option) => (
            <Dropdown.Item
              key={option.value}
              onAction={() => setTheme(option.value)}
            >
              {/* Icon mirrors the language rows' flags: the mode row above has
                none, each concrete choice carries its own identifier. */}
              <option.Icon className="size-4" />
              <span>{option.label}</span>
              <Check
                className={cn("ms-auto", theme !== option.value && "hidden")}
                size={14}
              />
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
