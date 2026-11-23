// @ts-nocheck
"use client";

import {
  ListBox,
  Select,
  SelectPopover as SelectContent,
  SelectIndicator,
  ListBoxItem as SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  TabIndicator,
  Tabs,
  TabPanel as TabsContent,
  TabList as TabsList,
  TabListContainer as TabsListContainer,
  Tab as TabsTrigger,
  Tooltip,
  toast,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Switch } from "@workspace/ui/components/switch";
import { Textarea } from "@workspace/ui/components/textarea";
import { ConfirmButton } from "@workspace/ui/composed/confirm-button";
import { GoTemplateEditor } from "@workspace/ui/composed/editor/index";
import { EnhancedInput } from "@workspace/ui/composed/enhanced-input";
import { Icon } from "@workspace/ui/composed/icon";
import {
  ProTable,
  type ProTableActions,
} from "@workspace/ui/composed/pro-table/index";
import { UploadImage } from "@workspace/ui/composed/upload-image";
import type { ColumnDef } from "@workspace/ui/lib/table";
import {
  postApplication as createSubscribeApplication,
  deleteApplicationSubscribeApplication as deleteSubscribeApplication,
  getApplicationSubscribeApplicationList as getSubscribeApplicationList,
  putApplicationSubscribeApplication as updateSubscribeApplication,
} from "@workspace/ui/services/admin/admin";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { subscribeSchema } from "./schema";
import { TemplatePreview } from "./template-preview";

const createClientFormSchema = (t: any) =>
  z.object({
    name: z
      .string()
      .min(1, t("form.validation.nameRequired", "Client name is required")),
    description: z.string().optional(),
    icon: z.string().optional(),
    user_agent: z
      .string()
      .min(
        1,
        `User-Agent ${t("form.validation.userAgentRequiredSuffix", "is required")}`
      ),
    scheme: z.string().optional(),
    template: z.string(),
    output_format: z.string(),
    default_params: z
      .string()
      .max(255)
      .refine(
        (value) => {
          try {
            for (const pair of value.split("&")) {
              if (pair.includes(";")) return false;
              decodeURIComponent(pair.replace(/\+/g, " "));
            }
            return true;
          } catch {
            return false;
          }
        },
        t(
          "subscribe:form.validation.invalidDefaultParams",
          "Invalid query-string parameters"
        )
      ),
    download_link: z.object({
      windows: z.string().optional(),
      mac: z.string().optional(),
      linux: z.string().optional(),
      ios: z.string().optional(),
      android: z.string().optional(),
      harmony: z.string().optional(),
    }),
  });

type ClientFormData = z.infer<ReturnType<typeof createClientFormSchema>>;

export function ProtocolForm() {
  const { t } = useTranslation("subscribe");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingClient, setEditingClient] =
    useState<API.SubscribeApplication | null>(null);
  const tableRef = useRef<ProTableActions>(null);

  const clientFormSchema = createClientFormSchema(t);

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "",
      user_agent: "",
      scheme: "",
      template: "",
      output_format: "",
      default_params: "",
      download_link: {
        windows: "",
        mac: "",
        linux: "",
        ios: "",
        android: "",
        harmony: "",
      },
    },
  });

  const request = async (
    pagination: { page: number; size: number },
    _filter: Record<string, unknown>
  ) => {
    const { data } = await getSubscribeApplicationList({
      page: pagination.page,
      size: pagination.size,
    });

    return {
      list: data.data?.list || [],
      total: data.data?.total || 0,
    };
  };

  const columns: ColumnDef<API.SubscribeApplication, any>[] = [
    {
      accessorKey: "is_default",
      header: t("table.columns.default", "Default"),
      cell: ({ row }) => (
        <Switch
          checked={row.original.is_default}
          onCheckedChange={async (checked) => {
            await updateSubscribeApplication({
              ...row.original,
              is_default: checked,
            });
            tableRef.current?.refresh();
          }}
        />
      ),
    },
    {
      accessorKey: "name",
      header: t("table.columns.name", "Client Name"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.icon && (
            <div className="relative h-6 w-6 flex-shrink-0">
              {/* biome-ignore lint/performance/noImgElement: dynamic remote client icon URL */}
              <img
                alt={row.original.name}
                className="h-full w-full rounded object-contain"
                height={24}
                onError={() => {
                  console.log(`Failed to load image for ${row.original.name}`);
                }}
                src={row.original.icon}
                width={24}
              />
            </div>
          )}
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "user_agent",
      header: "User-Agent",
      cell: ({ row }) => (
        <div className="max-w-[150px] truncate font-mono text-muted text-sm">
          {row.original.user_agent}
        </div>
      ),
    },
    {
      accessorKey: "output_format",
      header: t("table.columns.outputFormat", "Output Format"),
      cell: ({ row }) => (
        <Badge className="text-xs" variant="secondary">
          {t(
            `outputFormats.${row.original.output_format}`,
            row.original.output_format
          ) || row.original.output_format}
        </Badge>
      ),
    },
    {
      accessorKey: "download_link",
      header: t("table.columns.supportedPlatforms", "Supported Platforms"),
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {Object.entries(row.original.download_link || {}).map(
            ([key, value]) => {
              if (value) {
                return (
                  <Badge className="text-xs" key={key} variant="secondary">
                    {t(`platforms.${key}`, key)}
                  </Badge>
                );
              }
              return null;
            }
          )}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: t("table.columns.description", "Description"),
      cell: ({ row }) => (
        <Tooltip>
          <Tooltip.Trigger>
            <div className="max-w-[200px] truncate text-muted text-sm">
              {row.original.description}
            </div>
          </Tooltip.Trigger>
          <Tooltip.Content className="max-w-xs">
            <p>{row.original.description}</p>
          </Tooltip.Content>
        </Tooltip>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingClient(null);
    form.reset({
      name: "",
      description: "",
      icon: "",
      user_agent: "",
      scheme: "",
      template: "",
      output_format: "",
      default_params: "",
      download_link: {
        windows: "",
        mac: "",
        linux: "",
        ios: "",
        android: "",
        harmony: "",
      },
    });
    setOpen(true);
  };

  const handleEdit = (client: API.SubscribeApplication) => {
    setEditingClient(client);
    form.reset({
      ...client,
      default_params: client.default_params || "",
      download_link: client.download_link || {
        windows: "",
        mac: "",
        linux: "",
        ios: "",
        android: "",
        harmony: "",
      },
    });
    setOpen(true);
  };

  const handleDelete = async (client: API.SubscribeApplication) => {
    setLoading(true);
    try {
      await deleteSubscribeApplication({ id: client.id });
      tableRef.current?.refresh();
      toast.success(t("actions.deleteSuccess", "Deleted successfully"));
    } catch (error) {
      console.error("Failed to delete client:", error);
      toast.danger(t("actions.deleteFailed", "Delete failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleBatchDelete = async (clients: API.SubscribeApplication[]) => {
    setLoading(true);
    try {
      await Promise.all(
        clients.map((client) => deleteSubscribeApplication({ id: client.id }))
      );
      tableRef.current?.refresh();
      toast.success(
        t(
          "actions.batchDeleteSuccess",
          "Successfully deleted {count} clients",
          { count: clients.length }
        )
      );
    } catch (error) {
      console.error("Failed to batch delete clients:", error);
      toast.danger(t("actions.deleteFailed", "Delete failed"));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ClientFormData) => {
    setLoading(true);
    try {
      if (editingClient) {
        await updateSubscribeApplication({
          ...data,
          is_default: editingClient.is_default,
          id: editingClient.id,
        });
        toast.success(t("actions.updateSuccess", "Updated successfully"));
      } else {
        await createSubscribeApplication({
          ...data,
          is_default: false,
        });
        toast.success(t("actions.createSuccess", "Created successfully"));
      }

      setOpen(false);
      tableRef.current?.refresh();
    } catch (error) {
      console.error("Failed to save client:", error);
      toast.danger(t("actions.saveFailed", "Save failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ProTable<API.SubscribeApplication, Record<string, unknown>>
        action={tableRef}
        actions={{
          render: (row: API.SubscribeApplication) => [
            <TemplatePreview
              applicationId={row.id}
              key="preview"
              output_format={row.output_format}
            />,
            <Button
              key="edit"
              onClick={() =>
                handleEdit(row as unknown as API.SubscribeApplication)
              }
            >
              {t("actions.edit", "Edit")}
            </Button>,
            <ConfirmButton
              cancelText={t("actions.cancel", "Cancel")}
              confirmText={t("actions.confirm", "Confirm")}
              description={t(
                "actions.deleteWarning",
                "This operation cannot be undone. Are you sure you want to delete this client?"
              )}
              key="delete"
              onConfirm={() =>
                handleDelete(row as unknown as API.SubscribeApplication)
              }
              title={t("actions.confirmDelete", "Confirm Delete")}
              trigger={
                <Button loading={loading} variant="destructive">
                  {t("actions.delete", "Delete")}
                </Button>
              }
            />,
          ],
          batchRender: (rows: API.SubscribeApplication[]) => [
            <ConfirmButton
              cancelText={t("actions.cancel", "Cancel")}
              confirmText={t("actions.confirm", "Confirm")}
              description={t(
                "actions.batchDeleteWarning",
                "Are you sure you want to delete the selected {count} clients?",
                {
                  count: rows.length,
                }
              )}
              key="batchDelete"
              onConfirm={() =>
                handleBatchDelete(rows as unknown as API.SubscribeApplication[])
              }
              title={t("actions.confirmDelete", "Confirm Delete")}
              trigger={
                <Button variant="destructive">
                  {t("actions.batchDelete", "Batch Delete")}
                </Button>
              }
            />,
          ],
        }}
        columns={columns}
        header={{
          title: (
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">
                {t("protocol.title", "Client Management")}
              </h2>
              <a
                className="inline-flex items-center gap-2 rounded-md px-3 py-1 font-medium text-accent text-sm hover:underline"
                href="https://github.com/perfect-panel/subscription-template"
                rel="noreferrer noopener"
                target="_blank"
              >
                <Icon className="h-4 w-4" icon="mdi:github" />
                <span>Template Repo</span>
                <Icon className="h-4 w-4 text-muted" icon="mdi:open-in-new" />
              </a>
            </div>
          ),
          toolbar: (
            <Button onClick={handleAdd}>{t("actions.add", "Add")}</Button>
          ),
        }}
        request={request}
      />

      <Sheet isOpen={open} onOpenChange={setOpen} placement="right">
        <Sheet.Backdrop>
          <Sheet.Content>
            <Sheet.Dialog className="w-[580px] max-w-full md:max-w-screen-md">
              <Sheet.Header>
                <Sheet.Heading>
                  {editingClient
                    ? t("form.editTitle", "Edit Client")
                    : t("form.addTitle", "Add Client")}
                </Sheet.Heading>
              </Sheet.Header>
              <ScrollArea className="h-[calc(100dvh-48px-36px-36px)] px-6">
                <Form {...form}>
                  <form className="space-y-6 py-4">
                    <Tabs
                      className="w-full min-w-0 max-w-full"
                      defaultSelectedKey="basic"
                    >
                      <TabsListContainer className="min-w-0 max-w-full">
                        <TabsList aria-label={t("sections", "Sections")}>
                          <TabsTrigger
                            className="w-auto flex-1 whitespace-nowrap"
                            id="basic"
                          >
                            {t("form.tabs.basic", "Basic Info")}
                            <TabIndicator />
                          </TabsTrigger>
                          <TabsTrigger
                            className="w-auto flex-1 whitespace-nowrap"
                            id="template"
                          >
                            {t("form.tabs.template", "Templates")}
                            <TabIndicator />
                          </TabsTrigger>
                          <TabsTrigger
                            className="w-auto flex-1 whitespace-nowrap"
                            id="download"
                          >
                            {t("form.tabs.download", "Downloads")}
                            <TabIndicator />
                          </TabsTrigger>
                        </TabsList>
                      </TabsListContainer>

                      <TabsContent className="space-y-4" id="basic">
                        <FormField
                          control={form.control}
                          name="icon"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t("form.fields.icon", "Icon")}
                              </FormLabel>
                              <FormControl>
                                <EnhancedInput
                                  onValueChange={(value) => {
                                    form.setValue(field.name, value as string);
                                  }}
                                  placeholder="https://example.com/icon.png"
                                  suffix={
                                    <UploadImage
                                      className="h-9 rounded-none border-none bg-default px-2"
                                      onChange={(value) => {
                                        form.setValue(
                                          field.name,
                                          value as string
                                        );
                                      }}
                                    />
                                  }
                                  type="text"
                                  value={field.value}
                                />
                              </FormControl>
                              <FormDescription>
                                {t(
                                  "form.descriptions.icon",
                                  "Icon URL or base64 encoding"
                                )}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t("form.fields.name", "Name")}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Clash for Windows"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                {t(
                                  "form.descriptions.name",
                                  "Client display name"
                                )}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="user_agent"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>User-Agent</FormLabel>
                              <FormControl>
                                <Input placeholder="Clash" {...field} />
                              </FormControl>
                              <FormDescription>
                                {t(
                                  "form.descriptions.userAgentPrefix",
                                  "Client identifier for distinguishing different clients"
                                )}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t("form.fields.description", "Description")}
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder={t(
                                    "form.descriptions.description",
                                    "Detailed client description"
                                  )}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                {t(
                                  "form.descriptions.description",
                                  "Detailed client description"
                                )}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>

                      <TabsContent className="space-y-4" id="template">
                        <FormField
                          control={form.control}
                          name="default_params"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t(
                                  "form.fields.defaultParams",
                                  "Default Parameters"
                                )}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="mode=rule&emoji=1"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="output_format"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t("form.fields.outputFormat", "Output Format")}
                              </FormLabel>
                              <FormControl>
                                <Select
                                  aria-label="Select ..."
                                  onSelectionChange={(key) => {
                                    if (key != null)
                                      field.onChange(String(key));
                                  }}
                                  placeholder="Select ..."
                                  selectedKey={
                                    field.value == null
                                      ? undefined
                                      : String(field.value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                    <SelectIndicator />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <ListBox>
                                      <SelectItem id="base64">
                                        {t("outputFormats.base64", "Base64")}
                                      </SelectItem>
                                      <SelectItem id="yaml">
                                        {t("outputFormats.yaml", "YAML")}
                                      </SelectItem>
                                      <SelectItem id="json">
                                        {t("outputFormats.json", "JSON")}
                                      </SelectItem>
                                      <SelectItem id="conf">
                                        {t("outputFormats.conf", "CONF")}
                                      </SelectItem>
                                      <SelectItem id="plain">
                                        {t("outputFormats.plain", "Plain Text")}
                                      </SelectItem>
                                    </ListBox>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormDescription>
                                {t(
                                  "form.descriptions.outputFormat",
                                  "Subscription configuration file format"
                                )}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="scheme"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                {t("form.fields.scheme", "URL Scheme")}

                                <Tooltip>
                                  <Tooltip.Trigger
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                  >
                                    <Icon
                                      className="h-4 w-4 text-muted"
                                      icon="mdi:help-circle-outline"
                                    />
                                  </Tooltip.Trigger>
                                  <Tooltip.Content
                                    className="max-w-md bg-accent-soft text-accent-soft-foreground"
                                    placement="right"
                                  >
                                    <div className="space-y-2 text-sm">
                                      <div className="font-medium">
                                        {t(
                                          "form.descriptions.scheme.title",
                                          "URL Scheme template"
                                        )}
                                      </div>

                                      <div>
                                        <div className="font-medium">
                                          {t(
                                            "form.descriptions.scheme.variables",
                                            "Supports variables:"
                                          )}
                                        </div>
                                        <ul className="ml-2 list-disc space-y-1 text-xs">
                                          <li>
                                            <code className="rounded px-1">
                                              {"${url}"}
                                            </code>{" "}
                                            -{" "}
                                            {t(
                                              "form.descriptions.scheme.urlVariable",
                                              "subscription URL"
                                            )}
                                          </li>
                                          <li>
                                            <code className="rounded px-1">
                                              {"${name}"}
                                            </code>{" "}
                                            -{" "}
                                            {t(
                                              "form.descriptions.scheme.nameVariable",
                                              "site name"
                                            )}
                                          </li>
                                        </ul>
                                      </div>

                                      <div>
                                        <div className="font-medium">
                                          {t(
                                            "form.descriptions.scheme.functions",
                                            "Supports functions:"
                                          )}
                                        </div>
                                        <ul className="ml-2 list-disc space-y-1 text-xs">
                                          <li>
                                            <code className="rounded px-1">
                                              {"${encodeURIComponent(...)}"}
                                            </code>{" "}
                                            -{" "}
                                            {t(
                                              "form.descriptions.scheme.urlEncoding",
                                              "URL encoding"
                                            )}
                                          </li>
                                          <li>
                                            <code className="rounded px-1">
                                              {"${window.btoa(...)}"}
                                            </code>{" "}
                                            -{" "}
                                            {t(
                                              "form.descriptions.scheme.base64Encoding",
                                              "Base64 encoding"
                                            )}
                                          </li>
                                          <li>
                                            <code className="rounded px-1">
                                              {"${JSON.stringify(...)}"}
                                            </code>{" "}
                                            -{" "}
                                            {t(
                                              "form.descriptions.scheme.jsonStringify",
                                              "JSON object to string"
                                            )}
                                          </li>
                                        </ul>
                                      </div>
                                    </div>
                                  </Tooltip.Content>
                                </Tooltip>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="clash://install-config?url=${url}&name=${name}"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="template"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                {t(
                                  "form.fields.template",
                                  "Subscription File Template"
                                )}

                                <Tooltip>
                                  <Tooltip.Trigger
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                  >
                                    <Icon
                                      className="h-4 w-4 text-muted"
                                      icon="mdi:help-circle-outline"
                                    />
                                  </Tooltip.Trigger>
                                  <Tooltip.Content
                                    className="max-w-md bg-accent-soft text-accent-soft-foreground"
                                    placement="right"
                                  >
                                    <div className="space-y-2 text-sm">
                                      <div className="font-medium">
                                        {t(
                                          "form.descriptions.template.title",
                                          "Go Template Syntax"
                                        )}
                                      </div>

                                      <div>
                                        <div className="font-medium">
                                          {t(
                                            "form.descriptions.template.variables",
                                            "Available variables:"
                                          )}
                                        </div>
                                        <ul className="ml-2 list-disc space-y-1 text-xs">
                                          <li>
                                            <code className="rounded px-1">
                                              .SiteName
                                            </code>{" "}
                                            -{" "}
                                            {t(
                                              "form.descriptions.template.siteName",
                                              "site name"
                                            )}
                                          </li>
                                          <li>
                                            <code className="rounded px-1">
                                              .SubscribeName
                                            </code>{" "}
                                            -{" "}
                                            {t(
                                              "form.descriptions.template.subscribeName",
                                              "subscription name"
                                            )}
                                          </li>
                                          <li>
                                            <code className="rounded px-1">
                                              .Proxies
                                            </code>{" "}
                                            -{" "}
                                            {t(
                                              "form.descriptions.template.nodes",
                                              "proxy nodes list"
                                            )}
                                          </li>
                                          <li>
                                            <code className="rounded px-1">
                                              .UserInfo
                                            </code>{" "}
                                            -{" "}
                                            {t(
                                              "form.descriptions.template.userInfo",
                                              "user info (traffic, expiry, etc.)"
                                            )}
                                          </li>
                                          <li>
                                            <code className="rounded px-1">
                                              .UserInfo.NowhereKey
                                            </code>{" "}
                                            -{" "}
                                            {t(
                                              "form.descriptions.template.nowhereKey",
                                              "NW3 shared key; other protocols continue to use .UserInfo.Password"
                                            )}
                                          </li>
                                        </ul>
                                      </div>

                                      <div>
                                        <div className="font-medium">
                                          {t(
                                            "form.descriptions.template.functions",
                                            "Template functions:"
                                          )}
                                        </div>
                                        <ul className="ml-2 list-disc space-y-1 text-xs">
                                          <li>
                                            <code className="rounded px-1">
                                              {"{{range .Proxies}}...{{end}}"}
                                            </code>{" "}
                                            -{" "}
                                            {t(
                                              "form.descriptions.template.range",
                                              "iterate arrays"
                                            )}
                                          </li>
                                          <li>
                                            <code className="rounded px-1">
                                              {"{{if .condition}}...{{end}}"}
                                            </code>{" "}
                                            -{" "}
                                            {t(
                                              "form.descriptions.template.if",
                                              "conditional statements"
                                            )}
                                          </li>
                                          <li>
                                            <code className="rounded px-1">
                                              {"{{sprig_func}}"}
                                            </code>{" "}
                                            -{" "}
                                            {t(
                                              "form.descriptions.template.sprig",
                                              "Sprig function library (string processing, dates, etc.)"
                                            )}
                                          </li>
                                        </ul>
                                      </div>
                                    </div>
                                  </Tooltip.Content>
                                </Tooltip>
                              </FormLabel>
                              <FormControl>
                                <GoTemplateEditor
                                  enableSprig
                                  onChange={(value: string | undefined) =>
                                    field.onChange(value || "")
                                  }
                                  schema={subscribeSchema}
                                  showLineNumbers
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>

                      <TabsContent className="space-y-4" id="download">
                        <div className="space-y-4">
                          <div className="grid gap-3">
                            {[
                              "windows",
                              "mac",
                              "linux",
                              "ios",
                              "android",
                              "harmony",
                            ].map((key) => (
                              <FormField
                                control={form.control}
                                key={key}
                                name={
                                  `download_link.${key}` as `download_link.${keyof ClientFormData["download_link"]}`
                                }
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      {t(`platforms.${key}`, key)}
                                    </FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormDescription>
                                      {t(`platforms.${key}`, key)}{" "}
                                      {t(
                                        "form.descriptions.downloadLink",
                                        "platform download URL"
                                      )}
                                    </FormDescription>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </form>
                </Form>
              </ScrollArea>
              <Sheet.Footer className="flex-row justify-end gap-2 pt-3">
                <Button onClick={() => setOpen(false)} variant="outline">
                  {t("actions.cancel", "Cancel")}
                </Button>
                <Button loading={loading} onClick={form.handleSubmit(onSubmit)}>
                  {editingClient
                    ? t("actions.update", "Update")
                    : t("actions.add", "Add")}
                </Button>
              </Sheet.Footer>
              <Sheet.CloseTrigger aria-label="Close" />
            </Sheet.Dialog>
          </Sheet.Content>
        </Sheet.Backdrop>
      </Sheet>
    </>
  );
}
