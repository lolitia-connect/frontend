"use client";

import { Chip } from "@heroui/react";
import { Button } from "@workspace/ui/components/button";
import { Link } from "@workspace/ui/lib/router-compat";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGlobalStore } from "@/stores/global";

export function Hero() {
  const { t } = useTranslation("main");
  const { common, user } = useGlobalStore();
  const { site } = common;

  return (
    <section className="flex flex-1 items-start py-12 sm:pt-20 lg:items-center lg:pb-24">
      <div className="flex min-w-0 max-w-2xl flex-col items-start gap-6">
        <h1 className="max-w-full text-balance font-semibold text-4xl tracking-tight sm:text-5xl lg:text-6xl">
          {t("welcome", "Welcome to")}
          <span className="wrap-anywhere mt-2 block text-accent">
            {site.site_name}
          </span>
        </h1>
        {site.site_desc && (
          <p className="max-w-xl text-pretty text-base text-muted leading-7 sm:text-lg">
            {site.site_desc}
          </p>
        )}
        <div className="flex w-full flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link to={user ? "/dashboard" : "/auth"}>
              {t("started", "Get Started")}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <a href="#plans">{t("view_plans", "View plans")}</a>
          </Button>
        </div>
        <div className="flex max-w-full flex-wrap gap-2">
          <Chip color="success" variant="soft">
            <ShieldCheck aria-hidden="true" className="size-4" />
            <Chip.Label>{t("secure_routing", "Secure routing")}</Chip.Label>
          </Chip>
          <Chip color="warning" variant="soft">
            <Zap aria-hidden="true" className="size-4" />
            <Chip.Label>{t("low_latency", "Low latency")}</Chip.Label>
          </Chip>
        </div>
      </div>
    </section>
  );
}
