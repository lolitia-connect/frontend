"use client";

import { Card } from "@heroui/react";
import { Button, buttonVariants } from "@workspace/ui/components/button";
import {
  ProList,
  type ProListActions,
} from "@workspace/ui/composed/pro-list/pro-list";
import { Link } from "@workspace/ui/lib/router-compat";
import {
  postV1PublicOrderClose as closeOrder,
  getV1PublicOrderList as queryOrderList,
} from "@workspace/ui/services/user/user";
import { formatDate } from "@workspace/ui/utils/formatting";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/display";

export default function Order() {
  const { t } = useTranslation("order");
  const [cancelLoading, setCancelLoading] = useState(false);
  const statusMap: Record<number, string> = {
    0: t("status.0", "Status"),
    1: t("status.1", "Pending"),
    2: t("status.2", "Paid"),
    3: t("status.3", "Cancelled"),
    4: t("status.4", "Closed"),
    5: t("status.5", "Completed"),
  };
  const typeMap: Record<number, string> = {
    0: t("type.0", "Type"),
    1: t("type.1", "New Purchase"),
    2: t("type.2", "Renewal"),
    3: t("type.3", "Reset Traffic"),
    4: t("type.4", "Recharge"),
  };

  const ref = useRef<ProListActions>(null);
  return (
    <ProList<API.OrderDetail, Record<string, unknown>>
      action={ref}
      renderItem={(item) => (
        <Card className="overflow-hidden">
          <Card.Header className="flex flex-row items-center justify-between gap-2 space-y-0">
            <Card.Title>
              {t("orderNo", "Order No")}
              <p className="text-sm">{item.order_no}</p>
            </Card.Title>
            <Card.Description className="flex gap-2">
              {item.status === 1 ? (
                <>
                  <Link
                    className={buttonVariants({ size: "sm" })}
                    key="payment"
                    search={{ order_no: item.order_no }}
                    to="/payment"
                  >
                    {t("payment", "Payment")}
                  </Link>
                  <Button
                    disabled={cancelLoading}
                    key="cancel"
                    onClick={async () => {
                      if (cancelLoading) return;
                      setCancelLoading(true);
                      try {
                        await closeOrder({ orderNo: item.order_no });
                        ref.current?.refresh();
                      } finally {
                        setCancelLoading(false);
                      }
                    }}
                    size="sm"
                    variant="destructive"
                  >
                    {t("cancel", "Cancel")}
                  </Button>
                </>
              ) : (
                <Link
                  className={buttonVariants({ size: "sm" })}
                  key="detail"
                  search={{ order_no: item.order_no }}
                  to="/payment"
                >
                  {t("detail", "Detail")}
                </Link>
              )}
            </Card.Description>
          </Card.Header>
          <Card.Content className="text-sm">
            <ul className="grid grid-cols-2 gap-3 *:flex *:flex-col lg:grid-cols-4">
              <li>
                <span className="text-muted">{t("name", "Product Name")}</span>
                <span>
                  {item.subscribe.name ||
                    typeMap[item.type] ||
                    t(`type.${item.type}`, "Unknown Type")}
                </span>
              </li>
              <li className="font-semibold">
                <span className="text-muted">
                  {t("paymentAmount", "Amount")}
                </span>
                <span>
                  <Display type="currency" value={item.amount} />
                </span>
              </li>
              <li className="font-semibold">
                <span className="text-muted">{t("status.0", "Status")}</span>
                <span>
                  {statusMap[item.status] ||
                    t(`status.${item.status}`, "Unknown Status")}
                </span>
              </li>
              <li className="font-semibold">
                <span className="text-muted">
                  {t("createdAt", "Created At")}
                </span>
                <time>{formatDate(item.created_at)}</time>
              </li>
            </ul>
          </Card.Content>
        </Card>
      )}
      request={async (pagination, filter) => {
        const response = await queryOrderList({ ...pagination, ...filter });
        return {
          list: response.data.data?.list || [],
          total: response.data.data?.total || 0,
        };
      }}
    />
  );
}
