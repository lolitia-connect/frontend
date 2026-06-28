import { PageLoading } from "@workspace/ui/composed/page-loading";
import { createLazyFileRoute } from "@tanstack/react-router";
import Subscribe from "@/sections/subscribe";

export const Route = createLazyFileRoute("/dashboard/subscribe/")({
  pendingComponent: PageLoading,
  component: Subscribe,
});
