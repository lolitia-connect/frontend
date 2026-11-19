import { Chip as HeroUIChip } from "@heroui/react";
import { chipVariants } from "@heroui/styles";
import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

/**
 * HeroUI adoption level (A): renders the real `@heroui/react` `Chip`.
 *
 * HeroUI's own docs point this way: "For standalone label usage, use the Chip
 * component instead" — `Badge` is for status dots anchored to another element,
 * whereas this wrapper is always a standalone text pill, so `Chip` is the
 * matching primitive.
 *
 * The exported contract is unchanged: same `Badge` name, same `variant`
 * vocabulary (`default | secondary | destructive | outline`), same `asChild`,
 * same `className`. HeroUI's vocabulary is `variant` × `color`, so the old
 * variants map onto the pair that matches the intended look:
 *   default     -> soft      + accent  (pale rose plate, deep-rose text)
 *   destructive -> primary   + danger  (solid danger, for destructive actions)
 *   secondary   -> secondary + default (neutral/quiet)
 *   outline     -> tertiary  + default (transparent fill, hover only)
 * `default` is deliberately the *soft* pair rather than a solid pink fill: the
 * primitive is overwhelmingly used for version numbers and status words, and a
 * solid rose pill with near-white text is both louder than the brand wants and
 * a contrast risk. Solid rose stays available through `<Button>`.
 * `rounded-full` and the svg sizing are kept because HeroUI's chip is rounded-2xl
 * and does not size child icons. `data-slot` is left to HeroUI, which emits
 * `chip` (verified: nothing in the workspace selects on `data-slot="badge"`).
 */

/** Extra utilities the old implementation provided that HeroUI's chip does not. */
const BADGE_EXTRAS =
  "overflow-hidden rounded-full transition-[color,box-shadow] focus-visible:border-focus focus-visible:ring-[3px] focus-visible:ring-focus/50 [&>svg]:pointer-events-none [&>svg]:size-3";

/** Old variant -> HeroUI `Chip` `color`/`variant` pair. */
const chipPropsByVariant = {
  default: { color: "accent", variant: "soft" },
  secondary: { color: "default", variant: "secondary" },
  destructive: { color: "danger", variant: "primary" },
  outline: { color: "default", variant: "tertiary" },
} as const;

/**
 * Full standalone class list (HeroUI's `chip` base + modifiers + extras), so the
 * exported `badgeVariants` stays usable on its own (e.g. on an arbitrary
 * element). When rendering HeroUI's `Chip`, only {@link BADGE_EXTRAS} is passed
 * as `className` because HeroUI already emits the `chip*` classes itself —
 * passing both would duplicate every class in the DOM.
 */
type BadgeVariant = keyof typeof chipPropsByVariant;
type BadgeVariantProps = { variant?: BadgeVariant | null; className?: string };

function badgeVariants({
  variant = "default",
  className,
}: BadgeVariantProps = {}) {
  const resolvedVariant = variant ?? "default";
  return cn(
    BADGE_EXTRAS,
    chipVariants(chipPropsByVariant[resolvedVariant]).base(),
    className
  );
}

function Badge({
  className,
  variant,
  asChild = false,
  children,
  // `color` stays in the public prop type (the deprecated HTML presentational
  // attribute) but is not forwarded: HeroUI's `Chip` types `color` as its own
  // semantic union, and the old `variant` vocabulary already selects the colour.
  color: _color,
  ...props
}: React.ComponentProps<"span"> & BadgeVariantProps & { asChild?: boolean }) {
  const resolvedVariant = variant ?? "default";

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<Record<string, unknown>>;
    return React.cloneElement(child, {
      ...(props as Record<string, unknown>),
      className: cn(
        badgeVariants({ variant: resolvedVariant }),
        className,
        typeof child.props.className === "string"
          ? child.props.className
          : undefined
      ),
      "data-slot": "badge",
    });
  }

  return (
    <HeroUIChip
      className={cn(BADGE_EXTRAS, className)}
      {...chipPropsByVariant[resolvedVariant]}
      {...props}
    >
      {children}
    </HeroUIChip>
  );
}

export { Badge, badgeVariants };
