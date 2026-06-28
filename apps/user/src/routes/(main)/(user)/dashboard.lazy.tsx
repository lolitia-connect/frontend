import { PageLoading } from "@workspace/ui/composed/page-loading";
import { createLazyFileRoute } from "@tanstack/react-router";

import Dashboard from "@/sections/user/dashboard";

export const Route = createLazyFileRoute("/(main)/(user)/dashboard")({
  pendingComponent: PageLoading,
  component: Dashboard,
});
