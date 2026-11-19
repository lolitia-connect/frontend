"use client";

import { Sheet, Button as SheetButton } from "@heroui/react";
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

import { MarkdownEditor } from "@workspace/ui/composed/editor/index";
import { Icon } from "@workspace/ui/composed/icon";
import {
  getSystemPrivacy as getPrivacyPolicyConfig,
  putSystemPrivacy as updatePrivacyPolicyConfig,
} from "@workspace/ui/services/admin/admin";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

const privacyPolicySchema = z.object({
  privacy_policy: z.string().optional(),
});

type PrivacyPolicyFormData = z.infer<typeof privacyPolicySchema>;

export default function PrivacyPolicyConfig() {
  const { t } = useTranslation("system");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ["getPrivacyPolicyConfig"],
    queryFn: async () => {
      const { data } = await getPrivacyPolicyConfig();
      return data.data;
    },
    enabled: open,
  });

  const form = useForm<PrivacyPolicyFormData>({
    resolver: zodResolver(privacyPolicySchema),
    defaultValues: {
      privacy_policy: "",
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        privacy_policy: data.privacy_policy || "",
      });
    }
  }, [data, form]);

  async function onSubmit(values: PrivacyPolicyFormData) {
    setLoading(true);
    try {
      await updatePrivacyPolicyConfig(values as API.PrivacyPolicyConfig);
      toast.success(t("common.saveSuccess", "Save Successful"));
      refetch();
      setOpen(false);
    } catch {
      toast.error(t("common.saveFailed", "Save Failed"));
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
                icon="mdi:shield-account-outline"
              />
            </span>
            <span className="flex-1">
              <span className="block font-medium">
                {t("privacyPolicy.title", "Privacy Policy")}
              </span>
              <span className="block text-muted text-sm">
                {t(
                  "privacyPolicy.description",
                  "Edit and manage privacy policy content"
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
                {t("privacyPolicy.title", "Privacy Policy")}
              </Sheet.Heading>
            </Sheet.Header>
            <ScrollArea className="h-[calc(100dvh-48px-36px-36px-24px-env(safe-area-inset-top))] px-6">
              <Form {...form}>
                <form
                  className="space-y-2 pt-4"
                  id="privacy-policy-form"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="privacy_policy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("privacyPolicy.title", "Privacy Policy")}
                        </FormLabel>
                        <FormControl>
                          <MarkdownEditor
                            onChange={field.onChange}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          {t(
                            "privacyPolicy.description",
                            "Edit and manage privacy policy content"
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
              <Button
                form="privacy-policy-form"
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
