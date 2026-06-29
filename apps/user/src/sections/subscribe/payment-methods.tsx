"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@workspace/ui/components/badge";
import { Label } from "@workspace/ui/components/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group";
import { cn } from "@workspace/ui/lib/utils";
import { getAvailablePaymentMethods } from "@workspace/ui/services/user/portal";
import type React from "react";
import { memo, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface PaymentMethodsProps {
  balance?: boolean;
  onAvailableMethodsChange?: (count: number) => void;
  onChange: (value: string) => void;
  value: string;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  value,
  onChange,
  balance = true,
  onAvailableMethodsChange,
}) => {
  const { t } = useTranslation("subscribe");

  const { data } = useQuery({
    queryKey: ["getAvailablePaymentMethods", { balance }],
    queryFn: async () => {
      const { data } = await getAvailablePaymentMethods();
      const list = data.data?.list || [];
      return balance ? list : list.filter((item) => item.id !== "-1");
    },
  });

  // Only set a default when the current value is not a valid option.
  // This avoids resetting the user's selection on refetch (common on mobile).
  // Prefer non-balance methods when possible.
  useEffect(() => {
    if (!data || data.length === 0) return;
    const valid = data.some((m) => String(m.id) === String(value));
    if (valid) return;

    const preferred = data.find((m) => m.id !== "-1")?.id ?? data[0]!.id;
    onChange(preferred);
  }, [data, onChange, value]);

  useEffect(() => {
    onAvailableMethodsChange?.(data?.length ?? 0);
  }, [data, onAvailableMethodsChange]);

  return (
    <>
      <div className="font-semibold">
        {t("paymentMethod", "Payment Method")}
      </div>
      <RadioGroup
        className="grid grid-cols-2 gap-2 md:grid-cols-5"
        onValueChange={(v) => onChange(v)}
        value={String(value)}
      >
        {data?.map((item) => (
          <div className="relative p-1" key={item.id}>
            {item.fee_mode === 1 && item.fee_percent > 0 && (
              <Badge className="absolute top-0 right-0 z-20 border-amber-200 bg-amber-100 px-1.5 py-0 text-[10px] text-amber-700 dark:border-amber-800 dark:bg-amber-900 dark:text-amber-300">
                {item.fee_percent}%
              </Badge>
            )}
            {item.fee_mode === 2 && item.fee_amount > 0 && (
              <Badge className="absolute top-0 right-0 z-20 border-amber-200 bg-amber-100 px-1.5 py-0 text-[10px] text-amber-700 dark:border-amber-800 dark:bg-amber-900 dark:text-amber-300">
                +{item.fee_amount}
              </Badge>
            )}
            <RadioGroupItem
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              id={String(item.id)}
              value={String(item.id)}
            />
            <Label
              className={cn(
                "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover py-2 text-popover-foreground hover:bg-accent hover:text-accent-foreground",
                String(value) === String(item.id)
                  ? "border-primary bg-primary/10 text-foreground"
                  : ""
              )}
              htmlFor={String(item.id)}
            >
              <div className="flex size-12 items-center justify-center">
                <img
                  alt={item.name}
                  height={48}
                  src={item.icon || "./assets/payment/balance.svg"}
                  width={48}
                />
              </div>
              <span className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-center">
                {item.name}
              </span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </>
  );
};

export default memo(PaymentMethods);
