/** @vitest-environment jsdom */
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { createRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProTable, type ProTableActions } from "./pro-table";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

afterEach(cleanup);

const rows = [
  { id: "a", name: "Tokyo", address: "tokyo.example.test" },
  { id: "b", name: "Berlin", address: "berlin.example.test" },
];
const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "address", header: "Address" },
];

function StatefulEditor() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  return (
    <>
      <button onClick={() => setOpen(true)} type="button">
        Edit row
      </button>
      {open && (
        <div aria-label="Row editor" role="dialog">
          <input
            aria-label="Draft"
            onChange={(event) => setDraft(event.target.value)}
            value={draft}
          />
        </div>
      )}
    </>
  );
}

describe("ProTable native collection", () => {
  it("preserves an open row editor and its draft across parent updates and refreshes", async () => {
    const action = createRef<ProTableActions>();
    const request = vi.fn().mockResolvedValue({ list: rows, total: 2 });
    const table = (label: string) => (
      <ProTable
        action={action}
        actions={{ render: () => [<StatefulEditor key="edit" />] }}
        aria-label="Servers"
        columns={columns}
        header={{ title: label }}
        request={request}
      />
    );
    const { rerender } = render(table("Initial"));
    const tokyo = await screen.findByRole("row", { name: /Tokyo/ });
    fireEvent.click(within(tokyo).getByRole("button", { name: "Edit row" }));
    const input = screen.getByRole("textbox", { name: "Draft" });
    fireEvent.change(input, {
      target: { value: "unsaved subscription changes" },
    });
    rerender(table("Updated"));
    expect(screen.getByRole("dialog", { name: "Row editor" })).not.toBeNull();
    expect(screen.getByRole("textbox", { name: "Draft" })).toBe(input);
    await act(async () => action.current?.refresh());
    expect(screen.getByRole("textbox", { name: "Draft" })).toBe(input);
    expect((input as HTMLInputElement).value).toBe(
      "unsaved subscription changes"
    );
    expect(request).toHaveBeenCalledTimes(2);
  });

  it("keeps selection attached to row identity when the refreshed order changes", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce({ list: rows, total: 2 })
      .mockResolvedValue({ list: [...rows].reverse(), total: 2 });
    const action = createRef<ProTableActions>();
    const selected = vi.fn();
    render(
      <ProTable
        action={action}
        actions={{
          batchRender: (items) => [
            <button key="archive" onClick={() => selected(items)} type="button">
              Archive selected
            </button>,
          ],
        }}
        aria-label="Servers"
        columns={columns}
        request={request}
      />
    );
    const grid = await screen.findByRole("grid", { name: "Servers" });
    const tokyo = await within(grid).findByRole("row", { name: /Tokyo/ });
    fireEvent.click(within(tokyo).getByRole("checkbox"));
    await act(async () => action.current?.refresh());
    await waitFor(() =>
      expect(within(grid).getAllByRole("row")[1]?.textContent).toContain(
        "Berlin"
      )
    );
    fireEvent.click(screen.getByRole("button", { name: "Archive selected" }));
    expect(selected).toHaveBeenCalledWith([rows[0]]);
  });

  it("updates the header and body collection together when a column is hidden", async () => {
    const request = vi.fn().mockResolvedValue({ list: rows, total: 2 });
    const edit = vi.fn();
    render(
      <ProTable
        actions={{
          render: (row) => [
            <button key="edit" onClick={() => edit(row.id)} type="button">
              Edit server
            </button>,
          ],
        }}
        aria-label="Servers"
        columns={columns}
        request={request}
      />
    );
    const grid = await screen.findByRole("grid", { name: "Servers" });
    await within(grid).findByRole("rowheader", { name: "Tokyo" });
    fireEvent.click(screen.getByRole("button", { name: "Choose columns" }));
    fireEvent.click(
      await screen.findByRole("menuitemcheckbox", { name: "Address" })
    );
    await waitFor(() =>
      expect(
        within(grid).queryByRole("columnheader", { name: "Address" })
      ).toBeNull()
    );
    expect(within(grid).queryByText("tokyo.example.test")).toBeNull();
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    fireEvent.click(
      within(grid).getAllByRole("button", { name: "Edit server" })[0]!
    );
    expect(edit).toHaveBeenCalledWith("a");
  });

  it("retains the filter and paging payloads after the table is refactored", async () => {
    const request = vi.fn().mockResolvedValue({ list: rows, total: 25 });
    render(
      <ProTable
        aria-label="Servers"
        columns={columns}
        params={[{ key: "search", placeholder: "Find a server" }]}
        request={request}
      />
    );
    await screen.findByRole("rowheader", { name: "Tokyo" });
    fireEvent.click(screen.getByRole("button", { name: "Go to next page" }));
    await waitFor(() =>
      expect(request).toHaveBeenLastCalledWith({ page: 2, size: 10 }, {})
    );
    await waitFor(() =>
      expect(screen.getByRole("grid").getAttribute("aria-busy")).not.toBe(
        "true"
      )
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Find a server" }), {
      target: { value: "Tokyo" },
    });
    await waitFor(() =>
      expect(request).toHaveBeenLastCalledWith(
        { page: 1, size: 10 },
        { search: "Tokyo" }
      )
    );
  });
});
