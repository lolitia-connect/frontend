import { createLazyFileRoute } from "@tanstack/react-router";
import { PageLoading } from "@workspace/ui/composed/page-loading";
import Auth from "@/sections/auth";

export const Route = createLazyFileRoute("/auth/")({
  pendingComponent: PageLoading,
  component: Auth,
});
