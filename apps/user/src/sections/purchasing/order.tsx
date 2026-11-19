"use client";

import { Card } from "@heroui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { Icon } from "@workspace/ui/composed/icon";
import { Link, useSearch } from "@workspace/ui/lib/router-compat";
import {
  checkoutV2Order,
  exchangeOrderSession,
  type OrderSnapshot,
} from "@workspace/ui/services/user/order-v2";
import { queryPurchaseOrder } from "@workspace/ui/services/user/portal";
import { formatDate } from "@workspace/ui/utils/formatting";
import { useCountDown } from "ahooks";
import { addMinutes, format } from "date-fns";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { SubscribeBilling } from "@/sections/subscribe/billing";
import { SubscribeDetail } from "@/sections/subscribe/detail";

import { useGlobalStore } from "@/stores/global";
import { setAuthorization, setRedirectUrl } from "@/utils/common";
import { clearCheckoutToken, getCheckoutToken } from "./checkout-token";
import { recentCheckoutOrder, takeOrderPayment } from "./create-order";
import { watchOrderEvents } from "./order-events";

export default function Order() {
  const { t } = useTranslation("order");
  const { getUserInfo, isLoadingUser } = useGlobalStore();
  const [orderNo, setOrderNo] = useState<string>();
  const [enabled, setEnabled] = useState<boolean>(false);
  const [accessError, setAccessError] = useState(false);
  const [snapshot, setSnapshot] = useState<OrderSnapshot>();
  const [sessionState, setSessionState] = useState<
    "idle" | "pending" | "error" | "ready"
  >("idle");
  const [sessionRetry, setSessionRetry] = useState(0);
  const sessionAttempt = useRef<string | undefined>(undefined);
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
        if (data?.data?.status !== 1 && data?.data?.status !== 2) {
          setEnabled(false);
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
      (query.state.data && ![1, 2].includes(query.state.data.status))
        ? false
        : 3000,
  });

  const [paymentType, setPaymentType] = useState<string>();
  const [checkoutUrl, setCheckoutUrl] = useState<string>();

  useEffect(() => {
    if (!(orderNo && capability) || accessError) return;
    return watchOrderEvents({
      orderNo,
      checkoutToken: capability,
      onSnapshot: setSnapshot,
      onError: () => {
        setAccessError(true);
        setEnabled(false);
      },
    });
  }, [orderNo, capability, accessError]);

  useEffect(() => {
    if (!orderNo) return;
    const payment = takeOrderPayment(orderNo);
    if (
      payment &&
      ["qr", "url"].includes(payment.type) &&
      payment.checkout_url
    ) {
      setPaymentType(payment.type);
      setCheckoutUrl(payment.checkout_url);
    }
  }, [orderNo]);

  useEffect(() => {
    if (
      !(orderNo && capability) ||
      sessionAttempt.current === orderNo ||
      !(snapshot?.fulfillment_status === "finished" || data?.status === 5)
    )
      return;
    sessionAttempt.current = orderNo;
    setSessionState("pending");
    exchangeOrderSession(orderNo, capability)
      .then(async ({ data: result }) => {
        const token = result.data?.access_token;
        if (!token) throw new Error("Missing account session");
        setAuthorization(token);
        await getUserInfo();
        clearCheckoutToken(orderNo);
        setSessionState("ready");
      })
      .catch(() => {
        sessionAttempt.current = undefined;
        setSessionState("error");
      });
  }, [
    orderNo,
    capability,
    snapshot?.fulfillment_status,
    data?.status,
    getUserInfo,
    sessionRetry,
  ]);

  // Checkout is triggered manually by user click, not automatically
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const { data } = await checkoutV2Order(
        orderNo || "",
        orderNo ? getCheckoutToken(orderNo) : undefined
      );
      if (data.data) setSnapshot(data.data.order);
      return data.data?.payment;
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
    const restoredOrder = search.order_no || recentCheckoutOrder();
    if (restoredOrder) {
      setOrderNo(restoredOrder);
      setEnabled(true);
      setAccessError(false);
      setSnapshot(undefined);
      setPaymentType(undefined);
      setCheckoutUrl(undefined);
      setSessionState("idle");
    }
  }, [search.order_no]);

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

  if (accessError || !(isLoadingUser || canQuery || data)) {
    return (
      <main className="container py-12">
        <div className="mx-auto max-w-lg space-y-4" role="alert">
          <h1 className="font-semibold text-xl">
            {t("orderUnavailable", "Order unavailable")}
          </h1>
          <p className="text-muted">
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
    <main className="container mb-16 lg:mt-16">
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="order-2 xl:order-1">
          <Card.Header className="flex flex-row items-start bg-default/50">
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
          </Card.Content>
        </Card>
        <Card className="order-1 flex flex-auto items-center justify-center xl:order-2">
          <Card.Content className="flex items-center justify-center py-16">
            {currentStatus && [2, 5].includes(currentStatus) && (
              <div className="flex flex-col items-center gap-8 text-center">
                <h3 className="font-bold text-2xl tracking-tight">
                  {currentStatus === 5
                    ? t("paymentSuccess", "Payment Successful")
                    : t("paymentReceived", "Payment received")}
                </h3>
                <Icon
                  className="text-7xl text-success"
                  icon="mdi:success-circle-outline"
                />
                {currentStatus === 2 && (
                  <p className="max-w-sm text-muted text-sm" role="status">
                    {t(
                      "fulfillmentPending",
                      "Your subscription is being activated."
                    )}
                  </p>
                )}
                {currentStatus === 5 && sessionState !== "ready" && (
                  <div
                    className="max-w-sm space-y-3 text-muted text-sm"
                    role="status"
                  >
                    <p>
                      {sessionState === "error"
                        ? t(
                            "sessionRestoreFailed",
                            "Your order is complete, but sign-in could not be restored."
                          )
                        : t(
                            "sessionRestoring",
                            "Restoring your account session..."
                          )}
                    </p>
                    {sessionState === "error" && (
                      <Button
                        onClick={() => setSessionRetry((value) => value + 1)}
                        variant="outline"
                      >
                        {t("retrySession", "Retry sign-in")}
                      </Button>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap justify-center gap-4">
                  {currentStatus === 5 && sessionState === "ready" && (
                    <Button asChild>
                      <Link to="/dashboard">
                        {t("subscribeNow", "Subscribe Now")}
                      </Link>
                    </Button>
                  )}
                  <Button asChild variant="outline">
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
                  {t("waitingForPayment", "Waiting for Payment")}
                </h3>
                <p className="flex items-center font-bold text-3xl">
                  {countdownDisplay}
                </p>
                <Icon className="text-7xl text-muted" icon="mdi:access-time" />
                <div className="flex gap-4">
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
                      : t("goToPayment", "Go to Payment")}
                  </Button>
                </div>
              </div>
            )}

            {currentStatus === 1 && paymentType === "qr" && checkoutUrl && (
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

            {currentStatus && [3, 4].includes(currentStatus) && (
              <div className="flex flex-col items-center gap-8 text-center">
                <h3 className="font-bold text-2xl tracking-tight">
                  {t("orderClosed", "Order Closed")}
                </h3>
                <Icon className="text-7xl text-danger" icon="mdi:cancel" />
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
          </Card.Content>
        </Card>
      </div>
    </main>
  );
}
