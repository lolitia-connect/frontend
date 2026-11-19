"use client";

import { useQuery } from "@tanstack/react-query";
import { Markdown } from "@workspace/ui/composed/markdown";
import { getPrivacyPolicy } from "@workspace/ui/services/common/common";
import { useTranslation } from "react-i18next";

export default function Page() {
  const { t } = useTranslation("components");
  const { data = "" } = useQuery({
    queryKey: ["tos"],
    queryFn: async () => {
      const { data } = await getPrivacyPolicy();
      return data.data?.privacy_policy;
    },
  });
  return (
    <main className="container py-8" id="main-content" tabIndex={-1}>
      <h1 className="sr-only">{t("footer.privacyPolicy", "Privacy Policy")}</h1>
      <Markdown>{data}</Markdown>
    </main>
  );
}
