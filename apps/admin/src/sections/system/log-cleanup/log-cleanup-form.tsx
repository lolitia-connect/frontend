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
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Switch } from "@workspace/ui/components/switch";
import { EnhancedInput } from "@workspace/ui/composed/enhanced-input";
import { Icon } from "@workspace/ui/composed/icon";
import { useQuery } from "@workspace/ui/hooks/query";
import {
  getLogSetting,
  postLogSetting as updateLogSetting,
} from "@workspace/ui/services/admin/admin";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const logCleanupSchema = z.object({
  auto_clear: z.boolean(),
  clear_days: z.number().min(1),
});

type LogCleanupFormData = z.infer<typeof logCleanupSchema>;

export default function LogCleanupForm() {
  const { t } = useTranslation("system");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ["getLogSetting"],
    queryFn: async () => {
      const { data } = await getLogSetting();
      return data.data;
    },
    enabled: open,
  });

  const form = useForm<LogCleanupFormData>({
    resolver: zodResolver(logCleanupSchema),
    defaultValues: {
      auto_clear: false,
      clear_days: 30,
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        auto_clear: data.auto_clear ?? false,
        clear_days: data.clear_days ?? 30,
      });
    }
  }, [data, form]);

  async function onSubmit(values: LogCleanupFormData) {
    setLoading(true);
    try {
      await updateLogSetting(values);
      toast.success(t("common.saveSuccess", "Save Successful"));
      refetch();
      setOpen(false);
    } catch {
      toast.danger(t("common.saveFailed", "Save Failed"));
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
              <Icon
                className="h-5 w-5 text-primary-500"
                icon="mdi:delete-sweep"
              />
            </span>
            <span className="flex-1">
              <span className="block font-medium">
                {t("logCleanup.title", "Log Cleanup Settings")}
              </span>
              <span className="block text-muted text-sm">
                {t(
                  "logCleanup.description",
                  "Configure automatic log cleanup rules and retention period"
                )}
              </span>
            </span>
          </span>
          <Icon className="size-6" icon="mdi:chevron-right" />
        </SheetButton>
      </Sheet.Trigger>
      <Sheet.Backdrop>
        <Sheet.Content>
          <Sheet.Dialog className="w-[600px] max-w-full md:max-w-screen-md">
            <Sheet.Header>
              <Sheet.Heading>
                {t("logCleanup.title", "Log Cleanup Settings")}
              </Sheet.Heading>
            </Sheet.Header>
            <ScrollArea className="h-[calc(100dvh-48px-36px-36px-24px-env(safe-area-inset-top))] px-6">
              <Form {...form}>
                <form
                  className="space-y-2 pt-4"
                  id="log-cleanup-form"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="auto_clear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("logCleanup.autoClear", "Enable Auto Cleanup")}
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
                            "logCleanup.autoClearDescription",
                            "When enabled, the system will automatically clear expired log records"
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="clear_days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("logCleanup.clearDays", "Retention Days")}
                        </FormLabel>
                        <FormControl>
                          <EnhancedInput
                            disabled={!form.watch("auto_clear")}
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            placeholder={t(
                              "logCleanup.clearDaysPlaceholder",
                              "Enter retention days"
                            )}
                            type="number"
                            value={field.value?.toString()}
                          />
                        </FormControl>
                        <FormDescription>
                          {t(
                            "logCleanup.clearDaysDescription",
                            "Number of days to retain logs; logs older than this will be cleaned up"
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </ScrollArea>
            <Sheet.Footer className="flex-row justify-end gap-2 pt-3">
              <Button
                loading={loading}
                onClick={() => setOpen(false)}
                variant="outline"
              >
                {t("common.cancel", "Cancel")}
              </Button>
              <Button form="log-cleanup-form" loading={loading} type="submit">
                {t("common.save", "Save Settings")}
              </Button>
            </Sheet.Footer>
            <Sheet.CloseTrigger aria-label="Close" />
          </Sheet.Dialog>
        </Sheet.Content>
      </Sheet.Backdrop>
    </Sheet>
  );
}
