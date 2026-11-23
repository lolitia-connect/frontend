"use client";

import { Button } from "@workspace/ui/components/button";
import { type ComponentProps, type ReactNode, useState } from "react";

type AsyncButtonProps = Omit<
  ComponentProps<typeof Button>,
  "asChild" | "loading" | "onClick"
> & {
  icon?: ReactNode;
  onAction: () => Promise<unknown> | unknown;
};

export function AsyncButton({
  children,
  icon,
  onAction,
  type = "button",
  ...props
}: AsyncButtonProps) {
  const [pending, setPending] = useState(false);
  return (
    <Button
      {...props}
      loading={pending}
      onClick={async () => {
        if (pending) return;
        setPending(true);
        try {
          await onAction();
        } finally {
          setPending(false);
        }
      }}
      type={type}
    >
      {!pending && icon}
      {children}
    </Button>
  );
}
