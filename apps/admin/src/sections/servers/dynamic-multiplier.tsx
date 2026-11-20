"use client";

import { Description, Sheet, Button as SheetButton } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { ScrollArea } from "@workspace/ui/components/scroll-area";

import { ArrayInput } from "@workspace/ui/composed/dynamic-inputs";
import { Icon } from "@workspace/ui/composed/icon";
import {
  getSystemGetNodeMultiplier as getNodeMultiplier,
  postSystemSetNodeMultiplier as setNodeMultiplier,
} from "@workspace/ui/services/admin/admin";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function DynamicMultiplier() {
  const { t } = useTranslation("servers");
  const [open, setOpen] = useState(false);
  const [timeSlots, setTimeSlots] = useState<API.TimePeriod[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: periodsResp, refetch: refetchPeriods } = useQuery({
    queryKey: ["getNodeMultiplier"],
    queryFn: async () => {
      const { data } = await getNodeMultiplier();
      return (data.data?.periods || []) as API.TimePeriod[];
    },
    enabled: open,
  });

  useEffect(() => {
    if (periodsResp) {
      setTimeSlots(periodsResp);
    }
  }, [periodsResp]);

  async function savePeriods() {
    if (saving) return;
    setSaving(true);
    try {
      await setNodeMultiplier({ periods: timeSlots });
      await refetchPeriods();
      toast.success(t("server_config.saveSuccess", "Saved successfully"));
      setOpen(false);
    } catch {
      /* error handled by interceptor */
    } finally {
      setSaving(false);
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
                icon="mdi:clock-time-eight"
              />
            </span>
            <span className="flex-1">
              <span className="block font-medium">
                {t("server_config.dynamic_multiplier", "Dynamic multiplier")}
              </span>
              <span className="block text-muted text-sm">
                {t(
                  "server_config.dynamic_multiplier_desc",
                  "Define time slots and multipliers to adjust traffic accounting."
                )}
              </span>
            </span>
          </span>
          <Icon className="size-6" icon="mdi:chevron-right" />
        </SheetButton>
      </Sheet.Trigger>

      <Sheet.Backdrop>
        <Sheet.Content>
          <Sheet.Dialog className="w-[600px] max-w-full md:max-w-3xl">
            <Sheet.Header>
              <Sheet.Heading>
                {t("server_config.dynamic_multiplier", "Dynamic multiplier")}
              </Sheet.Heading>
              <Description slot="description">
                {t(
                  "server_config.dynamic_multiplier_desc",
                  "Define time slots and multipliers to adjust traffic accounting."
                )}
              </Description>
            </Sheet.Header>
            <ScrollArea className="h-[calc(100dvh-48px-36px-60px-env(safe-area-inset-top))] px-6">
              <div className="space-y-4 pt-4">
                <ArrayInput<API.TimePeriod>
                  fields={[
                    {
                      name: "start_time",
                      prefix: t(
                        "server_config.fields.start_time",
                        "Start time"
                      ),
                      type: "time",
                      step: "1",
                    },
                    {
                      name: "end_time",
                      prefix: t("server_config.fields.end_time", "End time"),
                      type: "time",
                      step: "1",
                    },
                    {
                      name: "multiplier",
                      prefix: t(
                        "server_config.fields.multiplier",
                        "Multiplier"
                      ),
                      type: "number",
                      placeholder: "0",
                    },
                  ]}
                  onChange={setTimeSlots}
                  value={timeSlots}
                />
              </div>
            </ScrollArea>

            <Sheet.Footer className="flex-row justify-between pt-3">
              <Button
                onClick={() => setTimeSlots(periodsResp || [])}
                variant="outline"
              >
                {t("server_config.fields.reset", "Reset")}
              </Button>
              <div className="flex gap-2">
                <Button onClick={() => setOpen(false)} variant="outline">
                  {t("actions.cancel", "Cancel")}
                </Button>
                <Button loading={saving} onClick={savePeriods}>
                  {t("actions.save", "Save")}
                </Button>
              </div>
            </Sheet.Footer>
            <Sheet.CloseTrigger aria-label="Close" />
          </Sheet.Dialog>
        </Sheet.Content>
      </Sheet.Backdrop>
    </Sheet>
  );
}
