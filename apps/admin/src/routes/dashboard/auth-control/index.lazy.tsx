import { createLazyFileRoute } from "@tanstack/react-router";
import { PageLoading } from "@workspace/ui/composed/page-loading";
import AuthControl from "@/sections/auth-control";

export const Route = createLazyFileRoute("/dashboard/auth-control/")({
  pendingComponent: PageLoading,
  component: AuthControl,
});
