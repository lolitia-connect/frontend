import { useMemo } from "react";

export type RowData = unknown;
export type ColumnDef<TData = unknown, TValue = unknown> = {
  __types?: (data: TData, value: TValue) => void;
  id?: string;
  accessorKey?: string;
  header?:
    | string
    | ((context: {
        row: any;
        column: any;
        table: any;
        getValue: () => unknown;
      }) => any);
  cell?: (context: {
    row: any;
    column: any;
    table: any;
    getValue: () => unknown;
  }) => any;
  [key: string]: any;
};
export type ColumnFiltersState = Array<{ id: string; value: unknown }>;
export type SortingState = Array<{ id: string; desc: boolean }>;
export type VisibilityState = Record<string, boolean>;
export type Table<TData = unknown> = { __data?: TData } & any;
export type Header<TData = unknown, TValue = unknown> = {
  __types?: (data: TData, value: TValue) => void;
} & any;
export type Cell<TData = unknown, TValue = unknown> = {
  __types?: (data: TData, value: TValue) => void;
} & any;
export type CellContext<TData = unknown, TValue = unknown> = {
  __types?: (data: TData, value: TValue) => void;
} & any;

export function flexRender(renderer: any, context: any) {
  return typeof renderer === "function" ? renderer(context) : renderer;
}
export const getCoreRowModel = () => () => undefined;
export const getFilteredRowModel = getCoreRowModel;
export const getPaginationRowModel = getCoreRowModel;
export const getSortedRowModel = getCoreRowModel;

export function useReactTable(options: any) {
  const table = useMemo(() => {
    const columns = options.columns ?? [];
    const data = options.data ?? [];
    const isVisible = (column: any) =>
      options.state?.columnVisibility?.[column.id ?? column.accessorKey] !==
      false;
    const visibleColumns = columns.filter(isVisible);
    const makeCell = (column: any, row: any, index: number) => ({
      id: `${row.id}_${column.id ?? column.accessorKey ?? index}`,
      column: {
        ...column,
        id: column.id ?? column.accessorKey,
        columnDef: {
          ...column,
          cell: column.cell ?? ((context: any) => context.getValue()),
        },
      },
      getContext: () => ({
        table,
        row,
        column,
        getValue: () => row.getValue(column.id ?? column.accessorKey),
      }),
    });
    const makeRow = (original: any, index: number) => {
      const id = String(options.getRowId?.(original, index) ?? index);
      const getValue = (columnId: string) => {
        const def = columns.find(
          (column: any) => (column.id ?? column.accessorKey) === columnId
        );
        return def?.accessorFn
          ? def.accessorFn(original, index)
          : original[def?.accessorKey ?? columnId];
      };
      const row = {
        id,
        original,
        index,
        getValue,
        getVisibleCells: () =>
          visibleColumns.map((column: any) => makeCell(column, row, index)),
        getIsSelected: () => Boolean(options.state?.rowSelection?.[id]),
        getCanSelect: () => true,
        toggleSelected: (selected: boolean) =>
          options.onRowSelectionChange?.((previous: any) => ({
            ...previous,
            [id]: selected,
          })),
        getToggleSelectedHandler: () => (event: any) =>
          options.onRowSelectionChange?.((previous: any) => ({
            ...previous,
            [id]: event.target.checked,
          })),
      };
      return row;
    };
    return {
      options,
      getHeaderGroups: () => [
        {
          id: "header",
          headers: visibleColumns.map((column: any, index: number) => ({
            id: column.id ?? String(index),
            column: {
              ...column,
              id: column.id ?? column.accessorKey,
              columnDef: column,
              getCanSort: () => column.enableSorting !== false,
              getIsSorted: () => false,
              toggleSorting: () => undefined,
              getCanHide: () => column.enableHiding !== false,
              toggleVisibility: (visible: boolean) =>
                options.onColumnVisibilityChange?.((previous: any) => ({
                  ...previous,
                  [column.id ?? column.accessorKey]: visible,
                })),
            },
            isPlaceholder: false,
            getContext: () => ({
              table,
              header: { id: column.id ?? String(index) },
              column,
            }),
          })),
        },
      ],
      getRowModel: () => ({ rows: data.map(makeRow) }),
      getSelectedRowModel: () => {
        const rows = data
          .map(makeRow)
          .filter((row: any) => row.getIsSelected());
        return { rows, flatRows: rows };
      },
      getVisibleLeafColumns: () =>
        visibleColumns.map((column: any) => ({
          id: column.id ?? column.accessorKey,
          columnDef: column,
        })),
      getAllLeafColumns: () =>
        visibleColumns.map((column: any) => ({
          id: column.id ?? column.accessorKey,
          columnDef: column,
          accessorFn: column.accessorKey ? () => undefined : undefined,
          getCanHide: () => column.enableHiding !== false,
          getCanSort: () => column.enableSorting !== false,
          getIsSorted: () => false,
          toggleSorting: () => undefined,
          toggleVisibility: (visible: boolean) =>
            options.onColumnVisibilityChange?.((previous: any) => ({
              ...previous,
              [column.id ?? column.accessorKey]: visible,
            })),
          getIsVisible: () => true,
          getToggleVisibilityHandler: () => (event: any) =>
            options.onColumnVisibilityChange?.((previous: any) => ({
              ...previous,
              [column.id ?? column.accessorKey]: event.target.checked,
            })),
        })),
      getAllColumns: () =>
        columns.map((column: any) => ({
          id: column.id ?? column.accessorKey,
          columnDef: column,
          accessorFn: column.accessorKey ? () => undefined : undefined,
          getCanHide: () => column.enableHiding !== false,
          getCanSort: () => column.enableSorting !== false,
          getIsSorted: () => false,
          toggleSorting: () => undefined,
          toggleVisibility: (visible: boolean) =>
            options.onColumnVisibilityChange?.((previous: any) => ({
              ...previous,
              [column.id ?? column.accessorKey]: visible,
            })),
          getIsVisible: () =>
            options.state?.columnVisibility?.[
              column.id ?? column.accessorKey
            ] !== false,
          getToggleVisibilityHandler: () => (event: any) =>
            options.onColumnVisibilityChange?.((previous: any) => ({
              ...previous,
              [column.id ?? column.accessorKey]: event.target.checked,
            })),
        })),
      getColumn: (id: string) => ({
        id,
        columnDef: columns.find((column: any) => column.id === id) ?? {},
        getFilterValue: () =>
          options.state?.columnFilters?.find((filter: any) => filter.id === id)
            ?.value,
        setFilterValue: (value: any) =>
          options.onColumnFiltersChange?.((previous: any) => [
            ...previous.filter((filter: any) => filter.id !== id),
            { id, value },
          ]),
      }),
      setColumnFilters: (updater: any) =>
        options.onColumnFiltersChange?.(updater),
      getIsAllPageRowsSelected: () =>
        data.length > 0 &&
        data.every(
          (original: any, index: number) =>
            options.state?.rowSelection?.[
              String(options.getRowId?.(original, index) ?? index)
            ]
        ),
      getIsSomePageRowsSelected: () =>
        data.some(
          (original: any, index: number) =>
            options.state?.rowSelection?.[
              String(options.getRowId?.(original, index) ?? index)
            ]
        ),
      toggleAllPageRowsSelected: (selected: boolean) =>
        options.onRowSelectionChange?.(
          selected
            ? Object.fromEntries(
                data.map((original: any, index: number) => [
                  String(options.getRowId?.(original, index) ?? index),
                  true,
                ])
              )
            : {}
        ),
      getState: () => options.state ?? {},
      setPageIndex: (pageIndex: number) =>
        options.onPaginationChange?.((previous: any) => ({
          ...previous,
          pageIndex,
        })),
      nextPage: () =>
        options.onPaginationChange?.((previous: any) => ({
          ...previous,
          pageIndex: previous.pageIndex + 1,
        })),
      previousPage: () =>
        options.onPaginationChange?.((previous: any) => ({
          ...previous,
          pageIndex: Math.max(0, previous.pageIndex - 1),
        })),
      setPageSize: (pageSize: number) =>
        options.onPaginationChange?.((previous: any) => ({
          ...previous,
          pageSize,
        })),
      resetSorting: () => options.onSortingChange?.([]),
      resetColumnFilters: () => options.onColumnFiltersChange?.([]),
      resetGlobalFilter: (..._args: any[]) => undefined,
      resetColumnVisibility: () => options.onColumnVisibilityChange?.({}),
      resetRowSelection: () => options.onRowSelectionChange?.({}),
      resetPagination: () =>
        options.onPaginationChange?.({ pageIndex: 0, pageSize: 10 }),
      getPageCount: () =>
        Math.ceil(
          (options.rowCount ?? data.length) /
            (options.state?.pagination?.pageSize ?? 10)
        ),
      getCanPreviousPage: () => (options.state?.pagination?.pageIndex ?? 0) > 0,
      getCanNextPage: () =>
        (options.state?.pagination?.pageIndex ?? 0) <
        Math.ceil(
          (options.rowCount ?? data.length) /
            (options.state?.pagination?.pageSize ?? 10)
        ) -
          1,
    };
  }, [options]);
  return table;
}
