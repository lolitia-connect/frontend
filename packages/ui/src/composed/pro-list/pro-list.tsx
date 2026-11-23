// @ts-nocheck
"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { LoadingBar } from "@workspace/ui/components/progress";
import { BlockLoading } from "@workspace/ui/composed/block-loading";
import Empty from "@workspace/ui/composed/empty";
import {
  ColumnFilter,
  type IParams,
} from "@workspace/ui/composed/pro-list/column-filter";
import { Pagination } from "@workspace/ui/composed/pro-list/pagination";
import { RefreshButton } from "@workspace/ui/composed/refresh-button";
import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@workspace/ui/lib/table";
import { cn } from "@workspace/ui/lib/utils";
import { ListRestart, RefreshCcw } from "lucide-react";
import type React from "react";
import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export interface ProListProps<TData, TValue> {
  action?: React.Ref<ProListActions | undefined>;
  batchRender?: (rows: TData[]) => React.ReactNode[];
  empty?: React.ReactNode;
  header?: {
    title?: React.ReactNode;
    toolbar?: React.ReactNode | React.ReactNode[];
  };
  params?: IParams[];
  renderItem: (item: TData, checkbox: React.ReactNode) => React.ReactNode;
  request: (
    pagination: {
      page: number;
      size: number;
    },
    filter: TValue
  ) => Promise<{ list: TData[]; total: number }>;
  texts?: Partial<{
    textRowsPerPage: string;
    textPageOf: (current: number, total: number) => string;
    selectedRowsText: (total: number) => string;
  }>;
}
export interface ProListActions {
  refresh: () => void;
  reset: () => void;
}

export function ProList<TData, TValue extends Record<string, unknown>>({
  request,
  params,
  header,
  batchRender,
  renderItem,
  action,
  texts,
  empty,
}: ProListProps<TData, TValue>) {
  const { t } = useTranslation("components");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [data, setData] = useState<TData[]>([]);
  const [rowCount, setRowCount] = useState<number>();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);

  const table = useReactTable({
    data,
    columns: [],
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      columnFilters,
      rowSelection,
      pagination,
    },
    manualPagination: true,
    manualFiltering: true,
    rowCount,
  });

  const fetchData = async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
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
      if (requestId !== requestIdRef.current) return;
      setData(response.list);
      setRowCount(response.total);
    } catch (error) {
      if (requestId === requestIdRef.current)
        console.log("Fetch data error:", error);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  const reset = async () => {
    table.resetColumnFilters();
    table.resetGlobalFilter(true);
    table.resetColumnVisibility();
    setRowSelection({});
    table.resetPagination();
  };

  useImperativeHandle(action, () => ({
    refresh: fetchData,
    reset,
  }));

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize, columnFilters]);

  const handleSelectionChange = (index: number, isSelected: boolean) => {
    setRowSelection((prevSelection) => ({
      ...prevSelection,
      [index]: isSelected,
    }));
  };

  const selectedRows = data.filter((_, index) => rowSelection[index]);
  const selectedCount = selectedRows.length;

  return (
    <div className="flex max-w-full flex-col gap-4 overflow-hidden">
      {(params || header) && (
        <div className="flex flex-wrap-reverse items-center justify-between gap-4">
          <div>
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
          <div className="flex flex-1 items-center justify-end gap-2">
            {params && params?.length > 0 && (
              <>
                <RefreshButton
                  className="h-8 w-8 p-2"
                  onClick={fetchData}
                  variant="outline"
                >
                  <RefreshCcw className="h-4 w-4" />
                </RefreshButton>
                <Button
                  aria-label={t("table.reset", "Reset table")}
                  className="h-8 w-8 p-2"
                  onClick={reset}
                  type="button"
                  variant="outline"
                >
                  <ListRestart className="h-4 w-4" />
                </Button>
              </>
            )}
            {header?.toolbar}
          </div>
        </div>
      )}

      {selectedCount > 0 && batchRender && (
        <Alert className="flex items-center justify-between">
          <AlertTitle className="m-0">
            {texts?.selectedRowsText?.(selectedCount) ||
              `Selected ${selectedCount} rows`}
          </AlertTitle>
          <AlertDescription className="flex gap-2">
            {batchRender(selectedRows)}
          </AlertDescription>
        </Alert>
      )}

      <div
        aria-busy={loading}
        className={cn("relative overflow-x-auto", {
          "rounded-xl border": data.length === 0,
        })}
      >
        <div className="grid grid-cols-1 gap-4">
          {data.length ? (
            data.map((item, index) => {
              const isSelected = !!rowSelection[index];

              const checkbox = (
                <Checkbox
                  aria-label={t("table.selectRow", "Select row")}
                  checked={isSelected}
                  onCheckedChange={(value) =>
                    handleSelectionChange(index, !!value)
                  }
                />
              );

              return <div key={index}>{renderItem(item, checkbox)}</div>;
            })
          ) : loading && rowCount === undefined ? (
            <BlockLoading minHeight="12rem" surface={false} />
          ) : (
            <div className="flex items-center justify-center py-24">
              {empty || <Empty />}
            </div>
          )}
        </div>

        {loading && rowCount !== undefined && (
          <LoadingBar className="absolute inset-x-0 top-0 z-20" />
        )}
      </div>
      {(rowCount ?? 0) > 0 && <Pagination table={table} />}
    </div>
  );
}
