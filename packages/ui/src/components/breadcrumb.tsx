import { breadcrumbsVariants } from "@heroui/styles";
import { cn } from "@workspace/ui/lib/utils";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

/**
 * HeroUI v3 `breadcrumbsVariants` adoption (level B — variant classes).
 *
 * REVERTED from level (A). Rendering HeroUI's real `Breadcrumbs` root with this
 * module's existing children was tested by server-rendering and silently DROPS
 * all children:
 *
 *   renderToStaticMarkup(
 *     <Breadcrumbs separator={...}>
 *       <div data-slot="breadcrumb-list">
 *         <li data-slot="breadcrumb-item"><a href="/a">Home</a></li>
 *         ...
 *
 *   ->  <template><div data-slot="breadcrumb-list">...</div></template>
 *       <ol data-slot="breadcrumb" class="breadcrumbs"></ol>          // EMPTY
 *
 * `Breadcrumbs` is a React Aria collection component: it only accepts
 * `Breadcrumbs.Item` children (each of which *is* a link and renders the
 * separator itself), and everything else is captured into a `<template>`. This
 * module's public API separates `BreadcrumbItem` (plain `li`), `BreadcrumbLink`
 * (`a` with `asChild`) and `BreadcrumbPage` (non-navigable
 * `span[aria-current=page]`) inside a `BreadcrumbList` `<ol>`, so adopting the
 * real root would either render nothing or force a prop-API change on all seven
 * exports — forbidden by the contract. The single real call site
 * (`apps/admin/src/layout/header.tsx`) passes exactly that shape.
 *
 * Re-verified while fixing the styling defects below (same outcome, still level B):
 *
 *   renderToStaticMarkup(<Breadcrumbs><div data-slot="breadcrumb-list">…</div></Breadcrumbs>)
 *   ->  <template><div data-slot="breadcrumb-list">…</div></template>
 *       <ol data-slot="breadcrumbs" aria-label="Breadcrumbs" class="breadcrumbs"></ol>
 *
 * So the DOM structure is kept and HeroUI's BEM classes are adopted per part:
 * - `Breadcrumb` (nav)     -> `.breadcrumbs` base
 * - `BreadcrumbItem`       -> `.breadcrumbs__item`
 * - `BreadcrumbLink`       -> `.breadcrumbs__link`
 * - `BreadcrumbSeparator`  -> `.breadcrumbs__separator`
 *
 * Caller `className`s still win: utilities are emitted in the `utilities` layer,
 * which outranks the `components` layer HeroUI's rules live in. That layering is
 * what the fixes below rely on — every correction is a *utility* on the part
 * whose HeroUI BEM rule was wrong for this DOM, never an edited BEM rule.
 *
 * Styling defects fixed here (all inside a 56px `h-14` header bar):
 * 1. Separator box on the wrong element. HeroUI applies `.breadcrumbs__separator`
 *    (`size-3`, i.e. 12px) to the chevron *itself*
 *    (`@heroui/react/dist/components/breadcrumbs/breadcrumbs.js`:
 *    `jsx(IconChevronRight, { className: slots?.separator() })`). Here it was on the
 *    wrapping `<li>` while the default lucide chevron kept its 24px default
 *    (`lucide-react/dist/esm/Icon.js`: `size = 24`), so every separator overflowed
 *    its 12px box and collided with the neighbouring crumbs. The `<li>` keeps the
 *    BEM class for its colour/`rtl` behaviour, but the box is handed back to the
 *    icon: `h-auto w-auto` on the `<li>` plus `[&>svg]:size-3`.
 * 2. Row could not shrink and could wrap. `flex-wrap` plus `wrap-break-word` are
 *    wrong for a single-line header trail, and `breadcrumbs__item` is `shrink-0`
 *    while the `<ol>`'s parent is `flex-1` (`flex: 1 1 0%`, `min-width: auto`), so
 *    a long title (e.g. "Unmatched Payments") overflowed the bar and pushed the
 *    right-hand control group instead of wrapping. Fixed by making the shrink
 *    possible and the wrap impossible in one place: `min-w-0` on the nav/`<ol>`,
 *    `flex-nowrap`, and `truncate` on the current page.
 * 3. Current page was weight-inverted. `BreadcrumbPage` was `font-normal` while
 *    every sibling link is `.breadcrumbs__link` (`font-medium`), so the active
 *    crumb read lighter than its ancestors even though it was darker in colour.
 *    Now `font-medium` — same weight as HeroUI's own link in all states.
 * 4. Arbitrary gap ramp. `gap-1.5 sm:gap-2.5` widened the trail to 10px
 *    separations on desktop, against HeroUI's fixed `gap-1.5`. Now `gap-1.5`,
 *    matching `.breadcrumbs` (and `.breadcrumbs__item`'s `gap-1` inside an item).
 * 5. `BreadcrumbEllipsis` was `size-9` (36px) — that is shadcn's size for a
 *    clickable trigger in a 40px toolbar, but this export is a decorative,
 *    `aria-hidden` inline marker, so 36px stretched the text row. Now `size-5`
 *    (one `text-sm` line) with the icon at `size-4`.
 */

function Breadcrumb({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="breadcrumb"
      // `min-w-0` lets the trail shrink inside the header's `flex-1` group
      // instead of forcing the right-hand controls out of the bar (defect 2).
      className={cn(breadcrumbsVariants().base(), "min-w-0", className)}
      data-slot="breadcrumb"
      {...props}
    />
  );
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      // `flex-nowrap` (not `flex-wrap`): the trail is one line in the header, and
      // wrapping mid-crumb was what pushed the bar out of shape. Together with
      // `min-w-0` the row now shrinks and truncates instead of overflowing.
      // `gap-1.5` matches `.breadcrumbs`; the old `sm:gap-2.5` widened the ramp.
      className={cn(
        "flex min-w-0 flex-nowrap items-center gap-1.5 text-muted text-sm",
        className
      )}
      data-slot="breadcrumb-list"
      {...props}
    />
  );
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      // `.breadcrumbs__item` is `shrink-0`; re-enable shrinking so a long crumb
      // ellipsizes inside the bar rather than overflowing it (defect 2).
      className={cn(breadcrumbsVariants().item(), "min-w-0 shrink", className)}
      data-slot="breadcrumb-item"
      {...props}
    />
  );
}

function BreadcrumbLink({
  asChild,
  children,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean;
}) {
  const linkClassName = cn(
    breadcrumbsVariants().link(),
    "min-w-0 truncate",
    className
  );

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<Record<string, unknown>>;
    return React.cloneElement(child, {
      ...props,
      className: cn(
        linkClassName,
        typeof child.props.className === "string"
          ? child.props.className
          : undefined
      ),
      "data-slot": "breadcrumb-link",
    });
  }

  return (
    <a className={linkClassName} data-slot="breadcrumb-link" {...props}>
      {children}
    </a>
  );
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-current="page"
      aria-disabled="true"
      // `font-medium` (not `font-normal`): every sibling is a `.breadcrumbs__link`
      // at `font-medium`, so the current page used to read *lighter* than its own
      // ancestors (defect 3). `truncate` keeps it to one ellipsized line.
      className={cn("min-w-0 truncate font-medium text-foreground", className)}
      data-slot="breadcrumb-page"
      role="link"
      {...props}
    />
  );
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      aria-hidden="true"
      // `.breadcrumbs__separator` is HeroUI's *icon* class (`size-3`); on this
      // wrapper `<li>` its fixed 12px box clipped/collided with the default 24px
      // lucide chevron (defect 1). Keep the BEM class for colour + `rtl:rotate-180`,
      // but release the box (`h-auto w-auto`) and size the glyph itself to match
      // HeroUI's 12px separator.
      className={cn(
        breadcrumbsVariants().separator(),
        "h-auto w-auto [&>svg]:size-3",
        className
      )}
      data-slot="breadcrumb-separator"
      role="presentation"
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  const { t } = useTranslation("components");

  return (
    <span
      aria-hidden="true"
      // Inline, decorative marker — `size-5` keeps it on the `text-sm` line box
      // instead of the old `size-9` (36px) trigger-sized square (defect 5).
      className={cn(
        "flex size-5 shrink-0 items-center justify-center",
        className
      )}
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">{t("breadcrumb.more", "More")}</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
};
