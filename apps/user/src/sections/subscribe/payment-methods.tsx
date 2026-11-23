"use client";

import { Chip, Label, Radio, RadioGroup } from "@heroui/react";
import { useQuery } from "@workspace/ui/hooks/query";
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
        aria-label={t("paymentMethod", "Payment Method")}
        onChange={onChange}
        value={String(value)}
      >
        <div className="grid auto-rows-fr grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))] gap-3">
          {data?.map((item) => (
            <Radio
              className="h-full min-w-0"
              key={item.id}
              value={String(item.id)}
            >
              <Radio.Content
                aria-label={item.name}
                className="h-full min-h-16 w-full min-w-0 rounded-field bg-default p-3 data-[selected=true]:bg-accent-soft data-[selected=true]:text-accent-soft-foreground"
              >
                <Radio.Control>
                  <Radio.Indicator />
                </Radio.Control>
                {/* biome-ignore lint/performance/noImgElement: dynamic remote payment-method icon URL */}
                <img
                  alt=""
                  className="size-8 shrink-0 object-contain"
                  height={32}
                  src={item.icon || "./assets/payment/balance.svg"}
                  width={32}
                />
                <Label className="wrap-anywhere min-w-0 flex-1">
                  {item.name}
                </Label>
                {item.fee_mode === 1 && item.fee_percent > 0 && (
                  <Chip color="warning" size="sm" variant="soft">
                    {item.fee_percent}%
                  </Chip>
                )}
                {item.fee_mode === 2 && item.fee_amount > 0 && (
                  <Chip color="warning" size="sm" variant="soft">
                    +{item.fee_amount}
                  </Chip>
                )}
              </Radio.Content>
            </Radio>
          ))}
        </div>
      </RadioGroup>
    </>
  );
};

export default memo(PaymentMethods);
