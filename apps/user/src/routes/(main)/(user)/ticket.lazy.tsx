import { PageLoading } from "@workspace/ui/composed/page-loading";
import { createLazyFileRoute } from "@tanstack/react-router";
import Ticket from "@/sections/user/ticket";

export const Route = createLazyFileRoute("/(main)/(user)/ticket")({
  pendingComponent: PageLoading,
  component: Ticket,
});
