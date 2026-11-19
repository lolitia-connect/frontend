"use client";

import { ScrollShadow } from "@heroui/react";
import { cn } from "@workspace/ui/lib/utils";
import type * as React from "react";

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollShadow>) {
  return (
    <ScrollShadow
      className={cn("relative", className)}
      data-slot="scroll-area"
      {...props}
    >
      {children}
    </ScrollShadow>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & {
  orientation?: "vertical" | "horizontal";
}) {
  return (
    <div
      className={cn(
        "flex touch-none select-none p-px transition-colors",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className
      )}
      data-slot="scroll-area-scrollbar"
      {...props}
    >
      <div
        className="relative flex-1 rounded-full bg-border"
        data-slot="scroll-area-thumb"
      />
    </div>
  );
}

export { ScrollArea, ScrollBar };
