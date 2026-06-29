import { createLazyFileRoute } from "@tanstack/react-router";
import { PageLoading } from "@workspace/ui/composed/page-loading";
import Purchasing from "@/sections/purchasing";

export const Route = createLazyFileRoute("/(main)/purchasing/")({
  pendingComponent: PageLoading,
  component: Purchasing,
});
