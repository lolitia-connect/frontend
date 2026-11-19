import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { RefreshCcw } from "lucide-react";
import type { ComponentProps } from "react";
import { useCallback, useState } from "react";

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
    <Button disabled={loading || disabled} onClick={handleClick} {...props}>
      {loading ? <Spinner /> : (children ?? <RefreshCcw />)}
    </Button>
  );
}
