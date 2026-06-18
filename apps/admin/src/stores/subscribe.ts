import { getSubscribeList } from "@workspace/ui/services/admin/subscribe";
import { create } from "zustand";

interface SubscribeState {
  // Actions
  fetchSubscribes: () => Promise<void>;
  getSubscribeById: (
    subscribeId: string | number
  ) => API.SubscribeItem | undefined;

  // Getters
  getSubscribeName: (subscribeId?: string | number) => string;
  loaded: boolean;

  // Loading states
  loading: boolean;
  // Data
  subscribes: API.SubscribeItem[];
}

export const useSubscribeStore = create<SubscribeState>((set, get) => ({
  // Initial state
  subscribes: [],
  loading: false,
  loaded: false,

  // Actions
  fetchSubscribes: async () => {
    if (get().loading) return;

    set({ loading: true });
    try {
      const { data } = await getSubscribeList({ page: 1, size: 999_999_999 });
      set({
        subscribes: data?.data?.list || [],
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
  getSubscribeName: (subscribeId?: string | number) => {
    if (!subscribeId) return "--";
    const subscribe = get().subscribes.find(
      (s) => String(s.id) === String(subscribeId)
    );
    return subscribe?.name ?? `Subscribe ${subscribeId}`;
  },

  getSubscribeById: (subscribeId: string | number) =>
    get().subscribes.find((s) => String(s.id) === String(subscribeId)),
}));

export const useSubscribe = () => {
  const store = useSubscribeStore();

  // Auto-fetch subscribes
  if (!(store.loaded || store.loading)) {
    store.fetchSubscribes();
  }

  return {
    subscribes: store.subscribes,
    loading: store.loading,
    loaded: store.loaded,
    fetchSubscribes: store.fetchSubscribes,
    getSubscribeName: store.getSubscribeName,
    getSubscribeById: store.getSubscribeById,
  };
};

export default useSubscribeStore;
