import { createLazyFileRoute } from "@tanstack/react-router";
import { PageLoading } from "@workspace/ui/composed/page-loading";
import RegisterLogPage from "@/sections/log/register";

export const Route = createLazyFileRoute("/dashboard/log/register")({
  pendingComponent: PageLoading,
  component: RegisterLogPage,
});
