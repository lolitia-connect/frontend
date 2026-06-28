import { Spinner } from "@workspace/ui/components/spinner";
import { cn } from "@workspace/ui/lib/utils";

interface PageLoadingProps {
  className?: string;
}

/**
 * Full-page loading indicator shown during route transitions.
 * Renders a centered Spinner with a minimum height to prevent layout shift.
 */
export function PageLoading({ className }: PageLoadingProps) {
  return (
    <div
      className={cn("flex min-h-[60vh] items-center justify-center", className)}
    >
      <Spinner className="size-8 text-muted-foreground" />
    </div>
  );
}
