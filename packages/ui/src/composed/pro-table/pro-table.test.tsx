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
import { createRef } from "react";
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

describe("ProTable native collection", () => {
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
