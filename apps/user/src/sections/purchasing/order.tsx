"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useSearch } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { Icon } from "@workspace/ui/composed/icon";
import {
  purchaseCheckout,
  queryPurchaseOrder,
} from "@workspace/ui/services/user/portal";
import { formatDate } from "@workspace/ui/utils/formatting";
import { useCountDown } from "ahooks";
import { addMinutes, format } from "date-fns";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SubscribeBilling } from "@/sections/subscribe/billing";
import { SubscribeDetail } from "@/sections/subscribe/detail";

import { useGlobalStore } from "@/stores/global";
import { setAuthorization, setRedirectUrl } from "@/utils/common";
import { clearCheckoutToken, getCheckoutToken } from "./checkout-token";

export default function Order() {
  const { t } = useTranslation("order");
  const { getUserInfo, isLoadingUser } = useGlobalStore();
  const [orderNo, setOrderNo] = useState<string>();
  const [enabled, setEnabled] = useState<boolean>(false);
  const [accessError, setAccessError] = useState(false);
  const search = useSearch({ from: "/(main)/purchasing/order/" });

  const capability = orderNo ? getCheckoutToken(orderNo) : undefined;
  const canQuery = Boolean(orderNo && capability);
  const { data, refetch, isFetching } = useQuery({
    enabled: enabled && canQuery,
    queryKey: ["queryPurchaseOrder", orderNo],
    queryFn: async () => {
      if (!orderNo) return;
      try {
        const { data } = await queryPurchaseOrder(
          {
            order_no: orderNo,
            checkout_token: getCheckoutToken(orderNo),
          },
          { skipErrorHandler: true }
        );
        if (data?.data?.status !== 1) {
          setEnabled(false);
          if (data?.data?.token) {
            setAuthorization(data?.data?.token);
            await getUserInfo();
            clearCheckoutToken(orderNo);
          }
          if ([3, 4].includes(data?.data?.status ?? 0))
            clearCheckoutToken(orderNo);
        }
        setAccessError(false);
        return data?.data;
      } catch (error) {
        setEnabled(false);
        setAccessError(true);
        throw error;
      }
    },
    retry: false,
    refetchInterval: (query) =>
      query.state.status === "error" ||
      (query.state.data && query.state.data.status !== 1)
        ? false
        : 3000,
  });

  const [paymentType, setPaymentType] = useState<string>();
  const [checkoutUrl, setCheckoutUrl] = useState<string>();

  // Checkout is triggered manually by user click, not automatically
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const { data } = await purchaseCheckout({
        orderNo: orderNo || "",
        checkout_token: orderNo ? getCheckoutToken(orderNo) : undefined,
        returnUrl: window.location.href,
      });
      return data?.data;
    },
    onSuccess: (result) => {
      if (!result) return;
      if (result.type === "balance") {
        refetch();
        return;
      }
      setPaymentType(result.type);
      if (result.type === "url" && result.checkout_url) {
        window.location.href = result.checkout_url;
      } else if (result.checkout_url) {
        setCheckoutUrl(result.checkout_url);
      }
    },
  });

  useEffect(() => {
    if (search.order_no) {
      setOrderNo(search.order_no);
      setEnabled(true);
      setAccessError(false);
    }
  }, [search]);

  const [countDown, formattedRes] = useCountDown({
    targetDate:
      data &&
      format(addMinutes(data?.created_at, 15), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
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

  if (accessError || !(isLoadingUser || canQuery || data)) {
    return (
      <main className="container py-12">
        <div className="mx-auto max-w-lg space-y-4" role="alert">
          <h1 className="font-semibold text-xl">
            {t("orderUnavailable", "Order unavailable")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "orderAccessRequired",
              "The order access token is missing or no longer valid. Sign in to the account used for this order."
            )}
          </p>
          <div className="flex gap-2">
            {canQuery && (
              <Button
                disabled={isFetching}
                onClick={() => {
                  setAccessError(false);
                  setEnabled(true);
                  refetch();
                }}
              >
                {t("retry", "Retry")}
              </Button>
            )}
            <Button asChild variant="outline">
              <Link onClick={() => setRedirectUrl("/order")} to="/auth">
                {t("signIn", "Sign in")}
              </Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container lg:mt-16">
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="order-2 xl:order-1">
          <CardHeader className="flex flex-row items-start bg-muted/50">
            <div className="grid gap-0.5">
              <CardTitle className="flex flex-col text-lg">
                {t("orderNumber", "Order Number")}
                <span>{data?.order_no}</span>
              </CardTitle>
              <CardDescription>
                {t("createdAt", "Created At")}: {formatDate(data?.created_at)}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 p-6 text-sm">
            <div className="font-semibold">
              {t("paymentMethod", "Payment Method")}
            </div>
            <dl className="grid gap-3">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">
                  <Badge>{data?.payment.name || data?.payment.platform}</Badge>
                </dt>
              </div>
            </dl>
            <Separator />

            {data && (
              <SubscribeDetail
                subscribe={{
                  ...data?.subscribe,
                  quantity: data?.quantity,
                }}
              />
            )}
            <Separator />
            <SubscribeBilling
              order={{
                ...data,
                unit_price: data?.subscribe?.unit_price,
                show_original_price: data?.subscribe?.show_original_price,
              }}
            />
          </CardContent>
        </Card>
        <Card className="order-1 flex flex-auto items-center justify-center xl:order-2">
          <CardContent className="py-16">
            {data?.status && [2, 5].includes(data?.status) && (
              <div className="flex flex-col items-center gap-8 text-center">
                <h3 className="font-bold text-2xl tracking-tight">
                  {t("paymentSuccess", "Payment Successful")}
                </h3>
                <Icon
                  className="text-7xl text-green-500"
                  icon="mdi:success-circle-outline"
                />
                <div className="flex gap-4">
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
            {data?.status === 1 && !paymentType && (
              <div className="flex flex-col items-center gap-8 text-center">
                <h3 className="font-bold text-2xl tracking-tight">
                  {t("waitingForPayment", "Waiting for Payment")}
                </h3>
                <p className="flex items-center font-bold text-3xl">
                  {countdownDisplay}
                </p>
                <Icon
                  className="text-7xl text-muted-foreground"
                  icon="mdi:access-time"
                />
                <div className="flex gap-4">
                  <Button
                    disabled={checkoutMutation.isPending}
                    onClick={() => checkoutMutation.mutate()}
                  >
                    {checkoutMutation.isPending
                      ? t("processing", "Processing...")
                      : t("goToPayment", "Go to Payment")}
                  </Button>
                </div>
              </div>
            )}

            {data?.status === 1 && paymentType === "qr" && checkoutUrl && (
              <div className="flex flex-col items-center gap-8 text-center">
                <h3 className="font-bold text-2xl tracking-tight">
                  {t("scanToPay", "Scan to Pay")}
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
                  value={checkoutUrl}
                />
                <div className="flex gap-4">
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

            {data?.status && [3, 4].includes(data?.status) && (
              <div className="flex flex-col items-center gap-8 text-center">
                <h3 className="font-bold text-2xl tracking-tight">
                  {t("orderClosed", "Order Closed")}
                </h3>
                <Icon className="text-7xl text-red-500" icon="mdi:cancel" />
                <div className="flex gap-4">
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
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
