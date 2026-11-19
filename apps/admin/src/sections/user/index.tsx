"use client";

import {
  buttonVariants,
  Dropdown,
  Modal,
  Sheet,
  TabIndicator,
  Table,
  Tabs,
  TabPanel as TabsContent,
  TabList as TabsList,
  TabListContainer as TabsListContainer,
  Tab as TabsTrigger,
} from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";

import { ScrollArea } from "@workspace/ui/components/scroll-area";

import { ConfirmButton } from "@workspace/ui/composed/confirm-button";
import {
  ProTable,
  type ProTableActions,
} from "@workspace/ui/composed/pro-table/pro-table";
import { buildHref, useSearch } from "@workspace/ui/lib/router-compat";
import {
  // getUserGroupList,
  previewUserNodes,
} from "@workspace/ui/services/admin/group";
import {
  createUser,
  deleteUser,
  getUserDetail,
  getUserList,
} from "@workspace/ui/services/admin/user";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Display } from "@/components/display";
import { useSubscribe } from "@/stores/subscribe";
import { formatDate } from "@/utils/common";
import { UserDetail } from "./user-detail";
import { UserEnableSwitch } from "./user-enable-switch";
import UserForm from "./user-form";
import { AuthMethodsForm } from "./user-profile/auth-methods-form";
import { BasicInfoForm } from "./user-profile/basic-info-form";
import { NotifySettingsForm } from "./user-profile/notify-settings-form";
import UserSubscription from "./user-subscription";
// import EditUserGroupDialog from "./edit-user-group-dialog";

export default function User() {
  const { t } = useTranslation("user");
  const [loading, setLoading] = useState(false);
  const ref = useRef<ProTableActions>(null);
  const sp = useSearch({ strict: false }) as Record<string, string | undefined>;

  const { subscribes } = useSubscribe();

  // const { data: userGroupsData } = useQuery({
  //   queryKey: ["userGroups"],
  //   queryFn: async () => {
  //     const { data } = await getUserGroupList({ page: 1, size: 1000 });
  //     return data.data?.list || [];
  //   },
  // });

  const initialFilters = {
    search: sp.search || undefined,
    user_id: sp.user_id || undefined,
    subscribe_id: sp.subscribe_id || undefined,
    user_subscribe_id: sp.user_subscribe_id || undefined,
    short_code: sp.short_code || undefined,
    user_subscribe_token: sp.user_subscribe_token || undefined,
    // user_group_id: sp.user_group_id || undefined,
  };

  return (
    <ProTable<API.User, API.GetUserListParams>
      action={ref}
      actions={{
        render: (row) => [
          <ProfileSheet
            key="profile"
            onUpdated={() => ref.current?.refresh()}
            userId={row.id}
          />,
          <SubscriptionSheet key="subscription" userId={row.id} />,
          <PreviewNodesDialog key="preview-nodes" userId={row.id} />,
          <ConfirmButton
            cancelText={t("cancel", "Cancel")}
            confirmText={t("confirm", "Confirm")}
            description={t(
              "deleteDescription",
              "This action cannot be undone."
            )}
            key="edit"
            onConfirm={async () => {
              await deleteUser({ id: row.id });
              toast.success(t("deleteSuccess", "Deleted successfully"));
              ref.current?.refresh();
            }}
            title={t("confirmDelete", "Confirm Delete")}
            trigger={
              <Button variant="destructive">{t("delete", "Delete")}</Button>
            }
          />,
          <Dropdown key="more">
            <Dropdown.Trigger
              className={buttonVariants({
                variant: "outline",
                size: "md",
                class: undefined,
              })}
            >
              {t("more", "More")}
            </Dropdown.Trigger>
            <Dropdown.Popover placement="bottom end">
              <Dropdown.Menu aria-label="Actions">
                <Dropdown.Item
                  href={buildHref("/dashboard/order", {
                    user_id: String(row.id),
                  })}
                >
                  {t("orderList", "Order List")}
                </Dropdown.Item>
                <Dropdown.Item
                  href={buildHref("/dashboard/log/login", {
                    user_id: String(row.id),
                  })}
                >
                  {t("loginLogs", "Login Logs")}
                </Dropdown.Item>
                <Dropdown.Item
                  href={buildHref("/dashboard/log/balance", {
                    user_id: String(row.id),
                  })}
                >
                  {t("balanceLogs", "Balance Logs")}
                </Dropdown.Item>
                <Dropdown.Item
                  href={buildHref("/dashboard/log/commission", {
                    user_id: String(row.id),
                  })}
                >
                  {t("commissionLogs", "Commission Logs")}
                </Dropdown.Item>
                <Dropdown.Item
                  href={buildHref("/dashboard/log/gift", {
                    user_id: String(row.id),
                  })}
                >
                  {t("giftLogs", "Gift Logs")}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>,
        ],
      }}
      columns={[
        {
          id: "enable",
          accessorKey: "enable",
          header: t("enable", "Enable"),
          cell: ({ row }) => (
            <UserEnableSwitch
              onUpdated={() => ref.current?.refresh()}
              user={row.original}
            />
          ),
        },
        {
          id: "id",
          accessorKey: "id",
          header: "ID",
        },
        {
          id: "deleted_at",
          accessorKey: "deleted_at",
          header: t("isDeleted", "Deleted"),
          cell: ({ row }) => {
            const deletedAt = row.getValue("deleted_at") as number | undefined;
            return deletedAt ? (
              <Badge variant="destructive">{t("deleted", "Deleted")}</Badge>
            ) : (
              <Badge variant="outline">{t("normal", "Normal")}</Badge>
            );
          },
        },
        {
          id: "auth_methods",
          accessorKey: "auth_methods",
          header: t("userName", "Username"),
          cell: ({ row }) => {
            const method = row.original.auth_methods?.[0];
            return (
              <div>
                <Badge
                  className="mr-1 uppercase"
                  title={method?.verified ? t("verified", "Verified") : ""}
                >
                  {method?.auth_type}
                </Badge>
                {method?.auth_identifier}
              </div>
            );
          },
        },
        {
          id: "balance",
          accessorKey: "balance",
          header: t("balance", "Balance"),
          cell: ({ row }) => (
            <Display type="currency" value={row.getValue("balance")} />
          ),
        },
        {
          id: "gift_amount",
          accessorKey: "gift_amount",
          header: t("giftAmount", "Gift Amount"),
          cell: ({ row }) => (
            <Display type="currency" value={row.getValue("gift_amount")} />
          ),
        },
        {
          id: "commission",
          accessorKey: "commission",
          header: t("commission", "Commission"),
          cell: ({ row }) => (
            <Display type="currency" value={row.getValue("commission")} />
          ),
        },
        {
          id: "refer_code",
          accessorKey: "refer_code",
          header: t("inviteCode", "Invite Code"),
          cell: ({ row }) => row.getValue("refer_code") || "--",
        },
        {
          id: "referer_id",
          accessorKey: "referer_id",
          header: t("referer", "Referer"),
          cell: ({ row }) => <UserDetail id={row.original.referer_id} />,
        },
        {
          id: "created_at",
          accessorKey: "created_at",
          header: t("createdAt", "Created At"),
          cell: ({ row }) => formatDate(row.getValue("created_at")),
        },
      ]}
      header={{
        title: t("userList", "User List"),
        toolbar: (
          <UserForm<API.CreateUserRequest>
            key="create"
            loading={loading}
            onSubmit={async (values) => {
              setLoading(true);
              try {
                await createUser(values);
                toast.success(t("createSuccess", "Created successfully"));
                ref.current?.refresh();
                setLoading(false);

                return true;
              } catch {
                setLoading(false);

                return false;
              }
            }}
            title={t("createUser", "Create User")}
            trigger={t("create", "Create")}
          />
        ),
      }}
      initialFilters={initialFilters}
      key={initialFilters.user_id}
      params={[
        {
          key: "subscribe_id",
          placeholder: t("subscription", "Subscription"),
          options: [
            { label: t("all", "All"), value: "" },
            ...(subscribes?.map((item) => ({
              label: item.name!,
              value: String(item.id!),
            })) || []),
          ],
        },
        {
          key: "search",
          placeholder: "Search",
        },
        {
          key: "user_id",
          placeholder: t("userId", "User ID"),
        },
        {
          key: "user_subscribe_id",
          placeholder: t("subscriptionId", "Subscription ID"),
        },
        {
          key: "short_code",
          placeholder: t("shortCode", "Short Code"),
        },
        {
          key: "user_subscribe_token",
          placeholder: t(
            "subscriptionTokenOrUrl",
            "Subscription URL / Token / UUID"
          ),
        },
      ]}
      request={async (pagination, filter) => {
        const { data } = await getUserList({
          ...pagination,
          ...filter,
          user_subscribe_token: extractSubscribeToken(
            filter.user_subscribe_token
          ),
        });
        return {
          list: data.data?.list || [],
          total: data.data?.total || 0,
        };
      }}
    />
  );
}

function extractSubscribeToken(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return;
  const input = value.trim();
  let query = input;
  try {
    query = new URL(input).search;
  } catch {
    /* raw token or query */
  }
  const params = new URLSearchParams(query);
  return (
    (params.get("token") ?? params.get("uuid") ?? input).trim() || undefined
  );
}

function ProfileSheet({
  userId,
  onUpdated,
}: {
  userId: string | number;
  onUpdated?: () => void;
}) {
  const { t } = useTranslation("user");
  const [open, setOpen] = useState(false);
  const { data: user, refetch } = useQuery({
    enabled: open,
    queryKey: ["user", userId],
    queryFn: async () => {
      const { data } = await getUserDetail({ id: String(userId) });
      return data.data as API.User;
    },
  });

  const refetchAll = async () => {
    await refetch();
    onUpdated?.();
    return Promise.resolve();
  };
  return (
    <Sheet isOpen={open} onOpenChange={setOpen} placement="right">
      <Sheet.Trigger>
        <Button variant="default">{t("edit", "Edit")}</Button>
      </Sheet.Trigger>
      <Sheet.Backdrop>
        <Sheet.Content>
          <Sheet.Dialog className="w-[700px] max-w-full md:max-w-screen-lg">
            <Sheet.Header>
              <Sheet.Heading>
                {t("userProfile", "User Profile")} · ID: {userId}
              </Sheet.Heading>
            </Sheet.Header>
            {user && (
              <ScrollArea className="h-[calc(100dvh-140px)] p-2">
                <Tabs className="min-w-0 max-w-full" defaultSelectedKey="basic">
                  <TabsListContainer className="mb-3 min-w-0 max-w-full">
                    <TabsList aria-label={t("sections", "Sections")}>
                      <TabsTrigger
                        className="w-auto flex-1 whitespace-nowrap"
                        id="basic"
                      >
                        {t("basicInfoTitle", "Basic Info")}
                        <TabIndicator />
                      </TabsTrigger>
                      <TabsTrigger
                        className="w-auto flex-1 whitespace-nowrap"
                        id="notify"
                      >
                        {t("notifySettingsTitle", "Notify Settings")}
                        <TabIndicator />
                      </TabsTrigger>
                      <TabsTrigger
                        className="w-auto flex-1 whitespace-nowrap"
                        id="auth"
                      >
                        {t("authMethodsTitle", "Auth Methods")}
                        <TabIndicator />
                      </TabsTrigger>
                    </TabsList>
                  </TabsListContainer>
                  <TabsContent className="mt-0" id="basic">
                    <BasicInfoForm refetch={refetchAll} user={user} />
                  </TabsContent>
                  <TabsContent className="mt-0" id="notify">
                    <NotifySettingsForm refetch={refetchAll} user={user} />
                  </TabsContent>
                  <TabsContent className="mt-0" id="auth">
                    <AuthMethodsForm refetch={refetchAll} user={user} />
                  </TabsContent>
                </Tabs>
              </ScrollArea>
            )}
            <Sheet.CloseTrigger aria-label="Close" />
          </Sheet.Dialog>
        </Sheet.Content>
      </Sheet.Backdrop>
    </Sheet>
  );
}

function SubscriptionSheet({ userId }: { userId: string | number }) {
  const { t } = useTranslation("user");
  const [open, setOpen] = useState(false);
  return (
    <Sheet isOpen={open} onOpenChange={setOpen} placement="right">
      <Sheet.Trigger>
        <Button variant="secondary">{t("subscription", "Subscription")}</Button>
      </Sheet.Trigger>
      <Sheet.Backdrop>
        <Sheet.Content>
          <Sheet.Dialog className="w-[1000px] max-w-full md:max-w-7xl">
            <Sheet.Header>
              <Sheet.Heading>
                {t("subscriptionList", "Subscription List")} · ID: {userId}
              </Sheet.Heading>
            </Sheet.Header>
            <div className="admin-drawer-body mt-2 px-4">
              <UserSubscription userId={userId} />
            </div>
            <Sheet.CloseTrigger aria-label="Close" />
          </Sheet.Dialog>
        </Sheet.Content>
      </Sheet.Backdrop>
    </Sheet>
  );
}

function PreviewNodesDialog({ userId }: { userId: string | number }) {
  const { t } = useTranslation("user");
  const [open, setOpen] = useState(false);
  const { data: previewData, isLoading } = useQuery({
    enabled: open,
    queryKey: ["previewUserNodes", userId],
    queryFn: async () => {
      const { data } = await previewUserNodes({ user_id: String(userId) });
      return data.data;
    },
  });

  return (
    <Modal isOpen={open} onOpenChange={setOpen}>
      <Button variant="outline">{t("previewNodes", "Preview Nodes")}</Button>

      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="max-w-2xl">
            <Modal.Header>
              <Modal.Heading>
                {t("previewNodes", "Preview Nodes")} · ID: {userId}
              </Modal.Heading>
            </Modal.Header>
            {isLoading ? (
              <div className="py-8 text-center text-muted">
                {t("loading", "Loading...")}
              </div>
            ) : previewData ? (
              <div className="space-y-4">
                <div>
                  <span className="font-medium text-muted text-sm">
                    {t("availableNodes", "Available Nodes")}:
                  </span>{" "}
                  {previewData.node_groups?.reduce(
                    (sum, group) => sum + (group.nodes?.length || 0),
                    0
                  ) || 0}
                </div>
                {previewData.node_groups &&
                previewData.node_groups.length > 0 ? (
                  <div className="max-h-[400px] space-y-4 overflow-y-auto">
                    {previewData.node_groups.map((group) => (
                      <div key={group.id}>
                        <h4 className="mb-2 font-semibold text-sm">
                          {group.name ||
                            (group.id === "-1"
                              ? t("subscriptionNodes", "Subscription Nodes")
                              : group.id === "0"
                                ? t("publicNodes", "Public Nodes")
                                : `${t("nodeGroup", "Node Group")} ${group.id}`)}
                        </h4>
                        {group.nodes && group.nodes.length > 0 ? (
                          <Table>
                            <Table.ScrollContainer>
                              <Table.Content
                                aria-label={
                                  group.name ||
                                  t("availableNodes", "Available Nodes")
                                }
                              >
                                <Table.Header>
                                  <Table.Column id="id" isRowHeader>
                                    ID
                                  </Table.Column>
                                  <Table.Column id="name">
                                    {t("name", "Name")}
                                  </Table.Column>
                                  <Table.Column id="address">
                                    {t("address", "Address")}
                                  </Table.Column>
                                </Table.Header>
                                <Table.Body>
                                  {group.nodes.map((node) => (
                                    <Table.Row id={node.id} key={node.id}>
                                      <Table.Cell>{node.id}</Table.Cell>
                                      <Table.Cell>{node.name}</Table.Cell>
                                      <Table.Cell>
                                        {node.address}:{node.port}
                                      </Table.Cell>
                                    </Table.Row>
                                  ))}
                                </Table.Body>
                              </Table.Content>
                            </Table.ScrollContainer>
                          </Table>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-muted">
                    {t("noNodesAvailable", "No nodes available")}
                  </div>
                )}
              </div>
            ) : null}
            <Modal.CloseTrigger aria-label="Close" />
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
