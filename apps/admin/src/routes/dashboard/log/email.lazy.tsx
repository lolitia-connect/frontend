import { PageLoading } from "@workspace/ui/composed/page-loading";
import { createLazyFileRoute } from "@tanstack/react-router";
import EmailLogPage from "@/sections/log/email";

export const Route = createLazyFileRoute("/dashboard/log/email")({
  pendingComponent: PageLoading,
  component: EmailLogPage,
});
