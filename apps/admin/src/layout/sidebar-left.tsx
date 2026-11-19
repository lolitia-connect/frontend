"use client";

import { Focusable, Tooltip } from "@heroui/react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar";
import { Icon } from "@workspace/ui/composed/icon";
import { Link } from "@workspace/ui/lib/router-compat";
import { cn } from "@workspace/ui/lib/utils";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { useGlobalStore } from "@/stores/global";
import { type NavItem, useNavs } from "./navs";

function hasChildren(obj: any): obj is { items: any[] } {
  return (
    obj && Array.isArray((obj as any).items) && (obj as any).items.length > 0
  );
}

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { common } = useGlobalStore();
  const { site } = common;
  const navs = useNavs();
  const pathname = usePathname();
  const { state, isMobile } = useSidebar();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    setOpenGroups((prev) => {
      const next: Record<string, boolean> = { ...prev };
      navs.forEach((nav) => {
        if (hasChildren(nav) && next[nav.title] === undefined) {
          next[nav.title] = nav.defaultOpen ?? true;
        }
      });
      return next;
    });
  }, [navs]);

  const handleToggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const normalize = (p: string) =>
    p.endsWith("/") && p !== "/" ? p.replace(/\/+$/, "") : p;
  const isActiveUrl = (url: string) => {
    const path = normalize(pathname);
    const target = normalize(url);
    if (target === "/dashboard") return path === target;
    if (path === target) return true;
    return path.startsWith(`${target}/`);
  };

  const isNavActive = (nav: NavItem): boolean =>
    (nav.url ? isActiveUrl(nav.url) : false) ||
    (nav.activeUrls?.some(isActiveUrl) ?? false) ||
    (nav.items?.some(isNavActive) ?? false);

  const isGroupActive = (nav: NavItem) => isNavActive(nav);

  React.useEffect(() => {
    setOpenGroups((prev) => {
      const next: Record<string, boolean> = { ...prev };
      navs.forEach((nav) => {
        if (hasChildren(nav) && isGroupActive(nav)) next[nav.title] = true;
      });
      return next;
    });
  }, [pathname, navs]);

  const renderCollapsedFlyout = (nav: NavItem) => {
    const ParentButton = (
      <SidebarMenuButton
        aria-label={nav.title}
        className="h-8 justify-center"
        isActive={false}
        size="sm"
      >
        {"url" in nav && nav.url ? (
          <Link to={nav.url as string}>
            {"icon" in nav && (nav as any).icon ? (
              <Icon className="size-4" icon={(nav as any).icon} />
            ) : null}
          </Link>
        ) : "icon" in nav && (nav as any).icon ? (
          <Icon className="size-4" icon={(nav as any).icon} />
        ) : null}
      </SidebarMenuButton>
    );

    if (!hasChildren(nav)) return ParentButton;

    return (
      <Tooltip closeDelay={200} delay={40}>
        <Focusable>{ParentButton}</Focusable>
        <Tooltip.Content
          className="z-[9999] w-64 p-0"
          containerPadding={8}
          offset={10}
          placement="right"
        >
          <div className="flex items-center gap-2 border-b px-3 py-2">
            {"icon" in nav && (nav as any).icon ? (
              <Icon className="size-4" icon={(nav as any).icon} />
            ) : null}
            <span className="truncate font-medium text-muted text-xs">
              {nav.title}
            </span>
          </div>

          <ul className="p-1">
            {nav.items?.map((item: any) => (
              <li key={item.title}>
                <Link
                  className={[
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                    isNavActive(item)
                      ? "bg-primary-50 font-medium text-primary-600 dark:bg-default dark:text-foreground"
                      : "text-default-600 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-default dark:hover:text-foreground",
                  ].join(" ")}
                  to={item.url}
                >
                  {item.icon && <Icon className="size-4" icon={item.icon} />}
                  <span className="truncate">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Tooltip.Content>
      </Tooltip>
    );
  };

  return (
    <Sidebar className="border-r-0" collapsible="icon" {...props}>
      <SidebarHeader className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="h-10" size="sm">
              <Link to="/">
                {/* In collapsed (icon-rail) mode this row is clamped to a 32px
                    square by the button variants, so the text block has to be
                    hidden explicitly. Without this the two label spans stayed in
                    the flex row and, because the button only clips overflow, they
                    painted over/next to the logo instead of disappearing — the
                    misaligned element at the sidebar's top-left. */}
                <div className="flex aspect-square size-6 shrink-0 items-center justify-center rounded-lg">
                  <img
                    alt="logo"
                    className="size-full"
                    height={24}
                    src={site.site_logo || "/favicon.svg"}
                    width={24}
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold text-xs">
                    {site.site_name}
                  </span>
                  <span className="truncate text-xs opacity-70">
                    {site.site_desc}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <SidebarMenu>
          {!isMobile && state === "collapsed"
            ? navs.map((nav) => (
                <SidebarMenuItem className="mx-auto" key={nav.title}>
                  {renderCollapsedFlyout(nav)}
                </SidebarMenuItem>
              ))
            : navs.map((nav) => {
                if (hasChildren(nav)) {
                  const isOpen = openGroups[nav.title] ?? false;
                  return (
                    <SidebarGroup className={cn("py-1")} key={nav.title}>
                      <SidebarMenuButton
                        className={cn(
                          "group/nav-label mb-2 flex h-8 w-full items-center justify-between text-default-600 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-default dark:hover:text-foreground"
                        )}
                        isActive={false}
                        onClick={() => handleToggleGroup(nav.title)}
                        size="sm"
                        style={{ fontWeight: 500 }}
                        tabIndex={0}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          {"icon" in nav && (nav as any).icon ? (
                            <Icon
                              className="size-4 shrink-0"
                              icon={(nav as any).icon}
                            />
                          ) : null}
                          <span className="truncate text-sm">{nav.title}</span>
                        </span>
                        <Icon
                          className={`ml-2 size-4 transition-transform ${isOpen ? "" : "-rotate-90"}`}
                          icon="mdi:chevron-down"
                        />
                      </SidebarMenuButton>
                      {isOpen && (
                        <SidebarGroupContent className="px-4">
                          <SidebarMenu>
                            {nav.items?.map((item: any) => (
                              <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                  asChild
                                  className="h-8"
                                  isActive={isNavActive(item)}
                                  size="sm"
                                  tooltip={item.title}
                                >
                                  <Link to={item.url}>
                                    {item.icon && (
                                      <Icon
                                        className="size-4"
                                        icon={item.icon}
                                      />
                                    )}
                                    <span className="text-sm">
                                      {item.title}
                                    </span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            ))}
                          </SidebarMenu>
                        </SidebarGroupContent>
                      )}
                    </SidebarGroup>
                  );
                }

                return (
                  <SidebarGroup className="py-1" key={nav.title}>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            asChild={"url" in nav && !!(nav as any).url}
                            className="h-8"
                            isActive={
                              "url" in nav && (nav as any).url
                                ? isActiveUrl((nav as any).url)
                                : false
                            }
                            size="sm"
                            tooltip={nav.title}
                          >
                            {"url" in nav && (nav as any).url ? (
                              <Link to={(nav as any).url}>
                                {"icon" in nav && (nav as any).icon ? (
                                  <Icon
                                    className="size-4"
                                    icon={(nav as any).icon}
                                  />
                                ) : null}
                                <span className="text-sm">{nav.title}</span>
                              </Link>
                            ) : (
                              <>
                                {"icon" in nav && (nav as any).icon ? (
                                  <Icon
                                    className="size-4"
                                    icon={(nav as any).icon}
                                  />
                                ) : null}
                                <span className="text-sm">{nav.title}</span>
                              </>
                            )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                );
              })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
