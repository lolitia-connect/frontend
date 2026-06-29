import { createLazyFileRoute } from "@tanstack/react-router";
import { PageLoading } from "@workspace/ui/composed/page-loading";
import Payment from "@/sections/payment";

export const Route = createLazyFileRoute("/dashboard/payment/")({
  pendingComponent: PageLoading,
  component: Payment,
});
