"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  TabIndicator,
  Tabs,
  TabList as TabsList,
  TabListContainer as TabsListContainer,
  Tab as TabsTrigger,
} from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
// (Select imports removed)
import { Separator } from "@workspace/ui/components/separator";
import Empty from "@workspace/ui/composed/empty";
import { Icon } from "@workspace/ui/composed/icon";
import { Link } from "@workspace/ui/lib/router-compat";
import {
  getConsoleServer as queryServerTotalData,
  getConsoleTicket as queryTicketWaitReply,
} from "@workspace/ui/services/admin/admin";
import { formatBytes } from "@workspace/ui/utils/formatting";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import { UserDetail, UserSubscribeDetail } from "@/sections/user/user-detail";
import { RevenueStatisticsCard } from "./revenue-statistics-card";
import SystemVersionCard from "./system-version-card";
import { UserStatisticsCard } from "./user-statistics-card";

export default function Statistics() {
  const { t } = useTranslation("dashboard");

  const { data: TicketTotal } = useQuery({
    queryKey: ["queryTicketWaitReply"],
    queryFn: async () => {
      const { data } = await queryTicketWaitReply();
      return data.data?.count;
    },
  });
  const { data: ServerTotal } = useQuery({
    queryKey: ["queryServerTotalData"],
    queryFn: async () => {
      const { data } = await queryServerTotalData();
      return data.data;
    },
  });

  const [timeFrame, setTimeFrame] = useState<string | "today" | "yesterday">(
    "today"
  );

  const trafficData = {
    nodes: {
      today:
        ServerTotal?.server_traffic_ranking_today?.map((item) => ({
          name: item.name,
          traffic: item.download + item.upload,
        })) || [],
      yesterday:
        ServerTotal?.server_traffic_ranking_yesterday?.map((item) => ({
          name: item.name,
          traffic: item.download + item.upload,
        })) || [],
    },
    users: {
      today:
        ServerTotal?.user_traffic_ranking_today?.map((item) => ({
          name: item.sid,
          uid: item.uid,
          traffic: item.download + item.upload,
        })) || [],
      yesterday:
        ServerTotal?.user_traffic_ranking_yesterday?.map((item) => ({
          name: item.sid,
          uid: item.uid,
          traffic: item.download + item.upload,
        })) || [],
    },
  };

  const TrafficRankCard = ({ type }: { type: "nodes" | "users" }) => {
    const currentData = trafficData[type][timeFrame as "today" | "yesterday"];

    return (
      <Card>
        <CardHeader className="!flex-row flex items-center justify-between gap-2">
          <CardTitle className="min-w-0">
            {type === "nodes"
              ? t("nodeTraffic", "Node Traffic")
              : t("userTraffic", "User Traffic")}
          </CardTitle>
          <Tabs
            className="min-w-0 max-w-full shrink-0"
            onSelectionChange={(key) => setTimeFrame(String(key))}
            selectedKey={timeFrame}
          >
            <TabsListContainer className="min-w-0 max-w-full">
              <TabsList aria-label={t("sections", "Sections")}>
                <TabsTrigger
                  className="w-auto flex-1 whitespace-nowrap"
                  id="today"
                >
                  {t("today", "Today")}
                  <TabIndicator />
                </TabsTrigger>
                <TabsTrigger
                  className="w-auto flex-1 whitespace-nowrap"
                  id="yesterday"
                >
                  {t("yesterday", "Yesterday")}
                  <TabIndicator />
                </TabsTrigger>
              </TabsList>
            </TabsListContainer>
          </Tabs>
        </CardHeader>
        <CardContent className="h-80">
          {currentData.length > 0 ? (
            <ChartContainer
              className="max-h-80"
              config={{
                traffic: {
                  label: t("traffic", "Traffic"),
                  // `--primary` was the legacy bridge alias of `--accent`; read
                  // HeroUI's brand token directly instead of through the bridge.
                  color: "var(--accent)",
                },
                type: {
                  label: t("type", "Type"),
                  // `--muted-foreground` is defined NOWHERE (neither HeroUI nor
                  // the bridge) so this chart series had no colour at all.
                  // HeroUI's quiet-text token is `--muted`.
                  color: "var(--muted)",
                },
                label: {
                  color: "var(--foreground)",
                },
              }}
            >
              <BarChart data={currentData} height={400} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  axisLine={false}
                  tickFormatter={(value) => formatBytes(value || 0)}
                  tickLine={false}
                  type="number"
                />
                <YAxis
                  axisLine={false}
                  dataKey="name"
                  interval={0}
                  tickFormatter={(_value, index) => String(index + 1)}
                  tickLine={false}
                  tickMargin={0}
                  type="category"
                  width={15}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatBytes(Number(value) || 0)}
                      label={true}
                      labelFormatter={(label, [payload]) =>
                        type === "nodes" ? (
                          `${t("nodes", "Nodes")}: ${label}`
                        ) : (
                          <>
                            {payload?.payload.uid ? (
                              <>
                                <div className="w-80">
                                  <UserDetail id={payload.payload.uid} />
                                </div>
                                <Separator className="my-2" />
                              </>
                            ) : null}
                            <div className="w-80">
                              <UserSubscribeDetail
                                enabled={true}
                                id={payload?.payload.name}
                              />
                            </div>
                            <Separator className="my-2" />
                            <div>{`${t("users", "Users")}: ${label}`}</div>
                          </>
                        )
                      }
                    />
                  }
                  trigger="hover"
                />
                <Bar
                  dataKey="traffic"
                  fill="var(--accent)"
                  radius={[0, 4, 4, 0]}
                >
                  {/* The series name is drawn *on top of* the rose bar, so it
                      has to read as text on the brand fill — `--foreground`
                      (near-black) was unreadable there. */}
                  <LabelList
                    className="fill-accent-foreground"
                    dataKey="name"
                    fontSize={12}
                    offset={8}
                    position="insideLeft"
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <Empty />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

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
                    <div className="mb-1 font-bold text-2xl text-foreground">
                      {item.value}
                    </div>
                    <div className="h-4 text-muted text-xs">
                      {item.subtitle}
                    </div>
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
        <RevenueStatisticsCard />
        <UserStatisticsCard />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <TrafficRankCard type="nodes" />
        <TrafficRankCard type="users" />
      </div>
    </>
  );
}
