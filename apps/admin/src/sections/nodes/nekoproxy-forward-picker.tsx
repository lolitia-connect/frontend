import { Label } from "@workspace/ui/components/label";
import { Combobox } from "@workspace/ui/composed/combobox";
import type { NekoproxyState } from "@workspace/ui/services/admin/nekoproxy";
import { useTranslation } from "react-i18next";
import { activeSessions } from "./nekoproxy-queries";

export type EntryChoice = { forward_id: string; session_id: string };

export default function ForwardPicker({
  state,
  value,
  onChange,
  nodeID,
}: {
  state?: NekoproxyState;
  value: EntryChoice;
  onChange: (value: EntryChoice) => void;
  nodeID?: string;
}) {
  const { t } = useTranslation("nodes");
  const available =
    state?.forwards.filter(
      (forward) =>
        activeSessions(forward).length &&
        !state.bindings.some(
          (b) =>
            b.api_url === state.api_url &&
            b.forward_id === forward.id &&
            b.node_id !== nodeID
        )
    ) ?? [];
  const selected = available.find((f) => f.id === value.forward_id);
  const sessions = selected ? activeSessions(selected) : [];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1">
        <Label>{t("np.forward", "L4 forward")}</Label>
        <Combobox
          placeholder={t("np.chooseForward", "Choose an available forward")}
          options={available.map((f) => ({
            value: f.id,
            label: `${f.name || f.id} · ${f.target_host}:${f.target_port}`,
          }))}
          value={value.forward_id}
          onChange={(id) => {
            const f = available.find((item) => item.id === id);
            onChange({
              forward_id: id,
              session_id: f ? activeSessions(f)[0]?.id || "" : "",
            });
          }}
        />
      </div>
      <div className="space-y-1">
        <Label>{t("np.entry", "Forward entry")}</Label>
        <Combobox
          placeholder={t("np.chooseEntry", "Choose an active entry")}
          options={sessions.map((s) => ({
            value: s.id,
            label: `${s.address}:${s.port} (${s.id})`,
          }))}
          value={value.session_id}
          onChange={(id) => onChange({ ...value, session_id: id })}
        />
      </div>
      {state && !state.error && !available.length && (
        <p className="text-muted text-sm sm:col-span-2">
          {t(
            "np.noActiveEntry",
            "No available active entry. Issue a session in Nekoproxy first."
          )}
        </p>
      )}
    </div>
  );
}
