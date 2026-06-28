import { PageLoading } from "@workspace/ui/composed/page-loading";
import { createLazyFileRoute } from "@tanstack/react-router";
import CommissionLogPage from "@/sections/log/commission";

export const Route = createLazyFileRoute("/dashboard/log/commission")({
  pendingComponent: PageLoading,
  component: CommissionLogPage,
});
