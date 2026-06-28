import { PageLoading } from "@workspace/ui/composed/page-loading";
import { createLazyFileRoute } from "@tanstack/react-router";
import Document from "@/sections/user/document";

export const Route = createLazyFileRoute("/(main)/(user)/document")({
  pendingComponent: PageLoading,
  component: Document,
});
