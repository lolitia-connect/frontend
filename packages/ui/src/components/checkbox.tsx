"use client";

import { Checkbox as HeroCheckbox } from "@heroui/react";
import { cn } from "@workspace/ui/lib/utils";
import type * as React from "react";

type CheckboxProps = Omit<
  React.ComponentProps<typeof HeroCheckbox>,
  "children" | "isIndeterminate" | "isSelected" | "defaultSelected" | "onChange"
> & {
  checked?: boolean | "indeterminate";
  defaultChecked?: boolean | "indeterminate";
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
};

function Checkbox({
  className,
  checked,
  defaultChecked,
  onCheckedChange,
  ...props
}: CheckboxProps) {
  return (
    <HeroCheckbox
      className={cn("peer", className)}
      defaultSelected={defaultChecked === true}
      isIndeterminate={
        checked === "indeterminate" || defaultChecked === "indeterminate"
      }
      isSelected={checked === true}
      onChange={(selected) => {
        onCheckedChange?.(selected);
      }}
      {...props}
    >
      <HeroCheckbox.Content>
        <HeroCheckbox.Control>
          <HeroCheckbox.Indicator />
        </HeroCheckbox.Control>
      </HeroCheckbox.Content>
    </HeroCheckbox>
  );
}

export { Checkbox };
