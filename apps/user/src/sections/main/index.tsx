"use client";

import { PageLoading } from "@workspace/ui/composed/page-loading";
import { useNavigate } from "@workspace/ui/lib/router-compat";
import { useEffect } from "react";
import { useGlobalStore } from "@/stores/global";
import { DeferredGlobe } from "./deferred-globe";
import { Hero } from "./hero";
import { ProductShowcase } from "./product-showcase";
import { Stats } from "./stats";

export default function Main() {
  const user = useGlobalStore((state) => state.user);
  const isLoadingUser = useGlobalStore((state) => state.isLoadingUser);
  const isLoadingCommon = useGlobalStore((state) => state.isLoadingCommon);
  const navigate = useNavigate();

  const showLanding = process.env.NEXT_PUBLIC_SHOW_LANDING_PAGE !== "false";

  useEffect(() => {
    // Wait for user info to load before making navigation decisions
    if (isLoadingUser) {
      return;
    }

    if (user) {
      navigate({ to: "/dashboard" });
      return;
    }

    if (!showLanding) {
      navigate({ to: "/auth" });
    }
  }, [user, isLoadingUser, navigate, showLanding]);

  if (!showLanding) return <PageLoading />;

  return (
    <main
      className="relative isolate overflow-hidden bg-background text-foreground"
      id="main-content"
      tabIndex={-1}
    >
      <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden">
        <DeferredGlobe enabled={!(isLoadingCommon || isLoadingUser || user)} />
        <div className="container relative z-10 flex min-h-[calc(100svh-4rem)] flex-col">
          <Hero />
        </div>
      </section>

      <div className="container relative z-10 space-y-12 py-8 sm:space-y-16 sm:py-12">
        <Stats />
        <ProductShowcase />
      </div>
    </main>
  );
}
