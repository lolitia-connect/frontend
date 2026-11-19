"use client";

import { useTranslation } from "react-i18next";

export function SkipLink() {
  const { t } = useTranslation("components");
  return (
    <a
      className="sr-only z-[10000] rounded-md bg-background text-foreground shadow-lg focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:p-3 focus:outline-2 focus:outline-focus"
      href="#main-content"
    >
      {t("accessibility.skipToContent", "Skip to content")}
    </a>
  );
}
