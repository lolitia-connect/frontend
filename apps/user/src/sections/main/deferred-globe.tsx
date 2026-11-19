"use client";

import dynamic from "next/dynamic";
import { startTransition, useEffect, useState } from "react";

const GlobalMap = dynamic(
  () => import("./global-map").then((module) => module.GlobalMap),
  { ssr: false }
);

export function DeferredGlobe({ enabled }: { enabled: boolean }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let idle: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const show = () => startTransition(() => setReady(true));

    // Give the configured hero a paint before loading the decorative WebGL code.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        if (typeof requestIdleCallback === "function") {
          idle = requestIdleCallback(show, { timeout: 1500 });
        } else {
          timer = setTimeout(show, 0);
        }
      });
    });

    return () => {
      cancelAnimationFrame(frame);
      if (idle !== undefined) cancelIdleCallback(idle);
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [enabled]);

  return enabled && ready ? <GlobalMap /> : null;
}
