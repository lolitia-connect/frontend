import { createLazyFileRoute } from "@tanstack/react-router";
import { PageLoading } from "@workspace/ui/composed/page-loading";
import Main from "@/sections/main";

export const Route = createLazyFileRoute("/(main)/")({
  pendingComponent: PageLoading,
  component: Main,
});
