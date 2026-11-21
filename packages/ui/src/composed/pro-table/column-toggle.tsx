"use client";

import { Button, Dropdown, Tooltip } from "@heroui/react";
import type { Table } from "@tanstack/react-table";
import { ListTodoIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface ColumnToggleProps<TData> {
  table: Table<TData>;
}

export function ColumnToggle<TData>({ table }: ColumnToggleProps<TData>) {
  const { t } = useTranslation("components");
  const columns = table
    .getAllColumns()
    .filter((column) => column.accessorFn && column.getCanHide());
  const visible = table
    .getAllColumns()
    .filter((column) => column.getIsVisible());
  const label = t("table.columns", "Choose columns");

  return (
    <Dropdown>
      <Tooltip>
        <Button aria-label={label} isIconOnly variant="outline">
          <ListTodoIcon />
        </Button>
        <Tooltip.Content>{label}</Tooltip.Content>
      </Tooltip>
      <Dropdown.Popover placement="bottom end">
        <Dropdown.Menu
          aria-label={label}
          disabledKeys={
            visible.length === 1 ? visible.map((column) => column.id) : []
          }
          onSelectionChange={(keys) => {
            for (const column of columns) {
              const selected = keys === "all" || keys.has(column.id);
              if (selected !== column.getIsVisible())
                column.toggleVisibility(selected);
            }
          }}
          selectedKeys={visible.map((column) => column.id)}
          selectionMode="multiple"
        >
          {columns.map((column) => (
            <Dropdown.Item
              id={column.id}
              key={column.id}
              shouldCloseOnSelect={false}
              textValue={
                typeof column.columnDef.header === "string"
                  ? column.columnDef.header
                  : column.id
              }
            >
              {column.columnDef.header as ReactNode}
              <Dropdown.ItemIndicator />
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
