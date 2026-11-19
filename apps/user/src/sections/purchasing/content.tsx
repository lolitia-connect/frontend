"use client";

import { Card } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { EnhancedInput } from "@workspace/ui/composed/enhanced-input";
import { Icon } from "@workspace/ui/composed/icon";
import { useNavigate } from "@workspace/ui/lib/router-compat";
import { cn } from "@workspace/ui/lib/utils";
import { prePurchaseOrder } from "@workspace/ui/services/user/portal";
import { useCallback, useEffect, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { SubscribeBilling } from "@/sections/subscribe/billing";
import CouponInput from "@/sections/subscribe/coupon-input";
import { SubscribeDetail } from "@/sections/subscribe/detail";
import DurationSelector from "@/sections/subscribe/duration-selector";
import PaymentMethods from "@/sections/subscribe/payment-methods";
import { useGlobalStore } from "@/stores/global";
import { useCreateOrder } from "./create-order";

export default function Content({
  subscription,
}: {
  subscription?: API.Subscribe;
}) {
  const { t } = useTranslation("subscribe");
  const unitTimeMap: Record<string, string> = {
    Day: t("Day", "Day"),
    Hour: t("Hour", "Hour"),
    Minute: t("Minute", "Minute"),
    Month: t("Month", "Month"),
    NoLimit: t("NoLimit", "No Limit"),
    Year: t("Year", "Year"),
  };
  const { common, user } = useGlobalStore();
  const navigate = useNavigate();
  const createOrder = useCreateOrder();
  const [params, setParams] = useState<API.PortalPurchaseRequest>({
    quantity: 1,
    subscribe_id: "",
    payment: "-1",
    coupon: "",
    auth_type: "email",
    identifier: "",
    password: "",
  });
  const [loading, startTransition] = useTransition();
  const [isEmailValid, setIsEmailValid] = useState({
    valid: false,
    message: "",
  });

  const { data: order } = useQuery({
    enabled: !!subscription?.id && !!params.payment,
    queryKey: [
      "preCreateOrder",
      params.coupon,
      params.quantity,
      params.payment,
    ],
    queryFn: async () => {
      const { data } = await prePurchaseOrder({
        ...params,
        subscribe_id: subscription?.id ?? "",
      } as API.PrePurchaseOrderRequest);
      return data.data;
    },
  });

  useEffect(() => {
    if (subscription) {
      setParams((prev) => ({
        ...prev,
        quantity: 1,
        subscribe_id: subscription?.id,
      }));
    }
  }, [subscription]);

  const handleChange = useCallback(
    (field: keyof typeof params, value: string | number) => {
      setParams((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    startTransition(async () => {
      try {
        const { data } = await createOrder({
          type: "purchase",
          payment_id: params.payment,
          subscribe_id: params.subscribe_id,
          quantity: params.quantity,
          coupon: params.coupon,
          guest: user
            ? undefined
            : {
                auth_type: params.auth_type,
                identifier: params.identifier,
                password: params.password || crypto.randomUUID(),
                invite_code: localStorage.getItem("invite") || undefined,
              },
          // Real App Router paths. The pre-migration app routed on the hash
          // (`#/payment`, `#/purchasing/order`); a fragment is not a route under
          // the App Router, so the gateway would send the guest back to
          // `/purchasing` instead of the order page they were waiting on.
          return_url: `${window.location.origin}/${user ? "payment" : "purchasing/order"}`,
        });
        const order_no = data.data?.order.order_no;
        if (order_no) {
          navigate({
            to: user ? "/payment" : "/purchasing/order",
            search: { order_no },
          });
        }
      } catch (error) {
        console.log(error);
      }
    });
  }, [params, navigate, createOrder, user]);

  const passwordLength = params.password?.length ?? 0;
  const isPasswordInvalid =
    passwordLength > 0 && (passwordLength < 8 || passwordLength > 128);

  if (!subscription) {
    return (
      <div className="p-6 text-center">
        {t("subscriptionNotFound", "Subscription not found")}
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 flex max-w-4xl flex-col gap-8 md:grid md:grid-cols-2 md:flex-row">
      <div className="flex flex-col gap-6">
        {!user && (
          <Card>
            <Card.Header>
              {t(
                "emailInputTitle",
                "Enter the email address for your {{siteName}} account",
                {
                  siteName: common.site.site_name,
                }
              )}
            </Card.Header>
            <Card.Content className="flex flex-col gap-2">
              <div className="flex flex-col gap-2">
                <EnhancedInput
                  className={cn({
                    "border-danger":
                      !isEmailValid.valid && params.identifier !== "",
                  })}
                  onValueChange={(value: string) => {
                    const email = value as string;
                    setParams((prev) => ({
                      ...prev,
                      identifier: email,
                    }));
                    const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!reg.test(email)) {
                      setIsEmailValid({
                        valid: false,
                        message: t(
                          "invalidEmail",
                          "Please enter a valid email address"
                        ),
                      });
                      return;
                    }
                    if (common.auth.email.enable_domain_suffix) {
                      const domain = email.split("@")[1];
                      const isValid = common.auth.email?.domain_suffix_list
                        .split("\n")
                        .includes(domain || "");
                      if (!isValid) {
                        setIsEmailValid({
                          valid: false,
                          message: t(
                            "emailDomainNotAllowed",
                            "Email domain is not in the whitelist"
                          ),
                        });
                        return;
                      }
                    }
                    setIsEmailValid({
                      valid: true,
                      message: "",
                    });
                  }}
                  placeholder="Email"
                  required
                  type="email"
                  value={params.identifier || ""}
                />
                <p
                  className={cn("text-muted text-xs", {
                    "text-danger":
                      !isEmailValid.valid && params.identifier !== "",
                  })}
                >
                  {isEmailValid.message ||
                    t("emailRequired", "Please enter your email address.")}
                </p>
              </div>
              {params.identifier && isEmailValid.valid && (
                <div className="flex flex-col gap-2">
                  <EnhancedInput
                    onValueChange={(value: string) =>
                      handleChange("password", value)
                    }
                    placeholder={t(
                      "passwordPlaceholder",
                      "Password (at least 8 characters, optional)"
                    )}
                    type="password"
                    value={params.password || ""}
                  />
                  {isPasswordInvalid && (
                    <p className="text-danger text-xs">
                      {t("passwordLength", "Password must be 8-128 characters")}
                    </p>
                  )}
                  <p className="text-muted text-xs">
                    {t(
                      "passwordHint",
                      "If you do not enter a password, we will automatically generate one and send it to your email."
                    )}
                  </p>
                </div>
              )}
              {/* <div>
              <OAuthMethods />
            </div> */}
            </Card.Content>
          </Card>
        )}
        <Card>
          <Card.Content className="grid gap-3 text-sm">
            <h2 className="font-semibold text-xl">{subscription.name}</h2>
            <ul className="flex flex-grow flex-col gap-3">
              {(() => {
                let parsedDescription: {
                  description: string;
                  features: Array<{
                    icon: string;
                    label: string;
                    type: "default" | "success" | "destructive";
                  }>;
                };
                try {
                  parsedDescription = JSON.parse(subscription.description);
                } catch {
                  parsedDescription = { description: "", features: [] };
                }

                const { description, features } = parsedDescription;
                return (
                  <>
                    {description && (
                      <li className="text-muted">{description}</li>
                    )}
                    {features?.map(
                      (
                        feature: {
                          icon: string;
                          label: string;
                          type: "default" | "success" | "destructive";
                        },
                        index: number
                      ) => (
                        <li
                          className={cn("flex items-center gap-1", {
                            "text-muted line-through":
                              feature.type === "destructive",
                          })}
                          key={index}
                        >
                          {feature.icon && (
                            <Icon
                              className={cn("size-5 text-accent", {
                                "text-success": feature.type === "success",
                                "text-danger": feature.type === "destructive",
                              })}
                              icon={feature.icon}
                            />
                          )}
                          {feature.label}
                        </li>
                      )
                    )}
                  </>
                );
              })()}
            </ul>
            <SubscribeDetail
              subscribe={{
                ...subscription,
                quantity: params.quantity,
              }}
            />
            <Separator />
            <SubscribeBilling
              order={{
                ...order,
                quantity: params.quantity,
                unit_price: subscription?.unit_price,
                show_original_price: subscription?.show_original_price,
              }}
            />
          </Card.Content>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <Card.Content className="flex flex-col gap-5 pb-4">
            <section className="grid gap-3">
              <DurationSelector
                discounts={subscription?.discount}
                onChange={(value: number) => handleChange("quantity", value)}
                quantity={params.quantity!}
                unitTime={
                  unitTimeMap[subscription.unit_time!] || subscription.unit_time
                }
              />
            </section>
            <Separator />
            <section className="grid gap-3">
              <CouponInput
                coupon={params.coupon}
                onChange={(value: string) => handleChange("coupon", value)}
              />
            </section>
            <Separator />
            <section className="grid gap-3">
              <PaymentMethods
                balance={false}
                onChange={(value: string) => handleChange("payment", value)}
                value={params.payment!}
              />
            </section>
          </Card.Content>
        </Card>

        <Button
          className="w-full"
          disabled={
            (!user && (!isEmailValid.valid || isPasswordInvalid)) || loading
          }
          onClick={handleSubmit}
          size="lg"
        >
          {t("buyNow", "Buy Now")}
        </Button>
      </div>
    </div>
  );
}
