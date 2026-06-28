import { PageLoading } from "@workspace/ui/composed/page-loading";
import { createLazyFileRoute } from "@tanstack/react-router";
import Purchasing from "@/sections/purchasing";

export const Route = createLazyFileRoute("/(main)/purchasing/")({
  pendingComponent: PageLoading,
  component: Purchasing,
});
