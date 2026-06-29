import { createLazyFileRoute } from "@tanstack/react-router";
import { PageLoading } from "@workspace/ui/composed/page-loading";
import Nodes from "@/sections/nodes";

export const Route = createLazyFileRoute("/dashboard/nodes")({
  pendingComponent: PageLoading,
  component: Nodes,
});
