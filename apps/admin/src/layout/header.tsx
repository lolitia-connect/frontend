"use client";

import { Header as HeroUIHeader, Tooltip } from "@heroui/react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import { Separator } from "@workspace/ui/components/separator";
import { SidebarTrigger } from "@workspace/ui/components/sidebar";

import { LanguageSwitch } from "@workspace/ui/composed/language-switch";
import { ThemeSwitch } from "@workspace/ui/composed/theme-switch";
import { Link } from "@workspace/ui/lib/router-compat";
import { usePathname } from "next/navigation";
import { Fragment, useMemo } from "react";
import { findNavByUrl, useNavs } from "./navs";
import TimezoneSwitch from "./timezone-switch";
import { UserNav } from "./user-nav";

/**
 * HeroUI v3 `Header` adoption (level A — the real `@heroui/react` `Header`).
 *
 * `Header` is `react-aria-components`' `Header` wrapped in `headerVariants`, so it
 * renders a real `<header>` with the `.header` BEM class. Unlike HeroUI's
 * `Breadcrumbs` root (see `packages/ui/src/components/breadcrumb.tsx`), it is a
 *leaf* component, not a collection root, so it renders its children normally —
 * verified by server-rendering it with a plain child:
 *
 *   renderToStaticMarkup(<Header className="my-shell-class"><span>KID</span></Header>)
 *   ->  <header class="header my-shell-class" data-slot="header"><span>KID</span></header>
 *
 * `headerVariants` itself is not called here: `HeroUIHeader` already applies
 * `headerVariants({ className })` internally, so calling it again would emit a
 * second, duplicate `header` base class.
 *
 * `.header` ships `w-full px-2 pt-1.5 pb-1 text-start text-xs font-medium
 * text-muted` (`@heroui/styles/dist/components/header.css`). The previous bare
 * `<header>` had none of the padding/typography, and this bar's own children own
 * their spacing (`px-3` groups) and type scale (breadcrumb `text-sm`, buttons).
 * The four negating utilities below therefore restore the exact prior rendering
 * rather than restyling the bar: `px-0 pt-0 pb-0` cancels the injected box, and
 * `text-foreground` + `[font-size:inherit]`/`[font-weight:inherit]` restore the
 * inherited `body` typography instead of `.header`'s `text-xs font-medium
 * text-muted`. Utilities win over HeroUI's `components` layer, so these override.
 *
 * The toggle's vertical separator explicitly keeps its 1px by 16px size and
 * centers itself, overriding HeroUI's default vertical `self-stretch` alignment.
 *
 * Behaviour and props are unchanged: same `<header>` element in the same place in
 * `layout/index.tsx`, same children, same sticky/z-index/height/background, and
 * the component still takes no props.
 *
 * Icon-only actions: the sidebar toggle is the one icon-only control owned by this
 * file, so it carries a HeroUI `Tooltip` (its `sr-only` label stays as the
 * accessible name). The remaining icon actions (`LanguageSwitch`,
 * `TimezoneSwitch`, `ThemeSwitch`, `UserNav`) are separate components that
 * already render this package's HeroUI-backed `Button`; no user chip or dropdown
 * menu is rendered directly here, so `Avatar`/`Dropdown` have no call site in this
 * file.
 */
export function Header() {
  const pathname = usePathname();
  const navs = useNavs();
  const items = useMemo(() => findNavByUrl(navs, pathname), [navs, pathname]);
  return (
    <HeroUIHeader className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-default-200 border-b bg-surface px-0 pt-0 pb-0 text-foreground [font-size:inherit] [font-weight:inherit]">
      <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
        <Tooltip>
          <SidebarTrigger />
          <Tooltip.Content>Toggle Sidebar</Tooltip.Content>
        </Tooltip>
        <Separator
          className="mr-2 h-4 w-px self-center"
          orientation="vertical"
        />
        <Breadcrumb className="overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <BreadcrumbList className="w-max shrink-0">
            {items.map((item, index) => (
              <Fragment key={item?.title}>
                {index !== items.length - 1 && (
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={item?.url || "/dashboard"}>{item?.title}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                )}
                {index < items.length - 1 && <BreadcrumbSeparator />}
                {index === items.length - 1 && (
                  <BreadcrumbPage>{item?.title}</BreadcrumbPage>
                )}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex shrink-0 items-center gap-2 px-3">
        <LanguageSwitch />
        <TimezoneSwitch />
        <ThemeSwitch />
        <UserNav />
      </div>
    </HeroUIHeader>
  );
}
