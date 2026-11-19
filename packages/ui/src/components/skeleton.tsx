import { Skeleton as HeroUISkeleton } from "@heroui/react";
import { cn } from "@workspace/ui/lib/utils";

type HeroUISkeletonProps = React.ComponentProps<typeof HeroUISkeleton>;

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <HeroUISkeleton
      className={cn("rounded-md", className)}
      {...(props as HeroUISkeletonProps)}
    />
  );
}

export { Skeleton };
