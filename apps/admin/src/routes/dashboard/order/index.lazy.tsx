import { PageLoading } from "@workspace/ui/composed/page-loading";
import { createLazyFileRoute } from "@tanstack/react-router";
import Order from "@/sections/order";

export const Route = createLazyFileRoute("/dashboard/order/")({
  pendingComponent: PageLoading,
  component: Order,
});
