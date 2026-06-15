import { useQuery } from "@tanstack/react-query";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import { Icon } from "@workspace/ui/composed/icon";
import { queryPublicServerList } from "@workspace/ui/services/user/server";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function ServiceMonitoring() {
  const { t } = useTranslation("servers");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const { data, isLoading } = useQuery({
    queryKey: ["queryPublicServerList"],
    queryFn: async () => {
      const res = await queryPublicServerList({});
      return res.data?.data?.list || [];
    },
    refetchInterval: 5000,
  });

  const servers = data || [];

  return (
    <div className="flex min-h-[calc(100vh-64px-58px-32px-114px)] w-full flex-col gap-4 overflow-x-hidden">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <Icon className="size-5" icon="uil:servers" />
          {t("serviceMonitoring", "Service Monitoring")}
        </h2>
      </div>

      {isLoading ? (
        <div className="flex h-[200px] items-center justify-center">
          <Icon className="size-8 animate-spin" icon="uil:spinner" />
        </div>
      ) : servers.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {servers.map((server: any) => {
            const isExpanded = expandedRows.has(server.id);
            const hasProtocols = server.protocols?.length > 0;

            return (
              <Card className="overflow-hidden" key={server.id}>
                <CardHeader
                  className={`flex flex-row items-center justify-between gap-2 space-y-0 ${
                    hasProtocols ? "cursor-pointer" : ""
                  }`}
                  onClick={() => hasProtocols && toggleRow(server.id)}
                >
                  <CardTitle className="flex items-center gap-2 text-base">
                    {server.name}
                    <Badge
                      className="gap-1"
                      variant={
                        server.status === "online" ? "default" : "destructive"
                      }
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          server.status === "online"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />
                      {server.status === "online"
                        ? t("online", "Online")
                        : t("offline", "Offline")}
                    </Badge>
                  </CardTitle>
                  {hasProtocols && (
                    <Icon
                      className={`size-4 text-muted-foreground transition-transform ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                      icon="uil:angle-right"
                    />
                  )}
                </CardHeader>
                <CardContent className="text-sm">
                  <ul className="grid grid-cols-1 gap-3 *:flex *:flex-col sm:grid-cols-2 lg:grid-cols-4">
                    <li>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Icon className="size-3.5" icon="uil:map-marker" />
                        {t("location", "Location")}
                      </span>
                      <span>
                        {server.country} · {server.city}
                      </span>
                    </li>
                    <li>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Icon className="size-3.5" icon="uil:users-alt" />
                        {t("onlineUsers", "Online")}
                      </span>
                      <span>{server.online_users}</span>
                    </li>
                    <li>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Icon className="size-3.5" icon="uil:processor" />
                        CPU
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress
                          className="h-2 flex-1"
                          value={server.cpu || 0}
                        />
                        <span className="w-12 text-right tabular-nums">
                          {server.cpu?.toFixed(1)}%
                        </span>
                      </div>
                    </li>
                    <li>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Icon className="size-3.5" icon="uil:dashboard" />
                        {t("memory", "Memory")}
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress
                          className="h-2 flex-1"
                          value={server.mem || 0}
                        />
                        <span className="w-12 text-right tabular-nums">
                          {server.mem?.toFixed(1)}%
                        </span>
                      </div>
                    </li>
                  </ul>
                  {isExpanded && hasProtocols && (
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {server.protocols.map((protocol: any, idx: number) => (
                        <div
                          className="flex items-center justify-between rounded-md border bg-muted/30 px-4 py-2"
                          key={idx}
                        >
                          <span className="font-medium">{protocol.type}</span>
                          <span className="text-muted-foreground">
                            {t("ratio", "Ratio")}: {protocol.ratio}x
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex h-[200px] items-center justify-center text-muted-foreground">
          {t("noData", "No servers available")}
        </div>
      )}
    </div>
  );
}
