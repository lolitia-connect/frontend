"use client";

import { Description, Sheet, Button as SheetButton } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { EnhancedInput } from "@workspace/ui/composed/enhanced-input";
import { Icon } from "@workspace/ui/composed/icon";
import { updateNekoproxyConfig } from "@workspace/ui/services/admin/nekoproxy";
import { type FormEvent, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  nekoproxyConfigKey,
  nekoproxyStateKey,
  useNekoproxyConfig,
} from "./nekoproxy-queries";

export default function NekoproxyConnectionSheet() {
  const { t } = useTranslation("nodes");
  const [open, setOpen] = useState(false);
  const [urlDraft, setURLDraft] = useState<string>();
  const [apiToken, setAPIToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputID = useId();
  const queryClient = useQueryClient();
  const config = useNekoproxyConfig(open);
  const apiURL = urlDraft ?? config.data?.api_url ?? "";
  const title = t("np.title", "Nekoproxy connection");

  function close() {
    setOpen(false);
    setURLDraft(undefined);
    setAPIToken("");
    setError("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || config.isLoading || !apiURL.trim()) return;
    setBusy(true);
    setError("");
    try {
      await updateNekoproxyConfig({
        api_url: apiURL.trim(),
        ...(apiToken.trim() ? { api_token: apiToken.trim() } : {}),
      });
      close();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: nekoproxyConfigKey }),
        queryClient.invalidateQueries({ queryKey: nekoproxyStateKey }),
      ]);
      toast.success(t("np.connected", "Connected and saved"));
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : t("np.failed", "The operation failed. Please retry.")
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet
      isDismissable={!busy}
      isOpen={open}
      onOpenChange={(next) => {
        if (busy) return;
        if (next) setOpen(true);
        else close();
      }}
      placement="right"
    >
      <Sheet.Trigger>
        <SheetButton
          aria-describedby={`${inputID}-hint`}
          aria-labelledby={`${inputID}-title`}
          className="settings-option justify-between"
          variant="ghost"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
              <Icon
                className="h-5 w-5 text-primary-500"
                icon="mdi:resistor-nodes"
              />
            </span>
            <span className="flex-1">
              <span className="block font-medium" id={`${inputID}-title`}>
                {title}
              </span>
              <span className="block text-muted text-sm" id={`${inputID}-hint`}>
                {t(
                  "np.cardHint",
                  "Set the API address and token for L4 forwarding."
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
              <Sheet.Heading>{title}</Sheet.Heading>
              <Description slot="description">
                {t(
                  "np.description",
                  "Configure the API connection here. Manage forwarding at the bottom of each node’s create or edit form."
                )}
              </Description>
            </Sheet.Header>
            <ScrollArea className="px-6">
              <form
                className="space-y-3 pt-4"
                id={`${inputID}-form`}
                onSubmit={save}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor={`${inputID}-url`}>
                      {t("np.apiURL", "API address")}
                    </Label>
                    <EnhancedInput
                      autoComplete="off"
                      disabled={busy || config.isLoading}
                      id={`${inputID}-url`}
                      onValueChange={(value) => setURLDraft(String(value))}
                      placeholder="https://nekoproxy.example.com"
                      required
                      type="url"
                      value={apiURL}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`${inputID}-token`}>
                      {t("np.apiToken", "API token")}
                    </Label>
                    <EnhancedInput
                      autoComplete="new-password"
                      disabled={busy || config.isLoading}
                      id={`${inputID}-token`}
                      onValueChange={(value) => setAPIToken(String(value))}
                      placeholder={
                        config.data?.has_api_token
                          ? t(
                              "np.tokenSaved",
                              "Configured; leave empty to keep"
                            )
                          : "nkp_…"
                      }
                      type="password"
                      value={apiToken}
                    />
                  </div>
                </div>
                {(error || config.isError) && (
                  <p className="text-danger text-sm" role="alert">
                    {error ||
                      t("np.failed", "The operation failed. Please retry.")}
                  </p>
                )}
              </form>
            </ScrollArea>
            <Sheet.Footer className="flex-row justify-end gap-2 pt-3">
              <Button
                disabled={busy}
                onClick={close}
                type="button"
                variant="outline"
              >
                {t("cancel", "Cancel")}
              </Button>
              <Button
                disabled={config.isLoading || !apiURL.trim()}
                form={`${inputID}-form`}
                loading={busy}
                type="submit"
              >
                {t("np.save", "Connect and save")}
              </Button>
            </Sheet.Footer>
            <Sheet.CloseTrigger
              aria-label={t("components:close", "Close")}
              isDisabled={busy}
            />
          </Sheet.Dialog>
        </Sheet.Content>
      </Sheet.Backdrop>
    </Sheet>
  );
}
