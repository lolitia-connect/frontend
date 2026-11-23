"use client";

import { Spinner } from "@workspace/ui/components/spinner";
import { Icon } from "@workspace/ui/composed/icon";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Certification from "./certification";

export default function OAuthPage({
  platform,
  children,
}: {
  platform: string;
  children?: ReactNode;
}) {
  const { t } = useTranslation("auth");

  return (
    <Certification platform={platform}>
      <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <Icon className="size-12" icon={`logos:${platform}`} />
            <Spinner className="size-8" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h1 className="bg-gradient-to-r from-primary-500 via-primary-400 to-primary-300 bg-clip-text font-black text-transparent text-xl uppercase md:text-2xl">
              {platform}
            </h1>
            <p className="text-lg text-muted md:text-xl">
              {t("authenticating", "Authenticating...")}
            </p>
          </div>
        </div>
        {children}
      </div>
    </Certification>
  );
}
