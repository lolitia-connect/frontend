import { PageLoading } from "@workspace/ui/composed/page-loading";
import { createLazyFileRoute } from "@tanstack/react-router";
import Group from "@/sections/group";

export const Route = createLazyFileRoute("/dashboard/group/")({
  pendingComponent: PageLoading,
  component: Group,
});
