import { PageLoading } from "@workspace/ui/composed/page-loading";
import { createLazyFileRoute } from "@tanstack/react-router";
import Auth from "@/sections/auth";

export const Route = createLazyFileRoute("/")({
  pendingComponent: PageLoading,
  component: Auth,
});
