import { createLazyFileRoute } from "@tanstack/react-router";
import { PageLoading } from "@workspace/ui/composed/page-loading";
import User from "@/sections/user";

export const Route = createLazyFileRoute("/dashboard/user/")({
  pendingComponent: PageLoading,
  component: User,
});
