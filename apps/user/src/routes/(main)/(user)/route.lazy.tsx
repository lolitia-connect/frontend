import { PageLoading } from "@workspace/ui/composed/page-loading";
import { createLazyFileRoute } from "@tanstack/react-router";
import UserLayout from "@/sections/user/layout";

export const Route = createLazyFileRoute("/(main)/(user)")({
  pendingComponent: PageLoading,
  component: UserLayout,
});
