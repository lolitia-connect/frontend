"use client";

import { Sheet } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Label } from "@workspace/ui/components/label";
import { ScrollArea } from "@workspace/ui/components/scroll-area";

import { Combobox } from "@workspace/ui/composed/combobox";
import { EnhancedInput } from "@workspace/ui/composed/enhanced-input";
import TagInput from "@workspace/ui/composed/tag-input";
import {
  getGroupConfig,
  getNodeGroupList,
} from "@workspace/ui/services/admin/group";
import { getNekoproxyBinding } from "@workspace/ui/services/admin/nekoproxy";
import type { TFunction } from "i18next";
import { useEffect, useId, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useNode } from "@/stores/node";
import { useServer } from "@/stores/server";
import NekoproxyFields from "./nekoproxy-fields";
import NekoproxyNodeSettings from "./nekoproxy-node-settings";
import { bindingKey, nekoproxyStateKey } from "./nekoproxy-queries";
import {
  nekoproxyBindingSchema,
  nekoproxyOptionsSchema,
} from "./nekoproxy-schema";

export type ProtocolName =
  | "shadowsocks"
  | "vmess"
  | "vless"
  | "trojan"
  | "hysteria"
  | "hysteria2"
  | "shadowsocksr"
  | "nowhere"
  | "tuic"
  | "anytls"
  | "naive"
  | "http"
  | "socks"
  | "mieru";

export const buildSchema = (t: TFunction) =>
  z
    .object({
      name: z
        .string()
        .trim()
        .min(1, t("errors.nameRequired", "Please enter a name")),
      sort: z.number().int().min(0).max(2_147_483_647).default(0),
      server_id: z.string().optional(),
      protocol: z.string().default(""),
      protocol_id: z.string().default(""),
      address: z.string().trim(),
      nekoproxy: nekoproxyOptionsSchema(t),
      nekoproxy_binding: nekoproxyBindingSchema(t),
      nekoproxy_sync_on_save: z.boolean().optional(),
      port: z
        .number({
          message: t("errors.portRange", "Port must be between 1 and 65535"),
        })
        .int()
        .min(0, t("errors.portRange", "Port must be between 1 and 65535"))
        .max(65_535, t("errors.portRange", "Port must be between 1 and 65535")),
      tags: z.array(z.string()),
      node_group_ids: z.optional(z.array(z.string()).default([])),
      node_type: z.enum(["landing", "front"]).default("landing"),
      is_hidden: z.optional(z.boolean()).default(false),
    })
    .superRefine((values, ctx) => {
      if (
        !values.nekoproxy &&
        values.nekoproxy_binding?.action !== "bind" &&
        values.nekoproxy_binding?.action !== "sync"
      ) {
        if (!values.address)
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t(
              "errors.serverAddrRequired",
              "Please enter an entry address"
            ),
            path: ["address"],
          });
        if (values.port < 1)
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("errors.portRange", "Port must be between 1 and 65535"),
            path: ["port"],
          });
      }
      if (values.node_type === "front") {
        return;
      }

      if (!values.server_id?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("errors.serverRequired", "Please select a server"),
          path: ["server_id"],
        });
      }

      if (!values.protocol.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("errors.protocolRequired", "Please select a protocol"),
          path: ["protocol"],
        });
      }

      if (!values.protocol_id.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("errors.protocolRequired", "Please select a protocol"),
          path: ["protocol"],
        });
      }
    });

export type NodeFormValues = z.infer<ReturnType<typeof buildSchema>>;

function normalizeValues(v?: Partial<NodeFormValues>): Partial<NodeFormValues> {
  if (!v) return {};
  return {
    ...v,
    tags: Array.isArray(v.tags) ? v.tags : [],
    node_group_ids: v.node_group_ids?.map(String) ?? [],
    node_type: v.node_type || "landing",
    is_hidden: v.is_hidden ?? false,
  };
}

export default function NodeForm(props: {
  trigger?: string;
  onClose?: () => void;
  title: string;
  loading?: boolean;
  nodeID?: string;
  initialValues?: Partial<NodeFormValues>;
  onSubmit: (values: NodeFormValues) => Promise<boolean> | boolean;
}) {
  const { trigger, title, loading, initialValues, nodeID, onSubmit } = props;
  const { t } = useTranslation("nodes");
  const Scheme = useMemo(() => buildSchema(t), [t]);
  const [open, setOpen] = useState(Boolean(nodeID));
  const formId = useId();
  const client = useQueryClient();
  const nodeEntry = useQuery({
    queryKey: bindingKey(nodeID || ""),
    enabled: open && Boolean(nodeID),
    queryFn: async () => (await getNekoproxyBinding(nodeID!)).data.data,
    retry: false,
  });

  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(
    new Set()
  );

  const addAutoFilledField = (fieldName: string) => {
    setAutoFilledFields((prev) => new Set(prev).add(fieldName));
  };

  const removeAutoFilledField = (fieldName: string) => {
    setAutoFilledFields((prev) => {
      const newSet = new Set(prev);
      newSet.delete(fieldName);
      return newSet;
    });
  };

  const form = useForm({
    resolver: zodResolver(Scheme),
    defaultValues: {
      name: "",
      sort: 0,
      server_id: undefined,
      protocol: "",
      protocol_id: "",
      address: "",
      port: 0,
      tags: [],
      node_group_ids: [],
      node_type: "landing",
      is_hidden: false,
      ...normalizeValues(initialValues),
    } as NodeFormValues,
    mode: "onSubmit", // Only validate on form submission
  });

  const serverId = form.watch("server_id");
  const nodeType = form.watch("node_type");
  const nekoproxy = form.watch("nekoproxy");
  const bindingDraft = form.watch("nekoproxy_binding");
  const preference = form.watch("nekoproxy_sync_on_save");
  const useForwardEntry =
    nekoproxy ||
    bindingDraft?.action === "bind" ||
    bindingDraft?.action === "sync";
  const busy = Boolean(loading || form.formState.isSubmitting);
  const isFrontNode = nodeType === "front";

  const { servers, getAvailableProtocols } = useServer();
  const { tags } = useNode();

  const existingTags: string[] = tags || [];

  const availableProtocols = getAvailableProtocols(serverId);

  // Fetch node groups
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

  useEffect(() => {
    if (!isFrontNode) {
      return;
    }

    form.setValue("server_id", undefined, { shouldDirty: true });
    form.setValue("protocol", "", { shouldDirty: true });
    form.setValue("protocol_id", "", { shouldDirty: true });
    removeAutoFilledField("protocol");
    form.clearErrors(["server_id", "protocol"]);
  }, [form, isFrontNode]);

  function handleServerChange(nextId?: string | null) {
    const id = nextId ?? undefined;
    form.setValue("server_id", id);

    if (!id) {
      setAutoFilledFields(new Set());
      return;
    }

    const selectedServer = servers.find((s) => String(s.id) === String(id));
    if (!selectedServer) return;

    const currentValues = form.getValues();
    const fieldsToFill: string[] = [];

    if (!currentValues.name || autoFilledFields.has("name")) {
      form.setValue("name", selectedServer.name as string, {
        shouldDirty: false,
      });
      fieldsToFill.push("name");
    }

    if (!currentValues.address || autoFilledFields.has("address")) {
      form.setValue("address", selectedServer.address as string, {
        shouldDirty: false,
      });
      fieldsToFill.push("address");
    }

    const protocols = getAvailableProtocols(id);
    const firstProtocol = protocols[0];

    if (
      firstProtocol &&
      (!currentValues.protocol || autoFilledFields.has("protocol"))
    ) {
      form.setValue("protocol", firstProtocol.protocol, { shouldDirty: false });
      form.setValue("protocol_id", firstProtocol.id, { shouldDirty: false });
      fieldsToFill.push("protocol");

      if (
        !currentValues.port ||
        currentValues.port === 0 ||
        autoFilledFields.has("port")
      ) {
        const port = firstProtocol.port || 0;
        form.setValue("port", port, { shouldDirty: false });
        fieldsToFill.push("port");
      }
    }

    setAutoFilledFields(new Set(fieldsToFill));
  }

  const handleManualFieldChange = (
    fieldName: keyof NodeFormValues,
    value: any
  ) => {
    form.setValue(fieldName, value);
    removeAutoFilledField(fieldName);
  };

  function handleProtocolChange(nextProtocolId?: string | null) {
    const key = nextProtocolId || "";
    const sep = key.indexOf(":");
    const proto = sep >= 0 ? key.slice(0, sep) : "";
    const id = sep >= 0 ? key.slice(sep + 1) : key;
    const protocol = proto as ProtocolName | "";
    form.setValue("protocol", protocol);
    form.setValue("protocol_id", id);

    if (!(protocol && id && serverId)) {
      removeAutoFilledField("protocol");
      return;
    }

    const currentValues = form.getValues();
    const isPortAutoFilled = autoFilledFields.has("port");

    removeAutoFilledField("protocol");

    const protocolData = availableProtocols.find(
      (p) => p.protocol === protocol && String(p.id) === String(id)
    );
    if (
      (!currentValues.port || currentValues.port === 0 || isPortAutoFilled) &&
      protocolData
    ) {
      const port = protocolData.port || 0;
      form.setValue("port", port, { shouldDirty: false });
      addAutoFilledField("port");
    }
  }

  async function handleSubmit(values: NodeFormValues) {
    if (loading) return;
    const normalizedValues =
      values.node_type === "front"
        ? {
            ...values,
            server_id: undefined,
            protocol: "",
            protocol_id: "",
          }
        : values;

    const result = await onSubmit(normalizedValues);
    if (result) {
      if (nodeID)
        await client.invalidateQueries({
          queryKey: bindingKey(nodeID),
          refetchType: "none",
        });
      if (
        values.nekoproxy ||
        values.nekoproxy_binding ||
        nodeEntry.data?.binding
      )
        await client.invalidateQueries({
          queryKey: nekoproxyStateKey,
          refetchType: "none",
        });
      props.onClose?.();
      setOpen(false);
      setAutoFilledFields(new Set());
    }
  }

  function changeOpen(value: boolean) {
    if (busy) return;
    if (!value) props.onClose?.();
    setOpen(value);
  }

  return (
    <Sheet isOpen={open} onOpenChange={changeOpen} placement="right">
      {trigger && (
        <Sheet.Trigger>
          <Button
            onClick={() => {
              form.reset({
                name: "",
                sort: 0,
                server_id: undefined,
                protocol: "",
                protocol_id: "",
                address: "",
                port: 0,
                tags: [],
                node_type: "landing",
                ...normalizeValues(initialValues),
              });
              setAutoFilledFields(new Set());
            }}
          >
            {trigger}
          </Button>
        </Sheet.Trigger>
      )}

      <Sheet.Backdrop>
        <Sheet.Content>
          <Sheet.Dialog className="w-[560px] max-w-full">
            <Sheet.Header>
              <Sheet.Heading>{title}</Sheet.Heading>
            </Sheet.Header>
            <ScrollArea className="h-[calc(100dvh-48px-36px-36px-env(safe-area-inset-top))] px-6 pt-4">
              <Form {...form}>
                <form
                  className="admin-drawer-form"
                  id={formId}
                  onSubmit={form.handleSubmit(handleSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="node_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("node_type", "Node Type")}</FormLabel>
                        <FormControl>
                          <Combobox<NodeFormValues["node_type"], false>
                            onChange={(v) =>
                              form.setValue("node_type", v || "landing", {
                                shouldDirty: true,
                                shouldValidate: true,
                              })
                            }
                            options={[
                              {
                                value: "landing",
                                label: t("node_type_landing", "Landing Node"),
                              },
                              {
                                value: "front",
                                label: t("node_type_front", "Frontend Node"),
                              },
                            ]}
                            placeholder={t(
                              "select_node_type",
                              "Select node type…"
                            )}
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {!isFrontNode && (
                    <FormField
                      control={form.control}
                      name="server_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("server", "Server")}</FormLabel>
                          <FormControl>
                            <Combobox<string, false>
                              onChange={(v) => handleServerChange(v)}
                              options={servers.map((s) => ({
                                value: s.id,
                                label: `${s.name} (${(s.address as any) || ""})`,
                              }))}
                              placeholder={t("select_server", "Select server…")}
                              value={field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {!isFrontNode && (
                    <FormField
                      control={form.control}
                      name="protocol"
                      render={() => (
                        <FormItem className="admin-drawer-wide">
                          <FormLabel>{t("protocol", "Protocol")}</FormLabel>
                          <FormControl>
                            <Combobox<string, false>
                              onChange={(v) => handleProtocolChange(v || null)}
                              options={availableProtocols.map((p) => ({
                                value: `${p.protocol}:${p.id}`,
                                label: `${p.name || p.protocol} / ${p.protocol}#${p.id}${p.port ? ` (${p.port})` : ""}`,
                              }))}
                              placeholder={t(
                                "select_protocol",
                                "Select protocol…"
                              )}
                              value={
                                form.watch("protocol") &&
                                form.watch("protocol_id")
                                  ? `${form.watch("protocol")}:${form.watch("protocol_id")}`
                                  : ""
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("name", "Name")}</FormLabel>
                        <FormControl>
                          <EnhancedInput
                            {...field}
                            onValueChange={(v) =>
                              handleManualFieldChange("name", v as string)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sort"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("sort", "Sort ID")}</FormLabel>
                        <FormControl>
                          <EnhancedInput
                            {...field}
                            inputMode="numeric"
                            min={0}
                            onValueChange={(v) =>
                              field.onChange(Number(v) || 0)
                            }
                            type="number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {!useForwardEntry && (
                    <>
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("address", "Address")}</FormLabel>
                            <FormControl>
                              <EnhancedInput
                                {...field}
                                onValueChange={(v) =>
                                  handleManualFieldChange(
                                    "address",
                                    v as string
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="port"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("port", "Port")}</FormLabel>
                            <FormControl>
                              <EnhancedInput
                                {...field}
                                max={65_535}
                                min={1}
                                onValueChange={(v) =>
                                  handleManualFieldChange("port", Number(v))
                                }
                                placeholder="1-65535"
                                type="number"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("tags", "Tags")}</FormLabel>
                        <FormControl>
                          <TagInput
                            onChange={(v) => form.setValue(field.name, v)}
                            options={existingTags}
                            placeholder={t(
                              "tags_placeholder",
                              "Use Enter or comma (,) to add multiple tags"
                            )}
                            value={field.value || []}
                          />
                        </FormControl>
                        <FormDescription>
                          {isGroupEnabled
                            ? t(
                                "tags_groupMode_description",
                                "Optional tags for display and filtering (node group will be used as tag if empty)."
                              )
                            : t(
                                "tags_description",
                                "Permission grouping tag (incl. plan binding and delivery policies)."
                              )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {isGroupEnabled && (
                    <FormField
                      control={form.control}
                      name="node_group_ids"
                      render={({ field }) => (
                        <FormItem className="admin-drawer-wide">
                          <FormLabel>{t("nodeGroup", "Node Group")}</FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-2 gap-2">
                              {nodeGroupsData?.map((g) => (
                                <div
                                  className="flex items-center space-x-2"
                                  key={g.id}
                                >
                                  <Checkbox
                                    checked={field.value?.includes(
                                      String(g.id)
                                    )}
                                    id={`node-group-${g.id}`}
                                    onCheckedChange={(checked) => {
                                      const currentValue = Array.isArray(
                                        field.value
                                      )
                                        ? field.value
                                        : [];

                                      if (checked) {
                                        form.setValue(
                                          field.name,
                                          [...currentValue, String(g.id)],
                                          {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                          }
                                        );
                                        return;
                                      }

                                      form.setValue(
                                        field.name,
                                        currentValue.filter(
                                          (v: string) => v !== String(g.id)
                                        ),
                                        {
                                          shouldValidate: true,
                                          shouldDirty: true,
                                        }
                                      );
                                    }}
                                  />
                                  <Label
                                    className="cursor-pointer"
                                    htmlFor={`node-group-${g.id}`}
                                  >
                                    {g.name}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </FormControl>
                          <FormDescription>
                            {t(
                              "nodeGroup_description",
                              "Assign this node to multiple groups for user access control."
                            )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {/* Is Hidden field - hidden nodes are not visible to users */}
                  <FormField
                    control={form.control}
                    name="is_hidden"
                    render={({ field }) => (
                      <FormItem className="admin-drawer-wide flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{t("is_hidden", "Hidden")}</FormLabel>
                          <FormDescription>
                            {t(
                              "is_hidden_description",
                              "Hidden nodes are not visible to users in subscribe"
                            )}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  {!nodeID && (
                    <FormField
                      control={form.control}
                      name="nekoproxy"
                      render={({ field }) => (
                        <FormItem className="admin-drawer-wide rounded-lg border p-4">
                          <NekoproxyFields
                            onChange={field.onChange}
                            targetHost={
                              servers.find(
                                (server) =>
                                  String(server.id) === String(serverId)
                              )?.address || form.watch("address")
                            }
                            targetPort={
                              availableProtocols.find(
                                (protocol) =>
                                  protocol.protocol ===
                                    form.watch("protocol") &&
                                  String(protocol.id) ===
                                    form.watch("protocol_id")
                              )?.port || form.watch("port")
                            }
                            value={field.value}
                          />
                          {form.formState.errors.nekoproxy && (
                            <p className="text-danger text-sm" role="alert">
                              {t(
                                "np.required",
                                "Complete the forwarding settings"
                              )}
                            </p>
                          )}
                        </FormItem>
                      )}
                    />
                  )}
                  {nodeID && (
                    <NekoproxyNodeSettings
                      disabled={busy}
                      entry={nodeEntry.data}
                      invalid={Boolean(form.formState.errors.nekoproxy_binding)}
                      isError={nodeEntry.isError}
                      nodeID={nodeID}
                      onChange={(value) => {
                        form.setValue("nekoproxy_binding", value, {
                          shouldDirty: true,
                        });
                        form.clearErrors("nekoproxy_binding");
                      }}
                      onPreferenceChange={(value) =>
                        form.setValue("nekoproxy_sync_on_save", value, {
                          shouldDirty: true,
                        })
                      }
                      preference={preference}
                      value={bindingDraft}
                    />
                  )}
                </form>
              </Form>
            </ScrollArea>

            <Sheet.Footer className="flex-row justify-end gap-2 pt-3">
              <Button
                disabled={busy}
                onClick={() => changeOpen(false)}
                variant="outline"
              >
                {t("cancel", "Cancel")}
              </Button>
              <Button disabled={busy} form={formId} type="submit">
                {nodeID ? t("save", "Save") : t("confirm", "Confirm")}
              </Button>
            </Sheet.Footer>
            <Sheet.CloseTrigger aria-label="Close" />
          </Sheet.Dialog>
        </Sheet.Content>
      </Sheet.Backdrop>
    </Sheet>
  );
}
