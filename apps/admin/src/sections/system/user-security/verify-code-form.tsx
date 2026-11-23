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
import { EnhancedInput } from "@workspace/ui/composed/enhanced-input";
import { Icon } from "@workspace/ui/composed/icon";
import { useQuery } from "@workspace/ui/hooks/query";
import {
  getSystemVerifyCodeConfig as getVerifyCodeConfig,
  putSystemVerifyCodeConfig as updateVerifyCodeConfig,
} from "@workspace/ui/services/admin/admin";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const verifyCodeSchema = z.object({
  verify_code_expire_time: z.number().optional(),
  verify_code_interval: z.number().optional(),
  verify_code_limit: z.number().optional(),
});

type VerifyCodeFormData = z.infer<typeof verifyCodeSchema>;

export default function VerifyCodeConfig() {
  const { t } = useTranslation("system");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ["getVerifyCodeConfig"],
    queryFn: async () => {
      const { data } = await getVerifyCodeConfig();
      return data.data;
    },
    enabled: open,
  });

  const form = useForm<VerifyCodeFormData>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      verify_code_expire_time: 300,
      verify_code_interval: 60,
      verify_code_limit: 10,
    },
  });

  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data, form]);

  async function onSubmit(values: VerifyCodeFormData) {
    setLoading(true);
    try {
      await updateVerifyCodeConfig(values as API.VerifyCodeConfig);
      toast.success(t("verifyCode.saveSuccess", "Save Successful"));
      refetch();
      setOpen(false);
    } catch {
      toast.danger(t("verifyCode.saveFailed", "Save Failed"));
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
                icon="mdi:message-text-clock-outline"
              />
            </span>
            <span className="flex-1">
              <span className="block font-medium">
                {t("verifyCode.title", "Verification Code Settings")}
              </span>
              <span className="block text-muted text-sm">
                {t(
                  "verifyCode.description",
                  "Configure email verification code sending rules and limits"
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
                {t("verifyCode.title", "Verification Code Settings")}
              </Sheet.Heading>
            </Sheet.Header>
            <ScrollArea className="h-[calc(100dvh-48px-36px-36px-24px-env(safe-area-inset-top))] px-6">
              <Form {...form}>
                <form
                  className="space-y-2 pt-4"
                  id="verify-code-form"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="verify_code_expire_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t(
                            "verifyCode.expireTime",
                            "Verification Code Validity"
                          )}
                        </FormLabel>
                        <FormControl>
                          <EnhancedInput
                            min={60}
                            onValueBlur={(value) =>
                              field.onChange(Number(value))
                            }
                            placeholder={t(
                              "verifyCode.inputPlaceholder",
                              "Please enter"
                            )}
                            suffix={t("verifyCode.seconds", "seconds")}
                            type="number"
                            value={field.value}
                          />
                        </FormControl>
                        <FormDescription>
                          {t(
                            "verifyCode.expireTimeDescription",
                            "Validity period of verification codes (seconds)"
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="verify_code_interval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("verifyCode.interval", "Sending Interval")}
                        </FormLabel>
                        <FormControl>
                          <EnhancedInput
                            min={30}
                            onValueBlur={(value) =>
                              field.onChange(Number(value))
                            }
                            placeholder={t(
                              "verifyCode.inputPlaceholder",
                              "Please enter"
                            )}
                            suffix={t("verifyCode.seconds", "seconds")}
                            type="number"
                            value={field.value}
                          />
                        </FormControl>
                        <FormDescription>
                          {t(
                            "verifyCode.intervalDescription",
                            "Minimum interval between two verification code sends (seconds)"
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="verify_code_limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("verifyCode.dailyLimit", "Daily Sending Limit")}
                        </FormLabel>
                        <FormControl>
                          <EnhancedInput
                            min={1}
                            onValueBlur={(value) =>
                              field.onChange(Number(value))
                            }
                            placeholder={t(
                              "verifyCode.inputPlaceholder",
                              "Please enter"
                            )}
                            suffix={t("verifyCode.times", "time(s)")}
                            type="number"
                            value={field.value}
                          />
                        </FormControl>
                        <FormDescription>
                          {t(
                            "verifyCode.dailyLimitDescription",
                            "Maximum number of verification codes each user can send per day"
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
              <Button form="verify-code-form" loading={loading} type="submit">
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
