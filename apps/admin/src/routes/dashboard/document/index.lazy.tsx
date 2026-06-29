import { createLazyFileRoute } from "@tanstack/react-router";
import { PageLoading } from "@workspace/ui/composed/page-loading";
import Document from "@/sections/document";

export const Route = createLazyFileRoute("/dashboard/document/")({
  pendingComponent: PageLoading,
  component: Document,
});
