import { createLazyFileRoute } from "@tanstack/react-router";
import { PageLoading } from "@workspace/ui/composed/page-loading";
import Product from "@/sections/product";

export const Route = createLazyFileRoute("/dashboard/product/")({
  pendingComponent: PageLoading,
  component: Product,
});
