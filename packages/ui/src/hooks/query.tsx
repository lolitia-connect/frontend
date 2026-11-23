"use client";

import { type ReactNode, useState } from "react";
import useSWR, { SWRConfig, useSWRConfig } from "swr";

export type QueryKey = readonly unknown[];

type QueryOptions<TData, TSelected = TData> = {
  queryKey: QueryKey;
  queryFn: () => Promise<TData> | TData;
  enabled?: boolean;
  initialData?: TData;
  placeholderData?: TData | (() => TData);
  select?: (data: TData) => TSelected;
  refetchInterval?:
    | number
    | false
    | ((query: {
        state: { data?: TData; status: "error" | "success" | "pending" };
      }) => number | false);
  refetchOnWindowFocus?: boolean;
  retry?: boolean | number;
};

function serializeKey(key: QueryKey) {
  return JSON.stringify(key);
}

export function useQuery<TData, TSelected = TData>({
  queryKey,
  queryFn,
  enabled = true,
  initialData,
  placeholderData,
  select,
  refetchInterval,
  refetchOnWindowFocus = true,
  retry,
}: QueryOptions<TData, TSelected>) {
  const key = serializeKey(queryKey);
  const [lastResponse, setLastResponse] = useState<{
    key: string;
    data: TData;
  }>();
  const result = useSWR<TData>(
    enabled ? key : null,
    async () => {
      const data = await queryFn();
      setLastResponse({ key, data });
      return data;
    },
    {
      fallbackData:
        initialData ??
        (typeof placeholderData === "function"
          ? (placeholderData as () => TData)()
          : placeholderData),
      refreshInterval: enabled
        ? typeof refetchInterval === "function"
          ? (data) =>
              refetchInterval({ state: { data, status: "success" } }) || 0
          : refetchInterval || 0
        : 0,
      revalidateOnFocus: enabled && refetchOnWindowFocus,
      ...(retry === undefined ? {} : { shouldRetryOnError: Boolean(retry) }),
    }
  );
  const data =
    !enabled && lastResponse?.key === key ? lastResponse.data : result.data;
  return {
    ...result,
    data: data === undefined || !select ? data : select(data),
    isFetching: result.isValidating,
    isError: Boolean(result.error),
    refetch: result.mutate,
  };
}

export function useMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
>({
  mutationFn,
  onSuccess,
  onError,
}: {
  mutationFn: (variables: TVariables) => Promise<TData> | TData;
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (error: TError, variables: TVariables) => void;
}) {
  const [state, setState] = useStateMutation<TError>();
  const mutateAsync = async (variables: TVariables) => {
    setState({ isPending: true });
    try {
      const data = await mutationFn(variables);
      setState({ isPending: false, data });
      await onSuccess?.(data, variables);
      return data;
    } catch (error) {
      setState({ isPending: false, error: error as TError });
      onError?.(error as TError, variables);
      throw error;
    }
  };
  return {
    ...state,
    mutateAsync,
    mutate: (
      variables: TVariables,
      options?: {
        onSuccess?: (data: TData) => void;
        onError?: (error: TError) => void;
      }
    ) => {
      mutateAsync(variables)
        .then(options?.onSuccess)
        .catch((error) => options?.onError?.(error));
    },
  };
}

function useStateMutation<TError>() {
  const [state, setState] = useState<{
    isPending: boolean;
    data?: unknown;
    error?: TError;
  }>({ isPending: false });
  return [state, setState] as const;
}

export function useQueryClient() {
  const { mutate } = useSWRConfig();
  return {
    invalidateQueries: async ({
      queryKey,
    }: {
      queryKey: QueryKey;
      refetchType?: unknown;
    }) => {
      await mutate(serializeKey(queryKey));
    },
    refetchQueries: async ({ queryKey }: { queryKey: QueryKey }) => {
      await mutate(serializeKey(queryKey));
    },
    setQueryData<T>(key: QueryKey, updater: T | ((old: T | undefined) => T)) {
      return mutate<T>(serializeKey(key), updater, { revalidate: false });
    },
  };
}

export class QueryClient {
  readonly cache = new Map();
  readonly options?: {
    defaultOptions?: {
      queries?: {
        retry?: number | false;
        retryDelay?: number;
        staleTime?: number;
      };
    };
  };

  constructor(options?: QueryClient["options"]) {
    this.options = options;
  }

  clear() {
    this.cache.clear();
  }
  setQueryData(key: QueryKey, data: unknown) {
    this.cache.set(serializeKey(key), { data });
  }
}

export function QueryClientProvider({
  client,
  children,
}: {
  client: QueryClient;
  children: ReactNode;
}) {
  const settings = client.options?.defaultOptions?.queries;
  return (
    <SWRConfig
      value={{
        provider: () => client.cache,
        revalidateIfStale: settings?.staleTime !== Number.POSITIVE_INFINITY,
        shouldRetryOnError: Boolean(settings?.retry),
        errorRetryCount: Number(settings?.retry ?? 0),
        errorRetryInterval: settings?.retryDelay ?? 5000,
      }}
    >
      {children}
    </SWRConfig>
  );
}
