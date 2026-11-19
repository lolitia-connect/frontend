"use client";

import {
  AlertDialog,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Description,
} from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Icon } from "@workspace/ui/composed/icon";
import {
  getToolVersion as getServerVersion,
  postToolRestart as restartSystem,
} from "@workspace/ui/services/admin/admin";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import packageJson from "../../../../../../package.json";

export default function SystemVersionCard() {
  const { t } = useTranslation("tool");
  const [openRestart, setOpenRestart] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const { data: serverVersion } = useQuery({
    queryKey: ["getServerVersion"],
    queryFn: async () => {
      const { data } = await getServerVersion({ skipErrorHandler: true });
      return data.data?.version ?? null;
    },
    retry: 1,
  });

  return (
    <Card className="flex h-full flex-col justify-center gap-0 p-3">
      <CardHeader className="mb-2 p-0">
        <CardTitle
          className="flex items-center justify-between gap-2"
          render={(props) => <h2 {...props} />}
        >
          <span className="min-w-0 break-words">
            {t("systemServices", "System Services")}
          </span>
          {/* `shrink-0` keeps the action group at its natural size so the long
              title is the only thing that wraps. */}
          <div className="flex shrink-0 items-center space-x-2">
            <AlertDialog isOpen={openRestart} onOpenChange={setOpenRestart}>
              <Button size="sm" variant="destructive">
                {t("systemReboot", "System Reboot")}
              </Button>
              <AlertDialog.Backdrop>
                <AlertDialog.Container>
                  <AlertDialog.Dialog>
                    <AlertDialog.Header>
                      <AlertDialog.Heading>
                        {t("confirmSystemReboot", "Confirm System Reboot")}
                      </AlertDialog.Heading>
                      <Description>
                        {t(
                          "rebootDescription",
                          "Are you sure you want to reboot the system? This action cannot be undone."
                        )}
                      </Description>
                    </AlertDialog.Header>
                    <AlertDialog.Footer>
                      <Button slot="close" variant="secondary">
                        {t("cancel", "Cancel")}
                      </Button>
                      <Button
                        disabled={isRestarting}
                        onClick={async () => {
                          setIsRestarting(true);
                          try {
                            await restartSystem();
                            await new Promise((resolve) =>
                              setTimeout(resolve, 5000)
                            );
                            setOpenRestart(false);
                          } catch {
                            // The request layer reports the failure.
                          } finally {
                            setIsRestarting(false);
                          }
                        }}
                      >
                        {isRestarting && (
                          <Icon
                            className="mr-2 animate-spin"
                            icon="mdi:loading"
                          />
                        )}
                        {isRestarting
                          ? t("rebooting", "Rebooting...")
                          : t("confirmReboot", "Confirm Reboot")}
                      </Button>
                    </AlertDialog.Footer>
                  </AlertDialog.Dialog>
                </AlertDialog.Container>
              </AlertDialog.Backdrop>
            </AlertDialog>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-0">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary-50 text-primary-500">
              <Icon className="size-4" icon="mdi:web" />
            </span>
            <span className="font-medium text-sm">
              {t("webVersion", "Web Version")}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge>V{packageJson.version}</Badge>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary-50 text-primary-500">
              <Icon className="size-4" icon="mdi:server" />
            </span>
            <span className="font-medium text-sm">
              {t("serverVersion", "Server Version")}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge>{serverVersion ? `V${serverVersion}` : "—"}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
