"use client";

import { Card, Modal } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { useNavigate } from "@workspace/ui/lib/router-compat";
import { preCreateOrder } from "@workspace/ui/services/user/order";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { useCreateOrder } from "@/sections/purchasing/create-order";
import CouponInput from "@/sections/subscribe/coupon-input";
import DurationSelector from "@/sections/subscribe/duration-selector";
import PaymentMethods from "@/sections/subscribe/payment-methods";
import { useGlobalStore } from "@/stores/global";
import { SubscribeBilling } from "./billing";
import { SubscribeDetail } from "./detail";

interface RenewalProps {
  className?: string;
  id: string;
  subscribe: API.Subscribe;
}

export default function Renewal({
  className,
  id,
  subscribe,
}: Readonly<RenewalProps>) {
  const { t } = useTranslation("subscribe");
  const { getUserInfo } = useGlobalStore();
  const navigate = useNavigate();
  const createOrder = useCreateOrder();
  const [open, setOpen] = useState<boolean>(false);
  const [params, setParams] = useState<
    Partial<API.RenewalOrderRequest> & { subscribe_id?: string }
  >({
    quantity: 1,
    payment: "-1",
    coupon: "",
    user_subscribe_id: id,
  });
  const [loading, startTransition] = useTransition();
  const lastSuccessOrderRef = useRef<any>(null);

  const {
    data: order,
    error,
    isFetching,
  } = useQuery({
    enabled: !!subscribe.id && open,
    queryKey: [
      "preCreateOrder",
      subscribe.id,
      params.quantity,
      params.payment,
      params.coupon,
    ],
    ...(params.coupon ? { retry: false } : {}),
    queryFn: async () => {
      try {
        const { data } = await preCreateOrder({
          ...params,
          subscribe_id: subscribe.id,
        } as API.PurchaseOrderRequest);
        const result = data.data;
        if (result) {
          lastSuccessOrderRef.current = result;
        }
        return result;
      } catch (error) {
        if (params.coupon) {
          throw error;
        }
        if (lastSuccessOrderRef.current) {
          return lastSuccessOrderRef.current;
        }
        throw error;
      }
    },
  });

  const couponStatus = params.coupon
    ? isFetching
      ? "checking"
      : error
        ? "invalid"
        : order
          ? "valid"
          : "idle"
    : "idle";
  useEffect(() => {
    if (subscribe.id && id) {
      const defaultQuantity =
        subscribe.show_original_price === false && subscribe.discount?.[0]
          ? subscribe.discount[0].quantity
          : 1;
      setParams((prev) => ({
        ...prev,
        quantity: defaultQuantity,
        subscribe_id: subscribe.id,
        user_subscribe_id: id,
      }));
    }
  }, [subscribe.id, id]);

  const handleChange = useCallback(
    (field: keyof typeof params, value: string | number) => {
      setParams((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    startTransition(async () => {
      try {
        const response = await createOrder({
          type: "renewal",
          payment_id: params.payment || "-1",
          user_subscribe_id: id,
          quantity: params.quantity,
          coupon: params.coupon,
        });
        const orderNo = response.data.data?.order.order_no;
        if (orderNo) {
          getUserInfo();
          navigate({ to: "/payment", search: { order_no: String(orderNo) } });
        }
      } catch {
        /* empty */
      }
    });
  }, [params, id, getUserInfo, navigate, createOrder]);

  return (
    <Modal isOpen={open} onOpenChange={setOpen}>
      <Button className={className} size="sm">
        {t("renew", "Renew")}
      </Button>

      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden p-0 md:max-h-none md:max-w-screen-lg">
            <Modal.Header className="flex-none p-6 pb-0">
              <Modal.Heading>
                {t("renewSubscription", "Renew Subscription")}
              </Modal.Heading>
            </Modal.Header>
            <div className="grid w-full flex-1 gap-3 overflow-y-auto p-6 pt-0 lg:grid-cols-2">
              <Card className="border-transparent shadow-none md:border-inherit md:shadow">
                <Card.Content className="grid gap-3 p-0 text-sm md:p-6">
                  <SubscribeDetail
                    subscribe={{
                      ...subscribe,
                      quantity: params.quantity,
                    }}
                  />
                  <Separator />
                  <SubscribeBilling
                    order={{
                      ...order,
                      quantity: params.quantity,
                      unit_price: subscribe?.unit_price,
                      show_original_price: subscribe?.show_original_price,
                    }}
                  />
                </Card.Content>
              </Card>
              <div className="flex flex-col justify-between text-sm">
                <div className="grid gap-3">
                  <DurationSelector
                    discounts={subscribe?.discount}
                    onChange={(value) => {
                      handleChange("quantity", value);
                    }}
                    quantity={params.quantity!}
                    showOriginalPrice={subscribe?.show_original_price}
                    unitTime={subscribe?.unit_time}
                  />
                  <CouponInput
                    coupon={params.coupon}
                    onChange={(value) => handleChange("coupon", value)}
                    status={couponStatus}
                  />
                  <PaymentMethods
                    onChange={(value) => {
                      handleChange("payment", value);
                    }}
                    value={params.payment ?? "0"}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-none justify-end border-t bg-background px-6 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] md:pb-4">
              <Button
                className="w-full md:w-auto md:min-w-40"
                loading={loading}
                onClick={handleSubmit}
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
