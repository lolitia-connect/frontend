/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

// This repo's vitest setups do not register testing-library's automatic cleanup,
// so each test file unmounts explicitly (same as the app suites).
afterEach(cleanup);

/**
 * Logic-parity guard for the router shim.
 *
 * `packages/ui/src/lib/router-compat.tsx` stands in for the TanStack Router slice
 * the apps used. `main` ran on TanStack *hash* history (`createHashHistory()` in
 * each app's `src/main.tsx`); the migrated apps route on the App Router pathname.
 * A shim bug here silently changes navigation for every call site, so the
 * documented contract is pinned rather than assumed:
 *
 *   - `useSearch({ strict: false })` -> plain object of the query string
 *   - `useNavigate()` / `useRouter().navigate({ to, params, search })`
 *   - `$param` interpolation in `to`
 *   - `<Link to search params />` -> a real href
 *   - `useLocation()` / `useRouterState()` shapes
 */

const nav = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => nav,
  usePathname: () => "/dashboard",
  useParams: () => ({ id: "42" }),
  useSearchParams: () =>
    new URLSearchParams("order_no=PP123&redirect=%2Fwallet"),
}));

const { Link, useNavigate, useLocation, useRouterState, useSearch, useParams } =
  await import("./router-compat");

function Harness({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

describe("router-compat: useSearch", () => {
  it("returns the query string as a plain object", () => {
    function Probe() {
      const search = useSearch();
      return <span data-testid="out">{JSON.stringify(search)}</span>;
    }
    render(
      <Harness>
        <Probe />
      </Harness>
    );
    expect(screen.getByTestId("out").textContent).toBe(
      '{"order_no":"PP123","redirect":"/wallet"}'
    );
  });
});

describe("router-compat: useNavigate", () => {
  it("pushes the interpolated path with a query string", async () => {
    function Probe() {
      const navigate = useNavigate();
      return (
        <button
          onClick={() =>
            navigate({
              to: "/users/$id",
              params: { id: "42" },
              search: { tab: "billing" },
            })
          }
          type="button"
        >
          go
        </button>
      );
    }
    render(<Probe />);
    screen.getByRole("button").click();
    expect(nav.push).toHaveBeenCalledWith("/users/42?tab=billing");
  });

  it("honours replace", () => {
    function Probe() {
      const navigate = useNavigate();
      return (
        <button
          onClick={() => navigate({ to: "/auth", replace: true })}
          type="button"
        >
          go
        </button>
      );
    }
    render(<Probe />);
    screen.getByRole("button").click();
    expect(nav.replace).toHaveBeenCalledWith("/auth");
  });

  it("drops empty query values instead of emitting key=", () => {
    function Probe() {
      const navigate = useNavigate();
      return (
        <button
          onClick={() =>
            navigate({ to: "/x", search: { a: "", b: undefined, c: 0 } })
          }
          type="button"
        >
          go
        </button>
      );
    }
    render(<Probe />);
    screen.getByRole("button").click();
    // `""` and `undefined` are omitted (they would otherwise become `a=&c=0`);
    // `0` is a meaningful value and must survive.
    expect(nav.push).toHaveBeenCalledWith("/x?c=0");
  });
});

describe("router-compat: Link", () => {
  it("maps to/search onto a real href", () => {
    render(
      <Link params={{ id: "7" }} search={{ tab: "log" }} to="/users/$id">
        Open
      </Link>
    );
    expect(screen.getByRole("link").getAttribute("href")).toBe(
      "/users/7?tab=log"
    );
  });

  it("prefers an explicit href", () => {
    render(<Link href="/plain">Open</Link>);
    expect(screen.getByRole("link").getAttribute("href")).toBe("/plain");
  });

  it("interpolates nothing when params are missing, keeping $placeholder", () => {
    render(<Link to="/users/$id">Open</Link>);
    expect(screen.getByRole("link").getAttribute("href")).toBe("/users/$id");
  });
});

describe("router-compat: location and params shapes", () => {
  it("useLocation exposes pathname/search/href", () => {
    function Probe() {
      const loc = useLocation();
      return <span data-testid="out">{JSON.stringify(loc)}</span>;
    }
    render(<Probe />);
    expect(JSON.parse(screen.getByTestId("out").textContent ?? "{}")).toEqual({
      hash: "",
      href: "/dashboard?order_no=PP123&redirect=%2Fwallet",
      pathname: "/dashboard",
      search: "order_no=PP123&redirect=%2Fwallet",
      state: undefined,
    });
  });

  it("useRouterState reports idle and carries the location", () => {
    function Probe() {
      const state = useRouterState();
      return (
        <span data-testid="out">
          {state.status}:{state.location.pathname}
        </span>
      );
    }
    render(<Probe />);
    expect(screen.getByTestId("out").textContent).toBe("idle:/dashboard");
  });

  it("useParams returns the dynamic segment", () => {
    function Probe() {
      const params = useParams<{ id: string }>();
      return <span data-testid="out">{params.id}</span>;
    }
    render(<Probe />);
    expect(screen.getByTestId("out").textContent).toBe("42");
  });
});
