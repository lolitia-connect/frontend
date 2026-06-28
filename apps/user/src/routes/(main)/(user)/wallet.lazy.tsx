import { PageLoading } from "@workspace/ui/composed/page-loading";
import { createLazyFileRoute } from "@tanstack/react-router";

import Wallet from "@/sections/user/wallet";

export const Route = createLazyFileRoute("/(main)/(user)/wallet")({
  pendingComponent: PageLoading,
  component: Wallet,
});
