"use client";

import { ProgressBar } from "@heroui/react";
import { cn } from "@workspace/ui/lib/utils";
import type * as React from "react";
import { useTranslation } from "react-i18next";

/**
 * HeroUI v3 `ProgressBar` adoption (real component).
 *
 * Public API is unchanged: the props type is still
 * `React.ComponentProps<typeof ProgressPrimitive.Root>`, so `value`, `max` and
 * `className` mean what they always meant at the two existing call sites
 * (`<Progress className="h-2 flex-1" value={n} />`).
 *
 * Mapping details:
 * - `value` -> HeroUI/RAC `value`; `null`/`undefined` becomes indeterminate,
 *   matching Radix's indeterminate behaviour.
 * - `max` -> `maxValue`.
 * - `getValueLabel` -> `valueLabel`, so the Radix aria-valuetext behaviour is kept.
 * - `gap-0` is added because HeroUI's `.progress-bar` is a two-row grid
 *   (`label output` / `track track`). Our API has no label/output slot, so
 *   without it the empty first row would add a `gap-1` offset and the caller's
 *   fixed height (`h-2`) would clip the track.
 * - The track is repainted onto the brand ramp (`bg-primary-100`, fully round)
 *   instead of HeroUI's neutral `bg-default`: the pale rose trough is what makes
 *   the rose fill read as one system, and it is the token the palette reserves
 *   for progress tracks.
 */

type ProgressProps = React.ComponentProps<typeof ProgressBar> & {
  value?: number | null;
  max?: number;
  getValueLabel?: (value: number, max: number) => string;
  color?: string;
};

type ProgressStatusColor =
  | "default"
  | "accent"
  | "success"
  | "warning"
  | "danger";

/**
 * Our public props type stays `React.ComponentProps<typeof ProgressPrimitive.Root>`,
 * which exposes the DOM passthrough `color?: string`. HeroUI's `color` is a
 * semantic status union, so only understood values are forwarded.
 */
function toStatusColor(
  color: string | undefined
): ProgressStatusColor | undefined {
  return color === "default" ||
    color === "accent" ||
    color === "success" ||
    color === "warning" ||
    color === "danger"
    ? color
    : undefined;
}

function Progress({
  className,
  value,
  max,
  color,
  getValueLabel,
  ...props
}: ProgressProps) {
  const { t } = useTranslation("components");
  const statusColor = toStatusColor(color);
  // A status colour (danger/warning/success) supplies its own fill, so the
  // trough stays neutral; the brand case gets the pale rose trough.
  const usesBrandFill = statusColor === undefined || statusColor === "accent";

  return (
    <ProgressBar
      aria-label={t("progress.label", "Progress")}
      className={cn("gap-0", className)}
      color={statusColor}
      data-slot="progress"
      isIndeterminate={value == null}
      maxValue={max}
      value={value ?? undefined}
      valueLabel={getValueLabel?.(value ?? 0, max ?? 100)}
      {...props}
    >
      <ProgressBar.Track
        className={cn(
          "rounded-full",
          usesBrandFill ? "bg-primary-100" : "bg-default-200"
        )}
        data-slot="progress-track"
      >
        <ProgressBar.Fill
          className="rounded-full"
          data-slot="progress-indicator"
        />
      </ProgressBar.Track>
    </ProgressBar>
  );
}

export { Progress };
