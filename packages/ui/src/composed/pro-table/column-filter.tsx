"use client";

import type { Table } from "@tanstack/react-table";
import { Input } from "@workspace/ui/components/input";
import { Combobox } from "@workspace/ui/composed/combobox";
import { cn } from "@workspace/ui/lib/utils";

export interface IParams {
  key: string;
  options?: { label: string; value: string }[];
  placeholder?: string;
  type?: "text" | "select" | "date";
}
interface ColumnFilterProps<TData> {
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters?: any;
  params: IParams[];
  table: Table<TData>;
}

export function ColumnFilter<TData>({
  className,
  table,
  params,
  filters,
}: ColumnFilterProps<TData>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateFilter = (key: string, value: any) => {
    table.setColumnFilters((prev) => {
      const newFilters = prev.filter((filter) => filter.id !== key);
      if (value) {
        newFilters.push({ id: key, value });
      }
      return newFilters;
    });
  };

  const toDateInput = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    return `${yyyy}-${MM}-${dd}`;
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {params.map((param) => {
        if (param.options || param.type === "select") {
          return (
            <Combobox
              className="min-w-32 max-w-48 flex-1"
              key={param.key}
              onChange={(value) => {
                updateFilter(param.key, value);
              }}
              options={param.options}
              placeholder={param.placeholder || "Choose..."}
              value={filters[param.key] || ""}
            />
          );
        }
        if (param.type === "date") {
          const raw = filters[param.key];
          const inputValue =
            typeof raw === "number"
              ? toDateInput(new Date(raw))
              : typeof raw === "string"
                ? raw
                : "";
          return (
            <Input
              className="min-w-32 flex-1"
              key={param.key}
              onChange={(event) => {
                const v = event.target.value;
                updateFilter(param.key, v || "");
              }}
              placeholder={param.placeholder}
              type="date"
              value={inputValue}
            />
          );
        }
        return (
          <Input
            className="min-w-32 flex-1"
            key={param.key}
            onChange={(event) => updateFilter(param.key, event.target.value)}
            placeholder={param.placeholder || "Search..."}
            value={filters[param.key] || ""}
          />
        );
      })}
    </div>
  );
}
