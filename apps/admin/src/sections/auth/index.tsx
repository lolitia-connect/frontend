"use client";

import { AuthShell } from "@workspace/ui/composed/auth-shell";
import { LanguageSwitch } from "@workspace/ui/composed/language-switch";
import { ThemeSwitch } from "@workspace/ui/composed/theme-switch";
import { Link, useNavigate } from "@workspace/ui/lib/router-compat";
import { useEffect } from "react";
import { useGlobalStore } from "@/stores/global";
import EmailAuthForm from "./email/auth-form";

export default function Auth() {
  const { common, user } = useGlobalStore();
  const { site } = common;

  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      navigate({ to: "/dashboard" });
    }
  }, [navigate, user]);

  return (
    <AuthShell>
      <Link
        className="mb-6 flex flex-col items-center gap-3 text-center"
        to="/"
      >
        {/* biome-ignore lint/performance/noImgElement: dynamic admin-configured logo URL; next/image needs statically configured remote patterns */}
        <img
          alt="logo"
          className="object-contain"
          height={48}
          src={site.site_logo || "/favicon.svg"}
          width={48}
        />
        <span className="max-w-full break-words font-semibold text-2xl">
          {site.site_name}
        </span>
      </Link>
      <div className="flex flex-col justify-center">
        <EmailAuthForm />
      </div>
      <div className="mt-8 flex items-center gap-5">
        <LanguageSwitch />
        <ThemeSwitch />
      </div>
    </AuthShell>
  );
}
