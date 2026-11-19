"use client";

import { Dropdown, Separator } from "@heroui/react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Icon } from "@workspace/ui/composed/icon";
import { useNavigate } from "@workspace/ui/lib/router-compat";
import { useTranslation } from "react-i18next";
import { useNavs } from "@/layout/navs";
import { useGlobalStore } from "@/stores/global";
import { Logout } from "@/utils/common";

export function UserNav() {
  const { t } = useTranslation("components");
  const { user, setUser } = useGlobalStore();
  const navigate = useNavigate();
  const navs = useNavs();

  const handleLogout = () => {
    setUser(undefined);
    Logout();
  };

  if (user) {
    return (
      <Dropdown>
        <Dropdown.Trigger className="flex cursor-pointer items-center gap-2 rounded-full border bg-background px-2 py-1.5 transition-colors duration-200 hover:bg-default">
          <Avatar className="h-6 w-6">
            <AvatarImage
              alt={user?.avatar ?? ""}
              className="object-cover"
              src={user?.avatar || undefined}
            />
            <AvatarFallback className="bg-linear-to-br from-accent/90 to-accent font-medium text-background">
              {user?.auth_methods?.[0]?.auth_identifier.toUpperCase().charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="max-w-10 truncate text-sm sm:max-w-[100px]">
            {user?.auth_methods?.[0]?.auth_identifier.split("@")[0]}
          </span>
          <Icon className="size-4 text-muted" icon="mdi:chevron-down" />
        </Dropdown.Trigger>
        <Dropdown.Popover className="w-64" placement="bottom end">
          <div className="flex items-center justify-start gap-2 p-2">
            <Avatar className="h-10 w-10">
              <AvatarImage
                alt={user?.avatar ?? ""}
                className="object-cover"
                src={user?.avatar || undefined}
              />
              <AvatarFallback className="bg-linear-to-br from-accent/90 to-accent text-background">
                {user?.auth_methods?.[0]?.auth_identifier
                  .toUpperCase()
                  .charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-0.5">
              <p className="font-medium text-sm leading-none">
                {user?.auth_methods?.[0]?.auth_identifier.split("@")[0]}
              </p>
              <p className="text-muted text-xs">
                {user?.auth_methods?.[0]?.auth_identifier}
              </p>
            </div>
          </div>
          <Dropdown.Menu aria-label="Actions">
            <Separator />
            {navs.map((nav) => (
              <Dropdown.Section key={nav.title}>
                {(nav.items || [nav]).map((item) => (
                  <Dropdown.Item
                    className="flex cursor-pointer items-center gap-2 py-2"
                    key={item.title}
                    onAction={() => {
                      navigate({ to: item.url });
                    }}
                  >
                    <Icon
                      className="size-4 flex-none text-muted"
                      icon={item.icon as string}
                    />
                    <span className="grow truncate">{item.title}</span>
                    <Icon
                      className="size-4 text-muted opacity-50"
                      icon="lucide:chevron-right"
                    />
                  </Dropdown.Item>
                ))}
              </Dropdown.Section>
            ))}
            <Separator />
            <Dropdown.Item
              className="flex cursor-pointer items-center gap-2 py-2 text-danger focus:text-danger"
              onAction={handleLogout}
            >
              <Icon className="size-4 flex-none" icon="uil:exit" />
              <span className="grow">{t("menu.logout", "Logout")}</span>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    );
  }
}
