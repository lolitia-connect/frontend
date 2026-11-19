import { Button, Dropdown, Label } from "@heroui/react";
import { useLanguage } from "@workspace/ui/integrations/language";
import { useTheme } from "@workspace/ui/integrations/theme";
import { getFollowSystemLabel } from "@workspace/ui/lib/i18n";
import { Languages, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

const languageNames: Record<string, string> = {
  "en-US": "English",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文（台灣）",
  "zh-HK": "繁體中文（香港）",
  "ja-JP": "日本語",
};

export function Preferences({
  variant = "default",
}: {
  variant?: "default" | "auth";
}) {
  const { t } = useTranslation("components");
  const {
    language,
    supportedLanguages,
    changeLanguage,
    followSystem,
    isFollowingSystem,
  } = useLanguage();
  const { theme, setTheme, resetTheme } = useTheme();
  const systemLabel = getFollowSystemLabel(language);
  const isAuth = variant === "auth";

  return (
    <div
      className={
        isAuth
          ? "flex shrink-0 items-center gap-5"
          : "flex shrink-0 items-center gap-1"
      }
    >
      <Dropdown>
        <Button
          aria-label={`${t("language.label", "Language")}: ${languageNames[language] ?? language}`}
          className={isAuth ? "scale-95 rounded-full" : undefined}
          isIconOnly
          variant={isAuth ? "ghost" : "tertiary"}
        >
          <Languages className={isAuth ? "size-[1.2rem]" : "size-4"} />
        </Button>
        <Dropdown.Popover placement="bottom end">
          <Dropdown.Menu
            aria-label={t("language.label", "Language")}
            onAction={(key) =>
              key === "system" ? followSystem() : changeLanguage(String(key))
            }
            selectedKeys={[isFollowingSystem ? "system" : language]}
            selectionMode="single"
          >
            <Dropdown.Item id="system" textValue={systemLabel}>
              <Label>{systemLabel}</Label>
              <Dropdown.ItemIndicator />
            </Dropdown.Item>
            {supportedLanguages.map((code) => (
              <Dropdown.Item
                id={code}
                key={code}
                textValue={languageNames[code] ?? code}
              >
                <Label>{languageNames[code] ?? code}</Label>
                <Dropdown.ItemIndicator />
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
      <Dropdown>
        <Button
          aria-label={t("theme.toggle", "Toggle theme")}
          className={isAuth ? "scale-95 rounded-full" : undefined}
          isIconOnly
          variant={isAuth ? "ghost" : "tertiary"}
        >
          <Sun
            className={
              isAuth ? "size-[1.2rem] dark:hidden" : "size-4 dark:hidden"
            }
          />
          <Moon
            className={
              isAuth
                ? "hidden size-[1.2rem] dark:block"
                : "hidden size-4 dark:block"
            }
          />
        </Button>
        <Dropdown.Popover placement="bottom end">
          <Dropdown.Menu
            aria-label={t("theme.toggle", "Toggle theme")}
            onAction={(key) => {
              if (key === "system") resetTheme();
              else if (key === "light" || key === "dark") setTheme(key);
            }}
            selectedKeys={[theme]}
            selectionMode="single"
          >
            <Dropdown.Item id="system" textValue={systemLabel}>
              <Label>{systemLabel}</Label>
              <Dropdown.ItemIndicator />
            </Dropdown.Item>
            <Dropdown.Item id="light" textValue={t("theme.light", "Light")}>
              <Sun className="size-4" />
              <Label>{t("theme.light", "Light")}</Label>
              <Dropdown.ItemIndicator />
            </Dropdown.Item>
            <Dropdown.Item id="dark" textValue={t("theme.dark", "Dark")}>
              <Moon className="size-4" />
              <Label>{t("theme.dark", "Dark")}</Label>
              <Dropdown.ItemIndicator />
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </div>
  );
}
