// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@workspace/ui/hooks/query";
import { afterEach, expect, it, vi } from "vitest";
import PaymentTable from "./payment-table";

const api = vi.hoisted(() => ({
  getPaymentList: vi.fn(),
  getPaymentPlatform: vi.fn(),
  putPayment: vi.fn(),
}));
vi.mock("@workspace/ui/services/admin/admin", () => api);
vi.mock("@workspace/ui/composed/editor/markdown", () => ({
  MarkdownEditor: () => null,
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("reopens an edited channel with the saved config while its list refresh is pending", async () => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  const original = {
    id: "1",
    name: "Original channel",
    platform: "EPay",
    config: { pid: "1001" },
    fee_mode: 0,
  };
  const saved = {
    ...original,
    name: "Renamed channel",
    config: { pid: "2002" },
  };
  const refreshed = { ...saved, name: "Refreshed channel" };
  const list = (row: typeof original) => ({
    data: { data: { list: [row], total: 1 } },
  });
  let finishRefresh!: () => void;
  api.getPaymentList
    .mockResolvedValueOnce(list(original))
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishRefresh = () => resolve(list(refreshed));
        })
    );
  api.getPaymentPlatform.mockResolvedValue({
    data: {
      data: {
        list: [
          {
            platform: "EPay",
            platform_field_description: { pid: "Merchant ID" },
          },
        ],
      },
    },
  });
  api.putPayment.mockResolvedValue({ data: { data: saved } });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <PaymentTable />
    </QueryClientProvider>
  );

  const openEditor = async () => {
    fireEvent.click(await screen.findByRole("button", { name: "edit" }));
    return screen.findByPlaceholderText<HTMLInputElement>("namePlaceholder");
  };
  fireEvent.change(await openEditor(), { target: { value: saved.name } });
  fireEvent.change(await screen.findByDisplayValue(original.config.pid), {
    target: { value: "02002" },
  });
  fireEvent.click(screen.getByRole("button", { name: "submit" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(api.putPayment).toHaveBeenCalledWith(
    expect.objectContaining({
      id: original.id,
      name: saved.name,
      config: { pid: "02002" },
    })
  );

  const name = await openEditor();
  expect(name.value).toBe(saved.name);
  expect(screen.getByDisplayValue(saved.config.pid)).toBeTruthy();
  fireEvent.change(name, { target: { value: "Unsubmitted draft" } });
  await act(async () => finishRefresh());
  expect(name.value).toBe("Unsubmitted draft");
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect((await openEditor()).value).toBe(refreshed.name);
});
