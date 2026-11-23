import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { Spinner } from "@workspace/ui/components/spinner";
import { Switch } from "@workspace/ui/components/switch";
import type { NekoproxyNodeEntry } from "@workspace/ui/services/admin/nekoproxy";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import ForwardPicker from "./nekoproxy-forward-picker";
import { activeSessions, useForwardOptions } from "./nekoproxy-queries";
import type { NodeFormValues } from "./node-form";

type BindingDraft = NodeFormValues["nekoproxy_binding"];
const emptyChoice = { forward_id: "", session_id: "" };

export default function NekoproxyNodeSettings({
  nodeID,
  entry,
  isError,
  disabled,
  invalid,
  preference,
  onPreferenceChange,
  onChange,
  value,
}: {
  nodeID: string;
  entry?: NekoproxyNodeEntry;
  isError: boolean;
  disabled: boolean;
  invalid: boolean;
  preference?: boolean;
  onPreferenceChange: (value: boolean | undefined) => void;
  onChange: (value: BindingDraft) => void;
  value: BindingDraft;
}) {
  const { t } = useTranslation("nodes");
  const id = useId();
  const binding = entry?.binding;
  const { config, state } = useForwardOptions(Boolean(entry) && !isError);
  const sameAPI = binding?.api_url === state.data?.api_url;
  const forward = sameAPI
    ? state.data?.forwards.find((f) => f.id === binding?.forward_id)
    : undefined;
  const session =
    forward &&
    activeSessions(forward).find((s) => s.id === binding?.session_id);
  const unavailable = binding && state.data && !session;
  const choice =
    value?.action === "bind"
      ? value
      : binding && session && value?.action !== "unbind"
        ? binding
        : emptyChoice;
  const syncOnSave = preference ?? binding?.sync_on_save ?? true;

  function undoChange() {
    onChange(undefined);
    if (!binding) onPreferenceChange(undefined);
  }

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="admin-drawer-wide min-w-0 space-y-3 rounded-lg border p-4"
    >
      <h3 className="font-medium" id={`${id}-title`}>
        {t("np.editTitle", "Nekoproxy L4 forwarding")}
      </h3>
      {isError ? (
        <p role="alert">
          {t("np.failed", "The operation failed. Please retry.")}
        </p>
      ) : entry ? (
        binding ? (
          <dl className="grid min-w-0 grid-cols-[auto_1fr] gap-x-3 gap-y-1 break-all text-sm">
            <dt>{t("np.forward", "L4 forward")}</dt>
            <dd>
              {forward?.name ? `${forward.name} · ` : ""}
              {binding.forward_id}
            </dd>
            <dt>{t("np.session", "Session ID")}</dt>
            <dd>{binding.session_id}</dd>
            <dt>{t("np.savedEntry", "Saved node entry")}</dt>
            <dd>
              {entry.address}:{entry.port}
            </dd>
            {forward && (
              <>
                <dt>{t("np.target", "Forward target")}</dt>
                <dd>
                  {forward.target_host}:{forward.target_port} ·{" "}
                  {forward.protocol.toUpperCase()}
                </dd>
              </>
            )}
          </dl>
        ) : (
          <p className="text-muted text-sm">
            {t("np.unbound", "This node is not bound to a Nekoproxy forward.")}
          </p>
        )
      ) : (
        <Spinner aria-label={t("np.loading", "Loading Nekoproxy…")} />
      )}
      {entry && !isError && (
        <>
          {!(
            config.isLoading ||
            config.data?.has_api_token ||
            config.isError
          ) && (
            <p className="text-muted text-sm">
              {t(
                "np.configureFirst",
                "Configure the Nekoproxy connection at the top of Node Management first."
              )}
            </p>
          )}
          {(config.isLoading || state.isFetching) && (
            <Spinner aria-label={t("np.loading", "Loading Nekoproxy…")} />
          )}
          {config.data?.has_api_token && state.data && !state.data.error && (
            <ForwardPicker
              nodeID={nodeID}
              onChange={(next) => {
                if (disabled) return;
                if (!next.forward_id) {
                  if (value?.action === "bind") undoChange();
                  return;
                }
                const isSaved =
                  sameAPI &&
                  next.forward_id === binding?.forward_id &&
                  next.session_id === binding?.session_id;
                onChange(isSaved ? undefined : { action: "bind", ...next });
              }}
              state={state.data}
              value={choice}
            />
          )}
          {binding &&
            value?.action !== "sync" &&
            value?.action !== "unbind" && (
              <div className="flex flex-wrap gap-2">
                {value?.action !== "bind" && session && (
                  <Button
                    disabled={disabled}
                    onClick={() => onChange({ action: "sync" })}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    {t("np.syncNextSave", "Sync entry on next save")}
                  </Button>
                )}
                <Button
                  disabled={disabled}
                  onClick={() => onChange({ action: "unbind" })}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {t("np.unbind", "Unbind")}
                </Button>
              </div>
            )}
          {value && (
            <>
              <Button
                disabled={disabled}
                onClick={undoChange}
                size="sm"
                type="button"
                variant="outline"
              >
                {t("np.undoChange", "Undo forwarding change")}
              </Button>
              <p className="text-muted text-sm" role="status">
                {value.action === "unbind"
                  ? t(
                      "np.pendingUnbind",
                      "The binding will be removed when you save."
                    )
                  : value.action === "sync"
                    ? t(
                        "np.pendingSync",
                        "The entry will be synchronized when you save."
                      )
                    : t(
                        "np.pendingBind",
                        "The selected forwarding entry will be used when you save."
                      )}
              </p>
            </>
          )}
          {invalid && (
            <p className="text-danger text-sm" role="alert">
              {t("np.required", "Complete the forwarding settings")}
            </p>
          )}
        </>
      )}
      {(config.isError ||
        state.isError ||
        state.data?.error ||
        unavailable) && (
        <p className="text-danger text-sm" role="alert">
          {state.data?.error ||
            t(
              "np.unavailable",
              "This forward is unavailable on the connected service."
            )}
        </p>
      )}
      {(binding || value?.action === "bind") && value?.action !== "unbind" && (
        <div className="flex items-center justify-between gap-3 border-t pt-3">
          <div>
            <Label htmlFor={`${id}-toggle`} id={`${id}-save`}>
              {t("np.syncOnSave", "Sync when saving this node")}
            </Label>
            <p className="text-muted text-xs">
              {t(
                "np.syncOnSaveHint",
                "Use the bound entry when saving. Switching the node protocol also updates an automatic forward target port; manual target ports are kept."
              )}
            </p>
          </div>
          <Switch
            aria-labelledby={`${id}-save`}
            checked={syncOnSave}
            disabled={disabled}
            id={`${id}-toggle`}
            onCheckedChange={onPreferenceChange}
          />
        </div>
      )}
    </section>
  );
}
