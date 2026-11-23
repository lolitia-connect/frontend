import { useQuery } from "@workspace/ui/hooks/query";
import {
  getNekoproxyConfig,
  getNekoproxyState,
  type NekoproxyForward,
} from "@workspace/ui/services/admin/nekoproxy";

export const nekoproxyConfigKey = ["nekoproxy", "config"];
export const nekoproxyStateKey = ["nekoproxy", "state"];
export const bindingKey = (nodeID: string) => ["nekoproxy", "binding", nodeID];

export function useNekoproxyConfig(enabled: boolean) {
  return useQuery({
    queryKey: nekoproxyConfigKey,
    enabled,
    queryFn: async () => (await getNekoproxyConfig()).data.data,
  });
}

export function useForwardOptions(enabled: boolean) {
  const config = useNekoproxyConfig(enabled);
  const state = useQuery({
    queryKey: nekoproxyStateKey,
    enabled: enabled && Boolean(config.data?.has_api_token),
    queryFn: async () => (await getNekoproxyState()).data.data,
    retry: false,
  });
  return { config, state };
}

export function activeSessions(forward: NekoproxyForward) {
  if (!forward.enabled || forward.paused) return [];
  return forward.sessions.filter(
    (session) =>
      session.status === "active" && session.address && session.port > 0
  );
}
