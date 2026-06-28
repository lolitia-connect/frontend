import { PageLoading } from "@workspace/ui/composed/page-loading";
import { createLazyFileRoute } from "@tanstack/react-router";
import System from "@/sections/system";

export const Route = createLazyFileRoute("/dashboard/system/")({
  pendingComponent: PageLoading,
  component: System,
});
