"use client";

import { Markdown } from "@workspace/ui/composed/markdown";
import { useQuery } from "@workspace/ui/hooks/query";
import { getTos } from "@workspace/ui/services/common/common";
import { useTranslation } from "react-i18next";

export default function Page() {
  const { t } = useTranslation("components");
  const { data = "" } = useQuery({
    queryKey: ["tos"],
    queryFn: async () => {
      const { data } = await getTos();
      return data.data?.tos_content;
    },
  });
  return (
    <main className="container py-8" id="main-content" tabIndex={-1}>
      <h1 className="sr-only">{t("footer.tos", "Terms of Service")}</h1>
      <Markdown>{data}</Markdown>
    </main>
  );
}
