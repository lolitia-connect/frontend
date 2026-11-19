"use client";

import { Separator as HeroUISeparator } from "@heroui/react";
import type * as React from "react";

type SeparatorProps = React.ComponentProps<typeof HeroUISeparator> & {
  decorative?: boolean;
  asChild?: boolean;
};

/**
 * Adopted from HeroUI v3's real `Separator` (level A).
 *
 * Old `variant`-less API is preserved exactly: `orientation` (default
 * `"horizontal"`) and Radix's `decorative` (default `true`), which maps onto
 * HeroUI's `isDecorative` (`Separator` defaults it to `false`, so the mapping is
 * explicit to keep the old default).
 *
 * `asChild` has no HeroUI equivalent (HeroUI uses `render`), so the `asChild`
 * branch keeps rendering the Radix primitive with HeroUI's own
 * `separatorVariants` classes — the prop stays fully functional instead of being
 * silently dropped.
 *
 * `elementType="hr"` is required to avoid a dev-only react-aria warning:
 * react-aria's `Separator` computes `Element = elementType || 'hr'`, then renders
 * it through `DOMElement`, which asserts at runtime that the produced element's
 * `localName` matches — warning
 * `Expected <hr>, got <div>`
 * when it does not. HeroUI's own `SeparatorRoot` defaults `elementType` to
 * `"div"` while still passing a `render` function, which trips that assertion.
 * Passing `elementType="hr"` (react-aria's default) makes the assertion pass and
 * keeps the semantic `<hr>` element. For a vertical separator react-aria
 * substitutes `div` internally by design, and its `Element` differs, so the
 * explicit value is omitted there to avoid re-introducing the mismatch.
 */
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  asChild,
  ...props
}: SeparatorProps) {
  return (
    <HeroUISeparator
      className={className}
      // See the doc comment: react-aria's assertion compares against its own
      // default (`hr`), so match it for horizontal separators.
      elementType={orientation === "horizontal" ? "hr" : "div"}
      isDecorative={decorative}
      orientation={orientation}
      {...props}
    />
  );
}

export { Separator };
