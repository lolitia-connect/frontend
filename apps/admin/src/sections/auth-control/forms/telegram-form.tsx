"use client";

import { Sheet, Button as SheetButton, toast } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Switch } from "@workspace/ui/components/switch";
import { EnhancedInput } from "@workspace/ui/composed/enhanced-input";
import { Icon } from "@workspace/ui/composed/icon";
import { useQuery } from "@workspace/ui/hooks/query";
import {
  getAuthMethodConfig,
  putAuthMethodConfig as updateAuthMethodConfig,
} from "@workspace/ui/services/admin/admin";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { SettingsFormBody } from "@/components/settings-form-body";

const telegramSchema = z.object({
  enabled: z.boolean(),
  bot_token: z.string().optional(),
  enable_notify: z.boolean(),
  webhook_domain: z.string().optional(),
  // Stored as text because the panel round-trips this config as JSON; the
  // server parses it and disables every group feature when it is empty.
  group_chat_id: z
    .string()
    .optional()
    .refine((value) => !value?.trim() || /^-?\d+$/.test(value.trim()), {
      message: "Group chat id must be a number, e.g. -1001234567890",
    }),
});

type TelegramFormData = z.infer<typeof telegramSchema>;

export default function TelegramForm() {
  const { t } = useTranslation("auth-control");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    data,
    refetch,
    isLoading: loadingConfig,
  } = useQuery({
    queryKey: ["getAuthMethodConfig", "telegram"],
    queryFn: async () => {
      const { data } = await getAuthMethodConfig({
        method: "telegram",
      });

      return data.data;
    },
    enabled: open,
  });

  const form = useForm<TelegramFormData>({
    resolver: zodResolver(telegramSchema),
    defaultValues: {
      enabled: false,
      bot_token: "",
      enable_notify: false,
      webhook_domain: "",
      group_chat_id: "",
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        enabled: data.enabled,
        bot_token: data.config?.bot_token || "",
        enable_notify: data.config?.enable_notify ?? false,
        webhook_domain: data.config?.webhook_domain || "",
        group_chat_id: data.config?.group_chat_id || "",
      });
    }
  }, [data, form]);

  async function onSubmit(values: TelegramFormData) {
    setLoading(true);
    try {
      await updateAuthMethodConfig({
        ...data,
        enabled: values.enabled,
        config: {
          ...data?.config,
          bot_token: values.bot_token,
          enable_notify: values.enable_notify,
          webhook_domain: values.webhook_domain,
          group_chat_id: values.group_chat_id?.trim() || "",
        },
      } as API.UpdateAuthMethodConfigRequest);
      toast.success(t("common.saveSuccess", "Saved successfully"));
      refetch();
      setOpen(false);
    } catch {
      toast.danger(t("common.saveFailed", "Save failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet isOpen={open} onOpenChange={setOpen} placement="right">
      <Sheet.Trigger>
        <SheetButton
          className="settings-option justify-between"
          variant="ghost"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
              <Icon className="h-5 w-5 text-primary-500" icon="mdi:telegram" />
            </span>
            <span className="flex-1">
              <span className="block font-medium">
                {t("telegram.title", "Telegram Sign-In")}
              </span>
              <span className="block text-muted text-sm">
                {t(
                  "telegram.description",
                  "Authenticate users with Telegram accounts"
                )}
              </span>
            </span>
          </span>
          <Icon className="size-6" icon="mdi:chevron-right" />
        </SheetButton>
      </Sheet.Trigger>
      <Sheet.Backdrop>
        <Sheet.Content>
          <Sheet.Dialog className="w-[500px] max-w-full md:max-w-screen-md">
            <Sheet.Header>
              <Sheet.Heading>
                {t("telegram.title", "Telegram Sign-In")}
              </Sheet.Heading>
            </Sheet.Header>
            <SettingsFormBody
              className="h-[calc(100dvh-48px-36px-36px-24px-env(safe-area-inset-top))] px-6"
              isLoading={loadingConfig}
            >
              <Form {...form}>
                <form
                  className="space-y-2 pt-4"
                  id="telegram-form"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="enabled"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("telegram.enable", "Enable")}</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            className="!mt-0 float-end"
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          {t(
                            "telegram.enableDescription",
                            "When enabled, users can sign in with their Telegram account"
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bot_token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("telegram.botToken", "Bot Token")}
                        </FormLabel>
                        <FormControl>
                          <EnhancedInput
                            onValueChange={field.onChange}
                            placeholder="123456789:AAHn_xxxxxxxxxxxxxxxxxxxxxxxx"
                            type="password"
                            value={field.value}
                          />
                        </FormControl>
                        <FormDescription>
                          {t(
                            "telegram.botTokenDescription",
                            "Telegram Bot Token from @BotFather"
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="webhook_domain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("telegram.webhookDomain", "Webhook Domain")}
                        </FormLabel>
                        <FormControl>
                          <EnhancedInput
                            onValueChange={field.onChange}
                            placeholder="https://your-domain.com"
                            value={field.value}
                          />
                        </FormControl>
                        <FormDescription>
                          {t(
                            "telegram.webhookDomainDescription",
                            "Public HTTPS URL of this server. Leave empty to use long-polling."
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="group_chat_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("telegram.groupChatId", "Admin Group Chat ID")}
                        </FormLabel>
                        <FormControl>
                          <EnhancedInput
                            onValueChange={field.onChange}
                            placeholder="-1001234567890"
                            value={field.value}
                          />
                        </FormControl>
                        <FormDescription>
                          {t(
                            "telegram.groupChatIdDescription",
                            "Forum-enabled supergroup that carries notifications, tickets and live chat. The bot must be an administrator with the manage-topics permission. Leave empty to disable every group feature."
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enable_notify"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("telegram.enableNotify", "Enable Notifications")}
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            className="!mt-0 float-end"
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          {t(
                            "telegram.enableNotifyDescription",
                            "Send order and expiry notifications to users via Telegram"
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </SettingsFormBody>
            <Sheet.Footer className="flex-row justify-end gap-2 pt-3">
              <Button
                disabled={loading}
                onClick={() => setOpen(false)}
                variant="outline"
              >
                {t("common.cancel", "Cancel")}
              </Button>
              <Button
                disabled={loadingConfig}
                form="telegram-form"
                loading={loading}
                type="submit"
              >
                {t("common.save", "Save")}
              </Button>
            </Sheet.Footer>
            <Sheet.CloseTrigger aria-label="Close" />
          </Sheet.Dialog>
        </Sheet.Content>
      </Sheet.Backdrop>
    </Sheet>
  );
}
