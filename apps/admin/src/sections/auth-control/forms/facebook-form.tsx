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

const facebookSchema = z.object({
  enabled: z.boolean(),
  client_id: z.string().optional(),
  client_secret: z.string().optional(),
});

type FacebookFormData = z.infer<typeof facebookSchema>;

export default function FacebookForm() {
  const { t } = useTranslation("auth-control");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    data,
    refetch,
    isLoading: loadingConfig,
  } = useQuery({
    queryKey: ["getAuthMethodConfig", "facebook"],
    queryFn: async () => {
      const { data } = await getAuthMethodConfig({
        method: "facebook",
      });
      return data.data;
    },
    enabled: open,
  });

  const form = useForm<FacebookFormData>({
    resolver: zodResolver(facebookSchema),
    defaultValues: {
      enabled: false,
      client_id: "",
      client_secret: "",
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        enabled: data.enabled,
        client_id: data.config?.client_id || "",
        client_secret: data.config?.client_secret || "",
      });
    }
  }, [data, form]);

  async function onSubmit(values: FacebookFormData) {
    setLoading(true);
    try {
      await updateAuthMethodConfig({
        ...data,
        enabled: values.enabled,
        config: {
          ...data?.config,
          client_id: values.client_id,
          client_secret: values.client_secret,
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
              <Icon className="h-5 w-5 text-primary-500" icon="mdi:facebook" />
            </span>
            <span className="flex-1">
              <span className="block font-medium">
                {t("facebook.title", "Facebook Sign-In")}
              </span>
              <span className="block text-muted text-sm">
                {t(
                  "facebook.description",
                  "Authenticate users with Facebook accounts"
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
                {t("facebook.title", "Facebook Sign-In")}
              </Sheet.Heading>
            </Sheet.Header>
            <SettingsFormBody
              className="h-[calc(100dvh-48px-36px-36px-24px-env(safe-area-inset-top))] px-6"
              isLoading={loadingConfig}
            >
              <Form {...form}>
                <form
                  className="space-y-2 pt-4"
                  id="facebook-form"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="enabled"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("facebook.enable", "Enable")}</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            className="!mt-0 float-end"
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          {t(
                            "facebook.enableDescription",
                            "When enabled, users can sign in with their Facebook account"
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="client_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("facebook.clientId", "App ID")}
                        </FormLabel>
                        <FormControl>
                          <EnhancedInput
                            onValueChange={field.onChange}
                            placeholder="1234567890123456"
                            value={field.value}
                          />
                        </FormControl>
                        <FormDescription>
                          {t(
                            "facebook.clientIdDescription",
                            "Facebook App ID, available from Facebook Developer Portal"
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="client_secret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("facebook.clientSecret", "App Secret")}
                        </FormLabel>
                        <FormControl>
                          <EnhancedInput
                            onValueChange={field.onChange}
                            placeholder="1234567890abcdef1234567890abcdef"
                            type="password"
                            value={field.value}
                          />
                        </FormControl>
                        <FormDescription>
                          {t(
                            "facebook.clientSecretDescription",
                            "Facebook App Secret, available from Facebook Developer Portal"
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
                form="facebook-form"
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
