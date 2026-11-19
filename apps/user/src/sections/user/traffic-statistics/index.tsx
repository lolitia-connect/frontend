"use client";

import {
  Card,
  ListBox,
  Select,
  SelectPopover as SelectContent,
  SelectIndicator,
  ListBoxItem as SelectItem,
  SelectTrigger,
  SelectValue,
  TabIndicator,
  Tabs,
  TabList as TabsList,
  TabListContainer as TabsListContainer,
  Tab as TabsTrigger,
} from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { BlockLoading } from "@workspace/ui/composed/block-loading";
import { Icon } from "@workspace/ui/composed/icon";
import { getUserTrafficStats } from "@workspace/ui/services/user/traffic";
import { queryUserSubscribe } from "@workspace/ui/services/user/user";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import TrafficRatioChart from "./traffic-ratio-chart";
import TrafficStatsCards from "./traffic-stats-cards";
import TrafficTrendChart from "./traffic-trend-chart";

export default function TrafficStatistics() {
  const { t } = useTranslation("traffic");
  const [days, setDays] = useState<7 | 30>(7);
  const [selectedSubscribeId, setSelectedSubscribeId] = useState<string | null>(
    null
  );

  // 查询用户订阅列表
  const { data: userSubscribe = [] } = useQuery({
    queryKey: ["queryUserSubscribe"],
    queryFn: async () => {
      const { data } = await queryUserSubscribe();
      return data.data?.list || [];
    },
  });

  // 使用 id_str 字段，避免 JavaScript 精度丢失
  const activeSubscribeId =
    selectedSubscribeId || userSubscribe[0]?.id_str || null;

  // 查询流量统计数据
  const { data: trafficStats, isLoading } = useQuery({
    queryKey: ["getUserTrafficStats", activeSubscribeId, days],
    queryFn: async () => {
      if (!activeSubscribeId) return null;
      const { data } = await getUserTrafficStats({
        user_subscribe_id: activeSubscribeId,
        days,
      });
      return data.data;
    },
    enabled: !!activeSubscribeId,
  });

  return (
    <div className="flex min-h-[calc(100vh-64px-58px-32px-114px)] w-full flex-col gap-4 overflow-x-hidden">
      {/* 标题和控制栏 */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="flex items-center gap-1.5 font-semibold">
          <Icon className="size-5" icon="uil:chart-line" />
          {t("title", "Traffic Statistics")}
        </h2>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          {/* 订阅选择 */}
          {userSubscribe.length > 1 && (
            <Select
              aria-label={t("selectSubscription", "Select Subscription")}
              onSelectionChange={(key) => {
                if (key != null)
                  ((value) => setSelectedSubscribeId(value))(String(key));
              }}
              placeholder={t("selectSubscription", "Select Subscription")}
              selectedKey={
                (activeSubscribeId || undefined) == null
                  ? undefined
                  : String(activeSubscribeId || undefined)
              }
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
                <SelectIndicator />
              </SelectTrigger>
              <SelectContent>
                <ListBox>
                  {userSubscribe.map((sub) => (
                    <SelectItem id={sub.id_str} key={sub.id}>
                      {sub.subscribe.name}
                    </SelectItem>
                  ))}
                </ListBox>
              </SelectContent>
            </Select>
          )}
          {/* 时间范围切换 */}
          <Tabs
            className="min-w-0 max-w-full"
            onSelectionChange={(key) =>
              ((value) => setDays(Number(value) as 7 | 30))(String(key))
            }
            selectedKey={String(days)}
          >
            <TabsListContainer className="min-w-0 max-w-full">
              <TabsList aria-label={t("sections", "Sections")}>
                <TabsTrigger className="w-auto flex-1 whitespace-nowrap" id="7">
                  {t("days7", "7 Days")}
                  <TabIndicator />
                </TabsTrigger>
                <TabsTrigger
                  className="w-auto flex-1 whitespace-nowrap"
                  id="30"
                >
                  {t("days30", "30 Days")}
                  <TabIndicator />
                </TabsTrigger>
              </TabsList>
            </TabsListContainer>
          </Tabs>
        </div>
      </div>

      {/* 统计卡片 */}
      {trafficStats && <TrafficStatsCards stats={trafficStats} />}

      {/* 图表区域 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 流量趋势图 */}
        <Card>
          <Card.Header>
            <Card.Title className="text-base">
              {t("trafficTrend", "Traffic Trend")}
            </Card.Title>
          </Card.Header>
          <Card.Content>
            {isLoading ? (
              <BlockLoading minHeight="300px" />
            ) : trafficStats && trafficStats.list.length > 0 ? (
              <TrafficTrendChart data={trafficStats.list} />
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted">
                {t("noData", "No traffic data available")}
              </div>
            )}
          </Card.Content>
        </Card>

        {/* 流量占比图 */}
        <Card>
          <Card.Header>
            <Card.Title className="text-base">
              {t("trafficRatio", "Upload/Download Ratio")}
            </Card.Title>
          </Card.Header>
          <Card.Content>
            {isLoading ? (
              <BlockLoading minHeight="300px" />
            ) : trafficStats &&
              (trafficStats.total_upload > 0 ||
                trafficStats.total_download > 0) ? (
              <TrafficRatioChart
                download={trafficStats.total_download}
                upload={trafficStats.total_upload}
              />
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted">
                {t("noData", "No traffic data available")}
              </div>
            )}
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
