"use client";

import { useQuery } from "@tanstack/react-query";
import { Markdown } from "@workspace/ui/composed/markdown";
import { getTos } from "@workspace/ui/services/common/common";

export default function Page() {
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
}
