import { PageLoading } from "@workspace/ui/composed/page-loading";
import { createLazyFileRoute } from "@tanstack/react-router";
import Main from "@/sections/main";

export const Route = createLazyFileRoute("/(main)/")({
  pendingComponent: PageLoading,
  component: Main,
});
