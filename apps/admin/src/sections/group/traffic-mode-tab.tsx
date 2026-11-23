"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  toast,
} from "@heroui/react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { BlockLoading } from "@workspace/ui/composed/block-loading";
import { useQuery } from "@workspace/ui/hooks/query";
import {
  getNodeGroupList,
  getRecalculationStatus,
  recalculateGroup,
  updateNodeGroup,
} from "@workspace/ui/services/admin/group";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import TrafficRangeConfig from "./traffic-ranges-config";

export default function TrafficModeTab() {
  const { t } = useTranslation("group");
  const [recalculating, setRecalculating] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const [status, setStatus] = useState<{
    state: string;
    progress: number;
    total: number;
  } | null>(null);

  // Fetch node groups
  const {
    data: nodeGroupsData,
    isLoading: isLoadingNodeGroups,
    refetch: refetchNodeGroups,
  } = useQuery({
    queryKey: ["nodeGroups"],
    queryFn: async () => {
      const { data } = await getNodeGroupList({ page: 1, size: 1000 });
      return data.data?.list || [];
    },
  });

  const loadStatus = async () => {
    setLoadingStatus(true);
    try {
      const { data } = await getRecalculationStatus();
      if (data.data) {
        setStatus(data.data);
      }
    } catch (error) {
      console.error("Failed to load recalculation status:", error);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleTrafficUpdate = async (
    nodeGroupId: string,
    fields: { min_traffic_gb?: number; max_traffic_gb?: number }
  ) => {
    try {
      await updateNodeGroup({
        id: nodeGroupId,
        ...fields,
      });
      toast.success(t("configSaved", "Configuration saved successfully"));
      // Refetch node groups to get updated data
      refetchNodeGroups();
    } catch (error) {
      console.error("Failed to update node group:", error);
      toast.danger(t("saveFailed", "Failed to save configuration"));
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      await recalculateGroup({ mode: "traffic" });
      toast.success(t("recalculationStarted", "Recalculation started"));
      loadStatus();
    } catch (error) {
      console.error("Failed to start recalculation:", error);
      toast.danger(t("recalculationFailed", "Failed to start recalculation"));
    } finally {
      setRecalculating(false);
    }
  };

  const getStateLabel = (state: string) => {
    switch (state) {
      case "running":
        return t("running", "Running");
      case "completed":
        return t("completed", "Completed");
      case "failed":
        return t("failed", "Failed");
      default:
        return t("idle", "Idle");
    }
  };

  const getStateVariant = (state: string) => {
    switch (state) {
      case "running":
        return "default";
      case "completed":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-4">
      {/* Node Groups Traffic Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t("trafficModeConfig", "Traffic Mode Configuration")}
          </CardTitle>
          <CardDescription>
            {t(
              "trafficModeDescription",
              "Configure traffic ranges for node groups. Users will be assigned to node groups based on their traffic usage."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingNodeGroups ? (
            <BlockLoading minHeight="8rem" surface={false} />
          ) : (
            <TrafficRangeConfig
              nodeGroups={nodeGroupsData || []}
              onTrafficUpdate={handleTrafficUpdate}
            />
          )}
        </CardContent>
      </Card>

      {/* Recalculation Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t("groupRecalculation", "Group Recalculation")}
          </CardTitle>
          <CardDescription>
            {t(
              "groupRecalculationDescription",
              "Manually trigger a full recalculation of all user groups based on current configuration"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">
                {t("currentStatus", "Current Status")}
              </span>
              {loadingStatus ? (
                <Spinner className="size-4" />
              ) : status ? (
                <Badge variant={getStateVariant(status.state) as any}>
                  {getStateLabel(status.state)}
                </Badge>
              ) : null}
            </div>

            {status?.state === "running" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{t("progress", "Progress")}</span>
                  <span>
                    {status.progress} / {status.total || 0}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-default">
                  <div
                    className="h-full bg-accent transition-all"
                    style={{
                      width: `${status.total > 0 ? (status.progress / status.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {status?.state === "completed" && (
              <div className="text-muted text-sm">
                {t(
                  "recalculationCompleted",
                  "Recalculation completed successfully"
                )}
              </div>
            )}

            {status?.state === "failed" && (
              <div className="text-danger text-sm">
                {t(
                  "recalculationFailed",
                  "Recalculation failed. Please try again."
                )}
              </div>
            )}
          </div>

          {/* Recalculate Button */}
          <div className="flex justify-end">
            <Button
              disabled={status?.state === "running"}
              loading={recalculating}
              onClick={handleRecalculate}
            >
              {t("recalculateAll", "Recalculate All Users")}
            </Button>
          </div>

          {/* Warning */}
          <div className="rounded-md bg-warning-soft p-4 text-sm text-warning-soft-foreground">
            <strong>{t("warning", "Warning")}:</strong>{" "}
            {t(
              "recalculationWarning",
              "Recalculation will reassign all users to new groups based on current configuration. This operation cannot be undone."
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
