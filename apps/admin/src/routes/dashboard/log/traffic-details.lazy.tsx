import { createLazyFileRoute } from "@tanstack/react-router";
import { PageLoading } from "@workspace/ui/composed/page-loading";
import TrafficDetailsPage from "@/sections/log/traffic-details";

export const Route = createLazyFileRoute("/dashboard/log/traffic-details")({
  pendingComponent: PageLoading,
  component: TrafficDetailsPage,
});
