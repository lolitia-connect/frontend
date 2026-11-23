"use client";
import { Card, Modal } from "@heroui/react";
import Empty from "@workspace/ui/composed/empty";
import { Icon } from "@workspace/ui/composed/icon";
import { Markdown } from "@workspace/ui/composed/markdown";
import { useQuery } from "@workspace/ui/hooks/query";
import { getV1PublicAnnouncementList as queryAnnouncement } from "@workspace/ui/services/user/user";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGlobalStore } from "@/stores/global";

export default function Announcement({ type }: { type: "popup" | "pinned" }) {
  const { t } = useTranslation("dashboard");
  const { user } = useGlobalStore();
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["announcement", type],
    queryFn: async () => {
      const result = await queryAnnouncement(
        {
          page: 1,
          size: 10,
          pinned: type === "pinned",
          popup: type === "popup",
        },
        {
          skipErrorHandler: true,
        }
      );
      return result.data.data?.announcements?.[0] || null;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (type === "popup" && data) setOpen(true);
  }, [data, type]);

  if (!data) return null;

  if (type === "popup") {
    return (
      <Modal.Backdrop isOpen={open} onOpenChange={setOpen}>
        <Modal.Container>
          <Modal.Dialog className="max-h-[85vh] overflow-auto sm:max-w-[425px]">
            <Modal.Header>
              <Modal.Heading>{data.title}</Modal.Heading>
            </Modal.Header>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <Markdown>{data.content}</Markdown>
            </div>
            <Modal.CloseTrigger aria-label="Close" />
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    );
  }

  if (type === "pinned") {
    return (
      <>
        <h2 className="flex items-center gap-1.5 font-semibold">
          <Icon className="size-5" icon="uil:bell" />
          {t("latestAnnouncement", "Latest Announcement")}
        </h2>
        <Card className="p-6">
          {data.content ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <Markdown>{data.content}</Markdown>
            </div>
          ) : (
            <Empty />
          )}
        </Card>
      </>
    );
  }

  return null;
}
