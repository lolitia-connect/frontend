"use client";

import { Card, Description, Drawer, Modal } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";

import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Textarea } from "@workspace/ui/components/textarea";
import { ConfirmButton } from "@workspace/ui/composed/confirm-button";
import Empty from "@workspace/ui/composed/empty";
import { Icon } from "@workspace/ui/composed/icon";
import {
  ProList,
  type ProListActions,
} from "@workspace/ui/composed/pro-list/pro-list";
import { cn } from "@workspace/ui/lib/utils";
import {
  postV1PublicTicket as createUserTicket,
  postV1PublicTicketFollow as createUserTicketFollow,
  getV1PublicTicketDetail as getUserTicketDetails,
  getV1PublicTicketList as getUserTicketList,
  putV1PublicTicket as updateUserTicketStatus,
} from "@workspace/ui/services/user/user";
import { formatDate } from "@workspace/ui/utils/formatting";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function Ticket() {
  const { t } = useTranslation("ticket");
  const statusMap: Record<number, string> = {
    0: t("status.0", "Status"),
    1: t("status.1", "Awaiting Support"),
    2: t("status.2", "Support Replied"),
    3: t("status.3", "Resolved"),
    4: t("status.4", "Closed"),
  };

  const [ticketId, setTicketId] = useState<any>(null);
  const [message, setMessage] = useState("");

  const { data: ticket, refetch: refetchTicket } = useQuery({
    queryKey: ["getUserTicketDetails", ticketId],
    queryFn: async () => {
      const { data } = await getUserTicketDetails({ id: ticketId });
      return data.data as API.Ticket;
    },
    enabled: !!ticketId,
    refetchInterval: 5000,
  });

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.children[1]?.scrollTo({
          top: scrollRef.current.children[1].scrollHeight,
          behavior: "smooth",
        });
      }
    }, 66);
  }, [ticket?.follow?.length]);

  const ref = useRef<ProListActions>(null);
  const [create, setCreate] =
    useState<Partial<API.CreateUserTicketRequest & { open: boolean }>>();
  const [createLoading, setCreateLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  return (
    <>
      <ProList<API.Ticket, { status: number }>
        action={ref}
        empty={<Empty />}
        header={{
          title: t("ticketList", "Ticket List"),
          toolbar: (
            <Modal
              isOpen={create?.open}
              onOpenChange={(open) => setCreate({ open })}
            >
              <Button size="sm">{t("createTicket", "Create Ticket")}</Button>

              <Modal.Backdrop>
                <Modal.Container>
                  <Modal.Dialog className="sm:max-w-[425px]">
                    <Modal.Header>
                      <Modal.Heading>
                        {t("createTicket", "Create Ticket")}
                      </Modal.Heading>
                      <Description slot="description">
                        {t(
                          "createTicketDescription",
                          "Create Ticket Description"
                        )}
                      </Description>
                    </Modal.Header>
                    <div className="grid gap-4 py-4">
                      <Label htmlFor="title">{t("title", "Title")}</Label>
                      <Input
                        defaultValue={create?.title}
                        id="title"
                        onChange={(e) =>
                          setCreate({ ...create, title: e.target.value! })
                        }
                      />
                      <Label htmlFor="content">
                        {t("description", "Description")}
                      </Label>
                      <Textarea
                        defaultValue={create?.description}
                        id="content"
                        onChange={(e) =>
                          setCreate({ ...create, description: e.target.value! })
                        }
                      />
                    </div>
                    <Modal.Footer>
                      <Button
                        disabled={
                          !(create?.title && create?.description) ||
                          createLoading
                        }
                        onClick={async () => {
                          if (createLoading) return;
                          setCreateLoading(true);
                          try {
                            await createUserTicket({
                              title: create!.title!,
                              description: create!.description!,
                            });
                            ref.current?.refresh();
                            toast.success(t("createSuccess", "Create Success"));
                            setCreate({ open: false });
                          } finally {
                            setCreateLoading(false);
                          }
                        }}
                      >
                        {t("submit", "Submit")}
                      </Button>
                    </Modal.Footer>
                    <Modal.CloseTrigger aria-label="Close" />
                  </Modal.Dialog>
                </Modal.Container>
              </Modal.Backdrop>
            </Modal>
          ),
        }}
        params={[
          {
            key: "search",
          },
          {
            key: "status",
            placeholder: t("status.0", "Status"),
            options: [
              {
                label: t("close", "Close"),
                value: "4",
              },
            ],
          },
        ]}
        renderItem={(item) => (
          <Card className="overflow-hidden">
            <Card.Header className="flex flex-row items-center justify-between gap-2 space-y-0 bg-default/50 p-3">
              <Card.Title>
                <span
                  className={cn(
                    "flex items-center gap-2 before:block before:size-1.5 before:animate-pulse before:rounded-full before:ring-2 before:ring-opacity-50",
                    {
                      // `*-soft-foreground` keeps each status dot readable on
                      // the card (warning 3.64:1, success 3.87:1) where the raw
                      // status colour would only reach ~2:1.
                      "before:bg-warning-soft-foreground before:ring-warning-soft-foreground":
                        item.status === 1,
                      "before:bg-accent-soft-foreground before:ring-accent-soft-foreground":
                        item.status === 2,
                      "before:bg-success-soft-foreground before:ring-success-soft-foreground":
                        item.status === 3,
                      "before:bg-default-500 before:ring-default-500":
                        item.status === 4,
                    }
                  )}
                >
                  {statusMap[item.status] ||
                    t(`status.${item.status}`, "Unknown Status")}
                </span>
              </Card.Title>
              <Card.Description className="flex gap-2">
                {item.status === 4 ? (
                  <Button
                    key="check"
                    onClick={() => setTicketId(item.id)}
                    size="sm"
                  >
                    {t("check", "Check")}
                  </Button>
                ) : (
                  <>
                    <Button
                      key="reply"
                      onClick={() => setTicketId(item.id)}
                      size="sm"
                    >
                      {t("reply", "Reply")}
                    </Button>
                    <ConfirmButton
                      cancelText={t("cancel", "Cancel")}
                      confirmText={t("confirm", "Confirm")}
                      description={t(
                        "closeWarning",
                        "Are you sure you want to close this ticket?"
                      )}
                      key="close"
                      onConfirm={async () => {
                        await updateUserTicketStatus({
                          id: item.id,
                          status: 4,
                        });
                        toast.success(t("closeSuccess", "Close Success"));
                        ref.current?.refresh();
                      }}
                      title={t("confirmClose", "Confirm Close")}
                      trigger={
                        <Button size="sm" variant="destructive">
                          {t("close", "Close")}
                        </Button>
                      }
                    />
                  </>
                )}
              </Card.Description>
            </Card.Header>

            <Card.Content className="p-3 text-sm">
              <ul className="grid gap-3 *:flex *:flex-col lg:grid-cols-3">
                <li>
                  <span className="text-muted">{t("title", "Title")}</span>
                  <span> {item.title}</span>
                </li>
                <li className="font-semibold">
                  <span className="text-muted">
                    {t("description", "Description")}
                  </span>
                  <time>{item.description}</time>
                </li>
                <li className="font-semibold">
                  <span className="text-muted">
                    {t("updatedAt", "Updated At")}
                  </span>
                  <time>{formatDate(item.updated_at)}</time>
                </li>
              </ul>
            </Card.Content>
          </Card>
        )}
        request={async (pagination, filters) => {
          const { data } = await getUserTicketList({
            ...pagination,
            ...filters,
          });
          return {
            list: data.data?.list || [],
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
            <Drawer.Dialog className="container mx-auto h-screen">
              <Drawer.Header className="border-b text-left">
                <Drawer.Heading>{ticket?.title}</Drawer.Heading>
                <Description className="line-clamp-3" slot="description">
                  {ticket?.description}
                </Description>
              </Drawer.Header>
              <ScrollArea className="h-full overflow-hidden" ref={scrollRef}>
                <div className="flex flex-col gap-4 p-4">
                  {ticket?.follow?.map((item) => (
                    <div
                      className={cn("flex items-center gap-4", {
                        "flex-row-reverse": item.from !== "System",
                      })}
                      key={item.id}
                    >
                      <div
                        className={cn("flex flex-col gap-1", {
                          "items-end": item.from !== "System",
                        })}
                      >
                        <p className="text-muted text-sm">
                          {formatDate(item.created_at)}
                        </p>
                        <p
                          className={cn(
                            "w-fit rounded-lg bg-default p-2 font-medium",
                            {
                              "bg-accent text-accent-foreground":
                                item.from !== "System",
                            }
                          )}
                        >
                          {item.type === 1 && item.content}
                          {item.type === 2 && (
                            // biome-ignore lint/performance/noImgElement: user-uploaded ticket attachment URL
                            <img
                              alt="ticket attachment"
                              className="!size-auto object-cover"
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
                <Drawer.Footer>
                  <form
                    className="flex w-full flex-row items-center gap-2"
                    onSubmit={async (event) => {
                      event.preventDefault();
                      if (message && !followLoading) {
                        setFollowLoading(true);
                        try {
                          await createUserTicketFollow({
                            ticket_id: ticketId,
                            from: "User",
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
                    <Button className="p-0" type="button" variant="outline">
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
                                      await createUserTicketFollow({
                                        ticket_id: ticketId,
                                        from: "User",
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
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t("inputPlaceholder", "Input Placeholder")}
                      value={message}
                    />
                    <Button disabled={!message || followLoading} type="submit">
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
