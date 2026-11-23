// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ServerForm from "./server-form";

const mocks = vi.hoisted(() => ({ error: vi.fn() }));

vi.mock("@heroui/react", async (importOriginal) => {
  const heroui = await importOriginal<typeof import("@heroui/react")>();
  return { ...heroui, toast: { ...heroui.toast, danger: mocks.error } };
});
vi.mock("@/stores/node", () => ({
  useNode: () => ({ isProtocolUsedInNodes: () => false }),
}));
vi.mock("@workspace/ui/components/scroll-area", () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
vi.mock("@workspace/ui/composed/icon", () => ({ Icon: () => null }));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string, values?: Record<string, unknown>) =>
      Object.entries(values || {}).reduce(
        (text, [key, value]) => text.replaceAll(`{{${key}}}`, String(value)),
        fallback
      ),
  }),
}));

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      disconnect() {}
      observe() {}
      unobserve() {}
    }
  );
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("server protocol form", () => {
  it.each([
    ["Off", "MULTIPLEXING_OFF", "tcp"],
    ["Low", "MULTIPLEXING_LOW", "tcp"],
    ["Middle", "MULTIPLEXING_MIDDLE", "udp"],
    ["High", "MULTIPLEXING_HIGH", "udp"],
  ])("creates a Mieru instance with %s (%s) over %s", async (label, multiplex, transport) => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    render(
      <ServerForm onSubmit={onSubmit} title="Create Server" trigger="Create" />
    );
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
      target: { value: "Mieru test" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Address" }), {
      target: { value: "node.example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "mieru" }));
    fireEvent.change(await screen.findByRole("spinbutton", { name: /Port/ }), {
      target: { value: "8443" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Low" }));
    fireEvent.click(await screen.findByRole("option", { name: label }));
    fireEvent.click(screen.getByRole("button", { name: "TCP" }));
    fireEvent.click(
      await screen.findByRole("option", { name: transport.toUpperCase() })
    );
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Mieru test",
          address: "node.example.com",
          protocols: [
            expect.objectContaining({
              type: "mieru",
              enable: true,
              port: 8443,
              transport,
              multiplex,
            }),
          ],
        })
      )
    );
    expect(mocks.error).not.toHaveBeenCalled();
  });

  it("edits a stored Mieru level without changing another protocol's multiplex", async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    render(
      <ServerForm
        initialValues={{
          name: "Mixed protocols",
          address: "node.example.com",
          protocols: [
            {
              id: "1",
              type: "vmess",
              enable: true,
              port: 8443,
              multiplex: "smux",
            },
            {
              id: "2",
              name: "Mieru legacy",
              type: "mieru",
              enable: true,
              port: 8444,
              multiplex: "high",
            },
          ],
        }}
        onSubmit={onSubmit}
        title="Edit Server"
        trigger="Edit"
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: /Mieru legacy/ }));
    fireEvent.click(screen.getByRole("button", { name: "High" }));
    fireEvent.click(await screen.findByRole("option", { name: "Off" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          protocols: [
            expect.objectContaining({
              id: "1",
              type: "vmess",
              multiplex: "smux",
            }),
            expect.objectContaining({
              id: "2",
              name: "Mieru legacy",
              type: "mieru",
              multiplex: "MULTIPLEXING_OFF",
            }),
          ],
        })
      )
    );
    expect(mocks.error).not.toHaveBeenCalled();
  });

  it.each([
    [{ port: 0 }, "Port is required"],
    [{ port: 8444, multiplex: "smux" }, "MULTIPLEXING_OFF"],
  ])("reports a nested protocol error and opens the invalid instance: %j", async (options, message) => {
    const onSubmit = vi.fn();
    render(
      <ServerForm
        initialValues={{
          name: "Mieru test",
          address: "node.example.com",
          protocols: [
            { id: "1", type: "vmess", enable: true, port: 8443 },
            {
              id: "2",
              name: "Invalid Mieru",
              type: "mieru",
              enable: true,
              ...options,
            },
          ],
        }}
        onSubmit={onSubmit}
        title="Edit Server"
        trigger="Edit"
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(mocks.error).toHaveBeenCalledWith(
        expect.stringContaining(message)
      );
    });
    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen
        .getByRole("button", { name: /Invalid Mieru/ })
        .getAttribute("aria-expanded")
    ).toBe("true");
  });
});
