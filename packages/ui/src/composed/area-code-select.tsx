"use client";

import { ComboBox, Input, ListBox } from "@heroui/react";
import { Icon } from "@workspace/ui/composed/icon";
import { cn } from "@workspace/ui/lib/utils";
import { countries, type ICountry } from "@workspace/ui/utils/countries";
import { ChevronsUpDown } from "lucide-react";

interface AreaCodeSelectProps {
  className?: string;
  onChange?: (value: ICountry) => void;
  placeholder?: string;
  simple?: boolean;
  value?: string;
  whitelist?: string[];
}

const filterItems = (whitelist?: string[]) => {
  const baseItems = countries
    .filter((item) => !!item.phone)
    .flatMap((item) => {
      const phones = item.phone!.split(",");
      if (phones.length > 1) {
        return [...phones].map((phone) => ({
          ...item,
          phone,
        }));
      }
      return item;
    });

  if (!whitelist?.length) return baseItems;
  return baseItems.filter((item) => whitelist.includes(item.phone!));
};

export const AreaCodeSelect = ({
  value,
  onChange,
  className,
  placeholder = "Select Area Code",
  simple = false,
  whitelist,
}: AreaCodeSelectProps) => {
  const items = filterItems(whitelist);
  const selectedItem = items.find((item) => item.phone === value);

  return (
    <ComboBox
      aria-label={placeholder}
      className={cn("min-w-0", className)}
      onSelectionChange={(key) => {
        const item = items.find(
          (item) => `${item.alpha2}-${item.phone}` === key
        );
        if (item) onChange?.(item);
      }}
      selectedKey={
        selectedItem ? `${selectedItem.alpha2}-${selectedItem.phone}` : null
      }
    >
      <ComboBox.InputGroup>
        {selectedItem && (
          <Icon
            className="size-5 shrink-0"
            icon={`flagpack:${selectedItem.alpha2.toLowerCase()}`}
          />
        )}
        <Input placeholder={placeholder} />
        <ComboBox.Trigger aria-label={placeholder}>
          <ChevronsUpDown className="size-4" />
        </ComboBox.Trigger>
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox items={items}>
          {(item) => (
            <ListBox.Item
              id={`${item.alpha2}-${item.phone}`}
              textValue={`+${item.phone}${simple ? "" : ` (${item.name})`}`}
            >
              <Icon
                className="size-5 shrink-0"
                icon={`flagpack:${item.alpha2.toLowerCase()}`}
              />
              +{item.phone} ({item.name})
              <ListBox.ItemIndicator />
            </ListBox.Item>
          )}
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
};
