import { createLazyFileRoute } from "@tanstack/react-router";
import { PageLoading } from "@workspace/ui/composed/page-loading";
import Subscribe from "@/sections/subscribe";

export const Route = createLazyFileRoute("/(main)/(user)/subscribe")({
  pendingComponent: PageLoading,
  component: Subscribe,
});
