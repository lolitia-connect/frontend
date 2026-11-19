// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RevenueStatisticsCard } from "./revenue-statistics-card";
import { UserStatisticsCard } from "./user-statistics-card";

vi.mock("react-i18next", () => {
  const t = (_key: string, fallback?: string) => fallback ?? _key;
  return { useTranslation: () => ({ t, i18n: { language: "en-US" } }) };
});
vi.mock("@workspace/ui/lib/request", () => ({ default: vi.fn() }));
vi.mock("@/stores/global", () => ({
  useGlobalStore: () => ({ common: { currency: { currency_symbol: "$" } } }),
}));
vi.mock("@workspace/ui/components/chart", () => ({
  ChartContainer: () => <div data-testid="statistics-chart" />,
  ChartLegend: () => null,
  ChartLegendContent: () => null,
  ChartTooltip: () => null,
  ChartTooltipContent: () => null,
}));

let client: QueryClient;

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      disconnect = vi.fn();
      observe = vi.fn();
      unobserve = vi.fn();
    }
  );
  client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Number.POSITIVE_INFINITY },
    },
  });
});

afterEach(() => {
  cleanup();
  client.clear();
  vi.unstubAllGlobals();
});

const cards = [
  {
    name: "revenue statistics",
    Component: RevenueStatisticsCard,
    queryKey: "queryRevenueStatistics",
    empty: { new_order_amount: 0, renewal_order_amount: 0, amount_total: 0 },
    series: ["new_order_amount", "renewal_order_amount"],
  },
  {
    name: "user statistics",
    Component: UserStatisticsCard,
    queryKey: "queryUserStatistics",
    empty: { register: 0, new_order_users: 0, renewal_order_users: 0 },
    series: ["register", "new_order_users", "renewal_order_users"],
  },
];

describe.each(cards)("$name empty state", ({
  Component,
  queryKey,
  empty,
  series,
}) => {
  function renderCard(
    list?: (typeof empty & { date: string })[],
    today = empty
  ) {
    client.setQueryData([queryKey], {
      today,
      monthly: { ...empty, list },
      all: { ...empty, list },
    });
    render(
      <QueryClientProvider client={client}>
        <Component />
      </QueryClientProvider>
    );
  }

  async function selectTab(name: string) {
    fireEvent.click(screen.getByRole("tab", { name }));
    await waitFor(() => {
      expect(screen.getByRole("tabpanel", { name })).toBeTruthy();
    });
  }

  it.each([
    { name: "a missing list", list: undefined },
    { name: "an empty list", list: [] },
    {
      name: "a list containing only zero values",
      list: [
        { ...empty, date: "2026-11-18" },
        { ...empty, date: "2026-11-19" },
      ],
    },
  ])("shows the shared empty state for $name", async ({ list }) => {
    renderCard(list);

    for (const tab of ["Today", "Month", "Total"]) {
      await selectTab(tab);
      const panel = within(screen.getByRole("tabpanel", { name: tab }));
      expect(panel.getByTitle("Empty")).toBeTruthy();
      expect(panel.queryByTestId("statistics-chart")).toBeNull();
    }
  });

  it.each(series)("keeps charts when only %s has data", async (key) => {
    const nonzero = { ...empty, [key]: 1 };
    renderCard(
      [
        { ...empty, date: "2026-11-18" },
        { ...nonzero, date: "2026-11-19" },
      ],
      nonzero
    );

    for (const tab of ["Today", "Month", "Total"]) {
      await selectTab(tab);
      const panel = within(screen.getByRole("tabpanel", { name: tab }));
      expect(panel.getByTestId("statistics-chart")).toBeTruthy();
      expect(panel.queryByTitle("Empty")).toBeNull();
    }
  });
});
