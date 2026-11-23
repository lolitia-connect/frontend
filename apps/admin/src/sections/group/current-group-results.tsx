"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@heroui/react";
import { BlockLoading } from "@workspace/ui/composed/block-loading";
import { useQuery } from "@workspace/ui/hooks/query";
import {
  getGroupHistory,
  getGroupHistoryDetail,
  getNodeGroupList,
} from "@workspace/ui/services/admin/group";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { GroupDetailStats, GroupDetailTable } from "./group-detail-table";

export default function CurrentGroupResults() {
  const { t } = useTranslation("group");
  const [loading, setLoading] = useState(true);
  const [latestResult, setLatestResult] = useState<any>(null);
  const [latestDetails, setLatestDetails] = useState<
    API.GroupHistoryDetailItem[]
  >([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Fetch node groups
  const { data: nodeGroups } = useQuery({
    queryKey: ["nodeGroups"],
    queryFn: async () => {
      const { data } = await getNodeGroupList({ page: 1, size: 1000 });
      return data.data?.list || [];
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load latest result
        const { data: historyData } = await getGroupHistory({
          page: 1,
          size: 1,
        });

        if (historyData.data?.list && historyData.data.list.length > 0) {
          const latest = historyData.data.list[0];
          if (!latest) return;
          setLatestResult(latest);

          // Fetch details
          setDetailsLoading(true);
          try {
            const { data: detailData } = await getGroupHistoryDetail({
              id: String(latest.id),
            });

            if (detailData.data?.config_snapshot?.group_details) {
              setLatestDetails(detailData.data.config_snapshot.group_details);
            } else {
              setLatestDetails([]);
            }
          } catch (error) {
            console.error("Failed to fetch latest result details:", error);
            setLatestDetails([]);
          } finally {
            setDetailsLoading(false);
          }
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {t("currentGroupingResult", "Current Grouping Result")}
          </CardTitle>
          <BlockLoading minHeight="6rem" surface={false} />
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Latest Result Card */}
      {latestResult ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {t("currentGroupingResult", "Current Grouping Result")}
            </CardTitle>
            <CardDescription>
              {t(
                "latestGroupingCalculation",
                "Latest grouping calculation details"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Calculation Info */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm">
                {t("calculationInfo", "Calculation Information")}
              </h3>
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-default/50 p-4">
                <div>
                  <div className="text-muted text-xs">
                    {t("groupMode", "Group Mode")}
                  </div>
                  <div className="font-medium">
                    {(latestResult.GroupMode || latestResult.group_mode) ===
                    "average"
                      ? t("averageMode", "Average Mode")
                      : (latestResult.GroupMode || latestResult.group_mode) ===
                          "subscribe"
                        ? t("subscribeMode", "Subscribe Mode")
                        : t("trafficMode", "Traffic Mode")}
                  </div>
                </div>
                <div>
                  <div className="text-muted text-xs">
                    {t("state", "State")}
                  </div>
                  <div className="font-medium">
                    {(latestResult.State || latestResult.state) === "completed"
                      ? t("completed", "Completed")
                      : (latestResult.State || latestResult.state) === "running"
                        ? t("running", "Running")
                        : (latestResult.State || latestResult.state) ===
                            "failed"
                          ? t("failed", "Failed")
                          : t("idle", "Idle")}
                  </div>
                </div>
                <div>
                  <div className="text-muted text-xs">
                    {t("triggerType", "Trigger Type")}
                  </div>
                  <div className="font-medium">
                    {(latestResult.TriggerType || latestResult.trigger_type) ===
                    "manual"
                      ? t("manualTrigger", "Manual")
                      : (latestResult.TriggerType ||
                            latestResult.trigger_type) === "auto"
                        ? t("autoTrigger", "Auto")
                        : t("scheduleTrigger", "Schedule")}
                  </div>
                </div>
                <div>
                  <div className="text-muted text-xs">
                    {t("successFailedCount", "Success/Failed")}
                  </div>
                  <div className="font-medium">
                    {latestResult.SuccessCount ||
                      latestResult.success_count ||
                      0}{" "}
                    /{" "}
                    {latestResult.FailedCount || latestResult.failed_count || 0}
                  </div>
                </div>
                <div>
                  <div className="text-muted text-xs">
                    {t("startTime", "Start Time")}
                  </div>
                  <div className="font-medium">
                    {latestResult.StartTime || latestResult.start_time
                      ? new Date(
                          (latestResult.StartTime || latestResult.start_time) *
                            1000
                        ).toLocaleString()
                      : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-muted text-xs">
                    {t("endTime", "End Time")}
                  </div>
                  <div className="font-medium">
                    {latestResult.EndTime || latestResult.end_time
                      ? new Date(
                          (latestResult.EndTime || latestResult.end_time) * 1000
                        ).toLocaleString()
                      : "-"}
                  </div>
                </div>
              </div>
            </div>

            {/* Grouping Details */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm">
                {t("groupingDetailsStatistics", "Grouping Details Statistics")}
              </h3>
              <GroupDetailStats details={latestDetails} />
            </div>

            {detailsLoading ? (
              <BlockLoading minHeight="8rem" surface={false} />
            ) : latestDetails.length > 0 ? (
              <GroupDetailTable
                details={latestDetails}
                nodeGroups={nodeGroups}
              />
            ) : (
              <div className="py-8 text-center text-muted text-sm">
                {t("noDetails", "No details available")}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {t("currentGroupingResult", "Current Grouping Result")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center text-muted text-sm">
              {t("noDetails", "No details available")}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
