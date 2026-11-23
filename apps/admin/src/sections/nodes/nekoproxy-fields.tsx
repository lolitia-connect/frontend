"use client";

import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { Spinner } from "@workspace/ui/components/spinner";
import { Switch } from "@workspace/ui/components/switch";
import { Combobox } from "@workspace/ui/composed/combobox";
import { EnhancedInput } from "@workspace/ui/composed/enhanced-input";
import type { NekoproxyNodeOptions } from "@workspace/ui/services/admin/nekoproxy";
import { useEffect, useId } from "react";
import { useTranslation } from "react-i18next";
import ForwardPicker from "./nekoproxy-forward-picker";
import { useForwardOptions } from "./nekoproxy-queries";

export default function NekoproxyFields({
  value,
  onChange,
  targetHost,
  targetPort,
}: {
  value?: NekoproxyNodeOptions;
  onChange: (value?: NekoproxyNodeOptions) => void;
  targetHost: string;
  targetPort: number;
}) {
  const { t } = useTranslation("nodes");
  const id = useId();
  const mode = value?.create ? "create" : value ? "existing" : "none";
  const { config, state } = useForwardOptions(Boolean(value));
  const ready = config.data?.has_api_token && state.data && !state.data.error;
  const newForward = (): NekoproxyNodeOptions => ({
    create: {
      chain_id: "",
      entry_group_id: "",
      protocol: "tcp_udp",
      target_host: targetHost,
      target_port: targetPort,
      requested_port: 0,
    },
  });
  const create = value?.create;
  const setCreate = (
    patch: Partial<NonNullable<NekoproxyNodeOptions["create"]>>
  ) => {
    if (create) onChange({ create: { ...create, ...patch } });
  };
  useEffect(() => {
    if (!create) return;
    const host = create.target_host || targetHost;
    const port = create.target_port_manual ? create.target_port : targetPort;
    if (host !== create.target_host || port !== create.target_port) {
      onChange({ create: { ...create, target_host: host, target_port: port } });
    }
  }, [create, onChange, targetHost, targetPort]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={`${id}-toggle`} id={id}>
          {t("np.createSwitch", "Sync forwarding when creating this node")}
        </Label>
        <Switch
          aria-labelledby={id}
          checked={Boolean(value)}
          id={`${id}-toggle`}
          onCheckedChange={(checked) =>
            onChange(checked ? newForward() : undefined)
          }
        />
      </div>
      {value && (
        <Combobox
          onChange={(next) =>
            onChange(
              next === "existing"
                ? { forward_id: "", session_id: "" }
                : newForward()
            )
          }
          options={[
            {
              value: "create",
              label: t("np.createForward", "Create a new forward"),
            },
            {
              value: "existing",
              label: t("np.existing", "Use an existing forward"),
            },
          ]}
          placeholder={t("np.createMode", "Nekoproxy forwarding")}
          value={mode}
        />
      )}
      {mode !== "none" && (
        <>
          <p className="text-muted text-sm">
            {t(
              "np.createHint",
              "The node uses the forwarding entry. A new forward targets the selected protocol port unless you enter a port manually."
            )}
          </p>
          {!(config.isLoading || config.data?.has_api_token) && (
            <p className="text-sm text-warning">
              {t(
                "np.configureFirst",
                "Configure the Nekoproxy connection at the top of Node Management first."
              )}
            </p>
          )}
          {(config.isError || state.isError || state.data?.error) && (
            <p className="text-danger text-sm" role="alert">
              {state.data?.error ||
                t("np.failed", "The operation failed. Please retry.")}
            </p>
          )}
          {(config.isLoading || state.isLoading) && (
            <Spinner aria-label={t("np.loading", "Loading Nekoproxy…")} />
          )}
          {config.data?.has_api_token && (
            <Button
              disabled={state.isLoading}
              loading={state.isFetching && !state.isLoading}
              onClick={() => state.refetch()}
              size="sm"
              type="button"
              variant="outline"
            >
              {t("np.refresh", "Refresh forwards")}
            </Button>
          )}
        </>
      )}
      {mode === "existing" && ready && (
        <ForwardPicker
          onChange={onChange}
          state={state.data}
          value={{
            forward_id: value?.forward_id || "",
            session_id: value?.session_id || "",
          }}
        />
      )}
      {create && ready && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>{t("np.chain", "Forwarding chain")}</Label>
            <Combobox
              onChange={(chain_id) => setCreate({ chain_id })}
              options={(state.data?.chains || []).map((chain) => ({
                value: chain.id,
                label: chain.name,
              }))}
              placeholder={t("np.chooseChain", "Choose an L4 chain")}
              value={create.chain_id}
            />
          </div>
          <div className="space-y-1">
            <Label>{t("np.group", "Entry group")}</Label>
            <Combobox
              onChange={(entry_group_id) => setCreate({ entry_group_id })}
              options={(state.data?.groups || []).map((group) => ({
                value: group.id,
                label: `${group.name} (${group.port_start}–${group.port_end})`,
              }))}
              placeholder={t("np.chooseGroup", "Choose an entry group")}
              value={create.entry_group_id}
            />
          </div>
          <div className="space-y-1">
            <Label>{t("np.transport", "Transport protocol")}</Label>
            <Combobox
              onChange={(protocol) =>
                setCreate({ protocol: protocol as "tcp" | "udp" | "tcp_udp" })
              }
              options={[
                { value: "tcp", label: "TCP" },
                { value: "udp", label: "UDP" },
                { value: "tcp_udp", label: "TCP + UDP" },
              ]}
              placeholder={t("np.transport", "Transport protocol")}
              value={create.protocol}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${id}-requested-port`}>
              {t("np.requestedPort", "Entry port (0 = automatic)")}
            </Label>
            <EnhancedInput
              id={`${id}-requested-port`}
              max={65_535}
              min={0}
              onValueChange={(port) =>
                setCreate({ requested_port: Number(port) })
              }
              type="number"
              value={create.requested_port}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${id}-target-host`}>
              {t("np.targetHost", "Target address")}
            </Label>
            <EnhancedInput
              id={`${id}-target-host`}
              onValueChange={(host) => setCreate({ target_host: String(host) })}
              value={create.target_host}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${id}-target-port`}>
              {t("np.targetPort", "Target port")}
            </Label>
            <EnhancedInput
              id={`${id}-target-port`}
              max={65_535}
              min={1}
              onValueChange={(port) =>
                setCreate({
                  target_port: Number(port),
                  target_port_manual: true,
                })
              }
              type="number"
              value={create.target_port}
            />
          </div>
        </div>
      )}
    </div>
  );
}
