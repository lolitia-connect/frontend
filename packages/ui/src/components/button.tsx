import { Button as HeroUIButton } from "@heroui/react";
import { buttonVariants as heroButtonVariants } from "@heroui/styles";
import { Spinner } from "@workspace/ui/components/spinner";
import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

/**
 * HeroUI adoption level (A): `Button` renders the real `@heroui/react` `Button`.
 *
 * The exported contract is unchanged. The old `variant` vocabulary maps onto
 * HeroUI's, and the old `size` vocabulary onto HeroUI's sizes plus `isIconOnly`:
 *   default -> primary     | destructive -> danger  | outline -> outline
 *   secondary -> secondary | ghost -> ghost         | link -> ghost + underline
 *   sm/md/lg -> sm/md/lg   | icon/icon-sm/icon-lg -> isIconOnly + md/sm/lg
 *
 * Two behaviours are preserved through HeroUI's own props:
 *   - `loading` -> `isPending` and `isDisabled`, with a decorative `Spinner`
 *     so the action keeps its accessible name.
 *   - `type`    -> forwarded explicitly, defaulting to `"submit"`. This matters:
 *     react-aria's `useButton` hardcodes `type = 'button'`
 *     (`react-aria/dist/private/button/useButton.js`: `type: type = 'button'`),
 *     whereas the previous implementation rendered a bare `<button>` whose HTML
 *     default is `type="submit"`. Without this default the 44 call sites that
 *     rely on an implicit submit inside a `<form>` would silently stop submitting.
 *
 * `asChild` projects the computed HeroUI classes and handlers directly onto
 * the caller's element, which keeps link triggers as single semantic nodes.
 */

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

type ButtonSize = "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";

/**
 * Long-label hardening (translated labels overflow their container).
 *
 * Mechanism (measured, not assumed): HeroUI's `.button` base ships
 * `width: fit-content` + `white-space: nowrap` + `display: inline-flex`, so the
 * element is a *flex/grid item* whose default `min-width: auto` floors it at
 * min-content width. A label wider than its container therefore cannot shrink —
 * the button keeps its min-content width and is pushed out of the container.
 * Measured in a real browser against this repo's compiled CSS: a label that
 * wraps to ~375px inside a 320px flex cell rendered a 374.5px button
 * (406.5px once the `loading` spinner was added), i.e. `cell.scrollWidth` 375
 * vs `clientWidth` 320.
 *
 * The fix is four utilities, all in Tailwind's `utilities` layer, which is
 * declared *after* the `components` layer that holds `.button`, so they win:
 *   - `min-w-0`        removes the `min-width: auto` floor so the box can shrink
 *   - `whitespace-normal` lets the label wrap instead of overflowing
 *   - `wrap-anywhere`  (`overflow-wrap: anywhere`) is what actually removes the
 *     min-content floor for an unbreakable compound word. `wrap-break-word`
 *     (`overflow-wrap: break-word`) is NOT sufficient: it does not reduce
 *     min-content size, and measured 26/150 residual container overflows vs
 *     0/150 for `wrap-anywhere`.
 *   - `max-w-full`     clamps against the container in the shrink-to-fit case
 *
 * No height utility is added on purpose. `.button` fixes the height per size
 * (`h-10 md:h-9`, sm `h-9 md:h-8`, lg `h-11 md:h-10`); adding a global `h-auto`
 * plus a `min-h-*` floor would fight call sites that deliberately set a smaller
 * box (`h-6`, `h-7`, `size-5`) and would do so inside files this task must not
 * touch. Keeping the height means single-line geometry, `size="icon"` squares
 * and every explicit call-site height are preserved byte-for-byte.
 *
 * Call sites stay in control: these come *before* the caller's `className`, so a
 * single-line label is still possible — pass `whitespace-nowrap` (tailwind-merge
 * treats it as the same group as our `whitespace-normal` and drops ours), e.g.
 * `className="whitespace-nowrap truncate"`. `truncate` *alone* is not enough: it
 * is a different merge group, so our `whitespace-normal` survives and CSS source
 * order (`.whitespace-normal` is emitted after `.truncate`) keeps the label
 * wrapping while `truncate`'s `overflow: hidden` clips it. A call site that
 * wants the box to grow for a multi-line label can add `h-auto`, which is this
 * repo's existing idiom (`subscribe/index.tsx`:
 * `h-auto max-w-full whitespace-normal break-words`).
 */
const LONG_LABEL_HARDENING =
  "min-w-0 max-w-full whitespace-normal wrap-anywhere";
const LINK_HOVER_STYLES =
  "bg-transparent hover:bg-transparent active:bg-transparent hover:opacity-70";

interface ButtonVariantOptions {
  className?: string;
  size?: ButtonSize | null | undefined;
  variant?: ButtonVariant | null | undefined;
}

/** Old variant -> HeroUI `Button` variant. */
const HERO_VARIANT = {
  default: "primary",
  destructive: "danger",
  outline: "outline",
  secondary: "secondary",
  ghost: "ghost",
  link: "ghost",
} as const;

/** Old size -> HeroUI `Button` size (`isIconOnly` is derived from the size). */
const HERO_SIZE = {
  default: "md",
  sm: "sm",
  lg: "lg",
  icon: "md",
  "icon-sm": "sm",
  "icon-lg": "lg",
} as const;

/**
 * Resolves the HeroUI BEM classes for a `(variant, size)` pair.
 *
 * The HeroUI variant function is called exactly once with *both* dimensions:
 * `heroButtonVariants` also applies its own `defaultVariants`, so calling it once
 * per dimension (e.g. `{variant}` then `{size}`) would emit the defaults of the
 * omitted one and duplicate `button--*` classes in the DOM.
 *
 * Exported so call sites can apply button styling to a non-button element
 * (`<Link className={buttonVariants({ size: "sm" })}>`). It keeps the original
 * `(options) => string` shape, so `VariantProps<typeof buttonVariants>` yields the
 * same `{ variant?, size? }` type the cva version produced.
 */
function buttonVariants({
  variant,
  size,
  className,
}: ButtonVariantOptions = {}): string {
  const resolvedVariant = variant ?? "default";
  const resolvedSize = size ?? "default";

  return cn(
    heroButtonVariants({
      isIconOnly: resolvedSize.startsWith("icon"),
      size: HERO_SIZE[resolvedSize],
      variant: HERO_VARIANT[resolvedVariant],
    }),
    LONG_LABEL_HARDENING,
    resolvedVariant === "link" && LINK_HOVER_STYLES,
    resolvedVariant === "link" && "underline underline-offset-4",
    className
  );
}

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: ButtonVariant | null | undefined;
  size?: ButtonSize | null | undefined;
  asChild?: boolean;
  loading?: boolean;
};

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  type,
  children,
  ...props
}: ButtonProps) {
  const resolvedVariant = variant ?? "default";
  const resolvedSize = size ?? "default";

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<Record<string, unknown>>;
    const childProps = child.props as Record<string, unknown>;
    const slotProps = props as Record<string, unknown>;
    const childClick = childProps.onClick;
    const slotClick = slotProps.onClick;
    const mergedProps: Record<string, unknown> = {
      ...slotProps,
      ...childProps,
      className: cn(
        buttonVariants({ variant, size, className }),
        typeof childProps.className === "string"
          ? childProps.className
          : undefined
      ),
      "data-slot": "button",
    };
    if (loading) {
      mergedProps["aria-busy"] = true;
      mergedProps["aria-disabled"] = true;
      mergedProps.children = (
        <>
          <Spinner aria-hidden="true" />
          {childProps.children as React.ReactNode}
        </>
      );
      mergedProps.onClick = (event: React.MouseEvent) => event.preventDefault();
      if (child.type === "button") mergedProps.disabled = true;
    } else if (
      typeof childClick === "function" &&
      typeof slotClick === "function"
    ) {
      mergedProps.onClick = (...args: unknown[]) => {
        (childClick as (...eventArgs: unknown[]) => void)(...args);
        (slotClick as (...eventArgs: unknown[]) => void)(...args);
      };
    }
    return React.cloneElement(child, mergedProps);
  }

  // react-aria types its handlers against `Element`, React's `<button>` types
  // them against `HTMLButtonElement`. The two are structurally incompatible in
  // TypeScript (parameter contravariance) even though react-aria receives the
  // same DOM event at runtime, so the pass-through is bridged once here and the
  // *public* prop type stays exactly `React.ComponentProps<"button">` — widening
  // the exported signature would be the actual API change.
  const heroProps = props as React.ComponentProps<typeof HeroUIButton>;

  return (
    <HeroUIButton
      // HeroUI emits `.button` and its modifiers itself, so only the extras the
      // old implementation added on top are passed here (no duplicated classes).
      // `LONG_LABEL_HARDENING` comes first so a call site can still opt into
      // `truncate`/`whitespace-nowrap` through its own `className`.
      className={cn(
        LONG_LABEL_HARDENING,
        resolvedVariant === "link" && LINK_HOVER_STYLES,
        resolvedVariant === "link" && "underline underline-offset-4",
        className
      )}
      data-slot="button"
      isDisabled={loading || disabled}
      isIconOnly={resolvedSize.startsWith("icon")}
      isPending={loading}
      size={HERO_SIZE[resolvedSize]}
      type={type ?? "submit"}
      variant={HERO_VARIANT[resolvedVariant]}
      {...heroProps}
    >
      {loading && <Spinner aria-hidden="true" />}
      {children}
    </HeroUIButton>
  );
}

export { Button, buttonVariants };
