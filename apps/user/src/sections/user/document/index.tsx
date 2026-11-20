"use client";

import {
  TabIndicator,
  Tabs,
  TabPanel as TabsContent,
  TabList as TabsList,
  TabListContainer as TabsListContainer,
  Tab as TabsTrigger,
} from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { getV1PublicDocumentList as queryDocumentList } from "@workspace/ui/services/user/user";
import { useTranslation } from "react-i18next";
import { MainEmpty } from "@/components/main-empty";
import { getContentLanguage } from "@/config/i18n";
import { DocumentButton } from "@/sections/user/document/document-button";
import { getTutorialList } from "@/sections/user/document/tutorial";
import { TutorialButton } from "@/sections/user/document/tutorial-button";
import { useGlobalStore } from "@/stores/global";

export default function Document() {
  const { t, i18n } = useTranslation("document");
  const locale = getContentLanguage(i18n.language);
  const { common } = useGlobalStore();
  const showTutorial = common.subscribe?.show_tutorial !== false;

  const { data } = useQuery({
    queryKey: ["queryDocumentList"],
    queryFn: async () => {
      const response = await queryDocumentList();
      const list = response.data.data?.list || [];
      return {
        tags: Array.from(
          new Set(
            list.reduce((acc: string[], item) => acc.concat(item.tags), [])
          )
        ),
        list,
      };
    },
  });
  const { tags, list: DocumentList } = data || { tags: [], list: [] };

  const { data: TutorialList } = useQuery({
    queryKey: ["getTutorialList", locale],
    queryFn: async () => {
      const list = await getTutorialList();
      return list.get(locale);
    },
    enabled: showTutorial,
  });

  if (
    (!DocumentList || DocumentList.length === 0) &&
    (!TutorialList || TutorialList.length === 0)
  ) {
    return <MainEmpty border />;
  }

  return (
    <div className="space-y-4">
      {DocumentList?.length > 0 && (
        <>
          <h2 className="flex items-center gap-1.5 font-semibold">
            {t("document", "Document")}
          </h2>
          <Tabs className="min-w-0 max-w-full" defaultSelectedKey="all">
            <TabsListContainer className="min-w-0 max-w-full">
              <TabsList aria-label={t("sections", "Sections")}>
                <TabsTrigger
                  className="w-auto flex-1 whitespace-nowrap"
                  id="all"
                >
                  {t("all", "All")}
                  <TabIndicator />
                </TabsTrigger>
                {tags?.map((item) => (
                  <TabsTrigger
                    className="w-auto flex-1 whitespace-nowrap"
                    id={item}
                    key={item}
                  >
                    {item}
                    <TabIndicator />
                  </TabsTrigger>
                ))}
              </TabsList>
            </TabsListContainer>
            <TabsContent id="all">
              <DocumentButton items={DocumentList} />
            </TabsContent>
            {tags?.map((item) => (
              <TabsContent id={item} key={item}>
                <DocumentButton
                  items={DocumentList.filter((docs) =>
                    item ? docs.tags.includes(item) : true
                  )}
                />
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}

      {showTutorial && TutorialList && TutorialList?.length > 0 && (
        <>
          <h2 className="flex items-center gap-1.5 font-semibold">
            {t("tutorial", "Tutorial")}
          </h2>
          <Tabs
            className="min-w-0 max-w-full"
            defaultSelectedKey={TutorialList?.[0]?.title}
          >
            <TabsListContainer className="min-w-0 max-w-full">
              <TabsList aria-label={t("sections", "Sections")}>
                {TutorialList?.map((tutorial) => (
                  <TabsTrigger
                    className="w-auto flex-1 whitespace-nowrap"
                    id={tutorial.title}
                    key={tutorial.title}
                  >
                    {tutorial.title}
                    <TabIndicator />
                  </TabsTrigger>
                ))}
              </TabsList>
            </TabsListContainer>
            {TutorialList?.map((tutorial) => (
              <TabsContent id={tutorial.title} key={tutorial.title}>
                <TutorialButton
                  items={
                    tutorial.subItems && tutorial.subItems?.length > 0
                      ? tutorial.subItems
                      : [tutorial]
                  }
                  key={tutorial.path}
                />
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </div>
  );
}
