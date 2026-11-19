import { TextArea as HeroUITextarea } from "@heroui/react";
import { cn } from "@workspace/ui/lib/utils";
import type * as React from "react";

type HeroUITextareaProps = React.ComponentProps<typeof HeroUITextarea>;

/**
 * Adopted from HeroUI v3's real `TextArea` (level A) — same `<textarea>` element,
 * and HeroUI's `textarea` BEM class now owns the field tokens, hover/focus/
 * disabled states and autofill handling.
 *
 * `field-sizing-content` is kept (HeroUI does not set it) so the auto-growing
 * behaviour the old implementation provided stays intact, and the `aria-invalid:`
 * utilities are kept because call sites set `aria-invalid` on a standalone
 * textarea rather than through HeroUI's `TextField` context.
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <HeroUITextarea
      className={cn(
        // HeroUI's `.textarea` does not set a width; the previous implementation was
        // `w-full min-h-16`, so those layout utilities are preserved here.
        "field-sizing-content min-h-16 w-full",
        "aria-invalid:border-danger aria-invalid:ring-[3px] aria-invalid:ring-danger/20 dark:aria-invalid:ring-danger/40",
        className
      )}
      {...(props as HeroUITextareaProps)}
    />
  );
}

export { Textarea };
