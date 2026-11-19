import request from "@workspace/ui/lib/request";
import { LosslessNumber, stringify } from "lossless-json";

export interface OrderSnapshot {
  amount: number;
  currency: string;
  expires_at: number;
  fulfillment_status: string;
  order_no: string;
  payment_status: string;
  state_version: number;
  status: string;
}

export interface EventTicket {
  ticket_expires_at: number;
  url: string;
}

export interface V2Order {
  checkout_token?: string;
  events: EventTicket;
  order: OrderSnapshot;
  payment?: { type: string; checkout_url?: string; payment_status: string };
}

export interface CreateOrder {
  amount?: number;
  coupon?: string;
  guest?: {
    auth_type: string;
    identifier: string;
    password: string;
    invite_code?: string;
  };
  payment_id: string;
  quantity?: number;
  return_url?: string;
  subscribe_id?: string;
  type: "purchase" | "renewal" | "reset_traffic" | "recharge";
  user_subscribe_id?: string;
}

const orderPath = (orderNo: string) =>
  `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v2/public/orders/${encodeURIComponent(orderNo)}`;

export function createV2Order(body: CreateOrder, idempotencyKey: string) {
  const serialized = { ...body } as Record<string, unknown>;
  for (const field of [
    "payment_id",
    "subscribe_id",
    "user_subscribe_id",
  ] as const) {
    if (body[field] !== undefined) {
      if (!/^-?\d+$/.test(body[field]))
        throw new Error("Invalid order identifier");
      serialized[field] = new LosslessNumber(body[field]);
    }
  }
  return request<API.Response & { data?: V2Order }>(
    `${process.env.NEXT_PUBLIC_API_PREFIX || ""}/v2/public/orders`,
    {
      method: "POST",
      data: stringify(serialized),
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
    }
  );
}

export function getV2Order(orderNo: string, checkoutToken?: string) {
  return request<API.Response & { data?: V2Order }>(orderPath(orderNo), {
    params: { checkout_token: checkoutToken },
    skipErrorHandler: true,
  });
}

export function checkoutV2Order(orderNo: string, checkoutToken?: string) {
  return request<API.Response & { data?: V2Order }>(
    `${orderPath(orderNo)}/checkout`,
    {
      method: "POST",
      data: { checkout_token: checkoutToken, return_url: window.location.href },
    }
  );
}

export function getOrderEventTicket(orderNo: string, checkoutToken?: string) {
  return request<API.Response & { data?: EventTicket }>(
    `${orderPath(orderNo)}/event-ticket`,
    {
      method: "POST",
      data: { checkout_token: checkoutToken },
      skipErrorHandler: true,
    }
  );
}

export function exchangeOrderSession(orderNo: string, checkoutToken: string) {
  return request<API.Response & { data?: { access_token: string } }>(
    `${orderPath(orderNo)}/session`,
    {
      method: "POST",
      data: { checkout_token: checkoutToken },
      skipErrorHandler: true,
    }
  );
}

export function orderEventUrl(
  orderNo: string,
  ticket: EventTicket,
  cursor?: string
) {
  const received = new URL(ticket.url, window.location.origin);
  const url = new URL(
    request.getUri({ url: `${orderPath(orderNo)}/events` }),
    window.location.origin
  );
  const token = received.searchParams.get("ticket");
  if (!token) throw new Error("Missing event ticket");
  url.searchParams.set("ticket", token);
  if (cursor) url.searchParams.set("after", cursor);
  return url.href;
}
