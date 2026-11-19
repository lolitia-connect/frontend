import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { RefreshCcw } from "lucide-react";
import type { ComponentProps } from "react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

type RefreshButtonProps = Omit<
  ComponentProps<typeof Button>,
  "loading" | "onClick"
> & {
  onClick?: () => Promise<unknown> | unknown;
};

/**
 * A button that shows a spinning RefreshCcw icon while the async onClick
 * handler is in progress, and the normal RefreshCcw icon otherwise.
 * Automatically disables itself while loading.
 */
export function RefreshButton({
  onClick,
  children,
  disabled,
  ...props
}: RefreshButtonProps) {
  const { t } = useTranslation("components");
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    if (loading || !onClick) return;
    setLoading(true);
    try {
      await onClick();
    } finally {
      setLoading(false);
    }
  }, [loading, onClick]);

  return (
    <Button
      aria-busy={loading}
      aria-label={t("table.refresh", "Refresh")}
      disabled={loading || disabled}
      onClick={handleClick}
      type="button"
      {...props}
    >
      {loading ? <Spinner /> : (children ?? <RefreshCcw />)}
    </Button>
  );
}
