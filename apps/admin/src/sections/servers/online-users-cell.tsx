// @ts-nocheck
"use client";

import { Sheet, Button as SheetButton } from "@heroui/react";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { ProTable } from "@workspace/ui/composed/pro-table/pro-table";
import { useQuery } from "@workspace/ui/hooks/query";
import { getUserSubscribeDetail as getUserSubscribeById } from "@workspace/ui/services/admin/admin";
import { formatBytes } from "@workspace/ui/utils/formatting";
import { Users } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IpLink } from "@/components/ip-link";
import { UserDetail } from "@/sections/user/user-detail";
import { formatDate } from "@/utils/common";

function UserSubscribeInfo({
  subscribeId,
  open,
  type,
  expiredText,
  unlimitedText,
}: {
  subscribeId: string;
  open: boolean;
  type:
    | "account"
    | "subscribeName"
    | "subscribeId"
    | "trafficUsage"
    | "expireTime";
  expiredText: string;
  unlimitedText: string;
}) {
  const { data, isLoading } = useQuery({
    enabled: Boolean(subscribeId) && open,
    queryKey: ["getUserSubscribeById", subscribeId],
    queryFn: async () => {
      const { data } = await getUserSubscribeById({ id: subscribeId });
      return data.data;
    },
  });

  if (isLoading) return <Skeleton className="h-4 w-16" />;
  if (!data) return <span className="text-muted">--</span>;

  switch (type) {
    case "account":
      if (!data.user_id) return <span className="text-muted">--</span>;
      return <UserDetail id={data.user_id} />;

    case "subscribeName":
      if (!data.subscribe?.name) return <span className="text-muted">--</span>;
      return <span className="text-sm">{data.subscribe.name}</span>;

    case "subscribeId":
      if (!data.id) return <span className="text-muted">--</span>;
      return <span className="font-mono text-sm">{data.id}</span>;

    case "trafficUsage": {
      const usedTraffic = data.upload + data.download;
      const isUnlimited = data.traffic_unlimited;
      return (
        <div className="min-w-0 text-sm">
          <div className="wrap-break-word">
            {isUnlimited
              ? `${formatBytes(usedTraffic)} / ${unlimitedText}`
              : `${formatBytes(usedTraffic)} / ${formatBytes(data.traffic || 0)}`}
          </div>
        </div>
      );
    }

    case "expireTime": {
      if (!data.expire_time) return <span className="text-muted">--</span>;
      const isExpired = data.expire_time < Date.now() / 1000;
      return (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
          <span className="text-sm">{formatDate(data.expire_time)}</span>
          {isExpired && (
            <Badge className="w-fit px-1 py-0 text-xs" variant="destructive">
              {expiredText}
            </Badge>
          )}
        </div>
      );
    }

    default:
      return <span className="text-muted">--</span>;
  }
}

export default function OnlineUsersCell({
  status,
}: {
  status?: API.ServerStatus;
}) {
  const { t } = useTranslation("servers");
  const [open, setOpen] = useState(false);

  return (
    <Sheet isOpen={open} onOpenChange={setOpen} placement="right">
      <Sheet.Trigger>
        <SheetButton
          className="flex h-auto w-full min-w-0 items-center justify-between gap-2 whitespace-normal bg-transparent p-0 text-start text-muted text-sm hover:text-foreground"
          type="button"
          variant="ghost"
        >
          <Users className="h-4 w-4" /> {status?.online.length}
        </SheetButton>
      </Sheet.Trigger>
      <Sheet.Backdrop>
        <Sheet.Content>
          <Sheet.Dialog className="h-screen w-screen max-w-none sm:h-auto sm:w-[900px] sm:max-w-[90vw]">
            <Sheet.Header>
              <Sheet.Heading>{t("onlineUsers", "Online Users")}</Sheet.Heading>
            </Sheet.Header>
            <div className="admin-drawer-body px-6 py-4">
              <ProTable<API.ServerOnlineUser, Record<string, unknown>>
                columns={[
                  {
                    accessorKey: "ip",
                    header: t("ipAddresses", "IP Addresses"),
                    cell: ({ row }) => {
                      const ips = row.original.ip;
                      return (
                        <div className="flex min-w-0 flex-col gap-1">
                          {ips.map((item) => (
                            <div
                              className="whitespace-nowrap text-sm"
                              key={`${item.protocol}-${item.ip}`}
                            >
                              <Badge>{item.protocol}</Badge>
                              <IpLink
                                className="ml-1 font-medium"
                                ip={item.ip}
                              />
                            </div>
                          ))}
                        </div>
                      );
                    },
                  },
                  {
                    accessorKey: "user",
                    header: t("user", "User"),
                    cell: ({ row }) => (
                      <UserSubscribeInfo
                        expiredText={t("expired", "Expired")}
                        open={open}
                        subscribeId={String(row.original.subscribe_id)}
                        type="account"
                        unlimitedText={t("unlimited", "Unlimited")}
                      />
                    ),
                  },
                  {
                    accessorKey: "subscription",
                    header: t("subscription", "Subscription"),
                    cell: ({ row }) => (
                      <UserSubscribeInfo
                        expiredText={t("expired", "Expired")}
                        open={open}
                        subscribeId={String(row.original.subscribe_id)}
                        type="subscribeName"
                        unlimitedText={t("unlimited", "Unlimited")}
                      />
                    ),
                  },
                  {
                    accessorKey: "subscribeId",
                    header: t("subscribeId", "Subscribe ID"),
                    cell: ({ row }) => (
                      <UserSubscribeInfo
                        expiredText={t("expired", "Expired")}
                        open={open}
                        subscribeId={String(row.original.subscribe_id)}
                        type="subscribeId"
                        unlimitedText={t("unlimited", "Unlimited")}
                      />
                    ),
                  },
                  {
                    accessorKey: "traffic",
                    header: t("traffic", "Traffic"),
                    cell: ({ row }) => (
                      <UserSubscribeInfo
                        expiredText={t("expired", "Expired")}
                        open={open}
                        subscribeId={String(row.original.subscribe_id)}
                        type="trafficUsage"
                        unlimitedText={t("unlimited", "Unlimited")}
                      />
                    ),
                  },
                  {
                    accessorKey: "expireTime",
                    header: t("expireTime", "Expire Time"),
                    cell: ({ row }) => (
                      <UserSubscribeInfo
                        expiredText={t("expired", "Expired")}
                        open={open}
                        subscribeId={String(row.original.subscribe_id)}
                        type="expireTime"
                        unlimitedText={t("unlimited", "Unlimited")}
                      />
                    ),
                  },
                ]}
                header={{ hidden: true }}
                request={async () => ({
                  list: status?.online || [],
                  total: status?.online?.length || 0,
                })}
              />
            </div>
            <Sheet.CloseTrigger aria-label="Close" />
          </Sheet.Dialog>
        </Sheet.Content>
      </Sheet.Backdrop>
    </Sheet>
  );
}
