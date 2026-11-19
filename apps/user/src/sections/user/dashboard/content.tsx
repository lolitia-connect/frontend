"use client";

import {
  Accordion,
  AccordionPanel as AccordionContent,
  AccordionHeading,
  AccordionIndicator,
  AccordionItem,
  AccordionTrigger,
  AlertDialog,
  Card,
  Description,
  TabIndicator,
  Tabs,
  TabList as TabsList,
  TabListContainer as TabsListContainer,
  Tab as TabsTrigger,
} from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { Icon } from "@workspace/ui/composed/icon";
import { RefreshButton } from "@workspace/ui/composed/refresh-button";
import { useThemeColor } from "@workspace/ui/hooks/use-theme-color";
import { Link } from "@workspace/ui/lib/router-compat";
import { cn } from "@workspace/ui/lib/utils";
import { getClient, getStat } from "@workspace/ui/services/common/common";
import {
  queryUserSubscribe,
  resetUserSubscribeToken,
} from "@workspace/ui/services/user/user";
import { differenceInDays, formatDate } from "@workspace/ui/utils/formatting";
import { isBrowser } from "@workspace/ui/utils/index";
import { QRCodeCanvas } from "qrcode.react";
import React, { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Display } from "@/components/display";
import { useGlobalStore } from "@/stores/global";
import { getPlatform } from "@/utils/common";
import {
  getSubscriptionUrlAvailability,
  isExpiredSubscription,
} from "@/utils/subscription";
import Subscribe from "../../subscribe";
import Renewal from "../../subscribe/renewal";
import ResetTraffic from "../../subscribe/reset-traffic";
import Unsubscribe from "../../subscribe/unsubscribe";

const platforms: (keyof API.DownloadLink)[] = [
  "windows",
  "mac",
  "linux",
  "ios",
  "android",
  "harmony",
];

export default function Content() {
  const { t } = useTranslation("dashboard");
  // `qrcode.react` paints onto a canvas and cannot resolve `var(...)`, so the
  // theme token has to be read as a concrete colour here.
  const qrColor = useThemeColor("--color-primary-500", "#ec4899");
  const { getUserSubscribe, getAppSubLink, commonError, isLoadingCommon } =
    useGlobalStore();

  const [protocol, setProtocol] = useState("");

  const { data: userSubscribe = [], refetch } = useQuery({
    queryKey: ["queryUserSubscribe"],
    queryFn: async () => {
      const { data } = await queryUserSubscribe();
      return data.data?.list || [];
    },
  });
  const { data: applications } = useQuery({
    queryKey: ["getClient"],
    queryFn: async () => {
      const { data } = await getClient();
      return data.data?.list || [];
    },
  });

  const availablePlatforms = React.useMemo(() => {
    if (!applications || applications.length === 0) return platforms;

    const platformsSet = new Set<keyof API.DownloadLink>();

    applications.forEach((app) => {
      if (app.download_link) {
        platforms.forEach((platform) => {
          if (app.download_link?.[platform]) {
            platformsSet.add(platform);
          }
        });
      }
    });

    return platforms.filter((platform) => platformsSet.has(platform));
  }, [applications]);

  const [platform, setPlatform] = useState<keyof API.DownloadLink>(() => {
    const detectedPlatform =
      getPlatform() === "macos"
        ? "mac"
        : (getPlatform() as keyof API.DownloadLink);
    return detectedPlatform;
  });

  React.useEffect(() => {
    if (
      availablePlatforms.length > 0 &&
      !availablePlatforms.includes(platform)
    ) {
      const firstAvailablePlatform = availablePlatforms[0];
      if (firstAvailablePlatform) {
        setPlatform(firstAvailablePlatform);
      }
    }
  }, [availablePlatforms, platform]);

  const { data } = useQuery({
    queryKey: ["getStat"],
    queryFn: async () => {
      const { data } = await getStat({
        skipErrorHandler: true,
      });
      return data.data;
    },
    refetchOnWindowFocus: false,
  });

  const statusWatermarks = {
    2: t("finished", "Finished"),
    3: t("expired", "Expired"),
    4: t("deducted", "Deducted"),
  };

  return (
    <>
      {userSubscribe.length ? (
        <>
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex min-w-0 items-center gap-1.5 font-semibold">
              <Icon className="size-5 shrink-0" icon="uil:servers" />
              <span className="truncate">
                {t("mySubscriptions", "My Subscriptions")}
              </span>
            </h2>
            <div className="flex shrink-0 gap-2">
              <RefreshButton
                onClick={() => refetch()}
                size="sm"
                variant="outline"
              >
                <Icon icon="uil:sync" />
              </RefreshButton>
              <Button
                aria-label={t("purchaseSubscription", "Purchase Subscription")}
                asChild
                size="sm"
              >
                <Link to="/subscribe">
                  <Icon icon="uil:shop" />
                  <span className="hidden whitespace-nowrap sm:inline">
                    {t("purchaseSubscription", "Purchase Subscription")}
                  </span>
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap justify-between gap-4">
            {availablePlatforms.length > 0 && (
              <Tabs
                className="w-full min-w-0 max-w-full md:w-auto"
                onSelectionChange={(key) =>
                  ((value) => setPlatform(value as keyof API.DownloadLink))(
                    String(key)
                  )
                }
                selectedKey={platform}
              >
                <TabsListContainer className="min-w-0 max-w-full">
                  <TabsList aria-label={t("sections", "Sections")}>
                    {availablePlatforms.map((item) => (
                      <TabsTrigger
                        className="w-auto flex-1 whitespace-nowrap px-1 lg:px-3"
                        id={item}
                        key={item}
                      >
                        <Icon
                          className="size-5"
                          icon={`${
                            {
                              windows: "mdi:microsoft-windows",
                              mac: "uil:apple",
                              linux: "uil:linux",
                              ios: "simple-icons:ios",
                              android: "uil:android",
                              harmony: "simple-icons:harmonyos",
                            }[item]
                          }`}
                        />
                        <TabIndicator />
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </TabsListContainer>
              </Tabs>
            )}
            {data?.protocol && data?.protocol.length > 1 && (
              <Tabs
                className="w-full min-w-0 max-w-full md:w-auto"
                onSelectionChange={(key) => setProtocol(String(key))}
                selectedKey={protocol}
              >
                <TabsListContainer className="min-w-0 max-w-full">
                  <TabsList aria-label={t("sections", "Sections")}>
                    {["all", ...(data?.protocol || [])].map((item) => (
                      <TabsTrigger
                        className="w-auto flex-1 whitespace-nowrap px-1 uppercase lg:px-3"
                        id={item === "all" ? "" : item}
                        key={item}
                      >
                        {item}
                        <TabIndicator />
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </TabsListContainer>
              </Tabs>
            )}
          </div>
          {userSubscribe.map((item) => {
            // 如果过期时间为0，说明是永久订阅，不应该显示过期状态
            const isActuallyExpired = isExpiredSubscription(item);
            const subscriptionUrls = getUserSubscribe(
              item.short,
              item.token,
              protocol
            );
            const subscriptionUrlAvailability = getSubscriptionUrlAvailability({
              error: Boolean(commonError),
              isLoading: isLoadingCommon,
              urls: subscriptionUrls,
            });
            const shouldShowWatermark =
              item.status === 2 || item.status === 4 || isActuallyExpired;

            return (
              <Card
                className={cn("relative", {
                  "relative opacity-80 grayscale": isActuallyExpired,
                  "relative hidden opacity-60 blur-[0.3px] grayscale":
                    item.status === 4,
                })}
                key={item.id}
              >
                {shouldShowWatermark && (
                  <div
                    className={cn(
                      "pointer-events-none absolute top-0 left-0 z-10 h-full w-full overflow-hidden mix-blend-difference brightness-150 contrast-200 invert-[0.2]",
                      {
                        "text-danger": item.status === 2,
                        "text-white": isActuallyExpired || item.status === 4,
                      }
                    )}
                  >
                    <div className="absolute inset-0">
                      {Array.from({ length: 16 }).map((_, i) => {
                        const row = Math.floor(i / 4);
                        const col = i % 4;
                        const top = 10 + row * 25 + (col % 2 === 0 ? 5 : -5);
                        const left = 5 + col * 30 + (row % 2 === 0 ? 0 : 10);

                        return (
                          <span
                            className="absolute rotate-[-30deg] whitespace-nowrap font-black text-lg opacity-40 shadow-[0px_0px_1px_var(--surface)]"
                            key={i}
                            style={{
                              top: `${top}%`,
                              left: `${left}%`,
                            }}
                          >
                            {
                              statusWatermarks[
                                item.status as keyof typeof statusWatermarks
                              ]
                            }
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
                <Card.Header className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
                  <Card.Title className="font-medium">
                    {item.subscribe.name}
                    <p className="mt-1 text-foreground/50 text-sm">
                      {t("expireAt", "Expires At")}:{" "}
                      {item.expire_time
                        ? formatDate(item.expire_time)
                        : t("noLimit", "No Limit")}
                    </p>
                  </Card.Title>
                  {item.status !== 4 && (
                    <div className="flex flex-wrap gap-2">
                      {!isActuallyExpired && (
                        <>
                          <AlertDialog>
                            <Button size="sm" variant="destructive">
                              {t("resetSubscription", "Reset Subscription")}
                            </Button>

                            <AlertDialog.Backdrop>
                              <AlertDialog.Container>
                                <AlertDialog.Dialog>
                                  <AlertDialog.Header>
                                    <AlertDialog.Heading>
                                      {t(
                                        "resetSubscriptionTitle",
                                        "After resetting, re-add your subscription in every app"
                                      )}
                                    </AlertDialog.Heading>
                                    <Description>
                                      {t(
                                        "resetSubscriptionDescription",
                                        "The old link and imported nodes stop working. Delete the old subscription in every app, then add the new link. Your plan, expiry date and used traffic are not affected."
                                      )}
                                    </Description>
                                  </AlertDialog.Header>
                                  <AlertDialog.Footer>
                                    <Button slot="close" variant="secondary">
                                      {t("cancel", "Cancel")}
                                    </Button>
                                    <Button
                                      onClick={async () => {
                                        await resetUserSubscribeToken({
                                          user_subscribe_id: item.id,
                                        });
                                        await refetch();
                                        toast.success(
                                          t("resetSuccess", "Reset Success")
                                        );
                                      }}
                                      slot="close"
                                    >
                                      {t("confirm", "Confirm")}
                                    </Button>
                                  </AlertDialog.Footer>
                                </AlertDialog.Dialog>
                              </AlertDialog.Container>
                            </AlertDialog.Backdrop>
                          </AlertDialog>
                          <ResetTraffic
                            id={item.id}
                            replacement={item.subscribe.replacement}
                            trafficUnlimited={item.traffic_unlimited}
                          />
                        </>
                      )}
                      {item.expire_time !== 0 && item.subscribe.sell && (
                        <Renewal id={item.id} subscribe={item.subscribe} />
                      )}
                      <Unsubscribe
                        allowDeduction={item.subscribe.allow_deduction}
                        id={item.id}
                        onSuccess={refetch}
                      />
                    </div>
                  )}
                </Card.Header>
                <Card.Content>
                  <ul className="grid grid-cols-2 gap-3 *:flex *:flex-col *:justify-between lg:grid-cols-4">
                    <li>
                      <span className="text-muted">{t("used", "Used")}</span>
                      <span className="font-bold text-2xl">
                        <Display
                          type="traffic"
                          unlimited={item.traffic_unlimited}
                          value={item.upload + item.download}
                        />
                      </span>
                    </li>
                    <li>
                      <span className="text-muted">
                        {t("totalTraffic", "Total Traffic")}
                      </span>
                      <span className="font-bold text-2xl">
                        <Display
                          type="traffic"
                          unlimited={item.traffic_unlimited}
                          value={item.traffic}
                        />
                      </span>
                    </li>
                    <li>
                      <span className="text-muted">
                        {t("nextResetDays", "Next Reset Days")}
                      </span>
                      <span className="font-semibold text-2xl">
                        {item.reset_time
                          ? differenceInDays(
                              new Date(item.reset_time),
                              new Date()
                            )
                          : t("noReset", "No Reset")}
                      </span>
                    </li>
                    <li>
                      <span className="text-muted">
                        {isActuallyExpired
                          ? t("expiredDays", "Days Expired")
                          : t("remainingDays", "Remaining Days")}
                      </span>
                      <span className="font-semibold text-2xl">
                        {item.expire_time
                          ? Math.abs(
                              differenceInDays(
                                new Date(item.expire_time),
                                new Date()
                              )
                            )
                          : t("noLimit", "No Limit")}
                      </span>
                    </li>
                  </ul>
                  <Separator className="mt-4" />
                  {subscriptionUrlAvailability !== "ready" && (
                    <p className="py-4 text-center text-muted text-sm">
                      {subscriptionUrlAvailability === "loading"
                        ? t(
                            "loadingSubscriptionConfig",
                            "Loading subscription configuration..."
                          )
                        : t(
                            "subscriptionConfigUnavailable",
                            "Subscription configuration is unavailable. Please refresh and try again."
                          )}
                    </p>
                  )}
                  <Accordion className="w-full" defaultExpandedKeys={["0"]}>
                    {subscriptionUrls.map((url, index) => (
                      <AccordionItem id={String(index)} key={url}>
                        <AccordionHeading>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex w-full flex-row items-center justify-between">
                              <Card.Title className="font-medium text-sm">
                                {t("subscriptionUrl", "Subscription URL")}{" "}
                                {index + 1}
                              </Card.Title>

                              <CopyToClipboard
                                onCopy={(_, result) => {
                                  if (result) {
                                    toast.success(
                                      t("copySuccess", "Copy Success")
                                    );
                                  }
                                }}
                                text={url}
                              >
                                <span
                                  className="mr-4 flex cursor-pointer rounded p-2 text-accent text-sm hover:bg-default"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Icon
                                    className="mr-2 size-5"
                                    icon="uil:copy"
                                  />
                                  {t("copy", "Copy")}
                                </span>
                              </CopyToClipboard>
                            </div>
                            <AccordionIndicator />
                          </AccordionTrigger>
                        </AccordionHeading>
                        <AccordionContent>
                          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                            {applications
                              ?.filter(
                                (application) =>
                                  !!(
                                    application.download_link?.[platform] &&
                                    application.scheme
                                  )
                              )
                              .map((application) => {
                                const downloadUrl =
                                  application.download_link?.[platform];

                                // Check if scheme template outputs the raw URL (which would be http(s)://)
                                // rather than the scheme prefix itself
                                const isHttpLink =
                                  application.scheme?.startsWith("${url}");

                                const handleCopy = (
                                  _: string,
                                  result: boolean
                                ) => {
                                  if (result) {
                                    const href = getAppSubLink(
                                      url,
                                      application.scheme
                                    );

                                    // Check if the generated link is a plain HTTP/HTTPS URL
                                    // If so, only copy to clipboard without triggering redirect
                                    const isPlainHttpUrl = /^https?:/i.test(
                                      href
                                    );

                                    if (isPlainHttpUrl) {
                                      toast.success(
                                        t("copySuccess", "Copy Success")
                                      );
                                      return;
                                    }

                                    const showSuccessMessage = () => {
                                      toast.success(
                                        <>
                                          <p>
                                            {t("copySuccess", "Copy Success")}
                                          </p>
                                          <br />
                                          <p>
                                            {t(
                                              "manualImportMessage",
                                              "Please import manually"
                                            )}
                                          </p>
                                        </>
                                      );
                                    };

                                    if (isBrowser() && href && !isHttpLink) {
                                      window.location.href = href;
                                      const checkRedirect = setTimeout(() => {
                                        if (window.location.href !== href) {
                                          showSuccessMessage();
                                        }
                                        clearTimeout(checkRedirect);
                                      }, 1000);
                                      return;
                                    }

                                    showSuccessMessage();
                                  }
                                };

                                return (
                                  <div
                                    className="flex size-full flex-col items-center justify-between gap-2 text-muted text-xs"
                                    key={application.name}
                                  >
                                    <span>{application.name}</span>

                                    {application.icon && (
                                      // biome-ignore lint/performance/noImgElement: dynamic remote application icon URL
                                      <img
                                        alt={application.name}
                                        className="p-1"
                                        height={64}
                                        src={application.icon}
                                        width={64}
                                      />
                                    )}
                                    <div className="flex w-full flex-wrap justify-center gap-1">
                                      {downloadUrl && (
                                        <Button
                                          asChild
                                          className="px-1.5"
                                          size="sm"
                                          variant="secondary"
                                        >
                                          <a
                                            href={downloadUrl}
                                            rel="noopener noreferrer"
                                            target="_blank"
                                          >
                                            {t("download", "Download")}
                                          </a>
                                        </Button>
                                      )}

                                      {application.scheme && (
                                        <CopyToClipboard
                                          onCopy={handleCopy}
                                          text={url}
                                        >
                                          <Button className="p-2" size="sm">
                                            {isHttpLink
                                              ? t(
                                                  "clickToCopy",
                                                  "Click to Copy"
                                                )
                                              : t("import", "Import")}
                                          </Button>
                                        </CopyToClipboard>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            <div className="hidden size-full flex-col items-center justify-between gap-2 text-muted text-sm lg:flex">
                              <span>{t("qrCode", "QR Code")}</span>
                              <QRCodeCanvas
                                bgColor="transparent"
                                fgColor={qrColor}
                                size={80}
                                value={url}
                              />
                              <span className="text-center">
                                {t("scanToSubscribe", "Scan to Subscribe")}
                              </span>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </Card.Content>
              </Card>
            );
          })}
        </>
      ) : (
        <>
          <h2 className="flex items-center gap-1.5 font-semibold">
            <Icon className="size-5" icon="uil:shop" />
            {t("purchaseSubscription", "Purchase Subscription")}
          </h2>
          <Subscribe />
        </>
      )}
    </>
  );
}
