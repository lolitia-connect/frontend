// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import SentryForm from "./sentry-form";

const { get, save } = vi.hoisted(() => ({ get: vi.fn(), save: vi.fn() }));
vi.mock("@workspace/ui/services/admin/admin", () => ({
  getLogSetting: get,
  postLogSetting: save,
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@workspace/ui/composed/icon", () => ({ Icon: () => null }));

afterEach(cleanup);

it("validates the project DSN and saves only Sentry settings", async () => {
  get.mockResolvedValue({
    data: {
      data: {
        auto_clear: true,
        clear_days: 14,
        sentry_enabled: true,
        sentry_error_enabled: true,
        sentry_logs_enabled: false,
        sentry_tracing_enabled: false,
        sentry_metrics_enabled: false,
        sentry_trace_id_header_enabled: false,
        sentry_dsn: "https://old@dsn.example/7",
      },
    },
  });
  save.mockResolvedValue({ data: { code: 200 } });
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <SentryForm />
    </QueryClientProvider>
  );
  const option = screen.getByRole("button", {
    name: /sentry\.title.*sentry\.description/,
  });
  expect(option).toBeTruthy();
  fireEvent.click(option);
  const input = await screen.findByDisplayValue("https://old@dsn.example/7");
  expect(screen.getAllByRole("switch")).toHaveLength(5);
  fireEvent.change(input, {
    target: { value: "https://wrong-project.example" },
  });
  fireEvent.click(screen.getByRole("button", { name: "common.save" }));
  await screen.findByText("sentry.invalidDsn");
  expect(save).not.toHaveBeenCalled();
  fireEvent.change(input, { target: { value: "https://new@dsn.example/8" } });
  fireEvent.click(screen.getByRole("button", { name: "common.save" }));
  await waitFor(() =>
    expect(save).toHaveBeenCalledWith({
      sentry_error_enabled: true,
      sentry_logs_enabled: false,
      sentry_tracing_enabled: false,
      sentry_metrics_enabled: false,
      sentry_trace_id_header_enabled: false,
      sentry_dsn: "https://new@dsn.example/8",
    })
  );
});
