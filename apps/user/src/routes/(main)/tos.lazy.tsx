import { PageLoading } from "@workspace/ui/composed/page-loading";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Markdown } from "@workspace/ui/composed/markdown";
import { getTos } from "@workspace/ui/services/common/common";

export const Route = createLazyFileRoute("/(main)/tos")({
  pendingComponent: PageLoading,
  component: () => {
    const { data = "" } = useQuery({
      queryKey: ["tos"],
      queryFn: async () => {
        const { data } = await getTos();
        return data.data?.tos_content;
      },
    });
    return (
      <div className="container py-8">
        <Markdown>{data}</Markdown>
      </div>
    );
  },
});
