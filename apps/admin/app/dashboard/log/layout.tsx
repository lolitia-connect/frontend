"use client";

import { LogNavigation } from "@/sections/log/log-navigation";

export default function LogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <LogNavigation />
      {children}
    </div>
  );
}
