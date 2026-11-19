"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  TabIndicator,
  Tabs,
  TabPanel as TabsContent,
  TabList as TabsList,
  TabListContainer as TabsListContainer,
  Tab as TabsTrigger,
} from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import { Separator } from "@workspace/ui/components/separator";
import Empty from "@workspace/ui/composed/empty";
import { getConsoleUser as queryUserStatistics } from "@workspace/ui/services/admin/admin";
import { useTranslation } from "react-i18next";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Pie,
  PieChart,
  XAxis,
} from "recharts";

export function UserStatisticsCard() {
  const { t, i18n } = useTranslation("dashboard");
  const locale = i18n.language;

  const UserStatisticsConfig = {
    register: {
      label: t("register", "Register"),
      color: "var(--accent)",
    },
    new_purchase: {
      label: t("newPurchase", "New Purchase"),
      color: "var(--primary-400)",
    },
    repurchase: {
      label: t("repurchase", "Repurchase"),
      color: "var(--primary-700)",
    },
  };

  const { data: UserStatistics } = useQuery({
    queryKey: ["queryUserStatistics"],
    queryFn: async () => {
      const { data } = await queryUserStatistics();
      return data.data;
    },
  });

  return (
    <Tabs className="min-w-0 max-w-full" defaultSelectedKey="today">
      <Card className="h-full pb-0">
        <CardHeader className="!flex-row flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="min-w-0">
            {t("userTitle", "User Statistics")}
          </CardTitle>
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
                id="month"
              >
                {t("month", "Month")}
                <TabIndicator />
              </TabsTrigger>
              <TabsTrigger
                className="w-auto flex-1 whitespace-nowrap"
                id="total"
              >
                {t("total", "Total")}
                <TabIndicator />
              </TabsTrigger>
            </TabsList>
          </TabsListContainer>
        </CardHeader>

        <TabsContent className="h-full" id="today">
          <CardContent className="h-80">
            {UserStatistics?.today.register ||
            UserStatistics?.today.new_order_users ||
            UserStatistics?.today.renewal_order_users ? (
              <ChartContainer
                className="mx-auto max-h-80"
                config={UserStatisticsConfig}
              >
                <PieChart>
                  <ChartLegend content={<ChartLegendContent />} />
                  <ChartTooltip
                    content={<ChartTooltipContent hideLabel />}
                    cursor={false}
                  />
                  <Pie
                    data={[
                      {
                        type: "register",
                        value: UserStatistics?.today.register || 0,
                        fill: "var(--color-register)",
                      },
                      {
                        type: "new_purchase",
                        value: UserStatistics?.today.new_order_users || 0,
                        fill: "var(--color-new_purchase)",
                      },
                      {
                        type: "repurchase",
                        value: UserStatistics?.today.renewal_order_users || 0,
                        fill: "var(--color-repurchase)",
                      },
                    ]}
                    dataKey="value"
                    innerRadius={50}
                    nameKey="type"
                    strokeWidth={5}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          const total =
                            (UserStatistics?.today.register || 0) +
                            (UserStatistics?.today.new_order_users || 0) +
                            (UserStatistics?.today.renewal_order_users || 0);
                          return (
                            <text
                              dominantBaseline="middle"
                              textAnchor="middle"
                              x={viewBox.cx}
                              y={viewBox.cy}
                            >
                              <tspan
                                className="fill-foreground font-bold text-3xl"
                                x={viewBox.cx}
                                y={viewBox.cy}
                              >
                                {total}
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <Empty />
              </div>
            )}
          </CardContent>
          <CardFooter className="!py-5 flex flex-row border-t">
            <div className="flex w-full items-center gap-2">
              <div className="grid flex-1 auto-rows-min gap-0.5">
                <div className="text-muted text-xs">
                  {UserStatisticsConfig.register.label}
                </div>
                <div className="font-bold text-xl tabular-nums leading-none">
                  {UserStatistics?.today.register}
                </div>
              </div>
              <Separator className="!h-10 mx-2 w-px" orientation="vertical" />
              <div className="grid flex-1 auto-rows-min gap-0.5">
                <div className="text-muted text-xs">
                  {UserStatisticsConfig.new_purchase.label}
                </div>
                <div className="font-bold text-xl tabular-nums leading-none">
                  {UserStatistics?.today.new_order_users}
                </div>
              </div>
              <Separator className="!h-10 mx-2 w-px" orientation="vertical" />
              <div className="grid flex-1 auto-rows-min gap-0.5">
                <div className="text-muted text-xs">
                  {UserStatisticsConfig.repurchase.label}
                </div>
                <div className="font-bold text-xl tabular-nums leading-none">
                  {UserStatistics?.today.renewal_order_users}
                </div>
              </div>
            </div>
          </CardFooter>
        </TabsContent>

        <TabsContent className="h-full" id="month">
          <CardContent className="h-80">
            {UserStatistics?.monthly.list &&
            UserStatistics?.monthly.list.length > 0 ? (
              <ChartContainer
                className="max-h-80 w-full"
                config={UserStatisticsConfig}
              >
                <BarChart
                  accessibilityLayer
                  data={
                    UserStatistics?.monthly.list?.map((item) => ({
                      date: item.date,
                      register: item.register,
                      new_purchase: item.new_order_users,
                      repurchase: item.renewal_order_users,
                    })) || []
                  }
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    axisLine={false}
                    dataKey="date"
                    tickFormatter={(value) => {
                      const [year, month, day] = value.split("-");
                      return new Date(year, month - 1, day).toLocaleDateString(
                        locale,
                        {
                          month: "short",
                          day: "numeric",
                        }
                      );
                    }}
                    tickLine={false}
                    tickMargin={10}
                  />
                  <Bar
                    dataKey="register"
                    fill="var(--color-register)"
                    radius={[0, 0, 4, 4]}
                    stackId="a"
                  />
                  <Bar
                    dataKey="new_purchase"
                    fill="var(--color-new_purchase)"
                    radius={0}
                    stackId="a"
                  />
                  <Bar
                    dataKey="repurchase"
                    fill="var(--color-repurchase)"
                    radius={[4, 4, 0, 0]}
                    stackId="a"
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={false}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <Empty />
              </div>
            )}
          </CardContent>
          <CardFooter className="!py-5 flex flex-row border-t">
            <div className="flex w-full items-center gap-2">
              <div className="grid flex-1 auto-rows-min gap-0.5">
                <div className="text-muted text-xs">
                  {UserStatisticsConfig.register.label}
                </div>
                <div className="font-bold text-xl tabular-nums leading-none">
                  {UserStatistics?.monthly.register}
                </div>
              </div>
              <Separator className="!h-10 mx-2 w-px" orientation="vertical" />
              <div className="grid flex-1 auto-rows-min gap-0.5">
                <div className="text-muted text-xs">
                  {UserStatisticsConfig.new_purchase.label}
                </div>
                <div className="font-bold text-xl tabular-nums leading-none">
                  {UserStatistics?.monthly.new_order_users}
                </div>
              </div>
              <Separator className="!h-10 mx-2 w-px" orientation="vertical" />
              <div className="grid flex-1 auto-rows-min gap-0.5">
                <div className="text-muted text-xs">
                  {UserStatisticsConfig.repurchase.label}
                </div>
                <div className="font-bold text-xl tabular-nums leading-none">
                  {UserStatistics?.monthly.renewal_order_users}
                </div>
              </div>
            </div>
          </CardFooter>
        </TabsContent>

        <TabsContent className="h-full" id="total">
          <CardContent className="h-80">
            {UserStatistics?.all.list && UserStatistics?.all.list.length > 0 ? (
              <ChartContainer
                className="max-h-80 w-full"
                config={UserStatisticsConfig}
              >
                <AreaChart
                  accessibilityLayer
                  data={
                    UserStatistics?.all.list?.map((item) => ({
                      date: item.date,
                      register: item.register,
                      new_purchase: item.new_order_users,
                      repurchase: item.renewal_order_users,
                    })) || []
                  }
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    axisLine={false}
                    dataKey="date"
                    tickFormatter={(value) => {
                      const [year, month] = value.split("-");
                      return new Date(year, month - 1).toLocaleDateString(
                        locale,
                        {
                          month: "short",
                        }
                      );
                    }}
                    tickLine={false}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent indicator="dot" />}
                    cursor={false}
                  />
                  <Area
                    dataKey="register"
                    fill="var(--color-register)"
                    fillOpacity={0.4}
                    stackId="a"
                    stroke="var(--color-register)"
                    type="natural"
                  />
                  <Area
                    dataKey="new_purchase"
                    fill="var(--color-new_purchase)"
                    fillOpacity={0.4}
                    stackId="a"
                    stroke="var(--color-new_purchase)"
                    type="natural"
                  />
                  <Area
                    dataKey="repurchase"
                    fill="var(--color-repurchase)"
                    fillOpacity={0.4}
                    stackId="a"
                    stroke="var(--color-repurchase)"
                    type="natural"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <Empty />
              </div>
            )}
          </CardContent>
          <CardFooter className="!py-5 flex flex-row border-t">
            <div className="flex w-full items-center gap-2">
              <div className="grid flex-1 auto-rows-min gap-0.5">
                <div className="text-muted text-xs">
                  {UserStatisticsConfig.register.label}
                </div>
                <div className="font-bold text-xl tabular-nums leading-none">
                  {UserStatistics?.all.register}
                </div>
              </div>
            </div>
          </CardFooter>
        </TabsContent>
      </Card>
    </Tabs>
  );
}
