import { createLazyFileRoute } from "@tanstack/react-router";
import { PageLoading } from "@workspace/ui/composed/page-loading";
import Coupon from "@/sections/coupon";

export const Route = createLazyFileRoute("/dashboard/coupon/")({
  pendingComponent: PageLoading,
  component: Coupon,
});
