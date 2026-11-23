"use client";

import {
  AlertDialog,
  Button,
  Card,
  Description,
  Label,
  Radio,
  RadioGroup,
  Spinner,
  Switch,
  toast,
} from "@heroui/react";
import {
  getGroupConfig,
  resetGroups,
  updateGroupConfig,
} from "@workspace/ui/services/admin/group";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function GroupConfig() {
  const { t } = useTranslation("group");
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState({ enabled: false, mode: "average" });

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getGroupConfig();
      if (data.data) {
        setConfig({
          enabled: data.data.enabled,
          mode: data.data.mode || "average",
        });
      }
    } catch (error) {
      console.error("Failed to load group config:", error);
      toast.danger(t("loadFailed", "Failed to load configuration"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const saveConfig = async (next: typeof config) => {
    setSaving(true);
    try {
      await updateGroupConfig(next);
      setConfig(next);
      toast.success(t("saved", "Configuration saved successfully"));
    } catch (error) {
      console.error("Failed to update group config:", error);
      toast.danger(t("saveFailed", "Failed to save configuration"));
    } finally {
      setSaving(false);
    }
  };

  const handleResetGroups = async () => {
    setResetting(true);
    try {
      await resetGroups({ confirm: true });
      toast.success(
        t("resetSuccess", "All groups have been reset successfully")
      );
      setShowResetDialog(false);
      // Reload config after reset
      await loadConfig();
    } catch (error) {
      console.error("Failed to reset groups:", error);
      toast.danger(t("resetFailed", "Failed to reset groups"));
    } finally {
      setResetting(false);
    }
  };

  const busy = loading || saving || resetting;
  const modes = [
    {
      value: "average",
      label: t("averageMode", "Average Mode"),
      description: t(
        "averageModeDescription",
        "Distribute users evenly across groups"
      ),
    },
    {
      value: "subscribe",
      label: t("subscribeMode", "Subscribe Mode"),
      description: t(
        "subscribeModeDescription",
        "Group users by their subscription plan"
      ),
    },
    {
      value: "traffic",
      label: t("trafficMode", "Traffic Mode"),
      description: t(
        "trafficModeDescription",
        "Group users by their traffic usage"
      ),
    },
  ];

  return (
    <Card>
      <Card.Header>
        <Card.Title>{t("groupConfig", "Group Configuration")}</Card.Title>
        <Card.Description>
          {t(
            "groupConfigDescription",
            "Configure user group and node group settings"
          )}
        </Card.Description>
      </Card.Header>
      <Card.Content className="space-y-5">
        <Switch
          className="w-full rounded-xl bg-default/50 p-4"
          isDisabled={busy}
          isSelected={config.enabled}
          onChange={(enabled) => saveConfig({ ...config, enabled })}
        >
          <Switch.Content className="w-full justify-between">
            <Label className="font-medium">
              {t("enableGrouping", "Enable Grouping")}
            </Label>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch.Content>
          <Description className="ps-0">
            {t(
              "enableGroupingDescription",
              "When enabled, users will only see nodes from their assigned group"
            )}
          </Description>
        </Switch>
        {config.enabled && (
          <RadioGroup
            isDisabled={busy}
            onChange={(mode) => saveConfig({ ...config, mode })}
            value={config.mode}
          >
            <Label>{t("groupingMode", "Grouping Mode")}</Label>
            <div className="grid gap-2 md:grid-cols-3">
              {modes.map(({ value, label, description }) => (
                <Radio
                  className="relative rounded-xl border border-border p-3 transition-colors data-[selected]:border-accent data-[selected]:bg-accent/5"
                  key={value}
                  value={value}
                >
                  <Radio.Content className="static after:absolute after:inset-0">
                    <Radio.Control>
                      <Radio.Indicator />
                    </Radio.Control>
                    <Label>{label}</Label>
                  </Radio.Content>
                  <Description>{description}</Description>
                </Radio>
              ))}
            </div>
          </RadioGroup>
        )}
      </Card.Content>
      <Card.Footer className="justify-end border-border border-t pt-4">
        <AlertDialog isOpen={showResetDialog} onOpenChange={setShowResetDialog}>
          <Button isDisabled={busy} variant="danger-soft">
            {t("resetGroups", "Reset All Groups")}
          </Button>
          <AlertDialog.Backdrop
            isDismissable={!resetting}
            isKeyboardDismissDisabled={resetting}
          >
            <AlertDialog.Container>
              <AlertDialog.Dialog>
                <AlertDialog.Header>
                  <AlertDialog.Heading>
                    {t("resetGroupsTitle", "Reset All Groups")}
                  </AlertDialog.Heading>
                  <Description>
                    {t(
                      "resetGroupsDescription",
                      "This action will delete all node groups and user groups, reset all users' group ID to 0, clear all products' node group IDs, and clear all nodes' node group IDs. This action cannot be undone."
                    )}
                  </Description>
                </AlertDialog.Header>
                <AlertDialog.Footer>
                  <Button
                    isDisabled={resetting}
                    slot="close"
                    variant="secondary"
                  >
                    {t("cancel", "Cancel")}
                  </Button>
                  <Button
                    isDisabled={resetting}
                    onPress={handleResetGroups}
                    variant="danger"
                  >
                    {resetting && <Spinner color="current" size="sm" />}
                    {t("confirm", "Confirm")}
                  </Button>
                </AlertDialog.Footer>
              </AlertDialog.Dialog>
            </AlertDialog.Container>
          </AlertDialog.Backdrop>
        </AlertDialog>
      </Card.Footer>
    </Card>
  );
}
