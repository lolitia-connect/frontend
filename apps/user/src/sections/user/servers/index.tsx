"use client";

import { Card } from "@heroui/react";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import { Spinner } from "@workspace/ui/components/spinner";
import { Icon } from "@workspace/ui/composed/icon";
import { useQuery } from "@workspace/ui/hooks/query";
import { queryPublicServerList } from "@workspace/ui/services/user/server";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MainEmpty } from "@/components/main-empty";

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
        <Card className="relative">
          <div className="flex min-h-[200px] items-center justify-center">
            <Spinner className="size-6 text-muted" />
          </div>
        </Card>
      ) : servers.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {servers.map((server: any) => {
            const isExpanded = expandedRows.has(server.id);
            const hasProtocols = server.protocols?.length > 0;

            return (
              <Card className="overflow-hidden" key={server.id}>
                <Card.Header
                  className={`flex flex-row items-center justify-between gap-2 space-y-0 ${
                    hasProtocols ? "cursor-pointer" : ""
                  }`}
                  onClick={() => hasProtocols && toggleRow(server.id)}
                >
                  <Card.Title className="flex items-center gap-2 text-base">
                    {server.name}
                    <Badge
                      className="gap-1"
                      variant={
                        server.status === "online" ? "default" : "destructive"
                      }
                    >
                      {/* The badge itself already carries the status colour
                          (soft rose when online, solid danger when offline), so
                          the dot only has to contrast with it. `*-soft-foreground`
                          is HeroUI's darker tone of each status colour, which is
                          what keeps this dot visible on the pale rose plate
                          (3.22:1) instead of the 1.83:1 a raw `--success` gives. */}
                      <span
                        className={`size-1.5 rounded-full ${
                          server.status === "online"
                            ? "bg-success-soft-foreground"
                            : "bg-danger-foreground"
                        }`}
                      />
                      {server.status === "online"
                        ? t("online", "Online")
                        : t("offline", "Offline")}
                    </Badge>
                  </Card.Title>
                  {hasProtocols && (
                    <Icon
                      className={`size-4 text-muted transition-transform ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                      icon="uil:angle-right"
                    />
                  )}
                </Card.Header>
                <Card.Content className="text-sm">
                  <ul className="grid grid-cols-1 gap-3 *:flex *:flex-col sm:grid-cols-2 lg:grid-cols-4">
                    <li>
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1 text-default-600">
                          <Icon className="size-3.5" icon="uil:map-marker" />
                          {t("location", "Location")}
                        </span>
                      </div>
                      <span>
                        {server.country} · {server.city}
                      </span>
                    </li>
                    <li>
                      <span className="flex items-center gap-1 text-muted">
                        <Icon className="size-3.5" icon="uil:users-alt" />
                        {t("onlineUsers", "Online Clients")}
                      </span>
                      <span>{server.online_users}</span>
                    </li>
                    {/*
                      Stacked metric rows: name left / value right on the first
                      line, hairline rose progress bar underneath. Keeps the
                      numeric read-out off the brand fill entirely (`tabular-nums`
                      stops the digits from shifting as values change).
                    */}
                    <li>
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1 text-default-600">
                          <Icon className="size-3.5" icon="uil:processor" />
                          CPU
                        </span>
                        <span className="font-medium text-foreground tabular-nums">
                          {server.cpu?.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={server.cpu || 0} />
                    </li>
                    <li>
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1 text-default-600">
                          <Icon className="size-3.5" icon="uil:dashboard" />
                          {t("memory", "Memory")}
                        </span>
                        <span className="font-medium text-foreground tabular-nums">
                          {server.mem?.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={server.mem || 0} />
                    </li>
                  </ul>
                  {isExpanded && hasProtocols && (
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {server.protocols.map((protocol: any, idx: number) => (
                        <div
                          className="flex items-center justify-between gap-2 rounded-md border bg-default/30 px-4 py-2"
                          key={idx}
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <Badge variant="secondary">{protocol.type}</Badge>
                            <span className="min-w-0 truncate font-medium">
                              {protocol.name
                                ? `${protocol.name}#${protocol.id}`
                                : `#${protocol.id}`}
                            </span>
                          </span>
                          <span className="shrink-0 text-muted">
                            {t("ratio", "Ratio")}: {protocol.ratio}x
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Content>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-0 p-0">
          <MainEmpty />
        </Card>
      )}
    </div>
  );
}
