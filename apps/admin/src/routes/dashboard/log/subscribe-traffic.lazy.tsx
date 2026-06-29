import { createLazyFileRoute } from "@tanstack/react-router";
import { PageLoading } from "@workspace/ui/composed/page-loading";
import SubscribeTrafficLogPage from "@/sections/log/subscribe-traffic";

export const Route = createLazyFileRoute("/dashboard/log/subscribe-traffic")({
  pendingComponent: PageLoading,
  component: SubscribeTrafficLogPage,
});
