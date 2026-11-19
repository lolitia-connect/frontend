"use client";

import { Description, Modal } from "@heroui/react";
import { Button } from "@workspace/ui/components/button";
import { useNavigate } from "@workspace/ui/lib/router-compat";

import { useEffect, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/display";
import { useCreateOrder } from "@/sections/purchasing/create-order";
import { useGlobalStore } from "@/stores/global";
import PaymentMethods from "./payment-methods";

interface ResetTrafficProps {
  id: string;
  replacement?: number;
  trafficUnlimited?: boolean;
}
export default function ResetTraffic({
  id,
  replacement,
  trafficUnlimited,
}: Readonly<ResetTrafficProps>) {
  const { t } = useTranslation("subscribe");
  const { getUserInfo } = useGlobalStore();
  const navigate = useNavigate();
  const createOrder = useCreateOrder();
  const [open, setOpen] = useState<boolean>(false);
  const [params, setParams] = useState<API.ResetTrafficOrderRequest>({
    payment: "-1",
    user_subscribe_id: id,
  });
  const [loading, startTransition] = useTransition();

  useEffect(() => {
    if (id) {
      setParams((prev) => ({
        ...prev,
        user_subscribe_id: id,
      }));
    }
  }, [id]);

  if (!replacement || trafficUnlimited) return;

  return (
    <Modal isOpen={open} onOpenChange={setOpen}>
      <Button size="sm" variant="secondary">
        {t("resetTraffic", "Reset Traffic")}
      </Button>

      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden p-0 md:max-h-none">
            <Modal.Header className="flex-none p-6 pb-0">
              <Modal.Heading>
                {t("resetTrafficTitle", "Reset Traffic")}
              </Modal.Heading>
              <Description slot="description">
                {t(
                  "resetTrafficDescription",
                  "Reset your subscription traffic"
                )}
              </Description>
            </Modal.Header>
            <div className="flex-1 overflow-y-auto p-6 pt-0 text-sm">
              <div className="grid gap-3">
                <div className="flex justify-between font-semibold">
                  <span>{t("resetPrice", "Reset Price")}</span>
                  <span>
                    <Display type="currency" value={replacement} />
                  </span>
                </div>
                <PaymentMethods
                  onChange={(value) => {
                    setParams((prev) => ({
                      ...prev,
                      payment: value,
                    }));
                  }}
                  value={params.payment}
                />
              </div>
            </div>
            <div className="flex flex-none justify-end border-t bg-background px-6 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] md:pb-4">
              <Button
                className="w-full md:w-auto md:min-w-40"
                disabled={!params.payment}
                loading={loading}
                onClick={async () => {
                  startTransition(async () => {
                    try {
                      const response = await createOrder({
                        type: "reset_traffic",
                        payment_id: params.payment,
                        user_subscribe_id: id,
                      });
                      const orderNo = response.data.data?.order.order_no;
                      if (orderNo) {
                        getUserInfo();
                        navigate({
                          to: "/payment",
                          search: { order_no: String(orderNo) },
                        });
                      }
                    } catch (error) {
                      console.log(error);
                    }
                  });
                }}
              >
                {t("buyNow", "Buy Now")}
              </Button>
            </div>
            <Modal.CloseTrigger aria-label="Close" />
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
