/**
 * Next.js App Router compatibility shim for the former legacy router API.
 *
 * The apps migrated from legacy router (Vite, hash history) to Next.js App
 * Router. Section/feature components referenced a small, well-defined slice of
 * the legacy API. Instead of rewriting every call site — which would also
 * duplicate search-param handling per app — this module re-implements that slice
 * on top of `next/link` and `next/navigation`, preserving the original call
 * signatures (`useSearch({ strict: false })`, `<Link to=... search=...>`, ...).
 *
 * Components migrated to `"use client"` may keep importing from here.
 */
"use client";

import NextLink from "next/link";
import {
  useParams as useNextParams,
  useRouter as useNextRouter,
  usePathname,
  useSearchParams,
} from "next/navigation";
import {
  type ComponentProps,
  type ReactNode,
  useCallback,
  useMemo,
} from "react";
import {
  completeNavigationProgress,
  startNavigationProgress,
} from "./navigation-progress";

type SearchRecord = Record<
  string,
  string | number | boolean | undefined | null
>;

function toQueryString(search: unknown): string {
  if (!search) return "";
  if (typeof search === "string")
    return search.startsWith("?") ? search.slice(1) : search;
  if (search instanceof URLSearchParams) return search.toString();

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search as SearchRecord)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  return params.toString();
}

/** Interpolate `/users/$id` + `{ id: "42" }` into `/users/42`. */
function interpolate(path: string, params?: Record<string, unknown>): string {
  if (!params) return path;
  return path.replace(/\$([A-Za-z0-9_]+)/g, (match, key: string) =>
    params[key] === undefined ? match : encodeURIComponent(String(params[key]))
  );
}

export interface LinkProps
  extends Omit<ComponentProps<typeof NextLink>, "href"> {
  children?: ReactNode;
  /** Plain Next.js destination. */
  href?: string;
  params?: Record<string, unknown>;
  /** search object or raw query string. */
  search?: SearchRecord | string | URLSearchParams;
  /** destination path. */
  to?: string;
}

/**
 * Builds a destination string from a path + search object, for
 * native HeroUI components (e.g. `Dropdown.Item`) that take a plain `href`.
 */
export function buildHref(
  to: string,
  search?: SearchRecord | string | URLSearchParams
): string {
  const query = toQueryString(search);
  return query ? `${to}?${query}` : to;
}

/**
 * `<Link>` with legacy-compatible `to` / `params` / `search` props.
 * Falls back to a plain `href` when provided, so both idioms work.
 */
export function Link({
  to,
  href,
  params,
  search,
  onNavigate,
  ...rest
}: LinkProps) {
  const resolved = href ?? interpolate(to ?? "/", params);
  const query = toQueryString(search);
  const destination = query ? `${resolved}?${query}` : resolved;
  return (
    <NextLink
      {...rest}
      href={destination}
      onNavigate={(event) => {
        let cancelled = false;
        onNavigate?.({
          preventDefault() {
            cancelled = true;
            event.preventDefault();
          },
        });
        if (!cancelled) startNavigationProgress(destination);
      }}
    />
  );
}

export interface NavigateOptions {
  params?: Record<string, unknown>;
  replace?: boolean;
  search?: SearchRecord | string | URLSearchParams;
  to?: string;
}

/**
 * legacy `useRouter()` — returns a facade that satisfies BOTH idioms:
 * the legacy object form (`navigate({ to, params, search })`) and the plain
 * Next.js string form (`push` / `replace` / `back` / `refresh` / `prefetch`).
 *
 * Note: this intentionally shadows `next/navigation`'s `useRouter` for callers
 * importing from this module. Reach for `next/navigation` directly if you only
 * need the raw Next router.
 */
export function useRouter() {
  const router = useNextRouter();
  const navigateTo = useCallback(
    (url: string, replace = false) => {
      const id = startNavigationProgress(url);
      try {
        if (replace) router.replace(url);
        else router.push(url);
      } catch (error) {
        if (id !== undefined) completeNavigationProgress(id);
        throw error;
      }
    },
    [router]
  );

  const navigate = useCallback(
    (options: string | NavigateOptions) => {
      const opts: NavigateOptions =
        typeof options === "string" ? { to: options } : options;
      const resolved = interpolate(opts.to ?? "/", opts.params);
      const query = toQueryString(opts.search);
      const url = query ? `${resolved}?${query}` : resolved;
      navigateTo(url, opts.replace);
      return Promise.resolve();
    },
    [navigateTo]
  );

  return useMemo(
    () => ({
      back: () => router.back(),
      forward: () => router.forward(),
      navigate,
      prefetch: (to: string) => router.prefetch(to),
      push: (url: string) => navigateTo(url),
      refresh: () => router.refresh(),
      replace: (url: string) => navigateTo(url, true),
    }),
    [navigate, navigateTo, router]
  );
}

/** Explicit alias for the facade, for call sites that prefer a distinct name. */
export const useAppRouter = useRouter;

/** legacy `useNavigate()` — returns the navigation function directly. */
export function useNavigate() {
  return useRouter().navigate;
}

/**
 * legacy `useSearch()` — returns the current query string as a plain object.
 *
 * The options bag accepts (and ignores) the legacy router keys that call sites
 * still pass, so retargeted components keep type-checking unchanged.
 */
export function useSearch<T = Record<string, string>>(_options?: {
  strict?: boolean;
  from?: string;
  structuralSharing?: boolean;
  select?: unknown;
}): T {
  const searchParams = useSearchParams();
  return useMemo(() => {
    const result: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) result[key] = value;
    return result as T;
  }, [searchParams]);
}

/** legacy `useLocation()` shape. */
export function useLocation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  return useMemo(
    () => ({
      hash: "",
      href: search ? `${pathname}?${search}` : pathname,
      pathname,
      search,
      state: undefined as unknown,
    }),
    [pathname, search]
  );
}

/** legacy `useParams()`. */
export function useParams<T = Record<string, string>>(_options?: unknown): T {
  return useNextParams() as T;
}

/**
 * legacy `useRouterState()` — the parts the apps relied on (pending status and
 * current location). Next exposes no global navigation-pending flag, so `status`
 * is always "idle". `NavigationProgress` instead observes navigation intent from
 * this module's Link/navigate/push/replace and completion via location changes.
 */
export function useRouterState(): {
  location: ReturnType<typeof useLocation>;
  status: "idle" | "pending";
} {
  const location = useLocation();
  return useMemo(() => ({ location, status: "idle" as const }), [location]);
}

/**
 * legacy `getRouteApi()` — reads params/search without a route context.
 */
export function getRouteApi(_id?: string) {
  return { useParams, useSearch };
}

/**
 * legacy `<Outlet />` rendered the matched child route of a layout.
 *
 * In the App Router a layout receives its children as props, so a component
 * that used `<Outlet />` should normally be given `children`. This passthrough
 * exists for the transitional case where such a component is rendered as a
 * Next.js `layout.tsx` body: the layout itself renders `{children}` and this
 * stays a no-op, keeping the import resolvable.
 */
export function Outlet({ children }: { children?: ReactNode }) {
  return <>{children ?? null}</>;
}

export { usePathname, useSearchParams } from "next/navigation";
