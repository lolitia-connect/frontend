"use client";

import { Autocomplete, ListBox, SearchField } from "@heroui/react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export type Option<T = string> = {
  value: T;
  label: string;
  children?: ReactNode;
};

type SelectionValue<T, M extends boolean> = M extends true ? T[] : T;

type ComboboxProps<T = string, M extends boolean = false> = {
  multiple?: M;
  options?: Option<T>[];
  placeholder?: string;
  value?: SelectionValue<T, M>;
  onChange: (value: SelectionValue<T, M>) => void;
  className?: string;
};

export function Combobox<T, M extends boolean = false>({
  multiple,
  options = [],
  placeholder = "Select...",
  value,
  onChange,
  className,
}: ComboboxProps<T, M>) {
  const { t } = useTranslation("components");
  const selected = options.flatMap((option, index) =>
    (
      multiple && Array.isArray(value)
        ? value.includes(option.value)
        : value === option.value
    )
      ? [String(index)]
      : []
  );

  return (
    <Autocomplete
      aria-label={placeholder}
      className={className}
      fullWidth
      onChange={(keys) => {
        const values = (
          Array.isArray(keys) ? keys : keys == null ? [] : [keys]
        ).flatMap((key) => {
          const option = options[Number(key)];
          return option ? [option.value] : [];
        });
        onChange(
          (multiple ? values : (values[0] ?? "")) as SelectionValue<T, M>
        );
      }}
      placeholder={placeholder}
      selectionMode={multiple ? "multiple" : "single"}
      value={multiple ? selected : (selected[0] ?? null)}
    >
      <Autocomplete.Trigger aria-label={placeholder}>
        <Autocomplete.Value className="min-w-0 truncate whitespace-nowrap" />
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter
          filter={(text, search) =>
            text.toLocaleLowerCase().includes(search.toLocaleLowerCase())
          }
        >
          <SearchField aria-label={t("search", "Search")}>
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder={t("search", "Search")} />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <ListBox renderEmptyState={() => t("noResults", "No results found")}>
            {options.map((option, index) => (
              <ListBox.Item
                id={String(index)}
                key={index}
                textValue={option.label}
              >
                {option.children ?? option.label}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}
