import { filterServerList } from "@workspace/ui/services/admin/server";
import { create } from "zustand";

interface ServerState {
  // Data
  servers: API.Server[];

  // Loading states
  loading: boolean;
  loaded: boolean;

  // Actions
  fetchServers: () => Promise<void>;

  // Getters
  getServerById: (serverId: string | number) => API.Server | undefined;
  getServerName: (serverId?: string | number) => string;
  getServerAddress: (serverId?: string | number) => string;
  getServerEnabledProtocols: (serverId: string | number) => API.Protocol[];
  getProtocolPort: (serverId?: string | number, protocol?: string) => string;
  getAvailableProtocols: (
    serverId?: string | number
  ) => Array<{ protocol: string; port: number }>;
}

export const useServerStore = create<ServerState>((set, get) => ({
  // Initial state
  servers: [],
  loading: false,
  loaded: false,

  // Actions
  fetchServers: async () => {
    if (get().loading) return;

    set({ loading: true });
    try {
      const { data } = await filterServerList({ page: 1, size: 999_999_999 });
      set({
        servers: data?.data?.list || [],
        loaded: true,
      });
    } catch (_error) {
      // Handle error silently
      set({ loaded: true });
    } finally {
      set({ loading: false });
    }
  },

  // Getters
  getServerById: (serverId: string | number) =>
    get().servers.find((s) => String(s.id) === String(serverId)),

  getServerName: (serverId?: string | number) => {
    if (!serverId) return "—";
    const server = get().servers.find((s) => String(s.id) === String(serverId));
    return server?.name ?? `#${serverId}`;
  },

  getServerAddress: (serverId?: string | number) => {
    if (!serverId) return "—";
    const server = get().servers.find((s) => String(s.id) === String(serverId));
    return server?.address ?? "—";
  },

  getServerEnabledProtocols: (serverId: string | number) => {
    const server = get().servers.find((s) => String(s.id) === String(serverId));
    return server?.protocols?.filter((p) => p.enable) || [];
  },

  getProtocolPort: (serverId?: string | number, protocol?: string) => {
    if (!(serverId && protocol)) return "—";
    const enabledProtocols = get().getServerEnabledProtocols(serverId);
    const protocolConfig = enabledProtocols.find((p) => p.type === protocol);
    return protocolConfig?.port ? String(protocolConfig.port) : "—";
  },

  getAvailableProtocols: (serverId?: string | number) => {
    if (!serverId) return [];
    return get()
      .getServerEnabledProtocols(serverId)
      .map((p) => ({
        protocol: p.type,
        port: p.port,
      }));
  },
}));

export const useServer = () => {
  const store = useServerStore();

  // Auto-fetch servers
  if (!(store.loaded || store.loading)) {
    store.fetchServers();
  }

  return {
    servers: store.servers,
    loading: store.loading,
    loaded: store.loaded,
    fetchServers: store.fetchServers,
    getServerById: store.getServerById,
    getServerName: store.getServerName,
    getServerAddress: store.getServerAddress,
    getServerEnabledProtocols: store.getServerEnabledProtocols,
    getProtocolPort: store.getProtocolPort,
    getAvailableProtocols: store.getAvailableProtocols,
  };
};

export default useServerStore;
