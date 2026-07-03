import { filterServerList } from "@workspace/ui/services/admin/server";
import { create } from "zustand";

interface ServerState {
  // Actions
  fetchServers: () => Promise<void>;
  getAvailableProtocols: (
    serverId?: string | number
  ) => Array<{ id: string; name?: string; protocol: string; port: number }>;
  getProtocolPort: (serverId?: string | number, protocolId?: string) => string;
  getServerAddress: (serverId?: string | number) => string;

  // Getters
  getServerById: (serverId: string | number) => API.Server | undefined;
  getServerEnabledProtocols: (serverId: string | number) => API.Protocol[];
  getServerName: (serverId?: string | number) => string;
  loaded: boolean;

  // Loading states
  loading: boolean;
  // Data
  servers: API.Server[];
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
    } catch {
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

  getProtocolPort: (serverId?: string | number, protocolId?: string) => {
    if (!(serverId && protocolId)) return "—";
    const enabledProtocols = get().getServerEnabledProtocols(serverId);
    const protocolConfig = enabledProtocols.find((p) => p.id === protocolId);
    return protocolConfig?.port ? String(protocolConfig.port) : "—";
  },

  getAvailableProtocols: (serverId?: string | number) => {
    if (!serverId) return [];
    return get()
      .getServerEnabledProtocols(serverId)
      .map((p) => ({
        id: p.id || p.type,
        name: p.name,
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
