"use client";

import Empty from "@workspace/ui/composed/empty";
import { cn } from "@workspace/ui/lib/utils";

export function MainEmpty({ border = false }: { border?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg border py-24",
        border ? "border-dashed" : "border-transparent"
      )}
    >
      <Empty />
    </div>
  );
}
