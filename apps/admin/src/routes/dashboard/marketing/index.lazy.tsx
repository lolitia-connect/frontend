import { PageLoading } from "@workspace/ui/composed/page-loading";
import { createLazyFileRoute } from "@tanstack/react-router";
import MarketingPage from "@/sections/marketing";

export const Route = createLazyFileRoute("/dashboard/marketing/")({
  pendingComponent: PageLoading,
  component: MarketingPage,
});
