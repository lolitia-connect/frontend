"use client";

import {
  getOrderEventTicket,
  getV2Order,
  type OrderSnapshot,
  orderEventUrl,
  reconcileStripeReturn,
} from "@workspace/ui/services/user/order-v2";

interface OrderEventsOptions {
  checkoutToken?: string;
  onError: (error: unknown) => void;
  onSnapshot: (snapshot: OrderSnapshot) => void;
  orderNo: string;
  stripeReturn?: boolean;
}

export function watchOrderEvents({
  orderNo,
  checkoutToken,
  stripeReturn = false,
  onSnapshot,
  onError,
}: OrderEventsOptions) {
  let stopped = false;
  let source: EventSource | undefined;
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  let expiryTimer: ReturnType<typeof setTimeout> | undefined;
  let pollTimer: ReturnType<typeof setTimeout> | undefined;
  let cursor: string | undefined;
  let snapshot: OrderSnapshot | undefined;
  let failures = 0;
  let connected = false;

  const stop = () => {
    stopped = true;
    source?.close();
    clearTimeout(reconnectTimer);
    clearTimeout(expiryTimer);
    clearTimeout(pollTimer);
  };
  const accept = (next: Partial<OrderSnapshot>, reset = false) => {
    if (
      stopped ||
      next.order_no !== orderNo ||
      !Number.isSafeInteger(next.state_version)
    )
      return;
    if (
      snapshot &&
      (next.state_version ?? 0) <= snapshot.state_version &&
      !reset
    )
      return;
    if (snapshot && (next.state_version ?? 0) < snapshot.state_version) return;
    snapshot = { ...snapshot, ...next } as OrderSnapshot;
    if (!next.status)
      snapshot.status =
        snapshot.fulfillment_status === "finished"
          ? "finished"
          : snapshot.payment_status === "paid"
            ? "paid"
            : snapshot.payment_status === "closed"
              ? "closed"
              : snapshot.payment_status === "failed"
                ? "failed"
                : "pending_payment";
    onSnapshot(snapshot);
    if (["finished", "closed", "failed"].includes(snapshot.status)) stop();
  };
  const poll = async (onReturn = false) => {
    if (stopped) return;
    try {
      if (connected && !onReturn) return;
      const { data } = onReturn
        ? await reconcileStripeReturn(orderNo, checkoutToken).catch(() =>
            getV2Order(orderNo, checkoutToken)
          )
        : await getV2Order(orderNo, checkoutToken);
      if (data.data) accept(data.data.order);
    } catch (error) {
      const failure = error as {
        code?: number;
        response?: { status?: number; data?: { code?: number } };
      };
      if (
        [401, 403, 404, 410].includes(failure.response?.status ?? 0) ||
        [40_002, 40_003, 40_004, 40_005, 61_001].includes(
          failure.response?.data?.code ?? failure.code ?? 0
        )
      ) {
        stop();
        onError(error);
      }
    } finally {
      if (!stopped) pollTimer = setTimeout(poll, 5000);
    }
  };
  const reconnect = () => {
    connected = false;
    source?.close();
    clearTimeout(expiryTimer);
    clearTimeout(reconnectTimer);
    if (stopped) return;
    reconnectTimer = setTimeout(
      connect,
      Math.min(1000 * 2 ** failures++, 30_000)
    );
  };
  const connect = async () => {
    if (stopped || typeof EventSource === "undefined") return;
    try {
      const { data } = await getOrderEventTicket(orderNo, checkoutToken);
      if (stopped) return;
      const ticket = data.data;
      if (!ticket) throw new Error("Missing event ticket");
      source = new EventSource(orderEventUrl(orderNo, ticket, cursor));
      source.onopen = () => {
        failures = 0;
        connected = true;
      };
      const receive = (event: MessageEvent<string>) => {
        try {
          const next: Partial<OrderSnapshot> = JSON.parse(event.data);
          if (
            stopped ||
            next.order_no !== orderNo ||
            !Number.isSafeInteger(next.state_version)
          )
            return;
          if (event.type === "order.reset") cursor = undefined;
          if (
            event.lastEventId &&
            /^\d+$/.test(event.lastEventId) &&
            (!cursor || BigInt(event.lastEventId) > BigInt(cursor))
          )
            cursor = event.lastEventId;
          accept(next, event.type === "order.reset");
        } catch {
          reconnect();
        }
      };
      for (const type of [
        "order.snapshot",
        "order.reset",
        "order.created",
        "order.payment_paid",
        "order.fulfilled",
        "order.closed",
        "order.state_changed",
      ])
        source.addEventListener(type, receive as EventListener);
      source.addEventListener("stream.expiring", reconnect);
      source.onerror = reconnect;
      expiryTimer = setTimeout(
        reconnect,
        Math.max(1000, ticket.ticket_expires_at * 1000 - Date.now() - 5000)
      );
    } catch {
      reconnect();
    }
  };
  poll(stripeReturn);
  connect();
  return stop;
}
