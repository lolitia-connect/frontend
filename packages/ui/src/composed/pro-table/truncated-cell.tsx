"use client";

import { Tooltip } from "@heroui/react";

import { type ReactNode, useState } from "react";

/** Reveal clipped addresses on pointer hover or keyboard focus. */
export function TruncatedCell({
  children,
  maxWidth,
}: {
  children: ReactNode;
  maxWidth: number;
}) {
  const [tooltip, setTooltip] = useState<string | null>(null);

  const reveal = (element: HTMLElement) => {
    const text = element.textContent ?? "";
    setTooltip(
      element.scrollWidth > element.clientWidth && text.length > 0 ? text : null
    );
  };

  const hide = () => setTooltip(null);

  return (
    <Tooltip isOpen={tooltip !== null}>
      <Tooltip.Trigger
        className="block w-full truncate"
        onBlur={hide}
        onFocus={(event) => reveal(event.currentTarget)}
        onPointerEnter={(event) => reveal(event.currentTarget)}
        onPointerLeave={hide}
        role="group"
        style={{ maxWidth }}
      >
        {children}
      </Tooltip.Trigger>
      <Tooltip.Content>{tooltip}</Tooltip.Content>
    </Tooltip>
  );
}
