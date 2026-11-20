"use client";

import { getV1PublicPortalSubscribe as getSubscription } from "@workspace/ui/services/user/user";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getContentLanguage } from "@/config/i18n";

const Content = dynamic(() =>
  import("./content").then((module) => module.Content)
);

export function ProductShowcase() {
  const { i18n } = useTranslation();
  const locale = getContentLanguage(i18n.language);
  const [subscriptionList, setSubscriptionList] = useState<API.Subscribe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const { data } = await getSubscription(
          {
            language: locale,
          },
          {
            skipErrorHandler: true,
          }
        );
        setSubscriptionList(data.data?.list || []);
      } catch (error) {
        console.error("Failed to fetch subscriptions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptions();
  }, [locale]);

  if (isLoading || subscriptionList.length === 0) return null;

  return <Content subscriptionData={subscriptionList} />;
}
