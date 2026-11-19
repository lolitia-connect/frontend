"use client";

import { Label, Radio, RadioGroup } from "@heroui/react";
import { Badge } from "@workspace/ui/components/badge";
import type React from "react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

interface DurationSelectorProps {
  discounts?: Array<{ quantity: number; discount: number }>;
  onChange: (value: number) => void;
  quantity: number;
  showOriginalPrice?: boolean;
  unitTime?: string;
}

const DurationSelector: React.FC<DurationSelectorProps> = ({
  quantity,
  unitTime = "Month",
  discounts = [],
  onChange,
  showOriginalPrice = true,
}) => {
  const { t } = useTranslation("subscribe");
  const handleChange = useCallback(
    (value: string) => {
      onChange(Number(value));
    },
    [onChange]
  );

  const currentDiscount = discounts?.find(
    (item) => item.quantity === quantity
  )?.discount;
  const discountPercentage = currentDiscount ? 100 - currentDiscount : 0;

  const hasQuantityOne = discounts?.some((item) => item.quantity === 1);

  const options: Array<{ label: string; value: string }> = [];
  if (showOriginalPrice && unitTime !== "Minute" && !hasQuantityOne) {
    options.push({ label: `1 / ${t(unitTime)}`, value: "1" });
  }
  for (const item of discounts ?? []) {
    options.push({
      label: `${item.quantity} / ${t(unitTime)}`,
      value: String(item.quantity),
    });
  }

  return (
    <>
      <div className="font-semibold">
        {t("purchaseDuration", "Purchase Duration")}
      </div>
      <RadioGroup
        aria-label={t("purchaseDuration", "Purchase Duration")}
        onChange={handleChange}
        value={String(quantity)}
      >
        <div className="flex flex-wrap gap-x-3 gap-y-2">
          {options.map((option) => (
            <Radio key={option.value} value={option.value}>
              <Radio.Content className="rounded-field bg-default px-3 py-2 data-[selected=true]:bg-accent-soft data-[selected=true]:text-accent-soft-foreground">
                <Radio.Control>
                  <Radio.Indicator />
                </Radio.Control>
                <Label>{option.label}</Label>
              </Radio.Content>
            </Radio>
          ))}
        </div>
      </RadioGroup>
      <div className="flex items-center justify-between">
        <span className="text-muted text-sm">
          {t("discountInfo", "Discount Info")}:
        </span>
        {discountPercentage > 0 ? (
          <Badge className="h-6 text-sm" variant="destructive">
            -{discountPercentage.toFixed(2)}% {t("discount", "Discount")}
          </Badge>
        ) : (
          <span className="h-6 text-muted text-sm">--</span>
        )}
      </div>
    </>
  );
};

export default DurationSelector;
