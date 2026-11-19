"use client";

import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";
import { getCookie } from "@workspace/ui/lib/cookies";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/layout/header";
import { findNavByUrl, useNavs } from "./navs";
import { SidebarLeft } from "./sidebar-left";

export default function DashboardLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();
  const navs = useNavs();
  const pageTitle = findNavByUrl(navs, pathname).at(-1)?.title;

  useEffect(() => {
    const sidebarState = getCookie("sidebar_state");
    if (sidebarState !== undefined) {
      setOpen(sidebarState === "true");
    }
  }, []);

  return (
    <SidebarProvider defaultOpen={open}>
      <SidebarLeft />
      <SidebarInset className="relative flex-grow overflow-hidden">
        <Header />
        <div className="h-[calc(100vh-56px)] flex-grow gap-4 overflow-auto p-4">
          <h1 className="sr-only">{pageTitle}</h1>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
