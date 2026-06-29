import { createLazyFileRoute } from "@tanstack/react-router";
import { PageLoading } from "@workspace/ui/composed/page-loading";
import SubscribeLogPage from "@/sections/log/subscribe";

export const Route = createLazyFileRoute("/dashboard/log/subscribe")({
  pendingComponent: PageLoading,
  component: SubscribeLogPage,
});
