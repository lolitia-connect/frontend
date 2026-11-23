"use client";

import { Card } from "@heroui/react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { Icon } from "@workspace/ui/composed/icon";
import { useMutation, useQuery } from "@workspace/ui/hooks/query";
import { getRouteApi, Link } from "@workspace/ui/lib/router-compat";
import {
  checkoutV2Order,
  type OrderSnapshot,
} from "@workspace/ui/services/user/order-v2";
import { getV1PublicOrderDetail as queryOrderDetail } from "@workspace/ui/services/user/user";
import { formatDate } from "@workspace/ui/utils/formatting";
import { useCountDown } from "ahooks";
import { addMinutes, format } from "date-fns";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/display";
import {
  recentCheckoutOrder,
  takeOrderPayment,
} from "@/sections/purchasing/create-order";
import { watchOrderEvents } from "@/sections/purchasing/order-events";
import { SubscribeBilling } from "@/sections/subscribe/billing";
import { SubscribeDetail } from "@/sections/subscribe/detail";
import { useGlobalStore } from "@/stores/global";

const routeApi = getRouteApi("/(main)/payment");

export default function Page() {
  const { t } = useTranslation("order");
  const { getUserInfo } = useGlobalStore();
  const search = routeApi.useSearch() as { order_no?: string };
  const order_no = search.order_no || recentCheckoutOrder();
  const [enabled, setEnabled] = useState<boolean>(!!order_no);
  const [snapshot, setSnapshot] = useState<OrderSnapshot>();

  useEffect(() => {
    if (order_no) {
      setEnabled(true);
      setSnapshot(undefined);
      setPaymentType(undefined);
      setCheckoutUrl(undefined);
    }
  }, [order_no]);

  const { data, refetch, isError } = useQuery({
    enabled: enabled && !!order_no,
    queryKey: ["queryOrderDetail", order_no],
    queryFn: async () => {
      const { data } = await queryOrderDetail({ order_no: order_no! });
      if (data?.data?.status !== 1 && data?.data?.status !== 2) {
        getUserInfo();
        setEnabled(false);
      }
      return data?.data;
    },
    retry: false,
    refetchInterval: (query) =>
      query.state.status === "error" ||
      (query.state.data && ![1, 2].includes(query.state.data.status))
        ? false
        : 5000,
  });

  const [paymentType, setPaymentType] = useState<string>();
  const [checkoutUrl, setCheckoutUrl] = useState<string>();

  useEffect(() => {
    if (!order_no || isError) return;
    return watchOrderEvents({
      orderNo: order_no,
      onSnapshot: (next) => {
        setSnapshot(next);
        if (next.payment_status === "paid") getUserInfo();
      },
      onError: () => undefined,
    });
  }, [order_no, getUserInfo, isError]);

  useEffect(() => {
    if (!order_no) return;
    const payment = takeOrderPayment(order_no);
    if (
      payment &&
      ["qr", "url"].includes(payment.type) &&
      payment.checkout_url
    ) {
      setPaymentType(payment.type);
      setCheckoutUrl(payment.checkout_url);
    }
  }, [order_no]);

  // Checkout is triggered manually by user click, not automatically
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const { data } = await checkoutV2Order(order_no!);
      if (data.data) setSnapshot(data.data.order);
      return data.data?.payment;
    },
    onSuccess: (result) => {
      if (!result) return;
      setPaymentType(result.type);
      if (result.type === "url" && result.checkout_url) {
        window.location.href = result.checkout_url;
      } else if (result.checkout_url) {
        setCheckoutUrl(result.checkout_url);
      }
    },
  });

  const currentStatus = snapshot
    ? ({ pending_payment: 1, paid: 2, closed: 3, failed: 4, finished: 5 }[
        snapshot.status
      ] ?? data?.status)
    : data?.status;

  useEffect(() => {
    if (["finished", "closed", "failed"].includes(snapshot?.status || ""))
      setEnabled(false);
  }, [snapshot?.status]);

  const [countDown, formattedRes] = useCountDown({
    targetDate: snapshot
      ? snapshot.expires_at * 1000
      : data &&
        format(
          addMinutes(data?.created_at, 15),
          "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
        ),
  });

  const { hours, minutes, seconds } = formattedRes;

  const countdownDisplay =
    countDown > 0 ? (
      <>
        {hours.toString().length === 1 ? `0${hours}` : hours} :{" "}
        {minutes.toString().length === 1 ? `0${minutes}` : minutes} :{" "}
        {seconds.toString().length === 1 ? `0${seconds}` : seconds}
      </>
    ) : (
      t("timeExpired", "Time Expired")
    );

  return (
    <div className="container grid gap-4 py-16 xl:grid-cols-2">
      {isError && (
        <div className="col-span-full flex items-center gap-3" role="alert">
          <span>{t("orderUnavailable", "Order unavailable")}</span>
          <Button
            onClick={() => {
              setEnabled(true);
              refetch();
            }}
          >
            {t("retry", "Retry")}
          </Button>
        </div>
      )}
      <Card className="wrap-anywhere order-2 min-w-0 gap-0 xl:order-1">
        <Card.Header className="flex flex-row items-start">
          <div className="grid gap-0.5">
            <Card.Title className="flex flex-col text-lg">
              {t("orderNumber", "Order Number")}
              <span>{data?.order_no}</span>
            </Card.Title>
            <Card.Description>
              {t("createdAt", "Created At")}: {formatDate(data?.created_at)}
            </Card.Description>
          </div>
        </Card.Header>
        <Card.Content className="grid gap-3 p-6 text-sm">
          <div className="font-semibold">
            {t("paymentMethod", "Payment Method")}
          </div>
          <dl className="grid gap-3">
            <div className="flex items-center justify-between">
              <dt className="text-muted">
                <Badge className="wrap-anywhere h-auto max-w-full whitespace-normal">
                  {data?.payment.name || data?.payment.platform}
                </Badge>
              </dt>
            </div>
          </dl>
          <Separator />

          {data?.type && [1, 2].includes(data.type) && (
            <SubscribeDetail
              subscribe={{
                ...data?.subscribe,
                quantity: data?.quantity,
              }}
            />
          )}
          {data?.type === 3 && (
            <>
              <div className="font-semibold">
                {t("resetTraffic", "Reset Traffic")}
              </div>
              <ul className="grid grid-cols-2 gap-3 *:flex *:items-center *:justify-between lg:grid-cols-1">
                <li className="flex items-center justify-between">
                  <span className="line-clamp-2 flex-1 text-muted">
                    {t("resetPrice", "Reset Price")}
                  </span>
                  <span>
                    <Display type="currency" value={data.amount} />
                  </span>
                </li>
              </ul>
            </>
          )}

          {data?.type === 4 && (
            <>
              <div className="font-semibold">
                {t("balanceRecharge", "Balance Recharge")}
              </div>
              <ul className="grid grid-cols-2 gap-3 *:flex *:items-center *:justify-between lg:grid-cols-1">
                <li className="flex items-center justify-between">
                  <span className="line-clamp-2 flex-1 text-muted">
                    {t("rechargeAmount", "Recharge Amount")}
                  </span>
                  <span>
                    <Display type="currency" value={data.amount} />
                  </span>
                </li>
              </ul>
            </>
          )}
          <Separator />
          <SubscribeBilling
            order={{
              ...data,
              unit_price: data?.subscribe?.unit_price,
              show_original_price: data?.subscribe?.show_original_price,
            }}
          />
        </Card.Content>
      </Card>
      <Card className="order-1 flex min-w-0 flex-auto items-center justify-center xl:order-2">
        <Card.Content className="flex min-w-0 max-w-full items-center justify-center py-16">
          {currentStatus && [2, 5].includes(currentStatus) && (
            <div className="flex flex-col items-center gap-8 text-center">
              <h3 className="font-bold text-2xl tracking-tight">
                {t("paymentSuccess", "Payment Success")}
              </h3>
              <Icon
                className="text-7xl text-success"
                icon="mdi:success-circle-outline"
              />
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild>
                  <Link to="/dashboard">
                    {t("subscribeNow", "Subscribe Now")}
                  </Link>
                </Button>
                <Button variant="outline">
                  <Link to="/document">
                    {t("viewDocument", "View Document")}
                  </Link>
                </Button>
              </div>
            </div>
          )}
          {currentStatus === 1 && (!paymentType || paymentType === "url") && (
            <div className="flex flex-col items-center gap-8 text-center">
              <h3 className="font-bold text-2xl tracking-tight">
                {t("waitingForPayment", "Waiting For Payment")}
              </h3>
              <p className="flex items-center font-bold text-3xl">
                {countdownDisplay}
              </p>
              <Icon className="text-7xl text-muted" icon="mdi:access-time" />
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  disabled={checkoutMutation.isPending}
                  onClick={() => {
                    if (paymentType === "url" && checkoutUrl)
                      window.location.assign(checkoutUrl);
                    else checkoutMutation.mutate();
                  }}
                >
                  {checkoutMutation.isPending
                    ? t("processing", "Processing...")
                    : t("goToPayment", "Go To Payment")}
                </Button>
              </div>
            </div>
          )}

          {currentStatus === 1 && paymentType === "qr" && checkoutUrl && (
            <div className="flex flex-col items-center gap-8 text-center">
              <h3 className="font-bold text-2xl tracking-tight">
                {t("scanToPay", "Scan To Pay")}
              </h3>
              <p className="flex items-center font-bold text-3xl">
                {countdownDisplay}
              </p>
              <QRCodeCanvas
                imageSettings={{
                  src: "./assets/payment/alipay_f2f.svg",
                  width: 24,
                  height: 24,
                  excavate: true,
                }}
                size={208}
                value={checkoutUrl || ""}
              />
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild>
                  <Link to="/subscribe">
                    {t("productList", "Product List")}
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/order">{t("orderList", "Order List")}</Link>
                </Button>
              </div>
            </div>
          )}

          {currentStatus && [3, 4].includes(currentStatus) && (
            <div className="flex flex-col items-center gap-8 text-center">
              <h3 className="font-bold text-2xl tracking-tight">
                {t("orderClosed", "Order Closed")}
              </h3>
              <Icon className="text-7xl text-danger" icon="mdi:cancel" />
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild>
                  <Link to="/subscribe">
                    {t("productList", "Product List")}
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/order">{t("orderList", "Order List")}</Link>
                </Button>
              </div>
            </div>
          )}
        </Card.Content>
      </Card>
    </div>
  );
}
