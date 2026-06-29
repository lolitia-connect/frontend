import { createLazyFileRoute } from "@tanstack/react-router";
import { PageLoading } from "@workspace/ui/composed/page-loading";
import Affiliate from "@/sections/user/affiliate";

export const Route = createLazyFileRoute("/(main)/(user)/affiliate")({
  pendingComponent: PageLoading,
  component: Affiliate,
});
