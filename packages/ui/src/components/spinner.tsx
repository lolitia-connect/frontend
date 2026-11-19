import { Spinner as HeroUISpinner } from "@heroui/react";
import { cn } from "@workspace/ui/lib/utils";
import { useTranslation } from "react-i18next";

type HeroUISpinnerProps = React.ComponentProps<typeof HeroUISpinner>;

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  const { t } = useTranslation("components");

  return (
    <HeroUISpinner
      aria-label={t("spinner.label", "Loading")}
      className={cn("size-4", className)}
      color="current"
      {...(props as unknown as HeroUISpinnerProps)}
    />
  );
}

export { Spinner };
