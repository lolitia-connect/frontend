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
  Button as SheetButton,
  TabIndicator,
  Tabs,
  TabPanel as TabsContent,
  TabList as TabsList,
  TabListContainer as TabsListContainer,
  Tab as TabsTrigger,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
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
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Textarea } from "@workspace/ui/components/textarea";
import { ArrayInput } from "@workspace/ui/composed/dynamic-inputs";
import { EnhancedInput } from "@workspace/ui/composed/enhanced-input";
import { Icon } from "@workspace/ui/composed/icon";
import {
  getSystemNodeConfig as getNodeConfig,
  putSystemNodeConfig as updateNodeConfig,
} from "@workspace/ui/services/admin/admin";
import { unitConversion } from "@workspace/ui/utils/unit-conversions";
import { DicesIcon } from "lucide-react";
import { uid } from "radash";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import {
  normalizeOutboundConfig,
  outboundConfigSchema,
} from "./outbound-config";
import { OutboundConfigInput } from "./outbound-config-input";

const dnsConfigSchema = z.object({
  proto: z.string(), // z.enum(['tcp', 'udp', 'tls', 'https', 'quic']),
  address: z.string(),
  server_name: z.string().optional(),
  domains: z.array(z.string()),
});

const nodeConfigSchema = z.object({
  node_secret: z.string().optional(),
  node_pull_interval: z.number().optional(),
  node_push_interval: z.number().optional(),
  traffic_report_threshold: z.number().optional(),
  ip_strategy: z.enum(["prefer_ipv4", "prefer_ipv6"]).optional(),
  dns: z.array(dnsConfigSchema).optional(),
  block: z.array(z.string()).optional(),
  outbound: z.array(outboundConfigSchema).optional(),
});
type NodeConfigFormData = z.infer<typeof nodeConfigSchema>;

export default function ServerConfig() {
  const { t } = useTranslation("servers");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: cfgResp, refetch: refetchCfg } = useQuery({
    queryKey: ["getNodeConfig"],
    queryFn: async () => {
      const { data } = await getNodeConfig();
      return data.data as API.NodeConfig | undefined;
    },
    enabled: open,
  });

  const form = useForm<NodeConfigFormData>({
    resolver: zodResolver(nodeConfigSchema),
    defaultValues: {
      node_secret: "",
      node_pull_interval: undefined,
      node_push_interval: undefined,
      traffic_report_threshold: undefined,
      ip_strategy: "prefer_ipv4",
      dns: [],
      block: [],
      outbound: [],
    },
  });

  useEffect(() => {
    if (cfgResp) {
      form.reset({
        node_secret: cfgResp.node_secret ?? "",
        node_pull_interval: cfgResp.node_pull_interval as number | undefined,
        node_push_interval: cfgResp.node_push_interval as number | undefined,
        traffic_report_threshold: cfgResp.traffic_report_threshold as
          | number
          | undefined,
        ip_strategy:
          (cfgResp.ip_strategy as "prefer_ipv4" | "prefer_ipv6" | undefined) ||
          "prefer_ipv4",
        dns: cfgResp.dns || [],
        block: cfgResp.block || [],
        outbound: cfgResp.outbound || [],
      });
    }
  }, [cfgResp, form]);

  async function onSubmit(values: NodeConfigFormData) {
    setSaving(true);
    try {
      await updateNodeConfig({
        ...values,
        outbound: (values.outbound || []).map((item) =>
          normalizeOutboundConfig(item)
        ),
      } as API.NodeConfig);
      toast.success(t("server_config.saveSuccess", "Saved successfully"));
      await refetchCfg();
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet isOpen={open} onOpenChange={setOpen} placement="right">
      <Sheet.Trigger>
        <SheetButton
          className="settings-option justify-between"
          variant="tertiary"
        >
          <span className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-surface">
              <Icon
                className="size-5 text-foreground"
                icon="mdi:resistor-nodes"
              />
            </span>
            <span className="flex-1">
              <span className="block font-medium">
                {t("server_config.title", "Node configuration")}
              </span>
              <span className="block text-muted text-sm">
                {t(
                  "server_config.description",
                  "Manage node communication keys, pull/push intervals."
                )}
              </span>
            </span>
          </span>
          <Icon className="size-6 text-muted" icon="mdi:chevron-right" />
        </SheetButton>
      </Sheet.Trigger>

      <Sheet.Backdrop>
        <Sheet.Content>
          <Sheet.Dialog className="w-[720px] max-w-full md:max-w-3xl">
            <Sheet.Header>
              <Sheet.Heading>
                {t("server_config.title", "Node configuration")}
              </Sheet.Heading>
            </Sheet.Header>

            <ScrollArea className="h-[calc(100dvh-48px-36px-36px-env(safe-area-inset-top))] px-6">
              <Tabs
                className="min-w-0 max-w-full pt-4"
                defaultSelectedKey="basic"
              >
                <TabsListContainer className="min-w-0 max-w-full">
                  <TabsList aria-label={t("sections", "Sections")}>
                    <TabsTrigger
                      className="w-auto flex-1 whitespace-nowrap"
                      id="basic"
                    >
                      {t("server_config.tabs.basic", "Basic Configuration")}
                      <TabIndicator />
                    </TabsTrigger>
                    <TabsTrigger
                      className="w-auto flex-1 whitespace-nowrap"
                      id="dns"
                    >
                      {t("server_config.tabs.dns", "DNS Configuration")}
                      <TabIndicator />
                    </TabsTrigger>
                    <TabsTrigger
                      className="w-auto flex-1 whitespace-nowrap"
                      id="outbound"
                    >
                      {t("server_config.tabs.outbound", "Outbound Rules")}
                      <TabIndicator />
                    </TabsTrigger>
                    <TabsTrigger
                      className="w-auto flex-1 whitespace-nowrap"
                      id="block"
                    >
                      {t("server_config.tabs.block", "Block Rules")}
                      <TabIndicator />
                    </TabsTrigger>
                  </TabsList>
                </TabsListContainer>

                <Form {...form}>
                  <form
                    className="mt-4"
                    id="server-config-form"
                    onSubmit={form.handleSubmit(onSubmit)}
                  >
                    <TabsContent className="space-y-4" id="basic">
                      <FormField
                        control={form.control}
                        name="node_secret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t(
                                "server_config.fields.communication_key",
                                "Communication key"
                              )}
                            </FormLabel>
                            <FormControl>
                              <EnhancedInput
                                onValueChange={field.onChange}
                                placeholder={t(
                                  "server_config.fields.communication_key_placeholder",
                                  "Please enter"
                                )}
                                suffix={
                                  <div className="flex h-9 items-center bg-default px-3">
                                    <DicesIcon
                                      className="cursor-pointer"
                                      onClick={() => {
                                        const id = uid(32).toLowerCase();
                                        const formatted = `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
                                        form.setValue("node_secret", formatted);
                                      }}
                                    />
                                  </div>
                                }
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              {t(
                                "server_config.fields.communication_key_desc",
                                "Used for node authentication."
                              )}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="node_pull_interval"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t(
                                "server_config.fields.node_pull_interval",
                                "Node pull interval"
                              )}
                            </FormLabel>
                            <FormControl>
                              <EnhancedInput
                                min={0}
                                onValueChange={field.onChange}
                                placeholder={t(
                                  "server_config.fields.communication_key_placeholder",
                                  "Please enter"
                                )}
                                suffix="S"
                                type="number"
                                value={field.value as number | undefined}
                              />
                            </FormControl>
                            <FormDescription>
                              {t(
                                "server_config.fields.node_pull_interval_desc",
                                "How often the node pulls configuration (seconds)."
                              )}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="node_push_interval"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t(
                                "server_config.fields.node_push_interval",
                                "Node push interval"
                              )}
                            </FormLabel>
                            <FormControl>
                              <EnhancedInput
                                min={0}
                                onValueChange={field.onChange}
                                placeholder={t(
                                  "server_config.fields.communication_key_placeholder",
                                  "Please enter"
                                )}
                                step={0.1}
                                suffix="S"
                                type="number"
                                value={field.value as number | undefined}
                              />
                            </FormControl>
                            <FormDescription>
                              {t(
                                "server_config.fields.node_push_interval_desc",
                                "How often the node pushes stats (seconds)."
                              )}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="traffic_report_threshold"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t(
                                "server_config.fields.traffic_report_threshold",
                                "Traffic Report Threshold"
                              )}
                            </FormLabel>
                            <FormControl>
                              <EnhancedInput
                                min={0}
                                onValueChange={(value) => {
                                  field.onChange(
                                    unitConversion("mbToBits", value)
                                  );
                                }}
                                placeholder="1"
                                suffix="MB"
                                type="number"
                                value={unitConversion(
                                  "bitsToMb",
                                  field.value as number | undefined
                                )}
                              />
                            </FormControl>
                            <FormDescription>
                              {t(
                                "server_config.fields.traffic_report_threshold_desc",
                                "Set the minimum threshold for traffic reporting."
                              )}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent className="space-y-4" id="dns">
                      <FormField
                        control={form.control}
                        name="ip_strategy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t(
                                "server_config.fields.ip_strategy",
                                "IP Strategy"
                              )}
                            </FormLabel>
                            <Select
                              aria-label={t(
                                "server_config.fields.ip_strategy_placeholder",
                                "Select IP strategy"
                              )}
                              onSelectionChange={(key) => {
                                if (key != null) field.onChange(String(key));
                              }}
                              placeholder={t(
                                "server_config.fields.ip_strategy_placeholder",
                                "Select IP strategy"
                              )}
                              selectedKey={
                                field.value == null
                                  ? undefined
                                  : String(field.value)
                              }
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                  <SelectIndicator />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <ListBox>
                                  <SelectItem id="prefer_ipv4">
                                    {t(
                                      "server_config.fields.ip_strategy_ipv4",
                                      "Prefer IPv4"
                                    )}
                                  </SelectItem>
                                  <SelectItem id="prefer_ipv6">
                                    {t(
                                      "server_config.fields.ip_strategy_ipv6",
                                      "Prefer IPv6"
                                    )}
                                  </SelectItem>
                                </ListBox>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              {t(
                                "server_config.fields.ip_strategy_desc",
                                "Choose IP version preference for network connections"
                              )}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dns"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t(
                                "server_config.fields.dns_config",
                                "DNS Configuration"
                              )}
                            </FormLabel>
                            <FormControl>
                              <ArrayInput
                                className="grid grid-cols-2 gap-2"
                                fields={[
                                  {
                                    name: "proto",
                                    type: "select",
                                    placeholder: t(
                                      "server_config.fields.dns_proto_placeholder",
                                      "Select type"
                                    ),
                                    options: [
                                      { label: "TCP", value: "tcp" },
                                      { label: "UDP", value: "udp" },
                                      { label: "TLS", value: "tls" },
                                      { label: "HTTPS", value: "https" },
                                      { label: "QUIC", value: "quic" },
                                    ],
                                  },
                                  {
                                    name: "address",
                                    type: "text",
                                    placeholder: "8.8.8.8:53",
                                  },
                                  {
                                    name: "server_name",
                                    type: "text",
                                    placeholder: t(
                                      "server_config.fields.dns_server_name_placeholder",
                                      "TLS server name (optional)"
                                    ),
                                  },
                                  {
                                    name: "domains",
                                    type: "textarea",
                                    className: "col-span-2",
                                    placeholder: t(
                                      "server_config.fields.dns_domains_placeholder",
                                      "One domain rule per line"
                                    ),
                                  },
                                ]}
                                onChange={(values) => {
                                  const converted = values.map((item: any) => ({
                                    proto: item.proto,
                                    address: item.address,
                                    server_name: item.server_name || "",
                                    domains:
                                      typeof item.domains === "string"
                                        ? item.domains
                                            .split("\n")
                                            .map((d: string) => d.trim())
                                        : item.domains || [],
                                  }));
                                  field.onChange(converted);
                                }}
                                value={(field.value || []).map((item) => ({
                                  ...item,
                                  domains: Array.isArray(item.domains)
                                    ? item.domains.join("\n")
                                    : "",
                                }))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent className="space-y-4" id="outbound">
                      <FormField
                        control={form.control}
                        name="outbound"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <OutboundConfigInput
                                onChange={(values) => {
                                  field.onChange(
                                    values.map((item) =>
                                      normalizeOutboundConfig(item)
                                    )
                                  );
                                }}
                                value={field.value || []}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent className="space-y-4" id="block">
                      <FormField
                        control={form.control}
                        name="block"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                onChange={(e) => {
                                  const lines = e.target.value
                                    .split("\n")
                                    .map((line) => line.trim());
                                  field.onChange(lines);
                                }}
                                placeholder={t(
                                  "server_config.fields.block_rules_placeholder",
                                  "One domain rule per line"
                                )}
                                rows={10}
                                value={(field.value || []).join("\n")}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </form>
                </Form>
              </Tabs>
            </ScrollArea>

            <Sheet.Footer className="flex-row justify-end gap-2 pt-3">
              <Button
                loading={saving}
                onClick={() => setOpen(false)}
                variant="outline"
              >
                {t("actions.cancel", "Cancel")}
              </Button>
              <Button form="server-config-form" loading={saving} type="submit">
                {t("actions.save", "Save")}
              </Button>
            </Sheet.Footer>
            <Sheet.CloseTrigger aria-label="Close" />
          </Sheet.Dialog>
        </Sheet.Content>
      </Sheet.Backdrop>
    </Sheet>
  );
}
