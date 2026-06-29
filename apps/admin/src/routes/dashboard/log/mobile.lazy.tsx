import { createLazyFileRoute } from "@tanstack/react-router";
import { PageLoading } from "@workspace/ui/composed/page-loading";
import MobileLogPage from "@/sections/log/mobile";

export const Route = createLazyFileRoute("/dashboard/log/mobile")({
  pendingComponent: PageLoading,
  component: MobileLogPage,
});
