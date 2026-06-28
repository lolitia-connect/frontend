import { PageLoading } from "@workspace/ui/composed/page-loading";
import { createLazyFileRoute } from "@tanstack/react-router";
import Dashboard from "@/sections/dashboard";

export const Route = createLazyFileRoute("/dashboard/")({
  pendingComponent: PageLoading,
  component: Dashboard,
});
