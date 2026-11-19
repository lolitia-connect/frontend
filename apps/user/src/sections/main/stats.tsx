"use client";

import { Card } from "@heroui/react";
import { Globe2, Server, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Stats() {
  const { t } = useTranslation("main");

  const list = [
    {
      name: t("users", "Users"),
      description: t("users_description", "Trusted by users worldwide"),
      icon: Users,
    },
    {
      name: t("servers", "Servers"),
      description: t(
        "servers_description",
        "High-performance servers globally"
      ),
      icon: Server,
    },
    {
      name: t("locations", "Locations"),
      description: t("locations_description", "Available in multiple regions"),
      icon: Globe2,
    },
  ];
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {list.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.name}>
            <Card.Header className="flex-row items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <Card.Title render={(props) => <h2 {...props} />}>
                {item.name}
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <Card.Description>{item.description}</Card.Description>
            </Card.Content>
          </Card>
        );
      })}
    </section>
  );
}
