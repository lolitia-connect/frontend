"use client";

import { Link } from "@tanstack/react-router";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { LanguageSwitch } from "@workspace/ui/composed/language-switch";
import { ThemeSwitch } from "@workspace/ui/composed/theme-switch";
import { useTranslation } from "react-i18next";
import { useGlobalStore } from "@/stores/global";
import EmailAuthForm from "./email/auth-form";
import { OAuthMethods } from "./oauth-methods";
import PhoneAuthForm from "./phone/auth-form";

export default function Main() {
  const { t } = useTranslation("auth");
  const { common } = useGlobalStore();
  const { site, auth } = common;

  const AUTH_METHODS = [
    {
      key: "email",
      enabled: auth.email.enable,
      children: <EmailAuthForm />,
    },
    {
      key: "mobile",
      enabled: auth.mobile.enable,
      children: <PhoneAuthForm />,
    },
  ].filter((method) => method.enabled);

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/50 px-5 py-7">
      <div className="flex w-full max-w-[520px] flex-col md:max-w-[560px] md:px-8 md:py-10 lg:rounded-2xl lg:bg-background lg:shadow">
        <div className="flex w-full max-w-[480px] flex-col items-stretch self-center">
          <Link
            className="mb-6 flex flex-col items-center gap-3 text-center"
            to="/"
          >
            {site.site_logo && (
              <img
                alt="logo"
                className="object-contain"
                height={48}
                src={site.site_logo}
                width={48}
              />
            )}
            <span className="max-w-full break-words font-semibold text-2xl">
              {site.site_name}
            </span>
          </Link>
          <div className="flex flex-col justify-center">
            <h1 className="mb-3 text-center font-bold text-2xl">
              {t("verifyAccount", "Verify Your Account")}
            </h1>
            <div className="mb-6 text-center font-medium text-muted-foreground">
              {t("verifyAccountDesc", "Please login or register to continue")}
            </div>
            {AUTH_METHODS.length === 1
              ? AUTH_METHODS[0]?.children
              : AUTH_METHODS[0] && (
                  <Tabs defaultValue={AUTH_METHODS[0].key}>
                    <TabsList className="mb-6 flex w-full *:flex-1">
                      {AUTH_METHODS.map((item) => (
                        <TabsTrigger key={item.key} value={item.key}>
                          {t(`methods.${item.key}`)}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {AUTH_METHODS.map((item) => (
                      <TabsContent key={item.key} value={item.key}>
                        {item.children}
                      </TabsContent>
                    ))}
                  </Tabs>
                )}
          </div>
          <div className="py-8">
            <OAuthMethods />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <LanguageSwitch />
              <ThemeSwitch />
            </div>
            <div className="flex gap-2 font-semibold text-primary text-sm">
              <Link to="/tos">{t("tos", "Terms of Service")}</Link>
              <span className="text-foreground/30">|</span>
              <Link to="/privacy-policy">
                {t("privacyPolicy", "Privacy Policy")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
