"use client";

import {
  type CreateOrder,
  createV2Order,
} from "@workspace/ui/services/user/order-v2";
import { useRef } from "react";
import { saveCheckoutToken } from "./checkout-token";

export function useCreateOrder() {
  const attempt = useRef<{ payload: string; key: string } | undefined>(
    undefined
  );
  const pending = useRef<ReturnType<typeof createV2Order> | undefined>(
    undefined
  );
  return async (body: CreateOrder) => {
    if (pending.current) return pending.current;
    // `return_url` is where the payment gateway sends the browser back to.
    // The pre-migration app used legacy *hash* history, so `/payment` was
    // written as `#/payment`; under the App Router a fragment is not a route, so
    // the gateway would return the user to the bare pathname with a dead
    // fragment instead of the payment page. Use the real pathname route.
    const requestBody = {
      ...body,
      return_url: body.return_url || `${window.location.origin}/payment`,
    };
    const payload = JSON.stringify(requestBody);
    if (attempt.current?.payload !== payload)
      attempt.current = { payload, key: crypto.randomUUID() };
    pending.current = createV2Order(requestBody, attempt.current.key);
    try {
      const response = await pending.current;
      const order = response.data.data;
      if (order) {
        saveCheckoutToken(order.order.order_no, order.checkout_token);
        rememberOrderPayment(order.order.order_no, order.payment);
        try {
          sessionStorage.setItem("recent-checkout-order", order.order.order_no);
        } catch {
          /* storage unavailable */
        }
        attempt.current = undefined;
      }
      return response;
    } finally {
      pending.current = undefined;
    }
  };
}

type Payment = { type: string; checkout_url?: string; payment_status: string };
const payments = new Map<string, Payment>();

function rememberOrderPayment(orderNo: string, payment?: Payment) {
  if (payment) payments.set(orderNo, payment);
}

export function takeOrderPayment(orderNo: string) {
  return payments.get(orderNo);
}

export function recentCheckoutOrder() {
  try {
    return sessionStorage.getItem("recent-checkout-order") || undefined;
  } catch {
    return;
  }
}
