import { PageLoading } from "@workspace/ui/composed/page-loading";
import { createLazyFileRoute } from "@tanstack/react-router";
import BalanceLogPage from "@/sections/log/balance";

export const Route = createLazyFileRoute("/dashboard/log/balance")({
  pendingComponent: PageLoading,
  component: BalanceLogPage,
});
