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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Subscribe from "./index";

const mocks = vi.hoisted(() => ({ plans: vi.fn(), subscriptions: vi.fn() }));
vi.mock("@workspace/ui/services/user/subscribe", () => ({
  querySubscribeList: mocks.plans,
}));
vi.mock("@workspace/ui/services/user/user", () => ({
  queryUserSubscribe: mocks.subscriptions,
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    i18n: { language: "en-US" },
    t: (_key: string, fallback: string, values?: Record<string, string>) =>
      fallback?.replace("{{name}}", values?.name ?? ""),
  }),
}));
vi.mock("@/components/display", () => ({ Display: () => null }));
vi.mock("@workspace/ui/composed/icon", () => ({ Icon: () => null }));
vi.mock("./redeem-code", () => ({ default: () => null }));
vi.mock("./detail", () => ({ SubscribeDetail: () => null }));
vi.mock("./purchase", () => ({
  default: ({ subscribe }: { subscribe?: { name: string } }) =>
    subscribe ? <div role="status">Purchase {subscribe.name}</div> : null,
}));
vi.mock("./renewal", () => ({
  default: ({ id }: { id: string }) => (
    <button type="button">Renew {id}</button>
  ),
}));

const plan = {
  id: "plan-1",
  name: "Standard",
  description: "{}",
  show: true,
  sell: true,
  unit_price: 100,
  unit_time: "Month",
};
let client: QueryClient;
beforeEach(() => {
  mocks.plans.mockResolvedValue({ data: { data: { list: [plan] } } });
  mocks.subscriptions.mockResolvedValue({ data: { data: { list: [] } } });
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});
afterEach(() => {
  cleanup();
  client.clear();
  vi.clearAllMocks();
});

function renderPlans() {
  render(
    <QueryClientProvider client={client}>
      <Subscribe />
    </QueryClientProvider>
  );
}

describe("subscription renewal reminder", () => {
  it("opens purchase directly when no renewable instance exists", async () => {
    renderPlans();
    fireEvent.click(await screen.findByRole("button", { name: "Buy" }));
    expect(screen.getByRole("status").textContent).toBe("Purchase Standard");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("offers existing instances before allowing an explicit new purchase", async () => {
    mocks.subscriptions.mockResolvedValue({
      data: {
        data: {
          list: [
            {
              id: "instance-1",
              subscribe_id: plan.id,
              status: 1,
              expire_time: Date.now() + 86_400_000,
              subscribe: plan,
            },
          ],
        },
      },
    });
    renderPlans();
    await screen.findByRole("button", { name: "Renew instance-1" });
    fireEvent.click(screen.getByRole("button", { name: "Buy" }));
    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByRole("button", { name: "Renew instance-1" })
    ).toBeTruthy();
    expect(screen.queryByRole("status")).toBeNull();
    fireEvent.click(
      within(dialog).getByRole("button", {
        name: "Buy Standard as a new subscription",
      })
    );
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toBe("Purchase Standard")
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("does not suggest renewal for an unsubscribed instance", async () => {
    mocks.subscriptions.mockResolvedValue({
      data: {
        data: {
          list: [
            {
              id: "closed",
              subscribe_id: plan.id,
              status: 4,
              expire_time: Date.now(),
              subscribe: plan,
            },
          ],
        },
      },
    });
    renderPlans();
    fireEvent.click(await screen.findByRole("button", { name: "Buy" }));
    expect(screen.getByRole("status").textContent).toBe("Purchase Standard");
  });
});
