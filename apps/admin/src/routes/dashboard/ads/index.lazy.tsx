import { createLazyFileRoute } from "@tanstack/react-router";
import { PageLoading } from "@workspace/ui/composed/page-loading";
import Ads from "@/sections/ads";

export const Route = createLazyFileRoute("/dashboard/ads/")({
  pendingComponent: PageLoading,
  component: Ads,
});
