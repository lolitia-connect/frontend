import { createLazyFileRoute } from "@tanstack/react-router";
import { PageLoading } from "@workspace/ui/composed/page-loading";
import ServiceMonitoring from "@/sections/user/servers";

export const Route = createLazyFileRoute("/(main)/(user)/servers")({
  pendingComponent: PageLoading,
  component: ServiceMonitoring,
});
