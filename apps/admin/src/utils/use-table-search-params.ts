"use client";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "@workspace/ui/lib/router-compat";
import { useCallback } from "react";

/**
 * Sync the table's filter state into the URL query string.
 *
 * Migrated off the legacy `router.history` object: the Next.js compat shim
 * exposes `next/navigation`'s router, so we read the current location from
 * `usePathname()` / `useSearchParams()` and write it back with `router.replace`.
 */
export function useTableSearchParams(filterKeys: readonly string[]) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filterKeysSnapshot = filterKeys.join("|");

  return useCallback(
    (filters: Record<string, unknown>) => {
      const keys = filterKeysSnapshot.split("|").filter(Boolean);
      const search = new URLSearchParams(searchParams.toString());

      for (const key of keys) {
        const value = filters[key];
        if (value === null || value === undefined || value === "") {
          search.delete(key);
        } else {
          search.set(key, String(value));
        }
      }

      const query = search.toString();
      const currentQuery = searchParams.toString();
      if (query !== currentQuery) {
        router.replace(query ? `${pathname}?${query}` : pathname);
      }
    },
    [filterKeysSnapshot, router, pathname, searchParams]
  );
}
