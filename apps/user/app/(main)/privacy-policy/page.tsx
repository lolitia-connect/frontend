"use client";

import { useQuery } from "@tanstack/react-query";
import { Markdown } from "@workspace/ui/composed/markdown";
import { getPrivacyPolicy } from "@workspace/ui/services/common/common";

export default function Page() {
  const { data = "" } = useQuery({
    queryKey: ["tos"],
    queryFn: async () => {
      const { data } = await getPrivacyPolicy();
      return data.data?.privacy_policy;
    },
  });
  return (
    <div className="container py-8">
      <Markdown>{data}</Markdown>
    </div>
  );
}
