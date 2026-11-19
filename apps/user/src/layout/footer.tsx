"use client";

import { Separator } from "@heroui/react";
import { Button } from "@workspace/ui/components/button";
import { Icon } from "@workspace/ui/composed/icon";
import { Link } from "@workspace/ui/lib/router-compat";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useGlobalStore } from "@/stores/global";

interface CustomData {
  community?: {
    discord?: string;
    facebook?: string;
    github?: string;
    instagram?: string;
    linkedin?: string;
    telegram?: string;
    twitter?: string;
  };
  contacts?: {
    address?: string;
    email?: string;
    telephone?: string;
  };
  website?: string;
}

export default function Footer() {
  const { t } = useTranslation("components");
  const { common } = useGlobalStore();
  const { site } = common;

  const customData = useMemo<CustomData>(() => {
    try {
      return JSON.parse(site.custom_data || "{}");
    } catch {
      return {};
    }
  }, [site.custom_data]);

  const links = useMemo(
    () => [
      {
        name: "email",
        icon: "uil:envelope",
        href: customData.contacts?.email
          ? `mailto:${customData.contacts.email}`
          : undefined,
      },
      {
        name: "telegram",
        icon: "uil:telegram",
        href: customData.community?.telegram,
      },
      {
        name: "twitter",
        icon: "uil:twitter",
        href: customData.community?.twitter,
      },
      {
        name: "discord",
        icon: "uil:discord",
        href: customData.community?.discord,
      },
      {
        name: "instagram",
        icon: "uil:instagram",
        href: customData.community?.instagram,
      },
      {
        name: "linkedin",
        icon: "uil:linkedin",
        href: customData.community?.linkedin,
      },
      {
        name: "github",
        icon: "uil:github",
        href: customData.community?.github,
      },
      {
        name: "facebook",
        icon: "uil:facebook",
        href: customData.community?.facebook,
      },
    ],
    [customData]
  );
  return (
    <footer>
      <Separator />
      <div className="container flex flex-wrap items-center justify-between gap-6 py-8 text-muted text-sm">
        <nav
          aria-label={t("accessibility.footerNavigation", "Community links")}
          className="flex flex-wrap items-center gap-1"
        >
          {links
            .filter((item) => item.href)
            .map((item) => (
              <Button asChild key={item.name} size="icon" variant="ghost">
                <a
                  aria-label={
                    item.name === "email"
                      ? t("footer.email", "Send us an email")
                      : t("footer.social", {
                          defaultValue: "Visit our {{name}}",
                          name: item.name,
                        })
                  }
                  href={item.href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icon className="size-5 text-foreground" icon={item.icon} />
                </a>
              </Button>
            ))}
        </nav>
        <div>
          <strong className="text-foreground">{site.site_name}</strong> ©{" "}
          {t("footer.copyright", "All rights reserved")}.
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
            <Button asChild className="h-auto p-0 text-muted" variant="link">
              <Link to="/tos">{t("footer.tos", "Terms of Service")}</Link>
            </Button>
            <Button asChild className="h-auto p-0 text-muted" variant="link">
              <Link to="/privacy-policy">
                {t("footer.privacyPolicy", "Privacy Policy")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
