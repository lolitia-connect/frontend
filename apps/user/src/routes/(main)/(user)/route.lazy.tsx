import { createLazyFileRoute } from "@tanstack/react-router";
import { PageLoading } from "@workspace/ui/composed/page-loading";
import UserLayout from "@/sections/user/layout";

export const Route = createLazyFileRoute("/(main)/(user)")({
  pendingComponent: PageLoading,
  component: UserLayout,
});
