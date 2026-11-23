"use client";

import { Tooltip } from "@heroui/react";
import { Button } from "@workspace/ui/components/button";
import { useQuery } from "@workspace/ui/hooks/query";
import { Link } from "@workspace/ui/lib/router-compat";

import {
  getUserDetail,
  getUserSubscribeById,
} from "@workspace/ui/services/admin/user";
import { formatBytes } from "@workspace/ui/utils/formatting";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/display";
import { formatDate } from "@/utils/common";
// import EditUserGroupDialog from "./edit-user-group-dialog";
// import { getUserGroupList } from "@workspace/ui/services/admin/group";

export function UserSubscribeDetail({
  id,
  enabled,
  hoverCard = false,
}: {
  id: string | number;
  enabled: boolean;
  hoverCard?: boolean;
}) {
  const { t } = useTranslation("user");
  const resolvedId = id ? String(id) : "";

  const { data } = useQuery({
    enabled: resolvedId !== "" && resolvedId !== "0" && enabled,
    queryKey: ["getUserSubscribeById", resolvedId],
    queryFn: async () => {
      const { data } = await getUserSubscribeById({ id: resolvedId });
      return data.data;
    },
  });

  // Fetch user groups for display
  // const { data: groupsData } = useQuery({
  //   enabled: id !== 0 && enabled,
  //   queryKey: ["getUserGroupList"],
  //   queryFn: async () => {
  //     const { data } = await getUserGroupList({
  //       page: 1,
  //       size: 100,
  //     });
  //     return data.data?.list || [];
  //   },
  // });

  if (!resolvedId || resolvedId === "0") return "--";

  const usedTraffic = data ? data.upload + data.download : 0;
  const totalTraffic = data?.traffic || 0;
  const isTrafficUnlimited = data?.traffic_unlimited ?? false;
  const remainingTraffic = isTrafficUnlimited
    ? 0
    : totalTraffic > 0
      ? totalTraffic - usedTraffic
      : 0;

  // Get user group info from data.user
  // const userGroupId = typeof data?.user?.user_group_id === 'number' ? data?.user?.user_group_id : 0;
  // const groupLocked = data?.user?.group_locked || false;
  // const groupIds = userGroupId > 0 ? [userGroupId] : [];

  // const groupNames = userGroupId > 0
  //   ? groupsData?.find((g: API.UserGroup) => g.id === userGroupId)?.name || "--"
  //   : "--";

  const subscribeContent = (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 font-medium text-sm">{t("subscriptionInfo")}</h3>
        <div className="rounded-lg bg-default/30 p-3">
          <ul className="grid gap-3">
            <li className="flex items-center justify-between font-semibold">
              <span className="text-muted">{t("subscriptionId")}</span>
              <span>{data?.id || "--"}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted">{t("subscriptionName")}</span>
              <span>{data?.subscribe?.name || "--"}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted">{t("token")}</span>
              <div className="font-mono text-xs" title={data?.token || ""}>
                {data?.token || "--"}
              </div>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted">{t("trafficUsage")}</span>
              <span>
                {data
                  ? isTrafficUnlimited
                    ? `${formatBytes(usedTraffic)} / ${t("unlimited")}`
                    : `${formatBytes(usedTraffic)} / ${formatBytes(totalTraffic)}`
                  : "--"}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted">{t("remainingTraffic")}</span>
              <span>
                {data
                  ? isTrafficUnlimited
                    ? t("unlimited")
                    : formatBytes(remainingTraffic)
                  : "--"}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted">{t("startTime")}</span>
              <span>
                {data?.start_time ? formatDate(data.start_time) : "--"}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted">{t("expireTime")}</span>
              <span>
                {data?.expire_time ? formatDate(data.expire_time) : "--"}
              </span>
            </li>
            {/* <li className="flex items-center justify-between">
              <span className="text-muted">{t("userGroup")}</span>
              <div className="flex items-center gap-2">
                <span>{groupNames || "--"}</span>
                {data?.id && (
                  <EditUserGroupDialog
                    userId={data?.user_id || 0}
                    userSubscribeId={data?.id}
                    currentGroupIds={groupIds}
                    currentLocked={groupLocked}
                    trigger={
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        {t("edit", "Edit")}
                      </Button>
                    }
                    onSubmit={async () => {
                      window.location.reload();
                      return true;
                    }}
                  />
                )}
              </div>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted">{t("groupLocked")}</span>
              <span>
                {groupLocked ? t("yes", "Yes") : t("no", "No")}
              </span>
            </li> */}
          </ul>
        </div>
      </div>

      {!hoverCard && (
        <div>
          <h3 className="mb-2 font-medium text-sm">
            {t("userInfo")}
            {/* Removed link to legacy user detail page */}
          </h3>
          <ul className="grid gap-3">
            <li className="flex items-center justify-between font-semibold">
              <span className="text-muted">{t("userId")}</span>
              <span>{data?.user_id}</span>
            </li>
            <li className="flex items-center justify-between font-semibold">
              <span className="text-muted">{t("balance")}</span>
              <span>
                <Display type="currency" value={data?.user.balance} />
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted">{t("giftAmount")}</span>
              <span>
                <Display type="currency" value={data?.user?.gift_amount} />
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted">{t("commission")}</span>
              <span>
                <Display type="currency" value={data?.user?.commission} />
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted">{t("createdAt")}</span>
              <span>
                {data?.user?.created_at && formatDate(data?.user?.created_at)}
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );

  if (hoverCard) {
    return (
      <Tooltip>
        <Button className="p-0" variant="link">
          {data?.subscribe?.name || t("loading")}
        </Button>

        <Tooltip.Content className="w-96">{subscribeContent}</Tooltip.Content>
      </Tooltip>
    );
  }

  return subscribeContent;
}

export function UserDetail({ id }: { id: string | number }) {
  const { t } = useTranslation("user");
  const resolvedId = id ? String(id) : "";

  const { data } = useQuery({
    enabled: resolvedId !== "" && resolvedId !== "0",
    queryKey: ["getUserDetail", resolvedId],
    queryFn: async () => {
      const { data } = await getUserDetail({ id: resolvedId });
      return data.data;
    },
  });

  if (!resolvedId || resolvedId === "0") return "--";

  const identifier =
    data?.auth_methods.find((m) => m.auth_type === "email")?.auth_identifier ||
    data?.auth_methods[0]?.auth_identifier;

  return (
    <Tooltip>
      <Button asChild className="p-0" variant="link">
        <Link search={{ user_id: resolvedId }} to="/dashboard/user">
          {identifier || t("loading", "Loading...")}
        </Link>
      </Button>

      <Tooltip.Content>
        <div className="grid gap-3">
          <ul className="grid gap-3">
            <li className="flex items-center justify-between font-semibold">
              <span className="text-muted">ID</span>
              <span>{data?.id}</span>
            </li>
            <li className="flex items-center justify-between font-semibold">
              <span className="text-muted">{t("balance", "Balance")}</span>
              <span>
                <Display type="currency" value={data?.balance} />
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted">
                {t("giftAmount", "Gift Amount")}
              </span>
              <span>
                <Display type="currency" value={data?.gift_amount} />
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted">
                {t("commission", "Commission")}
              </span>
              <span>
                <Display type="currency" value={data?.commission} />
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted">{t("createdAt", "Created At")}</span>
              <span>{data?.created_at && formatDate(data?.created_at)}</span>
            </li>
          </ul>
        </div>
      </Tooltip.Content>
    </Tooltip>
  );
}
