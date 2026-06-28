import { PageLoading } from "@workspace/ui/composed/page-loading";
import { createLazyFileRoute } from "@tanstack/react-router";
import BindPage from "@/sections/bind";

export const Route = createLazyFileRoute("/bind/$platform")({
  pendingComponent: PageLoading,
  component: () => {
    const { platform } = Route.useParams();
    return <BindPage platform={platform} />;
  },
});
