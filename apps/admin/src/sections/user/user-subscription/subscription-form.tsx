"use client";

import { Sheet } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { ScrollArea } from "@workspace/ui/components/scroll-area";

import { Switch } from "@workspace/ui/components/switch";
import { Combobox } from "@workspace/ui/composed/combobox";
import { DatePicker } from "@workspace/ui/composed/date-picker";
import { EnhancedInput } from "@workspace/ui/composed/enhanced-input";
import { unitConversion } from "@workspace/ui/utils/unit-conversions";
import { type ReactNode, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useSubscribe } from "@/stores/subscribe";

interface Props {
  initialData?: API.UserSubscribe;
  loading?: boolean;
  onSubmit: (values: any) => Promise<boolean>;
  title: string;
  trigger: ReactNode;
}

const formSchema = z.object({
  subscribe_id: z.string().optional(),
  traffic: z.number().optional(),
  traffic_unlimited: z.boolean().optional(),
  speed_limit: z.number().optional(),
  device_limit: z.number().optional(),
  expired_at: z.number().nullish().optional(),
  upload: z.number().optional(),
  download: z.number().optional(),
  id: z.string().optional(),
});

type SubscriptionFormValues = z.infer<typeof formSchema>;

export function SubscriptionForm({
  trigger,
  title,
  loading,
  initialData,
  onSubmit,
}: Props) {
  const { t } = useTranslation("user");
  const [open, setOpen] = useState(false);

  const [unlimitedTraffic, setUnlimitedTraffic] = useState(
    !!initialData?.traffic_unlimited
  );

  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subscribe_id: initialData?.subscribe_id || "",
      traffic: initialData?.traffic || 0,
      traffic_unlimited: initialData?.traffic_unlimited,
      upload: initialData?.upload || 0,
      download: initialData?.download || 0,
      expired_at: initialData?.expire_time || 0,
      ...(initialData && { id: initialData.id }),
    },
  });

  useEffect(() => {
    form.setValue("traffic_unlimited", unlimitedTraffic);
    if (unlimitedTraffic) {
      form.setValue("traffic", 0);
    }
  }, [unlimitedTraffic, form]);

  const handleSubmit = async (values: SubscriptionFormValues) => {
    const success = await onSubmit(values);
    if (success) {
      setOpen(false);
      form.reset();
    }
  };

  const { subscribes } = useSubscribe();

  return (
    <Sheet isOpen={open} onOpenChange={setOpen} placement="right">
      <Sheet.Trigger>
        <Button
          onClick={() => {
            form.reset();
            setUnlimitedTraffic(!!initialData?.traffic_unlimited);
          }}
          type="button"
        >
          {trigger}
        </Button>
      </Sheet.Trigger>
      <Sheet.Backdrop>
        <Sheet.Content>
          <Sheet.Dialog>
            <Sheet.Header>
              <Sheet.Heading>{title}</Sheet.Heading>
            </Sheet.Header>
            <ScrollArea className="px-6">
              <div>
                <Form {...form}>
                  <form
                    className="admin-drawer-form mt-4"
                    onSubmit={form.handleSubmit(handleSubmit)}
                  >
                    <FormField
                      control={form.control}
                      name="subscribe_id"
                      render={({ field }) => (
                        <FormItem className="admin-drawer-wide">
                          <FormLabel>
                            {t("subscription", "Subscription")}
                          </FormLabel>
                          <FormControl>
                            <Combobox<string, false>
                              onChange={(value) => {
                                form.setValue(field.name, value);
                              }}
                              options={subscribes?.map((item) => ({
                                value: item.id!,
                                label: item.name!,
                              }))}
                              placeholder="Select Subscription"
                              value={field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="traffic"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>
                              {t("trafficLimit", "Traffic Limit")}
                            </FormLabel>
                            <div className="flex items-center gap-2">
                              <span className="text-muted text-sm">
                                {t("unlimited", "Unlimited")}
                              </span>
                              <Switch
                                checked={unlimitedTraffic}
                                onCheckedChange={setUnlimitedTraffic}
                              />
                            </div>
                          </div>
                          <FormControl>
                            <EnhancedInput
                              disabled={unlimitedTraffic}
                              placeholder={t("unlimited", "Unlimited")}
                              type="number"
                              {...field}
                              formatInput={(value) =>
                                unitConversion("bytesToGb", value)
                              }
                              formatOutput={(value) =>
                                unitConversion("gbToBytes", value)
                              }
                              onValueChange={(value) => {
                                form.setValue(field.name, value as number);
                              }}
                              suffix="GB"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="upload"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("uploadTraffic", "Upload Traffic")}
                          </FormLabel>
                          <FormControl>
                            <EnhancedInput
                              placeholder="0"
                              type="number"
                              {...field}
                              formatInput={(value) =>
                                unitConversion("bytesToGb", value)
                              }
                              formatOutput={(value) =>
                                unitConversion("gbToBytes", value)
                              }
                              onValueChange={(value) => {
                                form.setValue(field.name, value as number);
                              }}
                              suffix="GB"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="download"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("downloadTraffic", "Download Traffic")}
                          </FormLabel>
                          <FormControl>
                            <EnhancedInput
                              placeholder="0"
                              type="number"
                              {...field}
                              formatInput={(value) =>
                                unitConversion("bytesToGb", value)
                              }
                              formatOutput={(value) =>
                                unitConversion("gbToBytes", value)
                              }
                              onValueChange={(value) => {
                                form.setValue(field.name, value as number);
                              }}
                              suffix="GB"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="expired_at"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("expiredAt", "Expired At")}</FormLabel>
                          <FormControl>
                            <DatePicker
                              onChange={(value: number | null | undefined) => {
                                form.setValue(field.name, value || 0);
                              }}
                              placeholder={t("permanent", "Permanent")}
                              value={
                                field.value && field.value > 0
                                  ? field.value
                                  : undefined
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </div>
            </ScrollArea>
            <Sheet.Footer className="flex-row justify-end gap-2 pt-3">
              <Button
                loading={loading}
                onClick={() => {
                  setOpen(false);
                }}
                variant="outline"
              >
                {t("cancel", "Cancel")}
              </Button>
              <Button
                loading={loading}
                onClick={form.handleSubmit(handleSubmit)}
              >
                {t("confirm", "Confirm")}
              </Button>
            </Sheet.Footer>
            <Sheet.CloseTrigger aria-label="Close" />
          </Sheet.Dialog>
        </Sheet.Content>
      </Sheet.Backdrop>
    </Sheet>
  );
}
