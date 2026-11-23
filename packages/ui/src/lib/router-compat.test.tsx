/** @vitest-environment jsdom */
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { RouterContext } from "next/dist/shared/lib/router-context.shared-runtime";
import type { NextRouter } from "next/router";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  completeNavigationProgress,
  getNavigationProgress,
} from "./navigation-progress";

// This repo's vitest setups do not register testing-library's automatic cleanup,
// so each test file unmounts explicitly (same as the app suites).
function preventBrowserNavigation(event: Event) {
  event.preventDefault();
}

afterEach(() => {
  cleanup();
  completeNavigationProgress();
  document.removeEventListener("click", preventBrowserNavigation);
  vi.useRealTimers();
});

/**
 * Logic-parity guard for the router shim.
 *
 * `packages/ui/src/lib/router-compat.tsx` stands in for the legacy router slice
 * the apps used. `main` ran on legacy *hash* history (`createHashHistory()` in
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

const route = vi.hoisted(() => ({ pathname: "/dashboard", search: "" }));
const progressBar = () =>
  screen.queryByRole("progressbar", { name: "Loading" });

vi.mock("next/navigation", () => ({
  useRouter: () => nav,
  usePathname: () => route.pathname,
  useParams: () => ({ id: "42" }),
  useSearchParams: () => new URLSearchParams(route.search),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));

const { NavigationProgress } = await import("../composed/navigation-progress");
const {
  Link,
  useNavigate,
  useRouter,
  useLocation,
  useRouterState,
  useSearch,
  useParams,
} = await import("./router-compat");

beforeEach(() => {
  vi.clearAllMocks();
  route.pathname = "/dashboard";
  route.search = "order_no=PP123&redirect=%2Fwallet";
  window.history.replaceState(null, "", `${route.pathname}?${route.search}`);
  // Stop jsdom's native navigation after Next's React click handler has run.
  document.addEventListener("click", preventBrowserNavigation);
});

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

describe("router-compat: navigation progress", () => {
  function Navigation({ children }: { children: ReactNode }) {
    return (
      <RouterContext.Provider value={nav as unknown as NextRouter}>
        <NavigationProgress />
        {children}
      </RouterContext.Provider>
    );
  }

  it("starts on a sidebar link click and stays pending until the route commits", () => {
    vi.useFakeTimers();
    const view = render(
      <Navigation>
        <Link prefetch={false} to="/dashboard/servers">
          Servers
        </Link>
      </Navigation>
    );
    expect(progressBar()).toBeNull();

    fireEvent.click(screen.getByRole("link"));
    expect(nav.push).toHaveBeenCalled();
    expect(progressBar()).not.toBeNull();
    act(() => vi.advanceTimersByTime(2000));
    expect(progressBar()).not.toBeNull();

    route.pathname = "/dashboard/servers";
    route.search = "";
    view.rerender(
      <Navigation>
        <span>Servers loaded</span>
      </Navigation>
    );
    expect(progressBar()).toBeNull();
    expect(getNavigationProgress()?.pending).toBe(false);
  });

  it.each([
    "navigate",
    "push",
    "replace",
  ] as const)("starts before %s and completes query-only navigation on commit", (method) => {
    const routerMethod = method === "replace" ? nav.replace : nav.push;
    routerMethod.mockImplementationOnce(() => {
      expect(getNavigationProgress()?.pending).toBe(true);
    });
    function Probe() {
      const router = useRouter();
      return (
        <button
          onClick={() => router[method]("/dashboard?tab=billing")}
          type="button"
        >
          go
        </button>
      );
    }
    const view = render(
      <Navigation>
        <Probe />
      </Navigation>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(progressBar()).not.toBeNull();
    route.search = "tab=billing";
    view.rerender(
      <Navigation>
        <Probe />
      </Navigation>
    );
    expect(progressBar()).toBeNull();
  });

  it("retains navigation intent until the lazy progress component mounts", () => {
    const view = render(
      <RouterContext.Provider value={nav as unknown as NextRouter}>
        <Link prefetch={false} to="/dashboard/servers">
          Servers
        </Link>
      </RouterContext.Provider>
    );
    fireEvent.click(screen.getByRole("link"));
    view.rerender(<NavigationProgress />);
    expect(progressBar()).not.toBeNull();
  });

  it("replaces the completion timeout when a newer navigation starts", () => {
    vi.useFakeTimers();
    const view = render(
      <Navigation>
        <Link prefetch={false} to="/dashboard/servers">
          Servers
        </Link>
        <Link prefetch={false} to="/dashboard/nodes">
          Nodes
        </Link>
      </Navigation>
    );
    fireEvent.click(screen.getByRole("link", { name: "Servers" }));
    act(() => vi.advanceTimersByTime(20_000));
    fireEvent.click(screen.getByRole("link", { name: "Nodes" }));
    act(() => vi.advanceTimersByTime(20_000));
    expect(progressBar()).not.toBeNull();
    route.pathname = "/dashboard/nodes";
    view.rerender(
      <Navigation>
        <span>Nodes loaded</span>
      </Navigation>
    );
    expect(progressBar()).toBeNull();
    act(() => vi.advanceTimersByTime(30_000));
    expect(progressBar()).toBeNull();
  });

  it("clears a navigation that never commits instead of leaving the bar stuck", () => {
    vi.useFakeTimers();
    render(
      <Navigation>
        <Link prefetch={false} to="/dashboard/servers">
          Servers
        </Link>
      </Navigation>
    );
    fireEvent.click(screen.getByRole("link"));
    expect(progressBar()).not.toBeNull();
    act(() => vi.advanceTimersByTime(30_000));
    expect(progressBar()).toBeNull();
  });

  it("does not start a late progress flash for an untracked route update", () => {
    const view = render(<NavigationProgress />);
    route.pathname = "/dashboard/servers";
    view.rerender(<NavigationProgress />);
    expect(progressBar()).toBeNull();
  });

  it.each([
    { to: "/dashboard?order_no=PP123&redirect=%2Fwallet" },
    { to: "#details" },
    { to: "https://example.test/elsewhere" },
    { to: "/dashboard/servers", target: "_blank" },
    { to: "/dashboard/servers", download: true },
    {
      to: "/dashboard/servers",
      onClick: (event: { preventDefault(): void }) => event.preventDefault(),
    },
    {
      to: "/dashboard/servers",
      onNavigate: (event: { preventDefault(): void }) => event.preventDefault(),
    },
  ])("does not start for a non-navigation click: %j", (props) => {
    render(
      <Navigation>
        <Link prefetch={false} {...props}>
          Open
        </Link>
      </Navigation>
    );
    fireEvent.click(screen.getByRole("link"));
    expect(progressBar()).toBeNull();
  });

  it.each([
    "ctrlKey",
    "metaKey",
    "shiftKey",
    "altKey",
  ])("does not start for a modified click (%s)", (modifier) => {
    render(
      <Navigation>
        <Link prefetch={false} to="/dashboard/servers">
          Servers
        </Link>
      </Navigation>
    );
    fireEvent.click(screen.getByRole("link"), { [modifier]: true });
    expect(progressBar()).toBeNull();
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
