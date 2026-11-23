"use client";

import { Modal, Sheet, Button as SheetButton, toast } from "@heroui/react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";

import { ScrollArea } from "@workspace/ui/components/scroll-area";

import { Icon } from "@workspace/ui/composed/icon";
import {
  ProTable,
  type ProTableActions,
} from "@workspace/ui/composed/pro-table/pro-table";
import {
  getMarketingEmailBatchList as getBatchSendEmailTaskList,
  postMarketingEmailBatchStop as stopBatchSendEmailTask,
} from "@workspace/ui/services/admin/admin";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/utils/common";

export default function EmailTaskManager() {
  const { t } = useTranslation("marketing");
  const ref = useRef<ProTableActions>(null);

  const [selectedTask, setSelectedTask] =
    useState<API.BatchSendEmailTask | null>(null);
  const [open, setOpen] = useState(false);

  const stopTask = async (taskId: string) => {
    try {
      await stopBatchSendEmailTask({
        id: taskId,
      });
      toast.success(t("taskStoppedSuccessfully", "Task stopped successfully"));
      ref.current?.refresh();
    } catch (error) {
      console.error("Failed to stop task:", error);
      toast.danger(t("failedToStopTask", "Failed to stop task"));
    }
  };

  const getStatusBadge = (status: number) => {
    const statusConfig = {
      0: {
        label: t("notStarted", "Not Started"),
        variant: "secondary" as const,
      },
      1: { label: t("inProgress", "In Progress"), variant: "default" as const },
      2: { label: t("completed", "Completed"), variant: "default" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: `${t("status", "Status")} ${status}`,
      variant: "secondary" as const,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Sheet isOpen={open} onOpenChange={setOpen} placement="right">
      <Sheet.Trigger>
        <SheetButton
          className="settings-option justify-between"
          variant="ghost"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
              <Icon
                className="h-5 w-5 text-primary-500"
                icon="mdi:email-multiple"
              />
            </span>
            <span className="flex-1">
              <span className="block font-medium">
                {t("emailTaskManager", "Email Task Manager")}
              </span>
              <span className="block text-muted text-sm">
                {t(
                  "viewAndManageEmailBroadcastTasks",
                  "View and manage email broadcast tasks"
                )}
              </span>
            </span>
          </span>
          <Icon className="size-6" icon="mdi:chevron-right" />
        </SheetButton>
      </Sheet.Trigger>
      <Sheet.Backdrop>
        <Sheet.Content>
          <Sheet.Dialog className="w-[1000px] max-w-full md:max-w-screen-lg">
            <Sheet.Header>
              <Sheet.Heading>
                {t("emailBroadcastTasks", "Email Broadcast Tasks")}
              </Sheet.Heading>
            </Sheet.Header>
            <ScrollArea className="h-[calc(100dvh-48px-36px-env(safe-area-inset-top))] px-6">
              <div className="mt-4 space-y-4">
                <ProTable<
                  API.BatchSendEmailTask,
                  API.getMarketingEmailBatchListParams
                >
                  action={ref}
                  actions={{
                    render: (row) => [
                      <Modal key="view-content">
                        <Button
                          onClick={() =>
                            setSelectedTask(row as API.BatchSendEmailTask)
                          }
                          size="icon"
                          variant="outline"
                        >
                          <Icon icon="mdi:eye" />
                        </Button>

                        <Modal.Backdrop>
                          <Modal.Container>
                            <Modal.Dialog className="max-h-[80vh] max-w-4xl">
                              <Modal.Header>
                                <Modal.Heading>
                                  {t("emailContent", "Email Content")}
                                </Modal.Heading>
                              </Modal.Header>
                              <ScrollArea className="h-[60vh] pr-4">
                                {selectedTask && (
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="mb-2 font-medium text-muted text-sm">
                                        {t("subject", "Email Subject")}
                                      </h4>
                                      <p className="font-medium">
                                        {selectedTask.subject}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="mb-2 font-medium text-muted text-sm">
                                        {t("content", "Email Content")}
                                      </h4>
                                      <div
                                        dangerouslySetInnerHTML={{
                                          __html: selectedTask.content,
                                        }}
                                      />
                                    </div>
                                    {selectedTask.additional && (
                                      <div>
                                        <h4 className="mb-2 font-medium text-muted text-sm">
                                          {t(
                                            "additionalRecipients",
                                            "Additional Recipients"
                                          )}
                                        </h4>
                                        <p className="text-sm">
                                          {selectedTask.additional}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </ScrollArea>
                              <Modal.CloseTrigger aria-label="Close" />
                            </Modal.Dialog>
                          </Modal.Container>
                        </Modal.Backdrop>
                      </Modal>,
                      ...([0, 1].includes(row.status)
                        ? [
                            <Button
                              key="stop"
                              onClick={() => stopTask(row.id)}
                              variant="destructive"
                            >
                              {t("stop", "Stop")}
                            </Button>,
                          ]
                        : []),
                    ],
                  }}
                  columns={[
                    {
                      accessorKey: "subject",
                      header: t("subject", "Email Subject"),
                      cell: ({ row }) => (
                        <div
                          className="max-w-[200px] truncate font-medium"
                          title={row.getValue("subject") as string}
                        >
                          {row.getValue("subject") as string}
                        </div>
                      ),
                    },
                    {
                      accessorKey: "scope",
                      header: t("recipientType", "Recipient Type"),
                      cell: ({ row }) => {
                        const scope = row.original.scope;
                        const scopeLabels = {
                          1: t("allUsers", "All Users"), // ScopeAll
                          2: t("subscribedUsers", "Subscribed Users"), // ScopeActive
                          3: t("expiredUsers", "Expired Users"), // ScopeExpired
                          4: t("nonSubscribers", "Non-subscribers"), // ScopeNone
                          5: t("specificUsers", "Specific Users"), // ScopeSkip
                        };
                        return (
                          scopeLabels[scope as keyof typeof scopeLabels] ||
                          `${t("scope", "Send Scope")} ${scope}`
                        );
                      },
                    },
                    {
                      accessorKey: "status",
                      header: t("status", "Status"),
                      cell: ({ row }) =>
                        getStatusBadge(row.getValue("status") as number),
                    },
                    {
                      accessorKey: "progress",
                      header: t("progress", "Progress"),
                      cell: ({ row }) => {
                        const task = row.original as API.BatchSendEmailTask;
                        const progress =
                          task.total > 0
                            ? (task.current / task.total) * 100
                            : 0;
                        return (
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>
                                {task.current} / {task.total}
                              </span>
                              <span>{progress.toFixed(1)}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-default">
                              <div
                                className="h-full bg-accent transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        );
                      },
                    },
                    {
                      accessorKey: "scheduled",
                      header: t("sendTime", "Send Time"),
                      cell: ({ row }) => {
                        const scheduled = row.getValue("scheduled") as number;
                        return scheduled && scheduled > 0
                          ? formatDate(scheduled)
                          : "--";
                      },
                    },
                    {
                      accessorKey: "created_at",
                      header: t("createdAt", "Created At"),
                      cell: ({ row }) => {
                        const createdAt = row.getValue("created_at") as number;
                        return formatDate(createdAt);
                      },
                    },
                  ]}
                  params={[
                    {
                      key: "status",
                      placeholder: t("status", "Status"),
                      options: [
                        { label: t("notStarted", "Not Started"), value: "0" },
                        { label: t("inProgress", "In Progress"), value: "1" },
                        { label: t("completed", "Completed"), value: "2" },
                      ],
                    },
                    {
                      key: "scope",
                      placeholder: t("sendScope", "Send Scope"),
                      options: [
                        { label: t("allUsers", "All Users"), value: "1" },
                        {
                          label: t("subscribedUsers", "Subscribed Users"),
                          value: "2",
                        },
                        {
                          label: t("expiredUsers", "Expired Users"),
                          value: "3",
                        },
                        {
                          label: t("nonSubscribers", "Non-subscribers"),
                          value: "4",
                        },
                        {
                          label: t("specificUsers", "Specific Users"),
                          value: "5",
                        },
                      ],
                    },
                  ]}
                  request={async (pagination, filters) => {
                    const response = await getBatchSendEmailTaskList({
                      ...filters,
                      page: pagination.page,
                      size: pagination.size,
                    });
                    return {
                      list: response.data?.data?.list || [],
                      total: response.data?.data?.total || 0,
                    };
                  }}
                />
              </div>
            </ScrollArea>
            <Sheet.CloseTrigger aria-label="Close" />
          </Sheet.Dialog>
        </Sheet.Content>
      </Sheet.Backdrop>
    </Sheet>
  );
}
