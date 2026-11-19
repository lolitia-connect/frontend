"use client";

import { buttonVariants, Dropdown, Header, Surface } from "@heroui/react";
import { buildHref, useSearch } from "@workspace/ui/lib/router-compat";
import { Check, ChevronDown, ListFilter } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

const logGroups = [
  {
    key: "account",
    routes: [
      { key: "login", url: "/dashboard/log/login" },
      { key: "register", url: "/dashboard/log/register" },
      { key: "subscribe", url: "/dashboard/log/subscribe" },
      { key: "resetSubscribe", url: "/dashboard/log/reset-subscribe" },
    ],
  },
  {
    key: "communication",
    routes: [
      { key: "email", url: "/dashboard/log/email" },
      { key: "mobile", url: "/dashboard/log/mobile" },
    ],
  },
  {
    key: "traffic",
    routes: [
      { key: "serverTraffic", url: "/dashboard/log/server-traffic" },
      { key: "subscribeTraffic", url: "/dashboard/log/subscribe-traffic" },
      { key: "trafficDetails", url: "/dashboard/log/traffic-details" },
    ],
  },
  {
    key: "finance",
    routes: [
      { key: "order", url: "/dashboard/log/order" },
      { key: "paymentUnmatched", url: "/dashboard/log/payment-unmatched" },
      { key: "balance", url: "/dashboard/log/balance" },
      { key: "commission", url: "/dashboard/log/commission" },
      { key: "gift", url: "/dashboard/log/gift" },
    ],
  },
] as const;

export function LogNavigation() {
  const { t } = useTranslation("log");
  const pathname = usePathname();
  const search = useSearch({ strict: false });

  return (
    <Surface className="flex flex-col gap-3 rounded-lg border p-3 shadow-xs">
      <div className="flex items-center gap-2">
        <ListFilter className="size-4 text-muted" />
        <div>
          <div className="font-medium text-sm">
            {t("navigation.title", "Log explorer")}
          </div>
          <div className="text-muted text-xs">
            {t(
              "navigation.description",
              "Switch log sources without leaving the current investigation."
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {logGroups.map((group) => {
          const activeRoute = group.routes.find(
            (route) => route.url === pathname
          );
          const groupLabel = t(`navigation.group.${group.key}`, group.key);

          return (
            <Dropdown key={group.key}>
              <Dropdown.Trigger
                className={buttonVariants({
                  variant: activeRoute ? "secondary" : "outline",
                  size: "md",
                  class: "inline-flex items-center",
                })}
              >
                <span>
                  {activeRoute
                    ? `${groupLabel} · ${t(`navigation.item.${activeRoute.key}`, activeRoute.key)}`
                    : groupLabel}
                </span>
                <ChevronDown className="size-4" />
              </Dropdown.Trigger>
              <Dropdown.Popover className="min-w-52" placement="bottom start">
                <Header>{groupLabel}</Header>
                <Dropdown.Menu aria-label="Actions">
                  {group.routes.map((route) => (
                    <Dropdown.Item
                      className="flex justify-between"
                      href={buildHref(route.url, search)}
                      key={route.key}
                    >
                      <span>
                        {t(`navigation.item.${route.key}`, route.key)}
                      </span>
                      {route.url === pathname && <Check className="size-4" />}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          );
        })}
      </div>
    </Surface>
  );
}
