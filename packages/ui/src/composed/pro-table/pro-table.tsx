"use client";

import { Table } from "@heroui/react";
import {
  type Cell,
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Spinner } from "@workspace/ui/components/spinner";
import Empty from "@workspace/ui/composed/empty";
import {
  ColumnFilter,
  type IParams,
} from "@workspace/ui/composed/pro-table/column-filter";
import { ColumnHeader } from "@workspace/ui/composed/pro-table/column-header";
import { resolveColumnMaxWidth } from "@workspace/ui/composed/pro-table/column-meta";
import { ColumnToggle } from "@workspace/ui/composed/pro-table/column-toggle";
import { Pagination } from "@workspace/ui/composed/pro-table/pagination";
import {
  SortableRow,
  SortHandle,
} from "@workspace/ui/composed/pro-table/sortable-row";
import { TruncatedCell } from "@workspace/ui/composed/pro-table/truncated-cell";
import { ProTableWrapper } from "@workspace/ui/composed/pro-table/wrapper";
import { RefreshButton } from "@workspace/ui/composed/refresh-button";
import { cn } from "@workspace/ui/lib/utils";
import type { TFunction } from "i18next";
import { ListRestart } from "lucide-react";
import type React from "react";
import {
  Fragment,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

export interface ProTableProps<TData, TValue> {
  action?: React.Ref<ProTableActions | undefined>;
  actions?: {
    render?: (row: TData) => React.ReactNode[];
    batchRender?: (rows: TData[]) => React.ReactNode[];
  };
  "aria-label"?: string;
  columns: ColumnDef<TData, TValue>[];
  empty?: React.ReactNode;
  header?: {
    title?: React.ReactNode;
    toolbar?: React.ReactNode | React.ReactNode[];
    hidden?: boolean;
  };
  initialFilters?: Record<string, unknown>;
  onFiltersChange?: (filters: TValue) => void;
  onSort?: (
    sourceId: string | number,
    targetId: string | number | null,
    items: TData[]
  ) => Promise<TData[]>;
  params?: IParams[];
  request: (
    pagination: {
      page: number;
      size: number;
    },
    filter: TValue
  ) => Promise<{ list: TData[]; total: number }>;
  texts?: Partial<{
    actions: string;
    asc: string;
    desc: string;
    hide: string;
    textRowsPerPage: string;
    textPageOf: (current: number, total: number) => string;
    selectedRowsText: (total: number) => string;
  }>;
}

export interface ProTableActions {
  refresh: () => void;
  reset: () => void;
}

export function ProTable<
  TData extends Record<string, unknown> & { id?: string | number },
  TValue extends Record<string, unknown>,
>({
  columns,
  request,
  params,
  header,
  actions,
  action,
  texts,
  empty,
  onSort,
  initialFilters,
  onFiltersChange,
  "aria-label": ariaLabel,
}: ProTableProps<TData, TValue>) {
  const { t } = useTranslation("components");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() => {
    if (initialFilters) {
      return Object.entries(initialFilters).map(([id, value]) => ({
        id,
        value,
      })) as ColumnFiltersState;
    }
    return [];
  });
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState<TData[]>([]);
  const [rowCount, setRowCount] = useState<number>(0);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const loadingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);

  const table = useReactTable({
    data,
    getRowId: (row, index) => String(row.id ?? index),
    columns: [
      ...(onSort
        ? [
            {
              id: "sortable",
              header: t("table.reorder", "Reorder"),
              cell: () => <SortHandle label={t("table.reorder", "Reorder")} />,
              enableSorting: false,
              enableHiding: false,
            },
          ]
        : []),
      ...(actions?.batchRender ? [createSelectColumn<TData, TValue>(t)] : []),
      ...columns.map(
        (column) =>
          ({
            enableSorting: false,
            ...column,
          }) as ColumnDef<TData, TValue>
      ),
      ...(actions?.render
        ? ([
            {
              id: "actions",
              header: texts?.actions || t("table.actions", "Actions"),
              cell: ({ row }) => (
                <div className="[&_.button]:wrap-normal flex w-max min-w-max items-center justify-end gap-2 whitespace-nowrap [&>*]:shrink-0 [&_.button]:whitespace-nowrap">
                  {actions?.render?.(row.original).map((item, index) => (
                    <Fragment key={index}>{item}</Fragment>
                  ))}
                </div>
              ),
              enableSorting: false,
              enableHiding: false,
            },
          ] as ColumnDef<TData, TValue>[])
        : []),
    ] as ColumnDef<TData, TValue>[],
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: (updater) => {
      setColumnFilters((previous) => {
        const next =
          typeof updater === "function" ? updater(previous) : updater;
        return next;
      });
      setPagination((previous) => ({ ...previous, pageIndex: 0 }));
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    manualPagination: true,
    manualFiltering: true,
    rowCount,
    manualSorting: true,
  });

  const fetchData = async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);
    try {
      const response = await request(
        {
          page: pagination.pageIndex + 1,
          size: pagination.pageSize,
        },
        Object.fromEntries(
          columnFilters.map((item) => [item.id, item.value])
        ) as TValue
      );
      setData(response.list);
      setRowCount(response.total);
    } catch (error) {
      console.log("Fetch data error:", error);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  };
  const reset = async () => {
    table.resetSorting();
    table.resetColumnFilters();
    table.resetGlobalFilter(true);
    table.resetColumnVisibility();
    table.resetRowSelection();
    table.resetPagination();
  };
  const ref = useRef<HTMLDivElement>(null);

  useImperativeHandle(action, () => ({
    refresh: fetchData,
    reset,
  }));

  useEffect(() => {
    onFiltersChange?.(
      Object.fromEntries(
        columnFilters.map((item) => [item.id, item.value])
      ) as TValue
    );
  }, [JSON.stringify(columnFilters)]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    JSON.stringify(columnFilters),
  ]);

  const selectedRows = table
    .getSelectedRowModel()
    .flatRows.map((row) => row.original);
  const selectedCount = selectedRows.length;
  const visibleColumns = table.getVisibleLeafColumns();
  const rowHeaderId =
    visibleColumns.find(
      (column) => !["sortable", "selected", "actions"].includes(column.id)
    )?.id ?? visibleColumns[0]?.id;

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-4" ref={ref}>
      {!header?.hidden && (
        <div className="flex flex-wrap-reverse items-center justify-between gap-4">
          <div className="min-w-0 max-w-full">
            {params ? (
              <ColumnFilter
                filters={Object.fromEntries(
                  columnFilters.map((item) => [item.id, item.value])
                )}
                params={params}
                table={table}
              />
            ) : (
              header?.title
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
            <RefreshButton onClick={fetchData} size="icon" variant="outline" />
            <ColumnToggle table={table} />
            <Button
              aria-label={t("table.reset", "Reset table")}
              onClick={reset}
              size="icon"
              variant="outline"
            >
              <ListRestart />
            </Button>
            {header?.toolbar}
          </div>
        </div>
      )}

      {selectedCount > 0 && actions?.batchRender && (
        <Alert className="flex items-center justify-between">
          <AlertTitle className="m-0">
            {texts?.selectedRowsText?.(selectedCount) ||
              `Selected ${selectedCount} rows`}
          </AlertTitle>
          <AlertDescription className="flex gap-2">
            {actions.batchRender(selectedRows)}
          </AlertDescription>
        </Alert>
      )}

      <div className="relative w-full min-w-0">
        <ProTableWrapper data={data} onSort={onSort} setData={setData}>
          <Table>
            <Table.ScrollContainer>
              <Table.Content
                aria-busy={isLoading}
                aria-label={
                  ariaLabel ??
                  (typeof header?.title === "string"
                    ? header.title
                    : t("table.data", "Data table"))
                }
              >
                <Table.Header>
                  {table
                    .getHeaderGroups()
                    .at(-1)
                    ?.headers.map((columnHeader) => (
                      <Table.Column
                        className={getTableHeaderClass(columnHeader.column.id)}
                        id={columnHeader.column.id}
                        isRowHeader={columnHeader.column.id === rowHeaderId}
                        key={columnHeader.id}
                      >
                        <ColumnHeader
                          header={columnHeader}
                          text={{
                            asc: texts?.asc,
                            desc: texts?.desc,
                            hide: texts?.hide,
                          }}
                        />
                      </Table.Column>
                    ))}
                </Table.Header>
                <Table.Body renderEmptyState={() => empty || <Empty />}>
                  {table.getRowModel().rows.map((row) => (
                    <Table.Row
                      data-selected={row.getIsSelected() || undefined}
                      id={row.id}
                      key={row.id}
                      render={
                        onSort
                          ? (props) => (
                              <SortableRow
                                {...(props as React.ComponentProps<"tr">)}
                                sortableId={row.id}
                              />
                            )
                          : undefined
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <Table.Cell
                          className={getTableCellClass(cell.column.id)}
                          key={cell.id}
                        >
                          {() => renderProTableCell(cell)}
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </ProTableWrapper>

        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-md bg-background/70 backdrop-blur-[1px]">
            <div className="rounded-full border bg-background p-3 shadow-sm">
              <Spinner className="size-6 text-muted" />
            </div>
          </div>
        )}
      </div>
      {rowCount > 0 && <Pagination table={table} />}
    </div>
  );
}

function createSelectColumn<TData, TValue>(
  t: TFunction
): ColumnDef<TData, TValue> {
  return {
    id: "selected",
    header: ({ table }) => (
      <Checkbox
        aria-label={t("table.selectAll", "Select all")}
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        slot={null}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={t("table.selectRow", "Select row")}
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        slot={null}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };
}

function getTableHeaderClass(columnId: string) {
  return cn("whitespace-nowrap", {
    "w-12": ["sortable", "selected"].includes(columnId),
    "text-end": columnId === "actions",
  });
}

function getTableCellClass(columnId: string) {
  return cn("whitespace-nowrap align-middle", {
    "w-12": ["sortable", "selected"].includes(columnId),
    "w-px": columnId === "actions",
  });
}

/**
 * Renders one body cell. Columns whose width is capped (network addresses by
 * default, or any column with an explicit `meta.proTable.maxWidth`) get the
 * cap plus a hover tooltip; every other column renders exactly as before.
 */
function renderProTableCell<TData, TValue>(cell: Cell<TData, TValue>) {
  const content = flexRender(cell.column.columnDef.cell, cell.getContext());
  const maxWidth = resolveColumnMaxWidth(cell.column);
  if (maxWidth === undefined) return content;
  return <TruncatedCell maxWidth={maxWidth}>{content}</TruncatedCell>;
}
