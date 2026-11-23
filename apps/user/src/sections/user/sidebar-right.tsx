"use client";

import { Card, toast } from "@heroui/react";
import { Button } from "@workspace/ui/components/button";
import { Sidebar, SidebarContent } from "@workspace/ui/components/sidebar";
import { Icon } from "@workspace/ui/composed/icon";
import { isBrowser } from "@workspace/ui/utils/index";
import CopyToClipboard from "react-copy-to-clipboard";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/display";
import Recharge from "@/sections/subscribe/recharge";
import { useGlobalStore } from "@/stores/global";

export function SidebarRight({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { user } = useGlobalStore();
  const { t } = useTranslation("layout");

  return (
    <Sidebar collapsible="none" side="right" {...props}>
      <SidebarContent className="*:gap-0 *:py-0">
        <Card>
          <Card.Header className="space-y-0 p-3 pb-2">
            <Card.Title className="font-medium text-sm">
              {t("accountBalance", "Account Balance")}
            </Card.Title>
          </Card.Header>
          <Card.Content className="flex flex-col items-start gap-1 p-3">
            <span className="font-bold text-2xl">
              <Display type="currency" value={user?.balance} />
            </span>
            <Recharge className="h-auto p-0" variant="link" />
          </Card.Content>
        </Card>
        <Card>
          <Card.Header className="space-y-0 p-3 pb-2">
            <Card.Title className="font-medium text-sm">
              {t("giftAmount", "Gift Amount")}
            </Card.Title>
          </Card.Header>
          <Card.Content className="p-3 font-bold text-2xl">
            <Display type="currency" value={user?.gift_amount} />
          </Card.Content>
        </Card>
        <Card>
          <Card.Header className="space-y-0 p-3 pb-2">
            <Card.Title className="font-medium text-sm">
              {t("commission", "Commission")}
            </Card.Title>
          </Card.Header>
          <Card.Content className="p-3 font-bold text-2xl">
            <Display type="currency" value={user?.commission} />
          </Card.Content>
        </Card>
        {user?.refer_code && (
          <Card>
            <Card.Header className="flex flex-row items-center justify-between space-y-0 p-3 pb-2">
              <Card.Title className="font-medium text-sm">
                {t("inviteCode", "Invite Code")}
              </Card.Title>
              <CopyToClipboard
                onCopy={(_text: string, result: boolean) => {
                  if (result) {
                    toast.success(t("copySuccess", "Copy Success"));
                  }
                }}
                text={`${isBrowser() && location?.origin}/auth?invite=${user?.refer_code}`}
              >
                <Button className="size-5 p-0" variant="ghost">
                  <Icon
                    className="text-2xl text-accent"
                    icon="mdi:content-copy"
                  />
                </Button>
              </CopyToClipboard>
            </Card.Header>
            <Card.Content className="truncate p-3 font-bold">
              {user?.refer_code}
            </Card.Content>
          </Card>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
