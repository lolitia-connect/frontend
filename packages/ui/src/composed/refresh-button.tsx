import { Button, type buttonVariants } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { RefreshCcw } from "lucide-react";
import { useCallback, useState } from "react";

interface RefreshButtonProps
  extends Omit<React.ComponentProps<"button">, "onClick"> {
  onClick?: () => Promise<unknown> | unknown;
  size?: (typeof buttonVariants)["variants"]["size"];
  variant?: (typeof buttonVariants)["variants"]["variant"];
}

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
