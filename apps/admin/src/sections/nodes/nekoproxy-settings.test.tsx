// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type {
  NekoproxyNodeOptions,
  NekoproxyState,
} from "@workspace/ui/services/admin/nekoproxy";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NekoproxyConnectionSheet from "./nekoproxy-connection-sheet";
import NekoproxyFields from "./nekoproxy-fields";
import NekoproxyNodeSettings from "./nekoproxy-node-settings";

const mocks = vi.hoisted(() => ({
  useQuery: vi.fn(),
  invalidate: vi.fn(),
  save: vi.fn(),
  bind: vi.fn(),
  unbind: vi.fn(),
  sync: vi.fn(),
  changed: vi.fn(),
}));
vi.mock("@tanstack/react-query", () => ({
  useQuery: mocks.useQuery,
  useQueryClient: () => ({ invalidateQueries: mocks.invalidate }),
}));
vi.mock("@workspace/ui/services/admin/nekoproxy", () => ({
  getNekoproxyConfig: vi.fn(),
  getNekoproxyState: vi.fn(),
  updateNekoproxyConfig: mocks.save,
  bindNekoproxy: mocks.bind,
  unbindNekoproxy: mocks.unbind,
  syncNekoproxy: mocks.sync,
}));
vi.mock("@workspace/ui/composed/combobox", () => ({
  Combobox: ({
    placeholder,
    options,
    value,
    onChange,
  }: {
    placeholder: string;
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
  }) => (
    <select
      aria-label={placeholder}
      onChange={(event) => onChange(event.target.value)}
      value={value}
    >
      <option value="" />
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (
      _key: string,
      fallback: string,
      values?: Record<string, string | number>
    ) =>
      Object.entries(values || {}).reduce(
        (text, [key, value]) => text.replaceAll(`{{${key}}}`, String(value)),
        fallback
      ),
  }),
}));

let state: NekoproxyState;
beforeEach(() => {
  state = {
    api_url: "https://np.example.com",
    bindings: [],
    chains: [],
    groups: [],
    forwards: [
      {
        id: "l4s-1",
        name: "Forward one",
        chain_id: "chain-1",
        chain_name: "Chain",
        protocol: "tcp",
        target_host: "target.example.com",
        target_port: 443,
        enabled: true,
        paused: false,
        sessions: [
          {
            id: "session-1",
            address: "entry.example.com",
            port: 2345,
            status: "active",
            group_id: "group-1",
          },
        ],
      },
    ],
  };
  mocks.useQuery.mockImplementation(({ queryKey }) => ({
    data:
      queryKey[1] === "config"
        ? { api_url: state.api_url, has_api_token: true }
        : state,
    refetch: vi.fn(),
  }));
  mocks.save.mockResolvedValue({ data: {} });
  mocks.bind.mockResolvedValue({ data: {} });
  mocks.unbind.mockResolvedValue({ data: {} });
  mocks.invalidate.mockResolvedValue(undefined);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
  );
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

function openConnection() {
  fireEvent.click(screen.getByRole("button", { name: "Nekoproxy connection" }));
}

describe("Nekoproxy connection sheet", () => {
  it("preserves the stored token on a blank save and never reopens with a submitted token", async () => {
    render(<NekoproxyConnectionSheet />);
    openConnection();
    const token = () => screen.getByLabelText("API token") as HTMLInputElement;
    expect(token().type).toBe("password");
    fireEvent.click(screen.getByRole("button", { name: "Connect and save" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(mocks.save).toHaveBeenCalledWith({ api_url: state.api_url });
    openConnection();
    fireEvent.change(token(), { target: { value: "nkp_replacement" } });
    fireEvent.click(screen.getByRole("button", { name: "Connect and save" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(mocks.save).toHaveBeenLastCalledWith({
      api_url: state.api_url,
      api_token: "nkp_replacement",
    });
    openConnection();
    expect(token().value).toBe("");
  });

  it("keeps a failed connection open for correction and discards the draft on cancel", async () => {
    mocks.save.mockRejectedValueOnce(new Error("Connection refused"));
    render(<NekoproxyConnectionSheet />);
    openConnection();
    fireEvent.change(screen.getByLabelText("API address"), {
      target: { value: "https://other.example.test" },
    });
    fireEvent.change(screen.getByLabelText("API token"), {
      target: { value: "nkp_unsaved" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Connect and save" }));
    expect((await screen.findByRole("alert")).textContent).toBe(
      "Connection refused"
    );
    expect(
      (screen.getByLabelText("API address") as HTMLInputElement).value
    ).toBe("https://other.example.test");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    openConnection();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(
      (screen.getByLabelText("API address") as HTMLInputElement).value
    ).toBe(state.api_url);
    expect((screen.getByLabelText("API token") as HTMLInputElement).value).toBe(
      ""
    );
    expect(mocks.save).toHaveBeenCalledTimes(1);
  });
});

function CreateForward({ port }: { port: number }) {
  const [value, setValue] = useState<NekoproxyNodeOptions>();
  return (
    <NekoproxyFields
      onChange={setValue}
      targetHost="target.example.test"
      targetPort={port}
      value={value}
    />
  );
}

it("tracks protocol ports until a manual override, and resets the override for a new forward", () => {
  const { rerender } = render(<CreateForward port={443} />);
  const toggle = screen.getByRole("switch");
  fireEvent.click(toggle);
  const target = screen.getByLabelText("Target port") as HTMLInputElement;
  rerender(<CreateForward port={8443} />);
  expect(target.value).toBe("8443");
  fireEvent.change(target, { target: { value: "9443" } });
  rerender(<CreateForward port={9443} />);
  rerender(<CreateForward port={443} />);
  expect(target.value).toBe("9443");
  fireEvent.click(toggle);
  fireEvent.click(toggle);
  expect((screen.getByLabelText("Target port") as HTMLInputElement).value).toBe(
    "443"
  );
});

const binding = {
  node_id: "2",
  api_url: "https://np.example.com",
  forward_id: "l4s-1",
  session_id: "session-1",
  sync_on_save: false,
};
function settings(
  bound: boolean,
  action = async (fn: () => Promise<unknown>) => {
    await fn();
    return true;
  }
) {
  render(
    <NekoproxyNodeSettings
      disabled={false}
      entry={{
        address: "old.example.com",
        port: 443,
        binding: bound ? binding : undefined,
      }}
      isError={false}
      nodeID="2"
      onAction={action}
      onPreferenceChange={mocks.changed}
    />
  );
}
describe("per-node forwarding settings", () => {
  it("binds the displayed node without asking for another node", async () => {
    settings(false);
    fireEvent.click(
      screen.getByRole("button", { name: "Bind an existing forward" })
    );
    fireEvent.change(
      screen.getByRole("combobox", { name: "Choose an available forward" }),
      { target: { value: "l4s-1" } }
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Bind and sync entry" })
    );
    await waitFor(() =>
      expect(mocks.bind).toHaveBeenCalledWith({
        node_id: "2",
        forward_id: "l4s-1",
        session_id: "session-1",
      })
    );
  });
  it("manual sync targets only this node even with sync on save off", async () => {
    mocks.sync.mockResolvedValue({
      data: { data: { updated: 1, errors: [] } },
    });
    settings(true);
    const toggle = screen.getByRole("switch", {
      name: "Sync when saving this node",
    });
    expect(
      toggle.getAttribute("aria-checked") === "true" ||
        (toggle as HTMLInputElement).checked
    ).toBeFalsy();
    fireEvent.click(screen.getByRole("button", { name: "Sync this node now" }));
    await waitFor(() =>
      expect(mocks.sync).toHaveBeenCalledWith({ node_id: "2" })
    );
    expect(mocks.changed).not.toHaveBeenCalled();
  });
  it("retains local binding details and unbind when the remote is unavailable", async () => {
    state.error = "Remote unavailable";
    state.forwards = [];
    settings(true);
    expect(screen.getByRole("alert").textContent).toBe("Remote unavailable");
    expect(screen.getByText("session-1")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Unbind" }));
    await waitFor(() =>
      expect(mocks.unbind).toHaveBeenCalledWith({ node_id: "2" })
    );
  });
});
