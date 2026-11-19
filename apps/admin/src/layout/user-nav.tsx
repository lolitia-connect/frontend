"use client";

import {
  buttonVariants,
  Dropdown,
  Header,
  Kbd,
  Separator,
} from "@heroui/react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";

import { useTranslation } from "react-i18next";
import { useGlobalStore } from "@/stores/global";
import { Logout } from "@/utils/common";

export function UserNav() {
  const { t } = useTranslation("auth");
  const { user } = useGlobalStore();

  if (user) {
    return (
      <Dropdown>
        <Dropdown.Trigger
          className={`${buttonVariants({ variant: "primary", isIconOnly: true, class: undefined })} inline-flex items-center justify-center`}
        >
          <Avatar className="size-8">
            <AvatarImage alt={user?.avatar ?? ""} src={user?.avatar ?? ""} />
            <AvatarFallback className="rounded-none bg-transparent">
              {user?.auth_methods?.[0]?.auth_identifier.toUpperCase().charAt(0)}
            </AvatarFallback>
          </Avatar>
        </Dropdown.Trigger>
        <Dropdown.Popover className="w-56" placement="bottom end">
          <Header className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="font-medium text-sm leading-none">
                {user?.auth_methods?.[0]?.auth_identifier}
              </p>
              {/* <p className='text-xs leading-none text-muted'>ID: {user?.id}</p> */}
            </div>
          </Header>
          <Dropdown.Menu aria-label="Actions">
            {/* <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Billing
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>New Team</DropdownMenuItem>
          </DropdownMenuGroup> */}
            <Separator />
            <Dropdown.Item onAction={Logout}>
              {t("logout", "Logout")}
              <Kbd>⇧⌘Q</Kbd>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    );
  }
}
