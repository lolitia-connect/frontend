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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import { Separator } from "@workspace/ui/components/separator";
import Empty from "@workspace/ui/composed/empty";
import { formatBytes } from "@workspace/ui/utils/formatting";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

const UserDetail = dynamic(() =>
  import("@/sections/user/user-detail").then((module) => module.UserDetail)
);
const UserSubscribeDetail = dynamic(() =>
  import("@/sections/user/user-detail").then(
    (module) => module.UserSubscribeDetail
  )
);

export type TrafficTimeFrame = "today" | "yesterday";

export default function TrafficRankCard({
  type,
  data,
  timeFrame,
  onTimeFrameChange,
}: {
  type: "nodes" | "users";
  data?: API.ServerTotalDataResponse;
  timeFrame: TrafficTimeFrame;
  onTimeFrameChange: (timeFrame: TrafficTimeFrame) => void;
}) {
  const { t } = useTranslation("dashboard");
  const currentData = useMemo(() => {
    if (type === "nodes") {
      const ranking =
        timeFrame === "today"
          ? data?.server_traffic_ranking_today
          : data?.server_traffic_ranking_yesterday;
      return (
        ranking?.map((item) => ({
          name: item.name,
          traffic: item.download + item.upload,
        })) ?? []
      );
    }
    const ranking =
      timeFrame === "today"
        ? data?.user_traffic_ranking_today
        : data?.user_traffic_ranking_yesterday;
    return (
      ranking?.map((item) => ({
        name: item.sid,
        uid: item.uid,
        traffic: item.download + item.upload,
      })) ?? []
    );
  }, [data, timeFrame, type]);

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
          onSelectionChange={(key) => {
            if (key === "today" || key === "yesterday") onTimeFrameChange(key);
          }}
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
                color: "var(--accent)",
              },
              type: { label: t("type", "Type"), color: "var(--muted)" },
              label: { color: "var(--foreground)" },
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
              <Bar dataKey="traffic" fill="var(--accent)" radius={[0, 4, 4, 0]}>
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
}
