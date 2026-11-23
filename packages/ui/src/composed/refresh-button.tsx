import type { Button } from "@workspace/ui/components/button";
import { AsyncButton } from "@workspace/ui/composed/async-button";
import { RefreshCcw } from "lucide-react";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";

type RefreshButtonProps = Omit<
  ComponentProps<typeof Button>,
  "loading" | "onClick"
> & {
  onClick?: () => Promise<unknown> | unknown;
};

export function RefreshButton({
  onClick,
  children,
  ...props
}: RefreshButtonProps) {
  const { t } = useTranslation("components");
  return (
    <AsyncButton
      aria-label={t("table.refresh", "Refresh")}
      icon={children ?? <RefreshCcw />}
      onAction={() => onClick?.()}
      {...props}
    />
  );
}
