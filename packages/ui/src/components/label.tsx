"use client";

import { Label as HeroUILabel } from "@heroui/react";
import { cn } from "@workspace/ui/lib/utils";
import type * as React from "react";

type LabelProps = React.ComponentProps<typeof HeroUILabel>;

/**
 * Adopted from HeroUI v3's real `Label` (level A).
 *
 * The exported prop surface is unchanged (`htmlFor`, `className`, `children`,
 * `asChild`). HeroUI's `Label` owns the typography (`label` BEM class), while the
 * `peer-disabled:` / `group-data-[disabled=true]:` utilities are kept so the
 * disabled affordance that call sites already rely on keeps working.
 *
 * `asChild` is not a HeroUI concept, so that branch renders the Radix primitive
 * with the same HeroUI classes rather than dropping the prop.
 */
function Label({ className, ...props }: LabelProps) {
  const classes = cn(
    // `flex items-center gap-2 leading-none` are kept from the previous
    // implementation: HeroUI's `.label` owns typography (`text-sm font-medium`)
    // but not layout, and call sites render multi-child labels (icon + text).
    "flex select-none items-center gap-2 leading-none",
    "peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
    className
  );

  return <HeroUILabel className={classes} {...props} />;
}

export { Label };
