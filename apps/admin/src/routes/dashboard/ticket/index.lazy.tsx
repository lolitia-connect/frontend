import { PageLoading } from "@workspace/ui/composed/page-loading";
import { createLazyFileRoute } from "@tanstack/react-router";
import Ticket from "@/sections/ticket";

export const Route = createLazyFileRoute("/dashboard/ticket/")({
  pendingComponent: PageLoading,
  component: Ticket,
});
