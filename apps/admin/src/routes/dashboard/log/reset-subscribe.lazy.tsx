import { createLazyFileRoute } from "@tanstack/react-router";
import { PageLoading } from "@workspace/ui/composed/page-loading";
import ResetSubscribeLogPage from "@/sections/log/reset-subscribe";

export const Route = createLazyFileRoute("/dashboard/log/reset-subscribe")({
  pendingComponent: PageLoading,
  component: ResetSubscribeLogPage,
});
