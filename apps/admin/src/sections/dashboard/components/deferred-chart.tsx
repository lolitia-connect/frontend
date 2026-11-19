"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

export function ChartPlaceholder({ tall = false }: { tall?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`${tall ? "h-[28rem]" : "h-[25rem]"} rounded-xl bg-default/30`}
    />
  );
}

export function DeferredChart({
  children,
  tall = false,
}: {
  children: ReactNode;
  tall?: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!container.current) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setVisible(true);
        observer.disconnect();
      },
      { rootMargin: "200px" }
    );
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-w-0" ref={container}>
      {visible ? children : <ChartPlaceholder tall={tall} />}
    </div>
  );
}
