import { createLazyFileRoute } from "@tanstack/react-router";
import { PageLoading } from "@workspace/ui/composed/page-loading";

import Wallet from "@/sections/user/wallet";

export const Route = createLazyFileRoute("/(main)/(user)/wallet")({
  pendingComponent: PageLoading,
  component: Wallet,
});
