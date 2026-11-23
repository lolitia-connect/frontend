import { Spinner } from "@workspace/ui/components/spinner";
import { cn } from "@workspace/ui/lib/utils";

type SpinnerSize = "sm" | "md" | "lg";

interface BlockLoadingProps {
  className?: string;
  /** Minimum height of the loading container */
  minHeight?: string;
  /** Spinner size variant */
  size?: SpinnerSize;
  /** Show a muted loading surface behind the indicator */
  surface?: boolean;
}

/**
 * Inline loading indicator for data blocks (cards, charts, stats).
 * Renders a centered Spinner with a consistent indicator surface.
 */
export function BlockLoading({
  size = "md",
  minHeight = "200px",
  className,
  surface = true,
}: BlockLoadingProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-md",
        surface && "bg-default/40",
        className
      )}
      style={{ minHeight }}
    >
      <Spinner className="text-muted" size={size} />
    </div>
  );
}
