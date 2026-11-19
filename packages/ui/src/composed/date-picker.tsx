"use client";

import { buttonVariants, Popover } from "@heroui/react";
import { Calendar } from "@workspace/ui/components/calendar";

import { cn } from "@workspace/ui/lib/utils";
import { intlFormat } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import * as React from "react";
import type { DayPicker } from "react-day-picker";

export function DatePicker({
  placeholder,
  value,
  onChange,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  placeholder?: string;
  value?: number;
  onChange?: (value?: number) => void;
}) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  );

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (onChange) {
      onChange(selectedDate?.getTime() || 0);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDate(undefined);
    if (onChange) {
      onChange(0);
    }
  };

  return (
    <Popover>
      <Popover.Trigger
        className={buttonVariants({
          variant: "outline",
          class: cn(
            "w-full justify-between font-normal",
            !value && "text-muted"
          ),
        })}
      >
        <span className="truncate">
          {value ? intlFormat(value) : <span>{placeholder}</span>}
        </span>
        <div className="flex items-center gap-2">
          {value && (
            <span
              className="flex cursor-pointer items-center"
              onClick={handleClear}
              onMouseDown={handleClear}
              role="button"
              tabIndex={0}
            >
              <X className="size-4 opacity-50 hover:opacity-100" />
            </span>
          )}
          <CalendarIcon className="size-4" />
        </div>
      </Popover.Trigger>
      <Popover.Content className="w-auto p-0" placement="bottom start">
        <Popover.Dialog aria-label="Details">
          <Calendar
            {...props}
            initialFocus
            mode="single"
            onSelect={handleSelect}
            selected={date}
          />
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
