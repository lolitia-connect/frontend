"use client";

import { BlockLoading } from "@workspace/ui/composed/block-loading";
import { getV1PublicPortalSubscribe as getSubscription } from "@workspace/ui/services/user/user";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getContentLanguage } from "@/config/i18n";

const Content = dynamic(
  () => import("./content").then((module) => module.Content),
  { loading: () => <BlockLoading /> }
);

export function ProductShowcase() {
  const { i18n } = useTranslation();
  const locale = getContentLanguage(i18n.language);
  const [subscriptionList, setSubscriptionList] = useState<API.Subscribe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const requestRef = useRef<
    | {
        locale: string;
        promise: Promise<API.Subscribe[]>;
      }
    | undefined
  >(undefined);

  useEffect(() => {
    let request = requestRef.current;
    if (!request || request.locale !== locale) {
      const promise = getSubscription(
        {
          language: locale,
        },
        {
          skipErrorHandler: true,
        }
      ).then(({ data }) => data.data?.list || []);
      request = { locale, promise };
      requestRef.current = request;
    }

    let cancelled = false;
    request.promise
      .then((subscriptions) => {
        if (!cancelled) setSubscriptionList(subscriptions);
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Failed to fetch subscriptions:", error);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [locale]);

  if (isLoading) return <BlockLoading />;
  if (!subscriptionList.length) return null;

  return <Content subscriptionData={subscriptionList} />;
}
