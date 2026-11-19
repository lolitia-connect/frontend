"use client";

import {
  Card,
  TabIndicator,
  Tabs,
  TabPanel as TabsContent,
  TabList as TabsList,
  TabListContainer as TabsListContainer,
  Tab as TabsTrigger,
} from "@heroui/react";
import { Icon } from "@workspace/ui/composed/icon";
import { Markdown } from "@workspace/ui/composed/markdown";
import {
  ProList,
  type ProListActions,
} from "@workspace/ui/composed/pro-list/pro-list";
import { queryAnnouncement } from "@workspace/ui/services/user/announcement";
import { formatDate } from "@workspace/ui/utils/formatting";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export default function Announcement() {
  const { t } = useTranslation("dashboard");
  const [, setActiveTab] = useState("all");
  const pinnedRef = useRef<ProListActions>(null);
  const normalRef = useRef<ProListActions>(null);

  const requestAnnouncements = async (
    pagination: { page: number; size: number },
    filter: { pinned?: boolean; popup?: boolean }
  ) => {
    const params: any = {
      page: pagination.page,
      size: pagination.size,
    };

    if (filter.pinned !== undefined) {
      params.pinned = filter.pinned;
    }
    if (filter.popup !== undefined) {
      params.popup = filter.popup;
    }

    const response = await queryAnnouncement(params);
    return {
      list: response.data.data?.announcements || [],
      total: response.data.data?.total || 0,
    };
  };

  const renderAnnouncement = (item: any) => (
    <Card className="overflow-hidden">
      <Card.Header>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <Card.Title className="text-lg">{item.title}</Card.Title>
            {item.pinned && (
              <span className="flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 font-medium text-primary-600 text-xs">
                <Icon className="size-3" icon="uil:bookmark" />
                {t("pinned", "Pinned")}
              </span>
            )}
            {item.popup && (
              <span className="flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 font-medium text-warning-soft-foreground text-xs">
                <Icon className="size-3" icon="uil:exclamation-triangle" />
                {t("popup", "Popup")}
              </span>
            )}
          </div>
          <Card.Description className="text-sm">
            <time dateTime={item.created_at}>
              {formatDate(item.created_at)}
            </time>
          </Card.Description>
        </div>
      </Card.Header>
      <Card.Content>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <Markdown>{item.content}</Markdown>
        </div>
      </Card.Content>
    </Card>
  );

  return (
    <div className="space-y-4">
      <h2 className="flex items-center gap-1.5 font-semibold">
        <Icon className="size-5" icon="uil:bell" />
        {t("announcements", "Announcements")}
      </h2>
      <Tabs
        className="min-w-0 max-w-full"
        defaultSelectedKey="all"
        onSelectionChange={(key) => setActiveTab(String(key))}
      >
        <TabsListContainer className="min-w-0 max-w-full">
          <TabsList aria-label={t("sections", "Sections")}>
            <TabsTrigger className="w-auto flex-1 whitespace-nowrap" id="all">
              {t("all", "All")}
              <TabIndicator />
            </TabsTrigger>
            <TabsTrigger
              className="w-auto flex-1 whitespace-nowrap"
              id="pinned"
            >
              {t("pinnedOnly", "Pinned Only")}
              <TabIndicator />
            </TabsTrigger>
            <TabsTrigger className="w-auto flex-1 whitespace-nowrap" id="popup">
              {t("popupOnly", "Popup Only")}
              <TabIndicator />
            </TabsTrigger>
          </TabsList>
        </TabsListContainer>

        <TabsContent id="all">
          <ProList
            action={normalRef}
            renderItem={renderAnnouncement}
            request={async (pagination) => requestAnnouncements(pagination, {})}
          />
        </TabsContent>

        <TabsContent id="pinned">
          <ProList
            action={pinnedRef}
            renderItem={renderAnnouncement}
            request={async (pagination) =>
              requestAnnouncements(pagination, { pinned: true })
            }
          />
        </TabsContent>

        <TabsContent id="popup">
          <ProList
            action={normalRef}
            renderItem={renderAnnouncement}
            request={async (pagination) =>
              requestAnnouncements(pagination, { popup: true })
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
