import { LanguageSwitch } from "@workspace/ui/composed/language-switch";
import { ThemeSwitch } from "@workspace/ui/composed/theme-switch";

export function Preferences({
  variant = "default",
}: {
  variant?: "default" | "auth";
}) {
  return (
    <div
      className={
        variant === "auth"
          ? "flex shrink-0 items-center gap-5"
          : "flex shrink-0 items-center gap-1"
      }
    >
      <LanguageSwitch />
      <ThemeSwitch />
    </div>
  );
}
