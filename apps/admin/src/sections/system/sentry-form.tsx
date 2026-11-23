"use client";

import { Sheet, Button as SheetButton, toast } from "@heroui/react";
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
import { useQuery, useQueryClient } from "@workspace/ui/hooks/query";
import {
  getLogSetting,
  postLogSetting,
} from "@workspace/ui/services/admin/admin";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

const queryKey = ["getLogSetting"];
const projectPath = /\/\d+$/;

function publicProjectDsn(value: string) {
  try {
    const url = new URL(value);
    return (
      ["https:", "http:"].includes(url.protocol) &&
      Boolean(url.username) &&
      !url.password &&
      !/[?#\s]/.test(value) &&
      projectPath.test(url.pathname)
    );
  } catch {
    return false;
  }
}

function SentryEditor({
  settings,
  close,
}: {
  settings: API.LogSetting;
  close: () => void;
}) {
  const { t } = useTranslation("system");
  const cache = useQueryClient();
  const form = useForm({
    resetOptions: { keepDirtyValues: true },
    values: {
      sentry_error_enabled:
        settings.sentry_error_enabled ?? settings.sentry_enabled ?? false,
      sentry_logs_enabled: settings.sentry_logs_enabled ?? false,
      sentry_tracing_enabled: settings.sentry_tracing_enabled ?? false,
      sentry_metrics_enabled: settings.sentry_metrics_enabled ?? false,
      sentry_trace_id_header_enabled:
        settings.sentry_trace_id_header_enabled ?? false,
      sentry_dsn: settings.sentry_dsn ?? "",
    },
  });
  const save = form.handleSubmit(async (values) => {
    const update = { ...values, sentry_dsn: values.sentry_dsn.trim() };
    const anyEnabled =
      update.sentry_error_enabled ||
      update.sentry_logs_enabled ||
      update.sentry_tracing_enabled ||
      update.sentry_metrics_enabled ||
      update.sentry_trace_id_header_enabled;
    if (
      (anyEnabled || update.sentry_dsn) &&
      !publicProjectDsn(update.sentry_dsn)
    ) {
      form.setError("sentry_dsn", { message: t("sentry.invalidDsn") });
      return;
    }
    try {
      await postLogSetting(update);
      cache.setQueryData<API.LogSetting>(queryKey, (old) => ({
        ...old,
        ...update,
      }));
      toast.success(t("common.saveSuccess"));
      close();
    } catch {
      toast.danger(t("common.saveFailed"));
    }
  });
  return (
    <Form {...form}>
      <form className="flex flex-1 flex-col" onSubmit={save}>
        <Sheet.Body className="space-y-4 px-6">
          <FormField
            control={form.control}
            name="sentry_error_enabled"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("sentry.errorMonitoring")}</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    className="float-end"
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>
                  {t("sentry.errorMonitoringDescription")}
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sentry_logs_enabled"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("sentry.logging")}</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    className="float-end"
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>
                  {t("sentry.loggingDescription")}
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sentry_tracing_enabled"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("sentry.tracing")}</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    className="float-end"
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>
                  {t("sentry.tracingDescription")}
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sentry_metrics_enabled"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("sentry.applicationMetrics")}</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    className="float-end"
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>
                  {t("sentry.applicationMetricsDescription")}
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sentry_trace_id_header_enabled"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("sentry.traceIDHeader")}</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    className="float-end"
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>
                  {t("sentry.traceIDHeaderDescription")}
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sentry_dsn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("sentry.dsn")}</FormLabel>
                <FormControl>
                  <EnhancedInput
                    autoComplete="off"
                    onValueChange={field.onChange}
                    spellCheck={false}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Sheet.Body>
        <Sheet.Footer className="flex-row justify-end gap-2 pt-3">
          <Button onClick={close} type="button" variant="outline">
            {t("common.cancel")}
          </Button>
          <Button
            disabled={!form.formState.isDirty}
            loading={form.formState.isSubmitting}
            type="submit"
          >
            {t("common.save")}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
}

export default function SentryForm() {
  const { t } = useTranslation("system");
  const [open, setOpen] = useState(false);
  const { data, isError, refetch } = useQuery({
    queryKey,
    queryFn: async () => (await getLogSetting()).data.data,
    enabled: open,
  });
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
                icon="simple-icons:sentry"
              />
            </span>
            <span className="flex-1">
              <span className="block font-medium">{t("sentry.title")}</span>
              <span className="block text-muted text-sm">
                {t("sentry.description")}
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
              <Sheet.Heading>{t("sentry.title")}</Sheet.Heading>
            </Sheet.Header>
            {open && data && (
              <SentryEditor close={() => setOpen(false)} settings={data} />
            )}
            {open && !data && (
              <Sheet.Body aria-live="polite">
                {isError ? (
                  <Button onClick={() => refetch()}>{t("sentry.retry")}</Button>
                ) : (
                  t("sentry.loading")
                )}
              </Sheet.Body>
            )}
            <Sheet.CloseTrigger aria-label={t("common.cancel")} />
          </Sheet.Dialog>
        </Sheet.Content>
      </Sheet.Backdrop>
    </Sheet>
  );
}
