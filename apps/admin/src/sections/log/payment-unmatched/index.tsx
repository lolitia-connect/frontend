"use client";

import { ProTable } from "@workspace/ui/composed/pro-table/pro-table";
import { useSearch } from "@workspace/ui/lib/router-compat";
import { getLogPaymentUnmatchedList } from "@workspace/ui/services/admin/admin";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/display";
import { OrderLink } from "@/components/order-link";
import { UserDetail } from "@/sections/user/user-detail";
import { formatDate } from "@/utils/common";
import { useTableSearchParams } from "@/utils/use-table-search-params";
import { RequestSource } from "../request-source";

export default function UnmatchedPayments() {
  const { t } = useTranslation("log");
  const search = useSearch({ strict: false }) as Record<
    string,
    string | undefined
  >;
  const syncFilters = useTableSearchParams([
    "search",
    "user_id",
    "start_date",
    "end_date",
  ]);
  return (
    <ProTable<
      API.UnmatchedPaymentLog,
      {
        search?: string;
        user_id?: string;
        start_date?: string;
        end_date?: string;
      }
    >
      columns={[
        {
          accessorKey: "user_id",
          header: t("column.user", "User"),
          cell: ({ row }) => <UserDetail id={row.original.user_id} />,
        },
        {
          accessorKey: "order_no",
          header: t("column.orderNo", "Order No."),
          cell: ({ row }) => <OrderLink orderId={row.original.order_no} />,
        },
        {
          accessorKey: "trade_no",
          header: t("column.tradeNo", "Transaction No."),
          cell: ({ row }) => (
            <span className="block max-w-72 break-all font-mono text-xs">
              {row.original.trade_no}
            </span>
          ),
        },
        {
          accessorKey: "amount",
          header: t("column.amount", "Amount"),
          cell: ({ row }) => (
            <div>
              <Display type="currency" value={row.original.amount} />{" "}
              <span>{row.original.currency}</span>
            </div>
          ),
        },
        { accessorKey: "platform", header: t("column.payment", "Payment") },
        {
          accessorKey: "reason",
          header: t("column.reason", "Reason"),
          cell: ({ row }) => (
            <span className="block max-w-80 whitespace-pre-wrap break-words">
              {row.original.reason}
            </span>
          ),
        },
        {
          id: "request_source",
          header: t("column.requestSource", "Request source"),
          cell: ({ row }) => <RequestSource metadata={row.original} />,
        },
        {
          accessorKey: "timestamp",
          header: t("column.time", "Time"),
          cell: ({ row }) => formatDate(row.original.timestamp),
        },
      ]}
      header={{ title: t("title.paymentUnmatched", "Unmatched Payments") }}
      initialFilters={{
        search: search.search,
        user_id: search.user_id,
        start_date: search.start_date,
        end_date: search.end_date,
      }}
      onFiltersChange={syncFilters}
      params={[
        {
          key: "search",
          placeholder: t("unmatchedSearch", "Order or transaction number"),
        },
        { key: "user_id", placeholder: t("column.userId", "User ID") },
        {
          key: "start_date",
          type: "date",
          label: t("startDate", "Start date"),
        },
        { key: "end_date", type: "date", label: t("endDate", "End date") },
      ]}
      request={async (pagination, filters) => {
        const { data } = await getLogPaymentUnmatchedList({
          ...pagination,
          ...filters,
          user_id: filters.user_id ? Number(filters.user_id) : undefined,
        });
        return { list: data.data?.list || [], total: data.data?.total || 0 };
      }}
    />
  );
}
