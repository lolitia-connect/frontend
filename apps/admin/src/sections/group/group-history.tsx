"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Description,
  Modal,
} from "@heroui/react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import {
  ProTable,
  type ProTableActions,
} from "@workspace/ui/composed/pro-table/pro-table";
import { useQuery } from "@workspace/ui/hooks/query";
import {
  getGroupHistory,
  getGroupHistoryDetail,
  getNodeGroupList,
} from "@workspace/ui/services/admin/group";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/utils/common";

import { GroupDetailStats, GroupDetailTable } from "./group-detail-table";

export default function GroupHistory() {
  const { t } = useTranslation("group");
  const ref = useRef<ProTableActions>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedHistory, setSelectedHistory] =
    useState<API.GroupHistory | null>(null);
  const [details, setDetails] = useState<API.GroupHistoryDetailItem[]>([]);
  // Fetch all node groups
  const { data: nodeGroups } = useQuery({
    queryKey: ["getNodeGroupListForDetail"],
    queryFn: async () => {
      const { data } = await getNodeGroupList({
        page: 1,
        size: 100,
      });
      return data.data?.list || [];
    },
  });

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case "average":
        return t("averageMode", "Average");
      case "subscribe":
        return t("subscribeMode", "Subscribe");
      case "traffic":
        return t("trafficMode", "Traffic");
      default:
        return mode;
    }
  };

  const getTriggerTypeLabel = (type: string) => {
    switch (type) {
      case "manual":
        return t("manualTrigger", "Manual");
      case "auto":
        return t("autoTrigger", "Auto");
      case "schedule":
        return t("scheduleTrigger", "Schedule");
      default:
        return type;
    }
  };

  const handleViewDetail = async (record: API.GroupHistory) => {
    setSelectedHistory(record);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const { data } = await getGroupHistoryDetail({
        id: String(record.id),
      });

      console.log("Group history detail response:", data);

      // 从返回的数据中获取详情列表
      // data.data.config_snapshot.group_details 包含分组详情
      if (data.data?.config_snapshot?.group_details) {
        setDetails(data.data.config_snapshot.group_details);
      } else {
        console.warn("No group_details found in response:", data);
        setDetails([]);
      }
    } catch (error) {
      console.error("Failed to fetch history details:", error);
      setDetails([]);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {t("groupHistory", "Group Calculation History")}
          </CardTitle>
          <CardDescription>
            {t(
              "groupHistoryDescription",
              "View group recalculation history and results"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProTable<API.GroupHistory, API.GetGroupHistoryRequest>
            action={ref}
            actions={{
              render: (row: any) => [
                <Button
                  key="detail"
                  onClick={() => handleViewDetail(row)}
                  size="sm"
                  variant="outline"
                >
                  {t("viewDetail", "View Detail")}
                </Button>,
              ],
            }}
            columns={[
              {
                id: "id",
                accessorKey: "id",
                header: t("id", "ID"),
                cell: ({ row }: { row: any }) => (
                  <span className="text-muted">
                    {t("idPrefix", "#")}
                    {row.getValue("id")}
                  </span>
                ),
              },
              {
                id: "group_mode",
                accessorKey: "group_mode",
                header: t("groupMode", "Group Mode"),
                cell: ({ row }: { row: any }) => (
                  <Badge variant="outline">
                    {getModeLabel(row.getValue("group_mode"))}
                  </Badge>
                ),
              },
              {
                id: "trigger_type",
                accessorKey: "trigger_type",
                header: t("triggerType", "Trigger Type"),
                cell: ({ row }: { row: any }) => (
                  <Badge variant="secondary">
                    {getTriggerTypeLabel(row.getValue("trigger_type"))}
                  </Badge>
                ),
              },
              {
                id: "total_users",
                accessorKey: "total_users",
                header: t("totalUsers", "Total Users"),
                cell: ({ row }: { row: any }) => (
                  <span className="font-semibold">
                    {row.getValue("total_users")}
                  </span>
                ),
              },
              {
                id: "result",
                accessorKey: "error_log",
                header: t("result", "Result"),
                cell: ({ row }: { row: any }) => {
                  const record = row.original;
                  return (
                    <div className="space-y-1">
                      <div className="text-muted text-xs">
                        {t("successCount", "Success")}: {record.success_count}{" "}
                        {t("separator", "/")} {t("failedCount", "Failed")}:{" "}
                        {record.failed_count}
                      </div>
                      {record.error_log && (
                        <Badge variant="destructive">
                          {t("failed", "Failed")}
                        </Badge>
                      )}
                      {!record.error_log && record.failed_count === 0 && (
                        <Badge variant="default">
                          {t("completed", "Completed")}
                        </Badge>
                      )}
                    </div>
                  );
                },
              },
              {
                id: "created_at",
                accessorKey: "created_at",
                header: t("createdAt", "Created At"),
                cell: ({ row }: { row: any }) =>
                  formatDate(row.getValue("created_at")),
              },
            ]}
            header={{
              title: t("groupHistory", "Group Calculation History"),
            }}
            request={async (params) => {
              const { data } = await getGroupHistory({
                page: params.page || 1,
                size: params.size || 10,
              });
              return {
                list: data.data?.list || [],
                total: data.data?.total || 0,
              };
            }}
          />
        </CardContent>
      </Card>

      {/* Detail Dialog */}

      <Modal.Backdrop isOpen={detailOpen} onOpenChange={setDetailOpen}>
        <Modal.Container>
          <Modal.Dialog className="max-h-[80vh] overflow-y-auto sm:max-w-[700px]">
            <Modal.Header>
              <Modal.Heading>
                {t("groupHistoryDetail", "Group Calculation Detail")}
              </Modal.Heading>
              <Description slot="description">
                {t("historyId", "History ID")}: {selectedHistory?.id}
              </Description>
            </Modal.Header>
            <div className="space-y-4">
              {selectedHistory && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-muted text-sm">
                        {t("groupMode", "Group Mode")}
                      </div>
                      <div className="font-medium">
                        {getModeLabel(selectedHistory.group_mode)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted text-sm">
                        {t("triggerType", "Trigger Type")}
                      </div>
                      <div className="font-medium">
                        {getTriggerTypeLabel(selectedHistory.trigger_type)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted text-sm">
                        {t("totalUsers", "Total Users")}
                      </div>
                      <div className="font-medium">
                        {selectedHistory.total_users}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted text-sm">
                        {t("result", "Result")}
                      </div>
                      <div className="font-medium">
                        {t("successCount", "Success")}:{" "}
                        {selectedHistory.success_count} {t("separator", "/")}{" "}
                        {t("failedCount", "Failed")}:{" "}
                        {selectedHistory.failed_count}
                      </div>
                    </div>
                    {selectedHistory.start_time && (
                      <div>
                        <div className="text-muted text-sm">
                          {t("startTime", "Start Time")}
                        </div>
                        <div className="font-medium">
                          {formatDate(selectedHistory.start_time)}
                        </div>
                      </div>
                    )}
                    {selectedHistory.end_time && (
                      <div>
                        <div className="text-muted text-sm">
                          {t("endTime", "End Time")}
                        </div>
                        <div className="font-medium">
                          {formatDate(selectedHistory.end_time)}
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedHistory.error_log && (
                    <div>
                      <div className="text-muted text-sm">
                        {t("errorMessage", "Error Message")}
                      </div>
                      <div className="rounded-md bg-danger/10 p-3 text-danger text-sm">
                        {selectedHistory.error_log}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div>
                <div className="mb-2 font-medium text-sm">
                  {t("groupDetails", "Group Details")}
                </div>
                {detailLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner className="size-6 text-muted" />
                    <span className="ml-2 text-muted text-sm">
                      {t("loading", "Loading...")}
                    </span>
                  </div>
                ) : details.length > 0 ? (
                  <div className="space-y-4">
                    <GroupDetailStats details={details} />
                    <GroupDetailTable
                      details={details}
                      nodeGroups={nodeGroups}
                    />
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted text-sm">
                    {t("noDetails", "No details available")}
                  </div>
                )}
              </div>
            </div>
            <Modal.CloseTrigger aria-label="Close" />
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  );
}
