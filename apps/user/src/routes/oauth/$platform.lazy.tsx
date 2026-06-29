import { createLazyFileRoute } from "@tanstack/react-router";
import { PageLoading } from "@workspace/ui/composed/page-loading";
import OAuthPage from "@/sections/oauth";

export const Route = createLazyFileRoute("/oauth/$platform")({
  pendingComponent: PageLoading,
  component: () => {
    const { platform } = Route.useParams();
    return <OAuthPage platform={platform} />;
  },
});
