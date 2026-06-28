import { PageLoading } from "@workspace/ui/composed/page-loading";
import { createLazyFileRoute } from "@tanstack/react-router";
import Redemption from "@/sections/redemption";

export const Route = createLazyFileRoute("/dashboard/redemption/")({
  pendingComponent: PageLoading,
  component: Redemption,
});
