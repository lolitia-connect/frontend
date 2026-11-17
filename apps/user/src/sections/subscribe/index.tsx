"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Separator } from "@workspace/ui/components/separator";
import Empty from "@workspace/ui/composed/empty";
import { Icon } from "@workspace/ui/composed/icon";
import { cn } from "@workspace/ui/lib/utils";
import { querySubscribeList } from "@workspace/ui/services/user/subscribe";
import { queryUserSubscribe } from "@workspace/ui/services/user/user";
import { differenceInDays, formatDate } from "@workspace/ui/utils/formatting";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/display";
import { SubscribeDetail } from "./detail";
import Purchase from "./purchase";
import RedeemCode from "./redeem-code";
import Renewal from "./renewal";

export default function Subscribe() {
  const { t, i18n } = useTranslation("subscribe");
  const unitTimeMap: Record<string, string> = {
    Day: t("Day", "Day"),
    Hour: t("Hour", "Hour"),
    Minute: t("Minute", "Minute"),
    Month: t("Month", "Month"),
    NoLimit: t("NoLimit", "No Limit"),
    Year: t("Year", "Year"),
  };
  const locale = i18n.language;
  const [subscribe, setSubscribe] = useState<API.Subscribe>();
  const [pendingPlan, setPendingPlan] = useState<API.Subscribe>();

  const { data: subscribeList } = useQuery({
    queryKey: ["querySubscribeList", locale],
    queryFn: async () => {
      console.log("Fetching subscription list...");
      const { data } = await querySubscribeList({ language: locale });
      return data.data?.list || [];
    },
  });

  const { data: userSubscriptions } = useQuery({
    queryKey: ["queryUserSubscribe"],
    queryFn: async () => {
      const { data } = await queryUserSubscribe();
      return data.data?.list || [];
    },
  });

  // Get IDs of plans the user has already purchased
  const purchasedPlanIds = new Set(
    userSubscriptions?.map((sub) => sub.subscribe_id) || []
  );

  // Show plan if: (1) show is true, or (2) user has purchased it
  const filteredData = subscribeList?.filter(
    (item) => item.show || purchasedPlanIds.has(item.id)
  );
  const renewableSubscriptions = [...(userSubscriptions || [])]
    .filter(
      (entry) =>
        entry.status !== 4 && entry.expire_time !== 0 && entry.subscribe?.sell
    )
    .sort((first, second) => first.expire_time - second.expire_time);
  const matchingRenewable = pendingPlan
    ? renewableSubscriptions.filter(
        (entry) => entry.subscribe_id === pendingPlan.id
      )
    : [];

  return (
    <div className="flex min-h-[calc(100vh-64px-58px-32px-114px)] w-full flex-col gap-4 overflow-hidden">
      <RedeemCode />
      <div className="space-y-4">
        {renewableSubscriptions.slice(0, 2).map((entry) => (
          <div
            className="flex flex-wrap items-center justify-between gap-4 border-b py-4"
            key={entry.id}
          >
            <div className="space-y-1">
              <p className="font-medium">{entry.subscribe.name}</p>
              <p className="text-muted-foreground text-sm">
                {t("expireAt", "Expires At")}: {formatDate(entry.expire_time)}
              </p>
              <p className="text-sm">
                {entry.status === 3
                  ? t("expired", "Expired")
                  : t("expiresInDays", "{{days}} days left", {
                      days: Math.max(
                        0,
                        differenceInDays(
                          new Date(entry.expire_time),
                          new Date()
                        )
                      ),
                    })}
              </p>
            </div>
            <Renewal id={entry.id} subscribe={entry.subscribe} />
          </div>
        ))}
        {renewableSubscriptions.length > 2 && (
          <p className="text-muted-foreground text-sm">
            {t(
              "moreRenewable",
              "{{total}} more subscriptions can be renewed from the dashboard",
              { total: renewableSubscriptions.length - 2 }
            )}
          </p>
        )}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {filteredData?.map((item) => (
            <Card className="relative flex flex-col" key={item.id}>
              <CardHeader className="font-medium text-xl">
                {item.name}
              </CardHeader>
              <CardContent className="*:!text-sm flex flex-grow flex-col gap-3">
                {/* <div className='font-semibold'>{t('productDescription')}</div> */}
                <ul className="flex flex-grow flex-col gap-3">
                  {(() => {
                    let parsedDescription: {
                      description: string;
                      features: Array<{
                        icon: string;
                        label: string;
                        type: "default" | "success" | "destructive";
                      }>;
                    };
                    try {
                      parsedDescription = JSON.parse(item.description);
                    } catch {
                      parsedDescription = { description: "", features: [] };
                    }

                    const { description, features } = parsedDescription;
                    return (
                      <>
                        {description && (
                          <li className="text-muted-foreground">
                            {description}
                          </li>
                        )}
                        {features?.map(
                          (
                            feature: {
                              icon: string;
                              label: string;
                              type: "default" | "success" | "destructive";
                            },
                            index: number
                          ) => (
                            <li
                              className={cn("flex items-center gap-1", {
                                "text-muted-foreground line-through":
                                  feature.type === "destructive",
                              })}
                              key={index}
                            >
                              {feature.icon && (
                                <Icon
                                  className={cn("size-5 text-primary", {
                                    "text-green-500":
                                      feature.type === "success",
                                    "text-destructive":
                                      feature.type === "destructive",
                                  })}
                                  icon={feature.icon}
                                />
                              )}
                              {feature.label}
                            </li>
                          )
                        )}
                      </>
                    );
                  })()}
                </ul>
                <SubscribeDetail
                  subscribe={{
                    ...item,
                    name: undefined,
                  }}
                />
              </CardContent>
              <Separator />
              <CardFooter className="flex flex-col gap-2">
                {(() => {
                  const hasDiscount = item.discount && item.discount.length > 0;
                  const shouldShowOriginal = item.show_original_price !== false;

                  const displayPrice =
                    shouldShowOriginal || !hasDiscount
                      ? item.unit_price
                      : Math.round(
                          item.unit_price *
                            (item.discount?.[0]?.quantity ?? 1) *
                            ((item.discount?.[0]?.discount ?? 100) / 100)
                        );

                  const displayQuantity =
                    shouldShowOriginal || !hasDiscount
                      ? 1
                      : (item.discount?.[0]?.quantity ?? 1);

                  const unitTime =
                    unitTimeMap[item.unit_time!] ||
                    t(item.unit_time || "Month", item.unit_time || "Month");

                  return (
                    <h2 className="pb-8 font-semibold text-2xl sm:text-3xl">
                      <Display type="currency" value={displayPrice} />
                      <span className="font-medium text-base">
                        {displayQuantity === 1
                          ? `/${unitTime}`
                          : `/${displayQuantity} ${unitTime}`}
                      </span>
                    </h2>
                  );
                })()}
                <Button
                  className="absolute bottom-0 w-full rounded-t-none rounded-b-xl"
                  onClick={() => {
                    if (
                      renewableSubscriptions.some(
                        (entry) => entry.subscribe_id === item.id
                      )
                    ) {
                      setPendingPlan(item);
                    } else {
                      setSubscribe(item);
                    }
                  }}
                >
                  {t("buy", "Buy")}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        {filteredData?.length === 0 && <Empty />}
      </div>
      <Dialog
        onOpenChange={(open) => {
          if (!open) setPendingPlan(undefined);
        }}
        open={Boolean(pendingPlan)}
      >
        <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {t("renewReminder.title", "You already have a subscription")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "renewReminder.description",
                "Renewing extends your current subscription and keeps its nodes and subscription link. Buying a new plan creates a separate subscription with its own time and traffic."
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="-mx-1 min-h-0 flex-1 space-y-3 overflow-y-auto px-1">
            {matchingRenewable.map((entry) => (
              <div
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                key={entry.id}
              >
                <div className="min-w-0 space-y-1">
                  <p className="break-words font-medium">
                    {entry.subscribe.name}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {t("expireAt", "Expires At")}:{" "}
                    {formatDate(entry.expire_time)}
                  </p>
                </div>
                <Renewal
                  className="w-full sm:w-auto"
                  id={entry.id}
                  subscribe={entry.subscribe}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              className="h-auto max-w-full whitespace-normal break-words"
              onClick={() => {
                setSubscribe(pendingPlan);
                setPendingPlan(undefined);
              }}
              variant="outline"
            >
              {t("renewReminder.buyNew", "Buy {{name}} as a new subscription", {
                name: pendingPlan?.name,
              })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Purchase setSubscribe={setSubscribe} subscribe={subscribe} />
    </div>
  );
}
