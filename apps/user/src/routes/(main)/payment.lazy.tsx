import { createLazyFileRoute } from "@tanstack/react-router";
import { PageLoading } from "@workspace/ui/composed/page-loading";
import Payment from "@/sections/user/payment";

export const Route = createLazyFileRoute("/(main)/payment")({
  pendingComponent: PageLoading,
  component: Payment,
});
