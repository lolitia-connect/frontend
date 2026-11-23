"use client";

import { Card, CardContent } from "@heroui/react";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Icon } from "@workspace/ui/composed/icon";
import { useQuery } from "@workspace/ui/hooks/query";
import { Link } from "@workspace/ui/lib/router-compat";
import {
  getConsoleServer as queryServerTotalData,
  getConsoleTicket as queryTicketWaitReply,
} from "@workspace/ui/services/admin/admin";
import { formatBytes } from "@workspace/ui/utils/formatting";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChartPlaceholder, DeferredChart } from "./deferred-chart";
import SystemVersionCard from "./system-version-card";
import type { TrafficTimeFrame } from "./traffic-rank-card";

const RevenueStatisticsCard = dynamic(
  () =>
    import("./revenue-statistics-card").then(
      (module) => module.RevenueStatisticsCard
    ),
  { ssr: false, loading: () => <ChartPlaceholder tall /> }
);
const UserStatisticsCard = dynamic(
  () =>
    import("./user-statistics-card").then(
      (module) => module.UserStatisticsCard
    ),
  { ssr: false, loading: () => <ChartPlaceholder tall /> }
);
const TrafficRankCard = dynamic(() => import("./traffic-rank-card"), {
  ssr: false,
  loading: () => <ChartPlaceholder />,
});

export default function Statistics() {
  const { t } = useTranslation("dashboard");

  const { data: TicketTotal, isLoading: loadingTickets } = useQuery({
    queryKey: ["queryTicketWaitReply"],
    queryFn: async () => {
      const { data } = await queryTicketWaitReply();
      return data.data?.count;
    },
  });
  const { data: ServerTotal, isLoading: loadingServers } = useQuery({
    queryKey: ["queryServerTotalData"],
    queryFn: async () => {
      const { data } = await queryServerTotalData();
      return data.data;
    },
  });

  const [timeFrame, setTimeFrame] = useState<TrafficTimeFrame>("today");

  return (
    <>
      <div className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: t("onlineUsersCount", "Online Users"),
            value: ServerTotal?.online_users || 0,
            subtitle: t("currentlyOnline", "Currently Online"),
            icon: "uil:users-alt",
            href: "/dashboard/servers",
          },
          {
            title: t("todayTraffic", "Today Traffic"),
            value: formatBytes(
              (ServerTotal?.today_upload || 0) +
                (ServerTotal?.today_download || 0)
            ),
            subtitle: `↑${formatBytes(ServerTotal?.today_upload || 0)} ↓${formatBytes(ServerTotal?.today_download || 0)}`,
            icon: "uil:exchange-alt",
          },
          {
            title: t("monthTraffic", "Month Traffic"),
            value: formatBytes(
              (ServerTotal?.monthly_upload || 0) +
                (ServerTotal?.monthly_download || 0)
            ),
            subtitle: `↑${formatBytes(ServerTotal?.monthly_upload || 0)} ↓${formatBytes(ServerTotal?.monthly_download || 0)}`,
            icon: "uil:cloud-data-connection",
          },
          {
            title: t("totalServers", "Total Servers"),
            value:
              (ServerTotal?.online_servers || 0) +
              (ServerTotal?.offline_servers || 0),
            subtitle: `${t("online", "Online")} ${ServerTotal?.online_servers || 0} ${t("offline", "Offline")} ${ServerTotal?.offline_servers || 0}`,
            icon: "uil:server-network",
            href: "/dashboard/servers",
          },
          {
            // The only genuinely alarming metric, so it keeps a semantic
            // warning colour instead of the shared rose icon plate.
            title: t("pendingTickets", "Pending Tickets"),
            value: TicketTotal || 0,
            subtitle: t("pending", "Pending"),
            icon: "uil:clipboard-notes",
            href: "/dashboard/ticket",
            alert: true,
          },
        ].map((item, index) => (
          <Link
            className={item.href ? "" : "pointer-events-none"}
            key={index}
            to={item.href || "#"}
          >
            <Card
              className={`group h-full ${item.href ? "cursor-pointer" : ""}`}
            >
              <CardContent className="flex flex-1 items-center justify-center">
                <div className="flex w-full items-center justify-between">
                  <div className="flex-1">
                    <p className="mb-2 font-medium text-default-600 text-sm">
                      {item.title}
                    </p>
                    {(item.alert ? loadingTickets : loadingServers) ? (
                      <Skeleton className="h-12 w-24" />
                    ) : (
                      <>
                        <div className="mb-1 font-bold text-2xl text-foreground">
                          {item.value}
                        </div>
                        <div className="h-4 text-muted text-xs">
                          {item.subtitle}
                        </div>
                      </>
                    )}
                  </div>
                  <div
                    className={`rounded-full p-3 transition-transform duration-300 group-hover:scale-110 ${
                      item.alert
                        ? "bg-warning-soft text-warning-soft-foreground"
                        : "bg-primary-50 text-primary-500"
                    }`}
                  >
                    <Icon className="h-6 w-6" icon={item.icon} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        <SystemVersionCard />
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-2">
        <DeferredChart tall>
          <RevenueStatisticsCard />
        </DeferredChart>
        <DeferredChart tall>
          <UserStatisticsCard />
        </DeferredChart>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {(["nodes", "users"] as const).map((type) => (
          <DeferredChart key={type}>
            {loadingServers ? (
              <ChartPlaceholder />
            ) : (
              <TrafficRankCard
                data={ServerTotal}
                onTimeFrameChange={setTimeFrame}
                timeFrame={timeFrame}
                type={type}
              />
            )}
          </DeferredChart>
        ))}
      </div>
    </>
  );
}
