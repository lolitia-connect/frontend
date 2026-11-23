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
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Spinner } from "@workspace/ui/components/spinner";
import { useQuery } from "@workspace/ui/hooks/query";
import {
  getGroupConfig,
  getNodeGroupList,
  getRecalculationStatus,
  recalculateGroup,
} from "@workspace/ui/services/admin/group";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export default function AverageModeTab() {
  const { t } = useTranslation("group");
  const [recalculating, setRecalculating] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const [averageConfig, setAverageConfig] = useState({
    node_group_count: 0,
  });

  const [status, setStatus] = useState<{
    state: string;
    progress: number;
    total: number;
  } | null>(null);

  const hasLoadedConfig = useRef(true);

  const { data: nodeGroupsData } = useQuery({
    queryKey: ["nodeGroups"],
    queryFn: async () => {
      const { data } = await getNodeGroupList({ page: 1, size: 1000 });
      return data.data?.list || [];
    },
  });

  const loadConfig = async () => {
    try {
      const { data } = await getGroupConfig();
      if (data.data?.config?.average_config) {
        setAverageConfig(data.data.config.average_config as any);
      }
      hasLoadedConfig.current = true;
    } catch (error) {
      console.error("Failed to load group config:", error);
      toast.danger(t("loadFailed", "Failed to load configuration"));
    }
  };

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

  useEffect(() => {
    loadConfig();
    loadStatus();
  }, []);

  useEffect(() => {
    if (nodeGroupsData) {
      const nodeGroupCount = nodeGroupsData?.length || 0;

      if (averageConfig.node_group_count !== nodeGroupCount) {
        setAverageConfig({
          ...averageConfig,
          node_group_count: nodeGroupCount,
        });
      }
    }
  }, [nodeGroupsData]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (status?.state === "running") {
        loadStatus();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [status?.state]);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      await recalculateGroup({ mode: "average" });
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
      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t("averageModeConfig", "Average Mode Configuration")}
          </CardTitle>
          <CardDescription>
            {t(
              "averageModeDescription",
              "Randomly assign node groups to user subscriptions based on subscribe configuration"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="node_group_count">
                {t("availableNodeGroups", "Available Node Groups")}
              </Label>
              <Input
                className="bg-default"
                id="node_group_count"
                min={1}
                readOnly
                type="number"
                value={averageConfig.node_group_count}
              />
              <p className="text-muted text-xs">
                {t(
                  "nodeGroupCountAutoCalculated",
                  "Auto-calculated from actual node groups"
                )}
              </p>
            </div>
          </div>
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
