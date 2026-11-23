"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  toast,
} from "@heroui/react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { useQuery } from "@workspace/ui/hooks/query";
import {
  getRecalculationStatus,
  getSubscribeGroupMapping,
  recalculateGroup,
} from "@workspace/ui/services/admin/group";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface SubscribeGroupMapping {
  node_group_name: string;
  subscribe_name: string;
}

export default function SubscribeModeTab() {
  const { t } = useTranslation("group");
  const [recalculating, setRecalculating] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const [status, setStatus] = useState<{
    state: string;
    progress: number;
    total: number;
  } | null>(null);

  // Fetch subscribe group mapping
  const { data: mappingData, isLoading: mappingLoading } = useQuery({
    queryKey: ["subscribeGroupMapping"],
    queryFn: async () => {
      const { data } = await getSubscribeGroupMapping();
      return (data.data?.list || []) as SubscribeGroupMapping[];
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

  useEffect(() => {
    loadStatus();
  }, []);

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
      await recalculateGroup({ mode: "subscribe" });
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
            {t("subscribeModeConfig", "Subscribe Mode Configuration")}
          </CardTitle>
          <CardDescription>
            {t(
              "subscribeModeDescription",
              "Group users by their purchased subscription plan"
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Subscribe Group Mapping Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t("subscribeGroupMappingTitle", "套餐-节点组对应关系")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mappingLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="size-6 text-muted" />
            </div>
          ) : (
            <Table>
              <Table.ScrollContainer>
                <Table.Content
                  aria-label={t(
                    "subscribeGroupMappingTitle",
                    "套餐-节点组对应关系"
                  )}
                >
                  <Table.Header>
                    <Table.Column id="subscribe" isRowHeader>
                      {t("subscribe", "Subscription")}
                    </Table.Column>
                    <Table.Column id="node-group">
                      {t("nodeGroups", "Node Groups")}
                    </Table.Column>
                  </Table.Header>
                  <Table.Body
                    renderEmptyState={() =>
                      t("noMappingData", "No mapping data available")
                    }
                  >
                    {(mappingData || [])
                      .filter(
                        (item: SubscribeGroupMapping) =>
                          item.subscribe_name && item.node_group_name
                      )
                      .map((item: SubscribeGroupMapping, index: number) => (
                        <Table.Row id={index} key={index}>
                          <Table.Cell className="font-medium">
                            {item.subscribe_name}
                          </Table.Cell>
                          <Table.Cell>
                            <Badge variant="outline">
                              {item.node_group_name}
                            </Badge>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>
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
