import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import {
  bindNekoproxy,
  type NekoproxyNodeEntry,
  syncNekoproxy,
  unbindNekoproxy,
} from "@workspace/ui/services/admin/nekoproxy";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import ForwardPicker, { type EntryChoice } from "./nekoproxy-forward-picker";
import { activeSessions, useForwardOptions } from "./nekoproxy-queries";

export default function NekoproxyNodeSettings({
  nodeID,
  entry,
  isError,
  disabled,
  preference,
  onPreferenceChange,
  onAction,
}: {
  nodeID: string;
  entry?: NekoproxyNodeEntry;
  isError: boolean;
  disabled: boolean;
  preference?: boolean;
  onPreferenceChange: (value: boolean) => void;
  onAction: (
    action: () => Promise<unknown>,
    applyEndpoint: boolean
  ) => Promise<boolean>;
}) {
  const { t } = useTranslation("nodes");
  const id = useId();
  const binding = entry?.binding;
  const [choice, setChoice] = useState<EntryChoice | null>(null);
  const { config, state } = useForwardOptions(Boolean(binding || choice));
  const sameAPI = binding?.api_url === state.data?.api_url;
  const forward = sameAPI
    ? state.data?.forwards.find((f) => f.id === binding?.forward_id)
    : undefined;
  const session =
    forward &&
    activeSessions(forward).find((s) => s.id === binding?.session_id);
  const selected = state.data?.forwards.find(
    (f) => f.id === choice?.forward_id
  );
  const canBind =
    selected &&
    !state.data?.error &&
    activeSessions(selected).some((s) => s.id === choice?.session_id);
  const unavailable = binding && state.data && !session;
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
        <p role="status">{t("np.loading", "Loading Nekoproxy…")}</p>
      )}
      {entry && (
        <div className="flex gap-2 *:h-auto *:min-h-9 *:py-1">
          {binding && !isError && (
            <>
              <Button
                disabled={
                  disabled ||
                  (Boolean(config.data) &&
                    config.data?.api_url !== binding.api_url)
                }
                onClick={() =>
                  onAction(async () => {
                    const result = (await syncNekoproxy({ node_id: nodeID }))
                      .data.data;
                    if (result?.updated !== 1 || result.errors.length)
                      throw new Error(
                        result?.errors[0]?.message ||
                          t(
                            "np.unavailable",
                            "This forward is unavailable on the connected service."
                          )
                      );
                  }, true)
                }
                size="sm"
                type="button"
              >
                {t("np.syncNow", "Sync this node now")}
              </Button>
              <Button
                disabled={disabled}
                onClick={async () => {
                  if (
                    await onAction(
                      () => unbindNekoproxy({ node_id: nodeID }),
                      false
                    )
                  )
                    setChoice(null);
                }}
                size="sm"
                type="button"
                variant="outline"
              >
                {t("np.unbind", "Unbind")}
              </Button>
            </>
          )}
          <Button
            disabled={disabled}
            onClick={() =>
              setChoice(
                choice
                  ? null
                  : {
                      forward_id: sameAPI && binding ? binding.forward_id : "",
                      session_id: sameAPI && binding ? binding.session_id : "",
                    }
              )
            }
            size="sm"
            type="button"
            variant="outline"
          >
            {choice
              ? t("cancel", "Cancel")
              : binding
                ? t("np.changeEntry", "Change bound entry")
                : t("np.bindExisting", "Bind an existing forward")}
          </Button>
        </div>
      )}
      {choice && (
        <>
          {!(config.isLoading || config.data?.has_api_token) && (
            <p>
              {t(
                "np.configureFirst",
                "Configure the Nekoproxy connection at the top of Node Management first."
              )}
            </p>
          )}
          {(config.isLoading || state.isFetching) && (
            <p role="status">{t("np.loading", "Loading Nekoproxy…")}</p>
          )}
          {config.data?.has_api_token && state.data && !state.data.error && (
            <>
              <ForwardPicker
                nodeID={nodeID}
                onChange={setChoice}
                state={state.data}
                value={choice}
              />
              <Button
                disabled={disabled || !canBind || state.isFetching}
                onClick={async () => {
                  if (
                    await onAction(
                      () => bindNekoproxy({ node_id: nodeID, ...choice }),
                      true
                    )
                  )
                    setChoice(null);
                }}
                size="sm"
                type="button"
              >
                {t("np.bindSync", "Bind and sync entry")}
              </Button>
            </>
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
      {binding && (
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
            checked={preference ?? binding.sync_on_save}
            disabled={disabled}
            id={`${id}-toggle`}
            onCheckedChange={onPreferenceChange}
          />
        </div>
      )}
    </section>
  );
}
