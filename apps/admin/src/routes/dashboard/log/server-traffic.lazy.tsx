import { createLazyFileRoute } from "@tanstack/react-router";
import { PageLoading } from "@workspace/ui/composed/page-loading";
import ServerTrafficLogPage from "@/sections/log/server-traffic";

export const Route = createLazyFileRoute("/dashboard/log/server-traffic")({
  pendingComponent: PageLoading,
  component: ServerTrafficLogPage,
});
