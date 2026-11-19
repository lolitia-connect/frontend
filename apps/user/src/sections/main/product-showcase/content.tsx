"use client";

import { Card, Chip, Separator } from "@heroui/react";
import { Button } from "@workspace/ui/components/button";
import { Icon } from "@workspace/ui/composed/icon";
import { Link } from "@workspace/ui/lib/router-compat";
import { cn } from "@workspace/ui/lib/utils";
import { ArrowRight, Check, X } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/display";
import { SubscribeDetail } from "@/sections/subscribe/detail";
import { useGlobalStore } from "@/stores/global";

interface ProductShowcaseProps {
  subscriptionData: API.Subscribe[];
}

interface PlanFeature {
  icon: string;
  label: ReactNode;
  type: string;
}

interface PlanDescription {
  description: string;
  features: PlanFeature[];
}

function parsePlanDescription(description: string): PlanDescription {
  try {
    const parsed = JSON.parse(description) as Partial<PlanDescription>;
    return {
      description: parsed.description || "",
      features: Array.isArray(parsed.features) ? parsed.features : [],
    };
  } catch {
    return { description: "", features: [] };
  }
}

function getPlanPrice(
  item: API.Subscribe,
  unitTimeMap: Record<string, string>,
  translate: (key: string, fallback: string) => string
) {
  const hasDiscount = Boolean(item.discount?.length);
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
    unitTimeMap[item.unit_time || ""] ||
    translate(item.unit_time || "Month", item.unit_time || "Month");

  return { displayPrice, displayQuantity, unitTime };
}

export function Content({ subscriptionData }: ProductShowcaseProps) {
  const { t } = useTranslation("main");
  const { user } = useGlobalStore();

  const unitTimeMap: Record<string, string> = {
    Day: t("Day", "Day"),
    Hour: t("Hour", "Hour"),
    Minute: t("Minute", "Minute"),
    Month: t("Month", "Month"),
    NoLimit: t("NoLimit", "No Limit"),
    Year: t("Year", "Year"),
  };

  return (
    <section
      aria-labelledby="plans-title"
      className="scroll-mt-20 space-y-6"
      id="plans"
    >
      <div className="space-y-2">
        <h2
          className="font-semibold text-2xl tracking-tight sm:text-3xl"
          id="plans-title"
        >
          {t("product_showcase_title", "Choose Your Package")}
        </h2>
        <p className="text-muted text-sm leading-6">
          {t(
            "product_showcase_description",
            "Let us help you select the package that best suits you and enjoy exploring it."
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {subscriptionData.map((item) => {
          const { description, features } = parsePlanDescription(
            item.description
          );
          const { displayPrice, displayQuantity, unitTime } = getPlanPrice(
            item,
            unitTimeMap,
            t
          );
          const hasDiscount = Boolean(item.discount?.length);

          return (
            <Card className="min-w-0" key={item.id}>
              <Card.Header className="gap-2">
                <Card.Title className="wrap-anywhere">{item.name}</Card.Title>
                {description && (
                  <Card.Description className="line-clamp-2">
                    {description}
                  </Card.Description>
                )}
              </Card.Header>

              <Card.Content className="flex flex-1 flex-col gap-4">
                {features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {features.slice(0, 3).map((feature, featureIndex) => {
                      const isDisabled = feature.type === "destructive";
                      return (
                        <Chip
                          className={cn(
                            "max-w-full",
                            isDisabled && "text-muted line-through"
                          )}
                          color={isDisabled ? "default" : "accent"}
                          key={`${item.id}-${featureIndex}`}
                          size="sm"
                          variant="soft"
                        >
                          {feature.icon ? (
                            <Icon className="size-3.5" icon={feature.icon} />
                          ) : isDisabled ? (
                            <X className="size-3.5" />
                          ) : (
                            <Check className="size-3.5" />
                          )}
                          <Chip.Label className="truncate">
                            {feature.label}
                          </Chip.Label>
                        </Chip>
                      );
                    })}
                  </div>
                )}

                <div className="space-y-3">
                  <SubscribeDetail
                    subscribe={{
                      ...item,
                      name: undefined,
                    }}
                  />
                </div>

                {features.length > 3 && (
                  <p className="text-muted text-xs">
                    {t("more_features", {
                      count: features.length - 3,
                      defaultValue: "{{count}} more features",
                    })}
                  </p>
                )}
              </Card.Content>

              <Separator />

              <Card.Footer className="flex-col items-stretch gap-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-muted text-xs">
                      {hasDiscount
                        ? t("starting_from", "Starting from")
                        : t("monthly_access", "Monthly access")}
                    </p>
                    <p className="mt-1 flex flex-wrap items-baseline font-semibold text-2xl tracking-tight">
                      <Display type="currency" value={displayPrice} />
                      <span className="ml-1 font-medium text-muted text-xs">
                        /
                        {displayQuantity === 1
                          ? unitTime
                          : `${displayQuantity} ${unitTime}`}
                      </span>
                    </p>
                  </div>
                  {hasDiscount && (
                    <Chip color="success" size="sm" variant="soft">
                      {t("offer", "Offer")}
                    </Chip>
                  )}
                </div>
                <Button asChild className="w-full justify-center gap-2">
                  <Link
                    search={user ? undefined : { id: item.id }}
                    to={user ? "/subscribe" : "/purchasing"}
                  >
                    {t("subscribe", "Subscribe")}
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </Button>
              </Card.Footer>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
