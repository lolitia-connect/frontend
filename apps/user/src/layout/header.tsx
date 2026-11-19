"use client";

import { Header as HeroUIHeader } from "@heroui/react";
import { buttonVariants } from "@workspace/ui/components/button";
import { LanguageSwitch } from "@workspace/ui/composed/language-switch";
import { ThemeSwitch } from "@workspace/ui/composed/theme-switch";
import { Link } from "@workspace/ui/lib/router-compat";
import { useTranslation } from "react-i18next";
import { useGlobalStore } from "@/stores/global";
import { UserNav } from "./user-nav";

/**
 * HeroUI v3 `Header` adoption (level A — the real `@heroui/react` `Header`).
 *
 * `Header` is `react-aria-components`' `Header` wrapped in `headerVariants`, so it
 * renders a real `<header>` carrying the `.header` BEM class. It is a *leaf*
 * component (unlike HeroUI's `Breadcrumbs` root), so it renders its children
 * normally — verified by server-rendering it with a plain child:
 *
 *   renderToStaticMarkup(<Header className="my-shell-class"><span>KID</span></Header>)
 *   ->  <header class="header my-shell-class" data-slot="header"><span>KID</span></header>
 *
 * `headerVariants` is not invoked here: `HeroUIHeader` already applies
 * `headerVariants({ className })` internally, so a second call would emit the
 * duplicate `header` base class.
 *
 * `.header` ships `w-full px-2 pt-1.5 pb-1 text-start text-xs font-medium
 * text-muted` (`@heroui/styles/dist/components/header.css`). This bar's box and
 * type come from its own children — the inner `.container` owns the horizontal
 * padding and the logo owns `font-bold text-lg` — so the injected
 * `px-2 pt-1.5 pb-1` would shift the container inward and `text-muted` would
 * recolour the logo, which has no colour class of its own and previously
 * inherited `text-foreground` from `body`. The negating utilities below
 * (`px-0 pt-0 pb-0`, `text-foreground [font-size:inherit] [font-weight:inherit]`)
 * restore the exact previous rendering instead of restyling the bar. Utilities
 * are emitted above HeroUI's `components` layer, so they win.
 *
 * Behaviour and props are unchanged: same public `Header` default export, same
 * `<header>` in `app/(main)/layout.tsx`, same sticky/z-index/border/backdrop-blur,
 * same inner `.container`/`h-16`/`justify-between`, same nav wrapper classes (kept
 * verbatim), same `LanguageSwitch`/`ThemeSwitch`/`UserNav` order, and the same
 * conditional login/register `Link` styled by `buttonVariants`. The component
 * still takes no props and still reads `site.site_logo`/`site.site_name` for the
 * logo exactly as before.
 *
 * No HeroUI `Button`/`Avatar`/`Dropdown` is introduced directly here: the icon
 * actions and the user chip are owned by the already-HeroUI-backed
 * `LanguageSwitch`, `ThemeSwitch` and `UserNav` components, and the only raw
 * control is the login/register link, which is an `<a>` styled with
 * `buttonVariants` (adding `Button` would change it from a link to a pressable).
 */
export default function Header() {
  const { t } = useTranslation("components");

  const { common, user } = useGlobalStore();
  const { site } = common;
  const Logo = (
    <Link className="flex items-center gap-2 font-bold text-lg" to="/">
      {site.site_logo && (
        <img
          alt={site.site_name || ""}
          height={36}
          src={site.site_logo}
          width={36}
        />
      )}
      <span className="">{site.site_name}</span>
    </Link>
  );
  return (
    <HeroUIHeader className="sticky top-0 z-50 border-default-200 border-b bg-surface/80 px-0 pt-0 pb-0 text-foreground backdrop-blur-md [font-size:inherit] [font-weight:inherit]">
      <div className="container flex h-16 items-center justify-between">
        <nav className="flex-col gap-6 font-medium text-lg md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          {Logo}
        </nav>
        <div className="flex flex-1 items-center justify-end gap-2">
          <LanguageSwitch />
          <ThemeSwitch />
          <UserNav />
          {!user && (
            <Link
              className={buttonVariants({
                className: "shrink-0 whitespace-nowrap",
                size: "sm",
              })}
              to="/auth"
            >
              <span className="md:hidden">
                {t("loginRegisterMobile", "Console")}
              </span>
              <span className="hidden md:inline">
                {t("loginRegister", "Login / Register")}
              </span>
            </Link>
          )}
        </div>
      </div>
    </HeroUIHeader>
  );
}
