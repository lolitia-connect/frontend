import { PageLoading } from "@workspace/ui/composed/page-loading";
import { createLazyFileRoute } from "@tanstack/react-router";
import Announcement from "@/sections/announcement";

export const Route = createLazyFileRoute("/dashboard/announcement/")({
  pendingComponent: PageLoading,
  component: Announcement,
});
