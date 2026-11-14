"use client";

import { Link, useNavigate } from "@tanstack/react-router";
import { LanguageSwitch } from "@workspace/ui/composed/language-switch";
import { ThemeSwitch } from "@workspace/ui/composed/theme-switch";
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
    <main className="flex min-h-screen items-center justify-center bg-muted/50 px-5 py-7">
      <div className="flex w-full max-w-[520px] flex-col md:max-w-[560px] md:px-8 md:py-10 lg:rounded-2xl lg:bg-background lg:shadow">
        <div className="flex w-full max-w-[480px] flex-col items-stretch self-center">
          <Link
            className="mb-6 flex flex-col items-center gap-3 text-center"
            to="/"
          >
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
        </div>
      </div>
    </main>
  );
}
