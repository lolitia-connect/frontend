import { PageLoading } from "@workspace/ui/composed/page-loading";
import { createLazyFileRoute } from "@tanstack/react-router";
import Servers from "@/sections/servers";

export const Route = createLazyFileRoute("/dashboard/servers")({
  pendingComponent: PageLoading,
  component: Servers,
});
