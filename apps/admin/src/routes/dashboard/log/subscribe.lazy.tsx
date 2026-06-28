import { PageLoading } from "@workspace/ui/composed/page-loading";
import { createLazyFileRoute } from "@tanstack/react-router";
import SubscribeLogPage from "@/sections/log/subscribe";

export const Route = createLazyFileRoute("/dashboard/log/subscribe")({
  pendingComponent: PageLoading,
  component: SubscribeLogPage,
});
