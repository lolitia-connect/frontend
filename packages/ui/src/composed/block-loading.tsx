import { Spinner } from "@workspace/ui/components/spinner";
import { cn } from "@workspace/ui/lib/utils";

type SpinnerSize = "sm" | "md" | "lg";

const sizeMap: Record<SpinnerSize, string> = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
};

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
        surface && "bg-muted/40",
        className
      )}
      style={{ minHeight }}
    >
      <div className="rounded-full border bg-background p-3 shadow-sm">
        <Spinner className={cn(sizeMap[size], "text-muted-foreground")} />
      </div>
    </div>
  );
}
