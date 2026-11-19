import { buttonVariants, Dropdown, Separator } from "@heroui/react";
import { flexRender, type Header } from "@tanstack/react-table";

import { cn } from "@workspace/ui/lib/utils";
import {
  ArrowDownIcon,
  ArrowDownUpIcon,
  ArrowUpIcon,
  EyeOffIcon,
} from "lucide-react";

interface ColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  header: Header<TData, TValue>;
  text?: Partial<{
    asc: string;
    desc: string;
    hide: string;
  }>;
}

export function ColumnHeader<TData, TValue>({
  header,
  className,
  text,
}: ColumnHeaderProps<TData, TValue>) {
  const column = header.column;
  const title = header.isPlaceholder
    ? null
    : flexRender(header.column.columnDef.header, header.getContext());
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex w-full items-center", className)}>
      <Dropdown>
        <Dropdown.Trigger
          className={buttonVariants({
            variant: "ghost",
            size: "md",
            class: "!bg-transparent flex h-8 w-full justify-start p-0 text-sm",
          })}
        >
          <span>{title}</span>
          {column.getIsSorted() === "desc" ? (
            <ArrowDownIcon className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "asc" ? (
            <ArrowUpIcon className="ml-2 h-4 w-4" />
          ) : (
            <ArrowDownUpIcon className="ml-2 h-4 w-4" />
          )}
        </Dropdown.Trigger>
        <Dropdown.Popover placement="bottom start">
          <Dropdown.Menu aria-label="Actions">
            <Dropdown.Item onAction={() => column.toggleSorting(false)}>
              <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted/70" />
              {text?.asc || "ASC"}
            </Dropdown.Item>
            <Dropdown.Item onAction={() => column.toggleSorting(true)}>
              <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted/70" />
              {text?.desc || "DESC"}
            </Dropdown.Item>
            {column.getCanHide() && (
              <>
                <Separator />
                <Dropdown.Item onAction={() => column.toggleVisibility(false)}>
                  <EyeOffIcon className="mr-2 h-3.5 w-3.5 text-muted/70" />
                  {text?.hide || "Hide"}
                </Dropdown.Item>
              </>
            )}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </div>
  );
}
