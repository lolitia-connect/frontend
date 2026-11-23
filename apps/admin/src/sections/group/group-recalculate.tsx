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
import {
  getRecalculationStatus,
  recalculateGroup,
} from "@workspace/ui/services/admin/group";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function GroupRecalculate() {
  const { t } = useTranslation("group");
  const [recalculating, setRecalculating] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [status, setStatus] = useState<{
    state: string;
    progress: number;
    total: number;
  } | null>(null);

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
    loadStatus();

    // Poll status every 2 seconds when recalculating
    const interval = setInterval(() => {
      if (status?.state === "running") {
        loadStatus();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [status?.state]);

  const handleRecalculate = async (
    mode: "average" | "subscribe" | "traffic"
  ) => {
    setRecalculating(mode);
    try {
      await recalculateGroup({ mode });
      toast.success(t("recalculationStarted", "Recalculation started"));
      loadStatus();
    } catch (error) {
      console.error("Failed to start recalculation:", error);
      toast.danger(t("recalculationFailed", "Failed to start recalculation"));
    } finally {
      setRecalculating(null);
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

          {/* Recalculate Buttons */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {/* Average Mode Recalculate */}
              <div className="space-y-2">
                <div className="font-medium">
                  {t("averageMode", "Average Mode")}
                </div>
                <Button
                  className="w-full"
                  disabled={status?.state === "running"}
                  loading={recalculating === "average"}
                  onClick={() => handleRecalculate("average")}
                  variant="outline"
                >
                  {t("recalculate", "Recalculate")}
                </Button>
              </div>

              {/* Subscribe Mode Recalculate */}
              <div className="space-y-2">
                <div className="font-medium">
                  {t("subscribeMode", "Subscribe Mode")}
                </div>
                <Button
                  className="w-full"
                  disabled={status?.state === "running"}
                  loading={recalculating === "subscribe"}
                  onClick={() => handleRecalculate("subscribe")}
                  variant="outline"
                >
                  {t("recalculate", "Recalculate")}
                </Button>
              </div>

              {/* Traffic Mode Recalculate */}
              <div className="space-y-2">
                <div className="font-medium">
                  {t("trafficMode", "Traffic Mode")}
                </div>
                <Button
                  className="w-full"
                  disabled={status?.state === "running"}
                  loading={recalculating === "traffic"}
                  onClick={() => handleRecalculate("traffic")}
                  variant="outline"
                >
                  {t("recalculate", "Recalculate")}
                </Button>
              </div>
            </div>
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
