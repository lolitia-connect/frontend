import { createLazyFileRoute } from "@tanstack/react-router";
import { PageLoading } from "@workspace/ui/composed/page-loading";
import Order from "@/sections/order";

export const Route = createLazyFileRoute("/dashboard/order/")({
  pendingComponent: PageLoading,
  component: Order,
});
