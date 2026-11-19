"use client";

import { RadioGroup as HeroRadioGroup, Radio } from "@heroui/react";
import { cn } from "@workspace/ui/lib/utils";
import type * as React from "react";

type RadioGroupProps = Omit<
  React.ComponentProps<typeof HeroRadioGroup>,
  "value" | "defaultValue" | "onChange"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

function RadioGroup({
  className,
  value,
  defaultValue,
  onValueChange,
  ...props
}: RadioGroupProps) {
  return (
    <HeroRadioGroup
      className={cn("grid gap-3", className)}
      defaultValue={defaultValue}
      onChange={onValueChange}
      value={value}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  value,
  ...props
}: React.ComponentProps<typeof Radio>) {
  return (
    <Radio className={cn("peer", className)} value={value} {...props}>
      <Radio.Content>
        <Radio.Control>
          <Radio.Indicator />
        </Radio.Control>
      </Radio.Content>
    </Radio>
  );
}

export { RadioGroup, RadioGroupItem };
