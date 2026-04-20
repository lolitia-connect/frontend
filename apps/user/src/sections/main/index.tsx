import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useGlobalStore } from "@/stores/global";
import { GlobalMap } from "./global-map";
import { Hero } from "./hero";
import { ProductShowcase } from "./product-showcase";
import { Stats } from "./stats";

export default function Main() {
  const { user } = useGlobalStore();
  const navigate = useNavigate();

  const showLanding = import.meta.env.VITE_SHOW_LANDING_PAGE !== "false";

  useEffect(() => {
    if (user) {
      navigate({ to: "/dashboard" });
      return;
    }

    if (!showLanding) {
      navigate({ to: "/auth" });
    }
  }, [user, navigate, showLanding]);

  if (!showLanding) return null;

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.22),transparent_45%),radial-gradient(circle_at_20%_20%,rgba(251,207,232,0.35),transparent_30%),linear-gradient(to_bottom,rgba(255,255,255,0),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.2),transparent_42%),radial-gradient(circle_at_20%_20%,rgba(190,24,93,0.18),transparent_30%),linear-gradient(to_bottom,rgba(255,255,255,0),transparent_58%)]" />

      <div className="container space-y-14 py-8 sm:space-y-20 sm:py-12 lg:py-16">
        <Hero />
        <Stats />
        <ProductShowcase />
        <GlobalMap />
      </div>
    </main>
  );
}
