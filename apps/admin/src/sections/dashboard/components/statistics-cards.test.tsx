// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@workspace/ui/hooks/query";
import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
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
  ChartContainer: ({
    children,
    config,
  }: {
    children: ReactElement<{ data?: unknown; children?: ReactNode }>;
    config: Record<string, { label: string }>;
  }) => (
    <div data-testid="statistics-chart">
      {JSON.stringify({
        config,
        data: children.props.data,
        series: Children.toArray(children.props.children)
          .filter(isValidElement)
          .map((child) => (child.props as { dataKey?: string }).dataKey)
          .filter(Boolean),
      })}
    </div>
  ),
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
    empty: {
      new_order_amount: 0,
      renewal_order_amount: 0,
      redemption_order_amount: 0,
      amount_total: 0,
    },
    series: [
      "new_order_amount",
      "renewal_order_amount",
      "redemption_order_amount",
    ],
    redemptionKey: "redemption_order_amount",
  },
  {
    name: "user statistics",
    Component: UserStatisticsCard,
    queryKey: "queryUserStatistics",
    empty: {
      register: 0,
      new_order_users: 0,
      renewal_order_users: 0,
      redemption_order_users: 0,
    },
    series: [
      "register",
      "new_order_users",
      "renewal_order_users",
      "redemption_order_users",
    ],
    redemptionKey: "redemption_order_users",
  },
];

describe.each(cards)("$name empty state", ({
  Component,
  queryKey,
  empty,
  series,
  redemptionKey,
}) => {
  type Metric = Partial<typeof empty> & { date?: string };

  function renderCard(
    section: Partial<typeof empty> & { list?: Metric[] } = {},
    today: Partial<typeof empty> = {}
  ) {
    const period = { ...empty, ...section };
    client.setQueryData([queryKey], {
      today: { ...empty, ...today },
      monthly: period,
      all: period,
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
  ])("shows the shared empty state on month and total for $name", async ({
    list,
  }) => {
    renderCard({ list });

    for (const tab of ["Month", "Total"]) {
      await selectTab(tab);
      const panel = within(screen.getByRole("tabpanel", { name: tab }));
      expect(panel.getByTitle("Empty")).toBeTruthy();
      expect(panel.queryByTestId("statistics-chart")).toBeNull();
    }
  });

  it("shows the empty state on today when every metric is zero", async () => {
    renderCard({ list: [] });

    await selectTab("Today");
    const panel = within(screen.getByRole("tabpanel", { name: "Today" }));
    expect(panel.getByTitle("Empty")).toBeTruthy();
    expect(panel.queryByTestId("statistics-chart")).toBeNull();
  });

  it("renders month and total charts whenever the period has list entries", async () => {
    renderCard({
      list: [
        { ...empty, date: "2026-11-18" },
        { ...empty, date: "2026-11-19" },
      ],
    });

    for (const tab of ["Month", "Total"]) {
      await selectTab(tab);
      const panel = within(screen.getByRole("tabpanel", { name: tab }));
      expect(panel.getByTestId("statistics-chart")).toBeTruthy();
      expect(panel.queryByTitle("Empty")).toBeNull();
    }
  });

  it("shows redemption summaries and chart series for every period", async () => {
    const metrics = { ...empty, [redemptionKey]: 300 };
    const expectedValue = redemptionKey === "redemption_order_amount" ? 3 : 300;
    renderCard(
      { ...metrics, list: [{ ...metrics, date: "2026-11-19" }] },
      metrics
    );

    for (const tab of ["Today", "Month", "Total"]) {
      await selectTab(tab);
      const panel = within(screen.getByRole("tabpanel", { name: tab }));
      expect(panel.getByText("Redemption")).toBeTruthy();
      const chart = JSON.parse(
        panel.getByTestId("statistics-chart").textContent ?? "{}"
      );
      expect(chart.config.redemption.label).toBe("Redemption");
      if (tab === "Today") {
        expect(chart.series).toContain("value");
      } else {
        expect(chart.series).toContain("redemption");
        expect(chart.data[0].redemption).toBe(expectedValue);
        expect(chart.data[0].new_purchase).toBe(0);
        expect(chart.data[0].repurchase).toBe(0);
      }
    }
  });

  it.each(series)("renders the today chart when %s has data", async (key) => {
    renderCard({}, { ...empty, [key]: 1 });

    await selectTab("Today");
    const panel = within(screen.getByRole("tabpanel", { name: "Today" }));
    expect(panel.getByTestId("statistics-chart")).toBeTruthy();
    expect(panel.queryByTitle("Empty")).toBeNull();
  });
});
