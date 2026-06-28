import { PageLoading } from "@workspace/ui/composed/page-loading";
import { createLazyFileRoute } from "@tanstack/react-router";
import Announcement from "@/sections/user/announcement/index";

export const Route = createLazyFileRoute("/(main)/(user)/announcement")({
  pendingComponent: PageLoading,
  component: Announcement,
});
