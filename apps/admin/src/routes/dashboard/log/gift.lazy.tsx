import { createLazyFileRoute } from "@tanstack/react-router";
import { PageLoading } from "@workspace/ui/composed/page-loading";
import GiftLogPage from "@/sections/log/gift";

export const Route = createLazyFileRoute("/dashboard/log/gift")({
  pendingComponent: PageLoading,
  component: GiftLogPage,
});
