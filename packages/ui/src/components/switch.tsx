"use client";

import { Switch as HeroSwitch } from "@heroui/react";
import { cn } from "@workspace/ui/lib/utils";
import type * as React from "react";

type SwitchProps = Omit<
  React.ComponentProps<typeof HeroSwitch>,
  "children" | "isSelected" | "defaultSelected" | "onChange" | "isDisabled"
> & {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (checked: boolean) => void;
};

function Switch({
  className,
  checked,
  defaultChecked,
  disabled,
  onChange,
  onCheckedChange,
  ...props
}: SwitchProps) {
  return (
    <HeroSwitch
      className={cn("peer", className)}
      defaultSelected={defaultChecked}
      isDisabled={disabled}
      isSelected={checked}
      onChange={onCheckedChange ?? onChange}
      {...props}
    >
      <HeroSwitch.Content>
        <HeroSwitch.Control>
          <HeroSwitch.Thumb />
        </HeroSwitch.Control>
      </HeroSwitch.Content>
    </HeroSwitch>
  );
}

export { Switch };
