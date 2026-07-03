"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Switch } from "@workspace/ui/components/switch";
import { ConfirmButton } from "@workspace/ui/composed/confirm-button";
import {
  ProTable,
  type ProTableActions,
} from "@workspace/ui/composed/pro-table/pro-table";
import {
  getGroupConfig,
  getNodeGroupList,
} from "@workspace/ui/services/admin/group";
import {
  createNode,
  deleteNode,
  filterNodeList,
  resetSortWithNode,
  sortNodeByName,
  toggleNodeStatus,
  updateNode,
} from "@workspace/ui/services/admin/server";
import { ArrowDownAZ } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useNode } from "@/stores/node";
import { useServer } from "@/stores/server";
import NodeForm, { type NodeFormValues } from "./node-form";

export default function Nodes() {
  const { t } = useTranslation("nodes");
  const ref = useRef<ProTableActions>(null);
  const [loading, setLoading] = useState(false);

  // Use our zustand store for server data
  const { getServerName, getServerAddress, getProtocolPort } = useServer();
  const { fetchNodes, fetchTags } = useNode();

  // Fetch node groups for display
  const { data: nodeGroupsData } = useQuery({
    queryKey: ["nodeGroups"],
    queryFn: async () => {
      const { data } = await getNodeGroupList({ page: 1, size: 1000 });
      return data.data?.list || [];
    },
  });

  // Fetch group config to check if group feature is enabled
  const { data: groupConfigData } = useQuery({
    queryKey: ["groupConfig"],
    queryFn: async () => {
      const { data } = await getGroupConfig();
      return data.data;
    },
  });

  const isGroupEnabled = groupConfigData?.enabled;

  const buildNodePayload = (values: NodeFormValues, row?: API.Node) => {
    const isFrontNode = values.node_type === "front";
    const payload: Record<string, any> = {
      ...(row || {}),
      name: values.name,
      address: values.address,
      port: Number(values.port),
      tags: values.tags || [],
      node_type: values.node_type,
      is_hidden: values.is_hidden ?? false,
      node_group_ids: values.node_group_ids || [],
    };

    if (isFrontNode) {
      payload.server_id = undefined;
      payload.protocol = undefined;
      return payload;
    }

    payload.server_id = values.server_id;
    payload.protocol = values.protocol;
    return payload;
  };

  // Dynamic columns based on group feature status
  const columns = useMemo(() => {
    const baseColumns = [
      {
        id: "enabled",
        header: t("enabled", "Enabled"),
        cell: ({ row }: { row: any }) => (
          <Switch
            checked={row.original.enabled}
            onCheckedChange={async (v) => {
              await toggleNodeStatus({ id: row.original.id, enable: v });
              toast.success(
                v ? t("enabled_on", "Enabled") : t("enabled_off", "Disabled")
              );
              ref.current?.refresh();
              fetchNodes();
              fetchTags();
            }}
          />
        ),
      },
      {
        id: "name",
        accessorKey: "name",
        header: t("name", "Name"),
      },
      {
        id: "node_type",
        header: t("node_type", "Node Type"),
        cell: ({ row }: { row: any }) => {
          const nodeType = row.original.node_type || "landing";
          return (
            <Badge variant={nodeType === "front" ? "secondary" : "outline"}>
              {nodeType === "front"
                ? t("node_type_front", "Frontend Node")
                : t("node_type_landing", "Landing Node")}
            </Badge>
          );
        },
      },
      {
        id: "address_port",
        header: `${t("address", "Address")}:${t("port", "Port")}`,
        cell: ({ row }: { row: any }) =>
          `${row.original.address || "—"}:${row.original.port || "—"}`,
      },
      {
        id: "server_id",
        header: t("server", "Server"),
        cell: ({ row }: { row: any }) =>
          `${getServerName(row.original.server_id)}:${getServerAddress(row.original.server_id)}`,
      },
      {
        id: "protocol",
        header: ` ${t("protocol", "Protocol")}:${t("port", "Port")}`,
        cell: ({ row }: { row: any }) =>
          `${row.original.protocol}/${row.original.protocol_id}:${getProtocolPort(row.original.server_id, row.original.protocol_id)}`,
      },
      {
        id: "tags",
        header: t("tags", "Tags"),
        cell: ({ row }: { row: any }) => (
          <div className="flex flex-wrap gap-1">
            {(row.original.tags || []).length === 0
              ? "—"
              : row.original.tags.map((tg: string) => (
                  <Badge key={tg} variant="outline">
                    {tg}
                  </Badge>
                ))}
          </div>
        ),
      },
    ];

    // Add Node Groups column when group feature is enabled
    if (isGroupEnabled) {
      baseColumns.push({
        id: "node_group_ids",
        header: t("nodeGroups", "Node Groups"),
        cell: ({ row }: { row: any }) => {
          const groupIds = (row.original.node_group_ids as string[]) || [];

          // Public node indicator (when node_group_ids is empty)
          if (groupIds.length === 0) {
            return (
              <div className="flex items-center gap-2">
                <Badge className="text-xs" variant="secondary">
                  {t("public", "Public")}
                </Badge>
              </div>
            );
          }

          return (
            <div className="flex flex-wrap gap-1">
              {groupIds.map((groupId) => {
                const group = nodeGroupsData?.find(
                  (g) => String(g.id) === String(groupId)
                );
                return (
                  <Badge key={groupId} variant="outline">
                    {group?.name || String(groupId)}
                  </Badge>
                );
              })}
            </div>
          );
        },
      });
    }

    return baseColumns;
  }, [
    isGroupEnabled,
    nodeGroupsData,
    t,
    getServerName,
    getServerAddress,
    getProtocolPort,
  ]);

  return (
    <ProTable<API.Node, { search: string; node_group_id?: string }>
      action={ref}
      actions={{
        render: (row) => [
          <NodeForm
            initialValues={row as any}
            key="edit"
            loading={loading}
            onSubmit={async (values) => {
              setLoading(true);
              try {
                const body = buildNodePayload(
                  values,
                  row
                ) as API.UpdateNodeRequest;
                await updateNode(body);
                toast.success(t("updated", "Updated"));
                ref.current?.refresh();
                fetchNodes();
                fetchTags();
                setLoading(false);
                return true;
              } catch {
                setLoading(false);
                return false;
              }
            }}
            title={t("drawerEditTitle", "Edit Node")}
            trigger={t("edit", "Edit")}
          />,
          <ConfirmButton
            cancelText={t("cancel", "Cancel")}
            confirmText={t("confirm", "Confirm")}
            description={t(
              "confirmDeleteDesc",
              "This action cannot be undone."
            )}
            key="delete"
            onConfirm={async () => {
              await deleteNode({ id: row.id } as any);
              toast.success(t("deleted", "Deleted"));
              ref.current?.refresh();
              fetchNodes();
              fetchTags();
            }}
            title={t("confirmDeleteTitle", "Delete this node?")}
            trigger={
              <Button variant="destructive">{t("delete", "Delete")}</Button>
            }
          />,
          <Button
            key="copy"
            onClick={async () => {
              const {
                id: _id,
                sort: _sort,
                enabled: _enabled,
                updated_at: _updated_at,
                created_at: _created_at,
                ...rest
              } = row as any;
              await createNode({
                ...rest,
                enabled: false,
              });
              toast.success(t("copied", "Copied"));
              ref.current?.refresh();
              fetchNodes();
              fetchTags();
            }}
            variant="outline"
          >
            {t("copy", "Copy")}
          </Button>,
        ],
        batchRender(rows) {
          return [
            <ConfirmButton
              cancelText={t("cancel", "Cancel")}
              confirmText={t("confirm", "Confirm")}
              description={t(
                "confirmDeleteDesc",
                "This action cannot be undone."
              )}
              key="delete"
              onConfirm={async () => {
                await Promise.all(
                  rows.map((r) => deleteNode({ id: r.id } as any))
                );
                toast.success(t("deleted", "Deleted"));
                ref.current?.refresh();
                fetchNodes();
                fetchTags();
              }}
              title={t("confirmDeleteTitle", "Delete this node?")}
              trigger={
                <Button variant="destructive">{t("delete", "Delete")}</Button>
              }
            />,
          ];
        },
      }}
      columns={columns}
      header={{
        title: t("pageTitle", "Nodes"),
        toolbar: (
          <div className="flex gap-2">
            <Button
              onClick={async () => {
                await sortNodeByName();
                toast.success(t("sorted_success", "Sorted successfully"));
                ref.current?.refresh();
              }}
              variant="outline"
            >
              <ArrowDownAZ className="mr-1 h-4 w-4" />
              {t("sortByName", "Sort by Name")}
            </Button>
            <NodeForm
              loading={loading}
              onSubmit={async (values) => {
                setLoading(true);
                try {
                  const body = buildNodePayload(
                    values
                  ) as API.CreateNodeRequest;
                  await createNode(body);
                  toast.success(t("created", "Created"));
                  ref.current?.refresh();
                  fetchNodes();
                  fetchTags();
                  setLoading(false);
                  return true;
                } catch {
                  setLoading(false);
                  return false;
                }
              }}
              title={t("drawerCreateTitle", "Create Landing Node")}
              trigger={t("create", "Create Landing Node")}
            />
          </div>
        ),
      }}
      onSort={async (source, target, items) => {
        // NOTE: `items` is the current page's items from ProTable.
        // Avoid mutating it in-place, and persist sort changes reliably.
        const sourceIndex = items.findIndex(
          (item) => String(item.id) === source
        );
        const targetIndex = items.findIndex(
          (item) => String(item.id) === target
        );

        if (sourceIndex === -1 || targetIndex === -1) return items;

        const next = items.slice();
        const [movedItem] = next.splice(sourceIndex, 1);
        next.splice(targetIndex, 0, movedItem!);
        // IMPORTANT:
        // Some installations have duplicate / empty `sort` values (commonly 0 or null)
        // which makes the order appear "random" after refresh and also makes
        // "swap sort values" strategies a no-op.
        //
        // To make the ordering stable, we re-index the current page to a strictly
        // increasing sequence.
        const numericSorts = items
          .map((it) => (typeof it.sort === "number" ? it.sort : Number.NaN))
          .filter((v) => Number.isFinite(v)) as number[];
        const baseSort = numericSorts.length ? Math.min(...numericSorts) : 0;

        const updatedItems = next.map((item, index) => ({
          ...item,
          sort: baseSort + index,
        }));

        // Send ALL items on the current page (not just changed ones) so the
        // backend can re-index globally and avoid cross-page sort conflicts.
        await resetSortWithNode({
          sort: updatedItems.map((item) => ({
            id: item.id,
            sort: item.sort,
          })) as API.SortItem[],
        });
        toast.success(t("sorted_success", "Sorted successfully"));

        // Re-fetch from backend to ensure frontend sort values match the
        // globally re-indexed state. Without this, subsequent drag-sorts
        // would use stale baseSort values and cause items to jump.
        ref.current?.refresh();
        return updatedItems;
      }}
      params={[
        {
          key: "search",
        },
        ...(isGroupEnabled
          ? [
              {
                key: "node_group_id",
                placeholder: t("nodeGroups", "Node Groups"),
                options: [
                  { label: t("all", "All"), value: "" },
                  ...(nodeGroupsData?.map((item) => ({
                    label: item.name,
                    value: String(item.id),
                  })) || []),
                ],
              },
            ]
          : []),
      ]}
      request={async (pagination, filter) => {
        const filters = {
          page: pagination.page,
          size: pagination.size,
          search: filter?.search || undefined,
          node_group_id: filter?.node_group_id || undefined,
        };

        const { data } = await filterNodeList(filters);
        const rawList = (data?.data?.list || []) as API.Node[];
        // Backend should ideally return nodes already sorted, but we also sort on the
        // frontend to keep the UI stable (and avoid "random" order after refresh).
        const list = rawList.slice().sort((a, b) => {
          const as = a.sort;
          const bs = b.sort;
          const an = typeof as === "number" ? as : Number.POSITIVE_INFINITY;
          const bn = typeof bs === "number" ? bs : Number.POSITIVE_INFINITY;
          if (an !== bn) return an - bn;
          // Tie-breaker to keep a stable order.
          return Number(a.id) - Number(b.id);
        });
        const total = Number(data?.data?.total || list.length);
        return { list, total };
      }}
    />
  );
}
