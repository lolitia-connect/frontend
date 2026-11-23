"use client";

import { Description, Modal } from "@heroui/react";
import { Button } from "@workspace/ui/components/button";
import { EnhancedInput } from "@workspace/ui/composed/enhanced-input";
import { useNavigate } from "@workspace/ui/lib/router-compat";
import { unitConversion } from "@workspace/ui/utils/unit-conversions";
import type React from "react";
import { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { useCreateOrder } from "@/sections/purchasing/create-order";
import { useGlobalStore } from "@/stores/global";
import PaymentMethods from "./payment-methods";

export default function Recharge(
  props: Readonly<React.ComponentProps<typeof Button>>
) {
  const { t } = useTranslation("subscribe");
  const { common } = useGlobalStore();
  const navigate = useNavigate();
  const createOrder = useCreateOrder();
  const { currency } = common;

  const [open, setOpen] = useState<boolean>(false);
  const [loading, startTransition] = useTransition();
  const [availableMethodsCount, setAvailableMethodsCount] = useState<number>();

  const [params, setParams] = useState<API.RechargeOrderRequest>({
    amount: 0,
    payment: "-1",
  });

  const hasNoPaymentMethods = availableMethodsCount === 0;
  const isButtonDisabled = !(params.amount && availableMethodsCount);

  return (
    <Modal isOpen={open} onOpenChange={setOpen}>
      <Button {...props}>{t("recharge", "Recharge")}</Button>

      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden p-0 md:max-h-none">
            <Modal.Header className="flex-none p-6 pb-0">
              <Modal.Heading>
                {t("balanceRecharge", "Balance Recharge")}
              </Modal.Heading>
              <Description slot="description">
                {t("rechargeDescription", "Recharge your account balance")}
              </Description>
            </Modal.Header>
            <div className="flex-1 overflow-y-auto p-6 pt-0 text-sm">
              <div className="grid gap-3">
                <div className="font-semibold">
                  {t("rechargeAmount", "Recharge Amount")}
                </div>
                <div className="flex">
                  <EnhancedInput
                    formatInput={(value) =>
                      unitConversion("centsToDollars", value)
                    }
                    formatOutput={(value) =>
                      unitConversion("dollarsToCents", value)
                    }
                    min={0}
                    onValueChange={(value) => {
                      setParams((prev) => ({
                        ...prev,
                        amount: value as number,
                      }));
                    }}
                    placeholder={t("enterAmount", "Enter Amount")}
                    prefix={currency.currency_symbol}
                    suffix={currency.currency_unit}
                    type="number"
                    value={params.amount}
                  />
                </div>
                <PaymentMethods
                  balance={false}
                  onAvailableMethodsChange={setAvailableMethodsCount}
                  onChange={(value) =>
                    setParams((prev) => ({ ...prev, payment: value }))
                  }
                  value={params.payment}
                />
                {hasNoPaymentMethods && (
                  <div className="text-muted text-sm">
                    {t(
                      "noPaymentMethodsAvailable",
                      "No payment methods available for recharge"
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-none justify-end border-t bg-background px-6 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] md:pb-4">
              <Button
                className="w-full md:w-auto md:min-w-40"
                disabled={isButtonDisabled}
                loading={loading}
                onClick={() => {
                  startTransition(async () => {
                    try {
                      const response = await createOrder({
                        type: "recharge",
                        payment_id: params.payment,
                        amount: params.amount,
                      });
                      const orderNo = response.data.data?.order.order_no;
                      if (orderNo) {
                        navigate({
                          to: "/payment",
                          search: { order_no: String(orderNo) },
                        });
                        setOpen(false);
                      }
                    } catch {
                      /* empty */
                    }
                  });
                }}
              >
                {t("rechargeNow", "Recharge Now")}
              </Button>
            </div>
            <Modal.CloseTrigger aria-label="Close" />
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
