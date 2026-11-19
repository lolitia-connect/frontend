import { Dropdown } from "@heroui/react";
import { buttonVariants } from "@workspace/ui/components/button";

import { useLanguage } from "@workspace/ui/integrations/language";
import { getFollowSystemLabel } from "@workspace/ui/lib/i18n";
import { cn } from "@workspace/ui/lib/utils";
import { Check, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

const allLanguages = [
  {
    code: "en-US",
    name: "English",
    flag: "🇺🇸",
  },
  {
    code: "zh-CN",
    name: "简体中文",
    flag: "🇨🇳",
  },
  {
    code: "zh-TW",
    name: "繁體中文（台灣）",
    flag: "🇨🇳",
  },
  {
    code: "zh-HK",
    name: "繁體中文（香港）",
    flag: "🇭🇰",
  },
  {
    code: "ja-JP",
    name: "日本語",
    flag: "🇯🇵",
  },
];

export function LanguageSwitch() {
  const {
    language,
    changeLanguage,
    supportedLanguages,
    isFollowingSystem,
    followSystem,
  } = useLanguage();
  const { t } = useTranslation("components");

  const languages = allLanguages.filter((lang) =>
    supportedLanguages.includes(lang.code)
  );

  const currentLanguage = languages.find((lang) => lang.code === language);

  // "System default", translated for the ACTIVE UI language.
  //
  // Deliberately not `theme.system` ("System" / 「系统」): that names the theme
  // setting, and "System" alone is ambiguous in a list of language names. A
  // catalog entry still wins when an app provides one, so this stays translatable.
  const catalogLabel = t("language.followSystem", {
    defaultValue: "",
  });
  const systemLabel =
    catalogLabel && catalogLabel !== "language.followSystem"
      ? catalogLabel
      : getFollowSystemLabel(language);

  // Screen-reader text for the trigger: names the language in effect, and says
  // whether it was chosen or is following the browser.
  const activeMode = isFollowingSystem
    ? `${systemLabel}${currentLanguage ? ` · ${currentLanguage.name}` : ""}`
    : (currentLanguage?.name ?? language);

  return (
    <Dropdown>
      <Dropdown.Trigger
        aria-label={`${t("language.label", "Language")}: ${activeMode}`}
        className={buttonVariants({
          className:
            "inline-flex scale-95 items-center justify-center rounded-full",
          size: "icon",
          variant: "ghost",
        })}
        data-testid="language-switch-trigger"
      >
        <Languages className="h-[1.2rem] w-[1.2rem]" />
      </Dropdown.Trigger>
      <Dropdown.Popover placement="bottom end">
        <Dropdown.Menu aria-label="Actions">
          {/*
          "Follow system" is a mode, not a language: selecting it clears the
          stored preference and re-applies whatever the browser prefers.

          Styled like ThemeSwitch's mode row — plain label, no leading
          icon, trailing check — so the two menus read consistently.
        */}
          <Dropdown.Item onAction={followSystem}>
            {systemLabel}
            <Check
              className={cn("ms-auto", !isFollowingSystem && "hidden")}
              size={14}
            />
          </Dropdown.Item>
          {languages.map((language) => (
            <Dropdown.Item
              key={language.code}
              onAction={() => changeLanguage(language.code)}
            >
              <span lang={language.code}>
                {language.flag} {language.name}
              </span>
              <Check
                className={cn(
                  "ms-auto",
                  (isFollowingSystem ||
                    currentLanguage?.code !== language.code) &&
                    "hidden"
                )}
                size={14}
              />
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
