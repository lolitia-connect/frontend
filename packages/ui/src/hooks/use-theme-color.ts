"use client";

import { useEffect, useState } from "react";

/**
 * Resolves a CSS custom property (e.g. `--color-primary-500`) to a concrete
 * colour string in the current theme.
 *
 * Needed because canvas-backed widgets — `qrcode.react`, recharts' SVG
 * `stroke`/`fill` attributes, the three-globe map — are handed raw values and
 * cannot resolve `var(...)` themselves, which is why those call sites used to
 * hardcode hex colours and drift away from the palette. Reading the computed
 * value keeps them on the theme tokens instead.
 *
 * Recomputes when the resolved value changes, so switching light/dark updates
 * the consumer without a reload.
 */
export function useThemeColor(variable: string, fallback = ""): string {
  const [color, setColor] = useState(fallback);

  useEffect(() => {
    const read = () => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(variable)
        .trim();
      if (value) {
        setColor(value);
      }
    };

    read();

    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributeFilter: ["class", "data-theme"],
      attributes: true,
    });

    return () => observer.disconnect();
  }, [variable]);

  return color;
}
