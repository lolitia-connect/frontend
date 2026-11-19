import { Card as HeroUICard } from "@heroui/react";
import { cn } from "@workspace/ui/lib/utils";
import type * as React from "react";

/**
 * HeroUI adoption level (A): every part renders the real `@heroui/react` `Card`
 * compound component (`Card` / `Card.Header` / `Card.Title` / `Card.Description` /
 * `Card.Content` / `Card.Footer`).
 *
 * The exported surface is unchanged — same six part names plus `CardAction`,
 * same `className` prop, and the same `data-slot` values, which HeroUI already
 * emits identically (`card`, `card-header`, `card-title`, `card-description`,
 * `card-content`, `card-footer`), so any existing selector keeps matching.
 *
 * Two intentional element changes come with HeroUI's semantics: `CardTitle`
 * renders `<h3>` and `CardDescription` renders `<p>` (the old markup used
 * `<div>`). Both are verified safe against real call sites — no call site nests
 * block content inside `CardDescription`, and `<div>` inside the `<h3>` used by
 * three call sites is not auto-closed by the HTML parser, so SSR output and the
 * client tree stay identical.
 */

function Card({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    // HeroUI requires `children`, so it is destructured and passed explicitly
    // while this wrapper keeps `children` optional.
    //
    // No border is added here: the card's hairline lives in the theme
    // (`packages/ui/src/styles/globals.css`, `.card` rule in the components
    // layer) so that the many call sites which render HeroUI's `Card` directly
    // get the same treatment — and so a call site can still opt out with any
    // `border-*` utility, which sits in the higher utilities layer.
    <HeroUICard className={className} {...props}>
      {children}
    </HeroUICard>
  );
}

function CardHeader({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <HeroUICard.Header className={className} {...props}>
      {children}
    </HeroUICard.Header>
  );
}

/**
 * `Card.Title` wraps by default so a long title can never overflow its card.
 *
 * HeroUI's `card__header` is `flex flex-col`, but several call sites override it
 * to `flex-row` (title on the left, an action / tabs on the right). A flex item
 * defaults to `min-width: auto`, so a long unbreakable title refused to shrink
 * and pushed its siblings out of the card — the reported overflow. `min-w-0`
 * lets it shrink, `break-words` lets the text wrap instead of being clipped.
 * Both are inert outside a flex/grid parent, so no other call site regresses.
 */
function CardTitle({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <HeroUICard.Title
      className={cn("min-w-0 break-words", className)}
      {...props}
    >
      {children}
    </HeroUICard.Title>
  );
}

function CardDescription({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <HeroUICard.Description className={className} {...props}>
      {children}
    </HeroUICard.Description>
  );
}

function CardContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <HeroUICard.Content className={className} {...props}>
      {children}
    </HeroUICard.Content>
  );
}

function CardFooter({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <HeroUICard.Footer className={className} {...props}>
      {children}
    </HeroUICard.Footer>
  );
}

/**
 * `CardAction` has no HeroUI counterpart, so it stays a plain `div`. The old
 * grid placement utilities are kept, and `ml-auto self-start` is added because
 * HeroUI's `card__header` is `flex flex-col` (not the grid this originally
 * targeted), where `justify-self` has no effect — `ml-auto` preserves the
 * "pushed to the end of the header row" behaviour.
 */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "col-start-2 row-span-2 row-start-1 ml-auto self-start justify-self-end",
        className
      )}
      data-slot="card-action"
      {...props}
    />
  );
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
