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
  getSystemInviteConfig as getInviteConfig,
  putSystemInviteConfig as updateInviteConfig,
} from "@workspace/ui/services/admin/admin";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const inviteSchema = z.object({
  forced_invite: z.boolean().optional(),
  referral_percentage: z.number().optional(),
  only_first_purchase: z.boolean().optional(),
});

type InviteFormData = z.infer<typeof inviteSchema>;

export default function InviteConfig() {
  const { t } = useTranslation("system");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ["getInviteConfig"],
    queryFn: async () => {
      const { data } = await getInviteConfig();
      return data.data;
    },
    enabled: open,
  });

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      forced_invite: false,
      referral_percentage: 0,
      only_first_purchase: false,
    },
  });

  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data, form]);

  async function onSubmit(values: InviteFormData) {
    setLoading(true);
    try {
      await updateInviteConfig(values as API.InviteConfig);
      toast.success(t("invite.saveSuccess", "Save Successful"));
      refetch();
      setOpen(false);
    } catch {
      toast.danger(t("invite.saveFailed", "Save Failed"));
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
                icon="mdi:account-multiple-plus-outline"
              />
            </span>
            <span className="flex-1">
              <span className="block font-medium">
                {t("invite.title", "Invitation Settings")}
              </span>
              <span className="block text-muted text-sm">
                {t(
                  "invite.description",
                  "Configure user invitation and referral reward settings"
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
                {t("invite.title", "Invitation Settings")}
              </Sheet.Heading>
            </Sheet.Header>
            <ScrollArea className="h-[calc(100dvh-48px-36px-36px-24px-env(safe-area-inset-top))] px-6">
              <Form {...form}>
                <form
                  className="space-y-2 pt-4"
                  id="invite-form"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="forced_invite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t(
                            "invite.forcedInvite",
                            "Require Invitation to Register"
                          )}
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
                            "invite.forcedInviteDescription",
                            "When enabled, users must register through an invitation link"
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="referral_percentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t(
                            "invite.referralPercentage",
                            "Referral Reward Percentage"
                          )}
                        </FormLabel>
                        <FormControl>
                          <EnhancedInput
                            max={100}
                            min={0}
                            onValueBlur={(value) =>
                              field.onChange(Number(value))
                            }
                            placeholder={t(
                              "invite.inputPlaceholder",
                              "Please enter"
                            )}
                            suffix="%"
                            type="number"
                            value={field.value}
                          />
                        </FormControl>
                        <FormDescription>
                          {t(
                            "invite.referralPercentageDescription",
                            "Percentage of reward given to referrers"
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="only_first_purchase"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t(
                            "invite.onlyFirstPurchase",
                            "First Purchase Reward Only"
                          )}
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
                            "invite.onlyFirstPurchaseDescription",
                            "When enabled, referrers only receive rewards for the first purchase by referred users"
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
              <Button form="invite-form" loading={loading} type="submit">
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
