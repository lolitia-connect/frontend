import { PageLoading } from "@workspace/ui/composed/page-loading";
import { createLazyFileRoute } from "@tanstack/react-router";
import LoginLogPage from "@/sections/log/login";

export const Route = createLazyFileRoute("/dashboard/log/login")({
  pendingComponent: PageLoading,
  component: LoginLogPage,
});
