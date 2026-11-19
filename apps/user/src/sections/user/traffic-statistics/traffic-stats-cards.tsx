"use client";

import { Card } from "@heroui/react";
import { Icon } from "@workspace/ui/composed/icon";
import type { GetUserTrafficStatsResponse } from "@workspace/ui/services/user/traffic";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/display";

interface TrafficStatsCardsProps {
  stats: GetUserTrafficStatsResponse;
}

export default function TrafficStatsCards({ stats }: TrafficStatsCardsProps) {
  const { t } = useTranslation("traffic");

  const cards = [
    {
      title: t("totalTraffic", "Total Traffic"),
      value: stats.total_traffic,
      icon: "uil:chart-line",
    },
    {
      title: t("uploadTraffic", "Upload Traffic"),
      value: stats.total_upload,
      icon: "uil:upload",
    },
    {
      title: t("downloadTraffic", "Download Traffic"),
      value: stats.total_download,
      icon: "uil:download-alt",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title}>
          <Card.Content className="flex flex-row items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate text-default-600 text-sm">
                {card.title}
              </span>
              <span className="truncate font-bold text-2xl text-foreground">
                <Display type="traffic" value={card.value} />
              </span>
            </div>
            <span className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-500">
              <Icon className="size-5" icon={card.icon} />
            </span>
          </Card.Content>
        </Card>
      ))}
    </div>
  );
}
