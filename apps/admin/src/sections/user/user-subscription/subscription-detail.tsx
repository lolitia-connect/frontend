"use client";

import { Sheet } from "@heroui/react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";

import { Switch } from "@workspace/ui/components/switch";
import { ConfirmButton } from "@workspace/ui/composed/confirm-button";
import { ProTable } from "@workspace/ui/composed/pro-table/pro-table";
import {
  getUserSubscribeDevices,
  kickOfflineByUserDevice,
} from "@workspace/ui/services/admin/user";
import { type ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { IpLink } from "@/components/ip-link";
import { formatDate } from "@/utils/common";

export function SubscriptionDetail({
  trigger,
  userId,
  subscriptionId,
}: {
  trigger: ReactElement<{ onPress?: (event: unknown) => void }>;
  userId: string | number;
  subscriptionId: string | number;
}) {
  const { t } = useTranslation("user");
  const [open, setOpen] = useState(false);

  return (
    <Sheet isOpen={open} onOpenChange={setOpen} placement="right">
      <Sheet.Trigger>{trigger}</Sheet.Trigger>
      <Sheet.Backdrop>
        <Sheet.Content>
          <Sheet.Dialog className="w-[700px] max-w-full md:max-w-screen-md">
            <Sheet.Header>
              <Sheet.Heading>
                {t("onlineDevices", "Online Devices")}
              </Sheet.Heading>
            </Sheet.Header>
            <div className="admin-drawer-body mt-4 px-6">
              <ProTable<API.UserDevice, Record<string, unknown>>
                actions={{
                  render: (row) => {
                    if (!row.identifier) return [];
                    return [
                      <ConfirmButton
                        cancelText={t("cancel", "Cancel")}
                        confirmText={t("confirm", "Confirm")}
                        description={t(
                          "kickOfflineConfirm",
                          `Kick device ${row.ip} offline?`
                        )}
                        key="offline"
                        onConfirm={async () => {
                          await kickOfflineByUserDevice({ id: row.id });
                          toast.success(
                            t("kickOfflineSuccess", "Device kicked offline")
                          );
                        }}
                        title={t("confirmOffline", "Confirm Offline")}
                        trigger={
                          <Button variant="destructive">
                            {t("confirmOffline", "Confirm Offline")}
                          </Button>
                        }
                      />,
                    ];
                  },
                }}
                columns={[
                  {
                    accessorKey: "enabled",
                    header: t("enable", "Enable"),
                    cell: ({ row }) => (
                      <Switch
                        checked={row.getValue("enabled")}
                        onChange={(checked) => {
                          console.log("Switch:", checked);
                        }}
                      />
                    ),
                  },
                  { accessorKey: "id", header: "ID" },
                  { accessorKey: "identifier", header: "IMEI" },
                  {
                    accessorKey: "user_agent",
                    header: t("userAgent", "User Agent"),
                  },
                  {
                    accessorKey: "ip",
                    header: "IP",
                    cell: ({ row }) => <IpLink ip={row.getValue("ip")} />,
                  },
                  {
                    accessorKey: "online",
                    header: t("loginStatus", "Login Status"),
                    cell: ({ row }) => (
                      <Badge
                        variant={
                          row.getValue("online") ? "default" : "destructive"
                        }
                      >
                        {row.getValue("online")
                          ? t("online", "Online")
                          : t("offline", "Offline")}
                      </Badge>
                    ),
                  },
                  {
                    accessorKey: "updated_at",
                    header: t("lastSeen", "Last Seen"),
                    cell: ({ row }) => formatDate(row.getValue("updated_at")),
                  },
                ]}
                request={async (pagination) => {
                  const { data } = await getUserSubscribeDevices({
                    user_id: String(userId),
                    subscribe_id: String(subscriptionId),
                    ...pagination,
                  });
                  return {
                    list: data.data?.list || [],
                    total: data.data?.total || 0,
                  };
                }}
              />
            </div>
            <Sheet.CloseTrigger aria-label="Close" />
          </Sheet.Dialog>
        </Sheet.Content>
      </Sheet.Backdrop>
    </Sheet>
  );
}
