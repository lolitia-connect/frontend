"use client";

import { Spinner as HeroUISpinner } from "@heroui/react";
import { useTranslation } from "react-i18next";

function Spinner(props: React.ComponentProps<typeof HeroUISpinner<"span">>) {
  const { t } = useTranslation("components", { useSuspense: false });

  return (
    <HeroUISpinner
      aria-label={t("spinner.label", "Loading")}
      color="current"
      size="sm"
      {...props}
    />
  );
}

export { Spinner };
