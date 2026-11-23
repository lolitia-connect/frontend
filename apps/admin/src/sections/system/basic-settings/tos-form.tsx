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
import { MarkdownEditor } from "@workspace/ui/composed/editor/markdown";
import { Icon } from "@workspace/ui/composed/icon";
import { useQuery } from "@workspace/ui/hooks/query";
import {
  getSystemTosConfig as getTosConfig,
  putSystemTosConfig as updateTosConfig,
} from "@workspace/ui/services/admin/admin";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { SettingsFormBody } from "@/components/settings-form-body";

const tosSchema = z.object({
  tos_content: z.string().optional(),
});

type TosFormData = z.infer<typeof tosSchema>;

export default function TosConfig() {
  const { t } = useTranslation("system");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    data,
    refetch,
    isLoading: loadingConfig,
  } = useQuery({
    queryKey: ["getTosConfig"],
    queryFn: async () => {
      const { data } = await getTosConfig();
      return data.data;
    },
    enabled: open,
  });

  const form = useForm<TosFormData>({
    resolver: zodResolver(tosSchema),
    defaultValues: {
      tos_content: "",
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        tos_content: data.tos_content || "",
      });
    }
  }, [data, form]);

  async function onSubmit(values: TosFormData) {
    setLoading(true);
    try {
      await updateTosConfig(values as API.TosConfig);
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
                icon="mdi:file-document-outline"
              />
            </span>
            <span className="flex-1">
              <span className="block font-medium">
                {t("tos.title", "Terms of Service")}
              </span>
              <span className="block text-muted text-sm">
                {t(
                  "tos.description",
                  "Edit and manage terms of service content"
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
                {t("tos.title", "Terms of Service")}
              </Sheet.Heading>
            </Sheet.Header>
            <SettingsFormBody
              className="h-[calc(100dvh-48px-36px-36px-24px-env(safe-area-inset-top))] px-6"
              isLoading={loadingConfig}
            >
              <Form {...form}>
                <form
                  className="space-y-2 pt-4"
                  id="tos-form"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="tos_content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("tos.title", "Terms of Service")}
                        </FormLabel>
                        <FormControl>
                          <MarkdownEditor
                            onChange={field.onChange}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          {t(
                            "tos.description",
                            "Edit and manage terms of service content"
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
                form="tos-form"
                loading={loading}
                type="submit"
              >
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
