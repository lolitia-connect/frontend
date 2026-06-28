import { PageLoading } from "@workspace/ui/composed/page-loading";
import { createLazyFileRoute } from "@tanstack/react-router";
import TrafficStatistics from "@/sections/user/traffic-statistics";

export const Route = createLazyFileRoute("/(main)/(user)/traffic")({
  pendingComponent: PageLoading,
  component: TrafficStatistics,
});
