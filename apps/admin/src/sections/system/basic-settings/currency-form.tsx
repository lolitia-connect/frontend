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

import { EnhancedInput } from "@workspace/ui/composed/enhanced-input";
import { Icon } from "@workspace/ui/composed/icon";
import {
  getSystemCurrencyConfig as getCurrencyConfig,
  putSystemCurrencyConfig as updateCurrencyConfig,
} from "@workspace/ui/services/admin/admin";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

// Constants
const EXCHANGE_RATE_HOST_URL = "https://exchangerate.host";

const currencySchema = z.object({
  access_key: z.string().optional(),
  currency_unit: z.string().min(1),
  currency_symbol: z.string().min(1),
});

type CurrencyFormData = z.infer<typeof currencySchema>;

export default function CurrencyConfig() {
  const { t } = useTranslation("system");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ["getCurrencyConfig"],
    queryFn: async () => {
      const { data } = await getCurrencyConfig();
      return data.data;
    },
    enabled: open, // Only request data when the modal is open
  });

  const form = useForm<CurrencyFormData>({
    resolver: zodResolver(currencySchema),
    defaultValues: {
      access_key: "",
      currency_unit: "USD",
      currency_symbol: "$",
    },
  });

  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data, form]);

  async function onSubmit(values: CurrencyFormData) {
    setLoading(true);
    try {
      await updateCurrencyConfig(values as API.CurrencyConfig);
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
                icon="mdi:currency-usd"
              />
            </span>
            <span className="flex-1">
              <span className="block font-medium">
                {t("currency.title", "Currency Configuration")}
              </span>
              <span className="block text-muted text-sm">
                {t(
                  "currency.description",
                  "Configure currency units, symbols, and exchange rate API settings"
                )}
              </span>
            </span>
          </span>
          <Icon className="size-6" icon="mdi:chevron-right" />
        </SheetButton>
      </Sheet.Trigger>
      <Sheet.Backdrop>
        <Sheet.Content>
          <Sheet.Dialog className="w-[600px] max-w-full gap-0 md:max-w-screen-md">
            <Sheet.Header>
              <Sheet.Heading>
                {t("currency.title", "Currency Configuration")}
              </Sheet.Heading>
            </Sheet.Header>
            <ScrollArea className="h-[calc(100dvh-48px-36px-36px-24px-env(safe-area-inset-top))] px-6">
              <Form {...form}>
                <form
                  className="space-y-2 pt-4"
                  id="currency-form"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="access_key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("currency.accessKey", "API Key")}
                        </FormLabel>
                        <FormControl>
                          <EnhancedInput
                            onValueChange={field.onChange}
                            placeholder={t(
                              "currency.accessKeyPlaceholder",
                              "Enter API key"
                            )}
                            value={field.value}
                          />
                        </FormControl>
                        <FormDescription>
                          {t(
                            "currency.accessKeyDescription",
                            "Free exchange rate API key provided by {{url}}",
                            {
                              url: EXCHANGE_RATE_HOST_URL,
                            }
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency_unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("currency.currencyUnit", "Currency Unit")}
                        </FormLabel>
                        <FormControl>
                          <EnhancedInput
                            onValueChange={field.onChange}
                            placeholder={t(
                              "currency.currencyUnitPlaceholder",
                              "USD"
                            )}
                            value={field.value}
                          />
                        </FormControl>
                        <FormDescription>
                          {t(
                            "currency.currencyUnitDescription",
                            "Used for display purposes only; changing this will affect all currency units in the system"
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency_symbol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("currency.currencySymbol", "Currency Symbol")}
                        </FormLabel>
                        <FormControl>
                          <EnhancedInput
                            onValueChange={field.onChange}
                            placeholder={t(
                              "currency.currencySymbolPlaceholder",
                              "$"
                            )}
                            value={field.value}
                          />
                        </FormControl>
                        <FormDescription>
                          {t(
                            "currency.currencySymbolDescription",
                            "Used for display purposes only; changing this will affect all currency units in the system"
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
              <Button form="currency-form" loading={loading} type="submit">
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
