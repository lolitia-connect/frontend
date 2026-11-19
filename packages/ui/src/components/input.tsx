import { Input as HeroUIInput } from "@heroui/react";
import { cn } from "@workspace/ui/lib/utils";
import type * as React from "react";

type HeroUIInputProps = React.ComponentProps<typeof HeroUIInput>;

/**
 * Adopted from HeroUI v3's real `Input` (level A) — same `<input>` element, and
 * HeroUI's `input` BEM class now owns the field tokens, hover/focus/disabled
 * states and autofill handling.
 *
 * The `aria-invalid:` utilities are kept because HeroUI's own invalid styling is
 * driven by `[data-invalid="true"]` (set by its `TextField` context), whereas the
 * ~app call sites set `aria-invalid` directly on a standalone input.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <HeroUIInput
      className={cn(
        // HeroUI's `.input` does not set a width; the previous implementation was
        // `w-full min-w-0`, so those layout utilities are preserved here.
        "w-full min-w-0",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-field-foreground file:text-sm",
        "aria-invalid:border-danger aria-invalid:ring-[3px] aria-invalid:ring-danger/20 dark:aria-invalid:ring-danger/40",
        className
      )}
      type={type}
      {...(props as HeroUIInputProps)}
    />
  );
}

export { Input };
