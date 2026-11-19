"use client";

import {
  TabIndicator,
  Tabs,
  TabPanel as TabsContent,
  TabList as TabsList,
  TabListContainer as TabsListContainer,
  Tab as TabsTrigger,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import AverageModeTab from "./average-mode-tab";
import CurrentGroupResults from "./current-group-results";
import GroupConfig from "./group-config";
import GroupHistory from "./group-history";
// import UserGroups from "./user-groups";
import NodeGroups from "./node-groups";
import SubscribeModeTab from "./subscribe-mode-tab";
import TrafficModeTab from "./traffic-mode-tab";

export default function Group() {
  const { t } = useTranslation("group");

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">
        {t("title", "Group Management")}
      </h2>

      <Tabs className="min-w-0 max-w-full" defaultSelectedKey="config">
        <TabsListContainer className="min-w-0 max-w-full">
          <TabsList aria-label={t("sections", "Sections")}>
            <TabsTrigger
              className="w-auto flex-1 whitespace-nowrap"
              id="config"
            >
              {t("config", "Config")}
              <TabIndicator />
            </TabsTrigger>
            {/* <TabsTrigger value="user">
              {t("userGroups", "User Groups")}
            </TabsTrigger> */}
            <TabsTrigger className="w-auto flex-1 whitespace-nowrap" id="node">
              {t("nodeGroups", "Node Groups")}
              <TabIndicator />
            </TabsTrigger>
            <TabsTrigger
              className="w-auto flex-1 whitespace-nowrap"
              id="average"
            >
              {t("averageMode", "Average Mode")}
              <TabIndicator />
            </TabsTrigger>
            <TabsTrigger
              className="w-auto flex-1 whitespace-nowrap"
              id="subscribe"
            >
              {t("subscribeMode", "Subscribe Mode")}
              <TabIndicator />
            </TabsTrigger>
            <TabsTrigger
              className="w-auto flex-1 whitespace-nowrap"
              id="traffic"
            >
              {t("trafficMode", "Traffic Mode")}
              <TabIndicator />
            </TabsTrigger>
            <TabsTrigger
              className="w-auto flex-1 whitespace-nowrap"
              id="results"
            >
              {t("currentGroupingResult", "Current Grouping Result")}
              <TabIndicator />
            </TabsTrigger>
            <TabsTrigger
              className="w-auto flex-1 whitespace-nowrap"
              id="history"
            >
              {t("history", "History")}
              <TabIndicator />
            </TabsTrigger>
          </TabsList>
        </TabsListContainer>

        <TabsContent className="mt-4" id="config">
          <GroupConfig />
        </TabsContent>

        {/* <TabsContent value="user" className="mt-4">
          <UserGroups />
        </TabsContent> */}

        <TabsContent className="mt-4" id="node">
          <NodeGroups />
        </TabsContent>

        <TabsContent className="mt-4" id="average">
          <AverageModeTab />
        </TabsContent>

        <TabsContent className="mt-4" id="subscribe">
          <SubscribeModeTab />
        </TabsContent>

        <TabsContent className="mt-4" id="traffic">
          <TrafficModeTab />
        </TabsContent>

        <TabsContent className="mt-4" id="results">
          <CurrentGroupResults />
        </TabsContent>

        <TabsContent className="mt-4" id="history">
          <GroupHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
