"use client";

import { Tooltip } from "@heroui/react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";

import { Separator } from "@workspace/ui/components/separator";
import { Combobox } from "@workspace/ui/composed/combobox";
import {
  ProTable,
  type ProTableActions,
} from "@workspace/ui/composed/pro-table/pro-table";
import { useSearch } from "@workspace/ui/lib/router-compat";
import { cn } from "@workspace/ui/lib/utils";
import {
  getOrderList,
  putOrderStatus as updateOrderStatus,
} from "@workspace/ui/services/admin/admin";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/display";
import { useSubscribe } from "@/stores/subscribe";
import { formatDate } from "@/utils/common";
import { UserDetail } from "../user/user-detail";

export default function Order() {
  const { t } = useTranslation("order");
  const sp = useSearch({ strict: false }) as Record<string, string | undefined>;

  // Soft semantic tints rather than solid saturated fills: this value is also
  // the Combobox trigger background, and a solid block there had dark text on a
  // saturated colour in light mode.
  const statusOptions = [
    {
      value: 1,
      label: t("status.1", "Pending"),
      className: "bg-warning-soft text-warning-soft-foreground",
    },
    {
      value: 2,
      label: t("status.2", "Paid"),
      className: "bg-success-soft text-success-soft-foreground",
    },
    {
      value: 3,
      label: t("status.3", "Cancelled"),
      className: "bg-default-soft text-default-soft-foreground",
    },
    {
      value: 4,
      label: t("status.4", "Closed"),
      className: "bg-danger-soft text-danger-soft-foreground",
    },
    {
      value: 5,
      label: t("status.5", "Completed"),
      className: "bg-success-soft text-success-soft-foreground",
    },
  ];

  const typeOptions = [
    { value: 1, label: t("type.1", "New Purchase") },
    { value: 2, label: t("type.2", "Renewal") },
    { value: 3, label: t("type.3", "Reset Traffic") },
    { value: 4, label: t("type.4", "Recharge") },
    { value: 5, label: t("type.5", "Redeem") },
  ];

  const ref = useRef<ProTableActions>(null);

  const { subscribes, getSubscribeName } = useSubscribe();
  const initialFilters = {
    status: sp.status ? Number(sp.status) : undefined,
    subscribe_id: sp.subscribe_id || undefined,
    search: sp.search || undefined,
    user_id: sp.user_id || undefined,
  };

  return (
    <ProTable<API.Order, API.GetOrderListParams>
      action={ref}
      columns={[
        {
          accessorKey: "order_no",
          header: t("orderNumber", "Order Number"),
        },
        {
          accessorKey: "type",
          header: t("type.0", "Type"),
          cell: ({ row }) => {
            const type = row.getValue("type") as number;
            return (
              typeOptions.find((opt) => opt.value === type)?.label ||
              t(`type.${type}`)
            );
          },
        },
        {
          accessorKey: "subscribe_id",
          header: t("subscribe", "Subscribe"),
          cell: ({ row }) => {
            const order = row.original as API.Order;
            if (order.type === 4) {
              const type = row.getValue("type") as number;
              return (
                typeOptions.find((opt) => opt.value === type)?.label ||
                t(`type.${type}`)
              );
            }
            const name = getSubscribeName(order.subscribe_id);
            const quantity = order.quantity;
            return name ? `${name} × ${quantity}` : "";
          },
        },
        {
          accessorKey: "amount",
          header: t("amount", "Amount"),
          cell: ({ row }) => {
            const order = row.original as API.Order;
            return (
              <Tooltip>
                <Button className="p-0" variant="link">
                  <Display type="currency" value={order.amount} />
                </Button>

                <Tooltip.Content className="w-auto max-w-[80vw]">
                  <div className="grid gap-3">
                    {order.trade_no && (
                      <>
                        <div className="font-semibold">
                          {t("tradeNo", "Transaction Number")}
                        </div>
                        <span className="break-all text-muted">
                          {order.trade_no}
                        </span>
                        <Separator className="my-2" />
                      </>
                    )}
                    <ul className="grid gap-3">
                      <li className="flex items-center justify-between">
                        <span className="text-muted">
                          {t("subscribePrice", "Subscription Price")}
                        </span>
                        <span>
                          <Display type="currency" value={order.price} />
                        </span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-muted">
                          {t("discount", "Discount Amount")}
                        </span>
                        <span>
                          <Display type="currency" value={order.discount} />
                        </span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-muted">
                          {t("couponDiscount", "Coupon Discount")}
                        </span>
                        <span>
                          <Display
                            type="currency"
                            value={order.coupon_discount}
                          />
                        </span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-muted">
                          {t("feeAmount", "Fee Amount")}
                        </span>
                        <span>
                          <Display type="currency" value={order.fee_amount} />
                        </span>
                      </li>
                      <li className="flex items-center justify-between font-semibold">
                        <span className="text-muted">
                          {t("total", "Total")}
                        </span>
                        <span>
                          <Display type="currency" value={order.amount} />
                        </span>
                      </li>
                    </ul>
                  </div>
                  <Separator className="my-4" />
                  <ul className="grid gap-3">
                    <li className="flex items-center justify-between">
                      <span className="text-muted">
                        {t("method", "Payment Method")}
                      </span>
                      <span>
                        {order.payment?.name || order.payment?.platform}
                      </span>
                    </li>
                  </ul>
                </Tooltip.Content>
              </Tooltip>
            );
          },
        },
        {
          accessorKey: "user_id",
          header: t("user", "User"),
          cell: ({ row }) => {
            const order = row.original as API.Order;
            return <UserDetail id={order.user_id} />;
          },
        },
        {
          accessorKey: "updated_at",
          header: t("updateTime", "Update Time"),
          cell: ({ row }) => {
            const order = row.original as API.Order;
            return formatDate(order.updated_at);
          },
        },
        {
          accessorKey: "status",
          header: t("status.0", "Status"),
          cell: ({ row }) => {
            const order = row.original as API.Order;
            const option = statusOptions.find(
              (opt) => opt.value === order.status
            );
            if ([1, 3, 4].includes(row.getValue("status"))) {
              return (
                <Combobox<number, false>
                  className={cn(option?.className)}
                  onChange={async (value) => {
                    await updateOrderStatus({
                      id: order.id,
                      status: value,
                    });
                    ref.current?.refresh();
                  }}
                  options={statusOptions}
                  placeholder={t("status.0", "Status")}
                  value={order.status}
                />
              );
            }
            return (
              <Badge>
                {option?.label || t(`status.${row.getValue("status")}`)}
              </Badge>
            );
          },
        },
      ]}
      initialFilters={initialFilters}
      key={JSON.stringify(initialFilters)}
      params={[
        {
          key: "status",
          placeholder: t("status.0", "Status"),
          options: statusOptions.map((item) => ({
            label: item.label,
            value: String(item.value),
          })),
        },
        {
          key: "subscribe_id",
          placeholder: `${t("subscribe", "Subscribe")}`,
          options: subscribes?.map((item) => ({
            label: item.name!,
            value: String(item.id),
          })),
        },
        { key: "search" },
        {
          key: "user_id",
          placeholder: `${t("user", "User")} ID`,
          options: undefined,
        },
      ]}
      request={async (pagination, filter) => {
        const { data } = await getOrderList({ ...pagination, ...filter });
        return {
          list: data.data?.list || [],
          total: data.data?.total || 0,
        };
      }}
    />
  );
}
