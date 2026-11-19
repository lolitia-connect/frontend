"use client";

import { Drawer } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";

import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { ConfirmButton } from "@workspace/ui/composed/confirm-button";
import { Icon } from "@workspace/ui/composed/icon";
import {
  ProTable,
  type ProTableActions,
} from "@workspace/ui/composed/pro-table/pro-table";
import { cn } from "@workspace/ui/lib/utils";
import {
  postTicketFollow as createTicketFollow,
  getTicketDetail as getTicket,
  getTicketList,
  putTicket as updateTicketStatus,
} from "@workspace/ui/services/admin/admin";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { formatDate } from "@/utils/common";
import { UserDetail } from "../user/user-detail";

export default function Page() {
  const { t } = useTranslation("ticket");

  // i18n status declarations for extraction
  // t("status.0", "Status")
  // t("status.1", "Pending Follow-up")
  // t("status.2", "Pending Reply")
  // t("status.3", "Resolved")
  // t("status.4", "Closed")

  const [ticketId, setTicketId] = useState<any>(null);

  const [message, setMessage] = useState("");
  const [followLoading, setFollowLoading] = useState(false);

  const { data: ticket, refetch: refetchTicket } = useQuery({
    queryKey: ["getTicket", ticketId],
    queryFn: async () => {
      const { data } = await getTicket({
        id: ticketId,
      });
      return data.data as API.Ticket;
    },
    enabled: !!ticketId,
    refetchInterval: 5000,
  });

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const scrollArea = scrollRef.current;
      scrollArea?.scrollTo({
        top: scrollArea.scrollHeight,
        behavior: "smooth",
      });
    }, 66);
    return () => clearTimeout(timeout);
  }, [ticket?.follow?.length]);

  const ref = useRef<ProTableActions>(null);
  return (
    <>
      <ProTable<API.Ticket, { status: number }>
        action={ref}
        actions={{
          render(row) {
            if (row.status !== 4) {
              return [
                <Button key="reply" onClick={() => setTicketId(row.id)}>
                  {t("reply", "Reply")}
                </Button>,
                <ConfirmButton
                  cancelText={t("cancel", "Cancel")}
                  confirmText={t("confirm", "Confirm")}
                  description={t(
                    "closeWarning",
                    "Once closed, the ticket cannot be operated on. Please proceed with caution."
                  )}
                  key="colse"
                  onConfirm={async () => {
                    await updateTicketStatus({
                      id: row.id,
                      status: 4,
                    });
                    toast.success(t("closeSuccess", "Closed successfully"));
                    ref.current?.refresh();
                  }}
                  title={t("confirmClose", "Are you sure you want to close?")}
                  trigger={
                    <Button variant="destructive">{t("close", "Close")}</Button>
                  }
                />,
              ];
            }
            return [
              <Button key="check" onClick={() => setTicketId(row.id)} size="sm">
                {t("check", "Check")}
              </Button>,
            ];
          },
        }}
        columns={[
          {
            accessorKey: "title",
            header: t("title", "Title"),
          },
          {
            accessorKey: "user_id",
            header: t("user", "User"),
            cell: ({ row }) => <UserDetail id={row.original.user_id} />,
          },
          {
            accessorKey: "status",
            header: t("status.0", "Status"),
            cell: ({ row }) => (
              <span
                className={cn(
                  "flex items-center gap-2 before:block before:size-1.5 before:animate-pulse before:rounded-full before:ring-2 before:ring-opacity-50",
                  {
                    // `*-soft-foreground` is each status colour's darker tone:
                    // it stays on-palette while clearing 3:1 against the card,
                    // which the raw status colour does not (warning 2.04:1,
                    // success 2.19:1). Both also beat the solid Tailwind colours
                    // this replaced (the amber tone 1.92:1, the green 2.28:1).
                    "before:bg-warning-soft-foreground before:ring-warning-soft-foreground":
                      row.original.status === 1,
                    "before:bg-accent-soft-foreground before:ring-accent-soft-foreground":
                      row.original.status === 2,
                    "before:bg-success-soft-foreground before:ring-success-soft-foreground":
                      row.original.status === 3,
                    "before:bg-default-500 before:ring-default-500":
                      row.original.status === 4,
                  }
                )}
              >
                {t(`status.${row.original.status}`)}
              </span>
            ),
          },
          {
            accessorKey: "updated_at",
            header: t("updatedAt", "Updated At"),
            cell: ({ row }) => formatDate(row.getValue("updated_at")),
          },
        ]}
        header={{
          title: t("ticketList", "Ticket List"),
        }}
        params={[
          {
            key: "status",
            placeholder: t("status.0", "Status"),
            options: [
              {
                label: t("status.1", "Pending Follow-up"),
                value: "1",
              },
              {
                label: t("status.2", "Pending Reply"),
                value: "2",
              },
              {
                label: t("status.3", "Resolved"),
                value: "3",
              },
              {
                label: t("status.4", "Closed"),
                value: "4",
              },
            ],
          },
        ]}
        request={async (pagination, filters) => {
          const { data } = await getTicketList({
            ...pagination,
            ...filters,
          });

          const list = (data.data?.list || []) as API.Ticket[];

          // Client-side ordering to improve triage efficiency:
          // - Put "Pending Follow-up" (status=1) before "Pending Reply" (status=2)
          // - Within each group, sort by updated_at desc
          const statusPriority = (status: number) => {
            if (status === 1) return 0;
            if (status === 2) return 1;
            return 2;
          };
          const toTime = (value: any) => {
            const t = new Date(value).getTime();
            return Number.isFinite(t) ? t : 0;
          };

          list.sort((a, b) => {
            const pa = statusPriority(a.status);
            const pb = statusPriority(b.status);
            if (pa !== pb) return pa - pb;
            return toTime(b.updated_at) - toTime(a.updated_at);
          });

          return {
            list,
            total: data.data?.total || 0,
          };
        }}
      />

      <Drawer
        isOpen={!!ticketId}
        onOpenChange={(open) => {
          if (!open) setTicketId(null);
        }}
      >
        <Drawer.Backdrop>
          <Drawer.Content>
            <Drawer.Dialog className="container mx-auto flex h-[85dvh] max-h-full min-h-0 min-w-0 flex-col overflow-hidden *:select-text">
              <Drawer.Header className="shrink-0 border-b pr-8 pb-4 text-left">
                <Drawer.Heading className="min-w-0 [overflow-wrap:anywhere]">
                  {ticket?.title}
                </Drawer.Heading>
              </Drawer.Header>
              <ScrollArea
                className="min-h-0 flex-1 overflow-x-hidden"
                ref={scrollRef}
              >
                <div className="flex min-w-0 flex-col gap-4 p-4">
                  {/* 显示工单描述作为第一条用户消息 */}
                  {ticket?.description && (
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex min-w-0 max-w-[min(90%,48rem)] flex-col gap-1">
                        <p className="text-muted text-sm">
                          {formatDate(ticket.created_at)}
                        </p>
                        <p className="w-fit max-w-full whitespace-pre-wrap rounded-lg bg-default p-2 font-medium [overflow-wrap:anywhere]">
                          {ticket.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 显示后续跟进消息 */}
                  {ticket?.follow?.map((item) => (
                    <div
                      className={cn("flex min-w-0 items-center gap-4", {
                        "flex-row-reverse": item.from === "System",
                      })}
                      key={item.id}
                    >
                      <div
                        className={cn(
                          "flex min-w-0 max-w-[min(90%,48rem)] flex-col gap-1",
                          {
                            "items-end": item.from === "System",
                          }
                        )}
                      >
                        <p className="text-muted text-sm">
                          {formatDate(item.created_at)}
                        </p>
                        <p
                          className={cn(
                            "w-fit max-w-full whitespace-pre-wrap rounded-lg bg-default p-2 font-medium [overflow-wrap:anywhere]",
                            {
                              "bg-accent text-accent-foreground":
                                item.from === "System",
                            }
                          )}
                        >
                          {item.type === 1 && item.content}
                          {item.type === 2 && (
                            // biome-ignore lint/performance/noImgElement: user-uploaded ticket attachment URL
                            <img
                              alt="attachment"
                              className="!size-auto max-w-full object-cover"
                              height={300}
                              src={item.content!}
                              width={300}
                            />
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {ticket?.status !== 4 && (
                <Drawer.Footer className="shrink-0 pt-4">
                  <form
                    className="flex w-full min-w-0 flex-row flex-wrap items-center gap-2"
                    onSubmit={async (event) => {
                      event.preventDefault();
                      if (message && !followLoading) {
                        setFollowLoading(true);
                        try {
                          await createTicketFollow({
                            ticket_id: ticketId,
                            from: "System",
                            type: 1,
                            content: message,
                          });
                          refetchTicket();
                          setMessage("");
                        } finally {
                          setFollowLoading(false);
                        }
                      }
                    }}
                  >
                    <Button
                      className="shrink-0 p-0"
                      type="button"
                      variant="outline"
                    >
                      <Label className="p-2" htmlFor="picture">
                        <Icon className="text-2xl" icon="uil:image-upload" />
                      </Label>
                      <Input
                        accept="image/*"
                        className="hidden"
                        id="picture"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file?.type.startsWith("image/")) {
                            const reader = new FileReader();
                            reader.readAsDataURL(file);
                            reader.onload = (e) => {
                              const img = new Image();
                              img.src = e.target?.result as string;
                              img.onload = () => {
                                const canvas = document.createElement("canvas");
                                const ctx = canvas.getContext("2d");

                                const maxWidth = 300;
                                const maxHeight = 300;
                                let width = img.width;
                                let height = img.height;

                                if (width > height) {
                                  if (width > maxWidth) {
                                    height = Math.round(
                                      (maxWidth / width) * height
                                    );
                                    width = maxWidth;
                                  }
                                } else if (height > maxHeight) {
                                  width = Math.round(
                                    (maxHeight / height) * width
                                  );
                                  height = maxHeight;
                                }

                                canvas.width = width;
                                canvas.height = height;
                                ctx?.drawImage(img, 0, 0, width, height);

                                canvas.toBlob(
                                  (blob) => {
                                    const reader = new FileReader();
                                    reader.readAsDataURL(blob!);
                                    reader.onloadend = async () => {
                                      await createTicketFollow({
                                        ticket_id: ticketId,
                                        from: "System",
                                        type: 2,
                                        content: reader.result as string,
                                      });
                                      refetchTicket();
                                    };
                                  },
                                  "image/webp",
                                  0.8
                                );
                              };
                            };
                          }
                        }}
                        type="file"
                      />
                    </Button>
                    <Input
                      className="min-w-0 flex-1"
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t(
                        "inputPlaceholder",
                        "Please enter your question, we will reply as soon as possible."
                      )}
                      value={message}
                    />
                    <Button
                      className="shrink-0"
                      disabled={!message || followLoading}
                      type="submit"
                    >
                      <Icon icon="uil:navigator" />
                    </Button>
                  </form>
                </Drawer.Footer>
              )}
              <Drawer.CloseTrigger aria-label="Close" />
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </>
  );
}
