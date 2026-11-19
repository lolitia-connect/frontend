"use client";

import {
  TabIndicator,
  Tabs,
  TabPanel as TabsContent,
  TabList as TabsList,
  TabListContainer as TabsListContainer,
  Tab as TabsTrigger,
} from "@heroui/react";
import { AuthShell } from "@workspace/ui/composed/auth-shell";
import { LanguageSwitch } from "@workspace/ui/composed/language-switch";
import { ThemeSwitch } from "@workspace/ui/composed/theme-switch";
import { Link } from "@workspace/ui/lib/router-compat";
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
    <AuthShell>
      <Link
        aria-label={
          site.site_name || t("components:accessibility.home", "Home")
        }
        className="mb-6 flex flex-col items-center gap-3 text-center"
        to="/"
      >
        {site.site_logo && (
          // biome-ignore lint/performance/noImgElement: dynamic admin-configured logo URL; next/image needs statically configured remote patterns
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
        <div className="mb-6 text-center font-medium text-muted">
          {t("verifyAccountDesc", "Please login or register to continue")}
        </div>
        {AUTH_METHODS.length === 1
          ? AUTH_METHODS[0]?.children
          : AUTH_METHODS[0] && (
              <Tabs
                className="min-w-0 max-w-full"
                defaultSelectedKey={AUTH_METHODS[0].key}
              >
                <TabsListContainer className="mb-6 min-w-0 max-w-full">
                  <TabsList aria-label={t("sections", "Sections")}>
                    {AUTH_METHODS.map((item) => (
                      <TabsTrigger
                        className="w-auto flex-1 whitespace-nowrap"
                        id={item.key}
                        key={item.key}
                      >
                        {t(`methods.${item.key}`)}
                        <TabIndicator />
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </TabsListContainer>
                {AUTH_METHODS.map((item) => (
                  <TabsContent id={item.key} key={item.key}>
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
        <div className="flex gap-2 font-semibold text-accent text-sm">
          <Link to="/tos">{t("tos", "Terms of Service")}</Link>
          <span className="text-foreground/30">|</span>
          <Link to="/privacy-policy">
            {t("privacyPolicy", "Privacy Policy")}
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
