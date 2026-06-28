import { PageLoading } from "@workspace/ui/composed/page-loading";
import { createLazyFileRoute } from "@tanstack/react-router";
import DashboardLayout from "@/layout";

export const Route = createLazyFileRoute("/dashboard")({
  pendingComponent: PageLoading,
  component: DashboardLayout,
});
