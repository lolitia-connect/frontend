// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import GroupConfig from "./group-config";

const api = vi.hoisted(() => ({
  getGroupConfig: vi.fn(),
  updateGroupConfig: vi.fn(),
  resetGroups: vi.fn(),
}));
vi.mock("@workspace/ui/services/admin/group", () => api);
vi.mock("react-i18next", () => {
  const t = (_key: string, fallback: string) => fallback;
  return { useTranslation: () => ({ t }) };
});

beforeEach(() => {
  api.getGroupConfig.mockResolvedValue({
    data: { data: { enabled: true, mode: "subscribe" } },
  });
});
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

it("saves the selected mode and keeps it when grouping is turned off and on", async () => {
  render(<GroupConfig />);
  fireEvent.click(await screen.findByRole("radio", { name: "Traffic Mode" }));
  const selected = screen.getByRole<HTMLInputElement>("radio", {
    name: "Traffic Mode",
  });
  await waitFor(() => expect(selected.checked).toBe(true));
  const toggle = screen.getByRole("switch", { name: "Enable Grouping" });
  fireEvent.click(toggle);
  await waitFor(() => expect(screen.queryByRole("radiogroup")).toBeNull());
  fireEvent.click(toggle);
  await waitFor(() =>
    expect(
      screen.getByRole<HTMLInputElement>("radio", { name: "Traffic Mode" })
        .checked
    ).toBe(true)
  );
  expect(api.updateGroupConfig.mock.calls).toEqual([
    [{ enabled: true, mode: "traffic" }],
    [{ enabled: false, mode: "traffic" }],
    [{ enabled: true, mode: "traffic" }],
  ]);
});

it("keeps the saved selection after the server rejects a mode change", async () => {
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  api.updateGroupConfig.mockRejectedValue(new Error("save failed"));
  render(<GroupConfig />);
  fireEvent.click(await screen.findByRole("radio", { name: "Traffic Mode" }));
  await waitFor(() =>
    expect(
      screen.getByRole<HTMLInputElement>("radio", { name: "Subscribe Mode" })
        .disabled
    ).toBe(false)
  );
  expect(api.updateGroupConfig).toHaveBeenCalledOnce();
  expect(
    screen.getByRole<HTMLInputElement>("radio", { name: "Subscribe Mode" })
      .checked
  ).toBe(true);
});

it("requires confirmation to reset and reloads the config after a confirmed reset", async () => {
  render(<GroupConfig />);
  await screen.findByRole("radiogroup");
  const reset = screen.getByRole("button", { name: "Reset All Groups" });
  fireEvent.click(reset);
  fireEvent.click(await screen.findByRole("button", { name: "Cancel" }));
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  expect(api.resetGroups).not.toHaveBeenCalled();
  fireEvent.click(reset);
  fireEvent.click(await screen.findByRole("button", { name: "Confirm" }));
  await waitFor(() => expect(api.getGroupConfig).toHaveBeenCalledTimes(2));
  expect(api.resetGroups).toHaveBeenCalledWith({ confirm: true });
});
