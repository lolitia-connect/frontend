"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@workspace/ui/lib/router-compat";
import { getSubscription } from "@workspace/ui/services/user/portal";
import { useTranslation } from "react-i18next";
import Content from "./content";

export default function Purchasing() {
  const { id } = useSearch({ from: "/(main)/purchasing/" }) as { id: string };
  const { t, i18n } = useTranslation("components");
  const { data } = useQuery({
    queryKey: ["subscription", i18n.language],
    queryFn: async () => {
      const { data } = await getSubscription(
        {
          language: i18n.language,
        },
        {
          skipErrorHandler: true,
        }
      );
      return data.data?.list || [];
    },
  });

  const subscription = data?.find((item: API.Subscribe) => item.id === id);

  return (
    <main className="container space-y-16 pb-8" id="main-content" tabIndex={-1}>
      <h1 className="sr-only">{t("menu.subscribe", "Subscribe")}</h1>
      <Content subscription={subscription} />
    </main>
  );
}
