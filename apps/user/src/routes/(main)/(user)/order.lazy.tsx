import { createLazyFileRoute } from "@tanstack/react-router";
import { PageLoading } from "@workspace/ui/composed/page-loading";
import Order from "@/sections/user/order";

export const Route = createLazyFileRoute("/(main)/(user)/order")({
  pendingComponent: PageLoading,
  component: Order,
});
