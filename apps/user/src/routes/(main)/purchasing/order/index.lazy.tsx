import { PageLoading } from "@workspace/ui/composed/page-loading";
import { createLazyFileRoute } from "@tanstack/react-router";
import Order from "@/sections/purchasing/order";

export const Route = createLazyFileRoute("/(main)/purchasing/order/")({
  pendingComponent: PageLoading,
  component: Order,
});
