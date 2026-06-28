import { PageLoading } from "@workspace/ui/composed/page-loading";
import { createLazyFileRoute } from "@tanstack/react-router";
import Profile from "@/sections/user/profile";

export const Route = createLazyFileRoute("/(main)/(user)/profile")({
  pendingComponent: PageLoading,
  component: Profile,
});
