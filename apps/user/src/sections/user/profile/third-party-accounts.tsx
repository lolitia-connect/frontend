"use client";

import { Card, Modal } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { AreaCodeSelect } from "@workspace/ui/composed/area-code-select";
import { Icon } from "@workspace/ui/composed/icon";
import {
  bindOAuth,
  unbindOAuth,
  updateBindEmail,
  updateBindMobile,
} from "@workspace/ui/services/user/user";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import SendCode from "@/sections/auth/send-code";
import { useGlobalStore } from "@/stores/global";
import { Logout } from "@/utils/common";
import {
  closePopup,
  navigateToTelegramCallbackRoute,
  openTelegramAuthPopup,
  requestTelegramAuthCallback,
} from "@/utils/oauth/telegram-popup";
import CurrentCredentialFields, {
  type VerifyBy,
} from "./current-credential-fields";

function EmailBindDialog({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation("profile");
  const { user } = useGlobalStore();
  const email = user?.auth_methods?.find(
    (method) => method.auth_type === "email"
  )?.auth_identifier;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyBy, setVerifyBy] = useState<VerifyBy>("password");
  const schema = z.object({
    email: z.string().email(),
    code: z.string().min(1),
    password: z.string().optional(),
    current_code: z.string().optional(),
  });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", code: "", password: "", current_code: "" },
  });
  const onSubmit = async (values: z.infer<typeof schema>) => {
    if (loading) return;
    const credential =
      verifyBy === "code" && email ? "current_code" : "password";
    if (email && !values[credential]) {
      form.setError(credential, {
        message: t(
          "currentCredential.required",
          "Verify your current credentials"
        ),
      });
      return;
    }
    setLoading(true);
    try {
      await updateBindEmail({
        email: values.email,
        code: values.code,
        [credential]: values[credential] || undefined,
      });
      toast.success(
        t("currentCredential.signInAgain", "Updated. Please sign in again.")
      );
      setOpen(false);
      form.reset();
      Logout();
    } catch {
      return;
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal isOpen={open} onOpenChange={setOpen}>
      {children}
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-[425px]">
            <Modal.Header>
              <Modal.Heading>
                {t("thirdParty.bindEmail", "Connect Email")}
              </Modal.Heading>
            </Modal.Header>
            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                {email && (
                  <CurrentCredentialFields
                    email={email}
                    onVerifyByChange={setVerifyBy}
                    passwordName="password"
                    verifyBy={verifyBy}
                  />
                )}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder={t(
                            "thirdParty.newEmail",
                            "New email address"
                          )}
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            autoComplete="one-time-code"
                            placeholder={t(
                              "thirdParty.newCode",
                              "Code sent to the new address"
                            )}
                            {...field}
                          />
                          <SendCode
                            params={{ email: form.watch("email"), type: 1 }}
                            type="email"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button className="w-full" loading={loading} type="submit">
                  {t("thirdParty.confirm", "Confirm")}
                </Button>
              </form>
            </Form>
            <Modal.CloseTrigger aria-label="Close" />
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

function MobileBindDialog({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation("profile");
  const { common, user } = useGlobalStore();
  const { enable_whitelist, whitelist } = common.auth.mobile;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyBy, setVerifyBy] = useState<VerifyBy>("password");
  const email = user?.auth_methods?.find(
    (method) => method.auth_type === "email"
  )?.auth_identifier;

  const formSchema = z.object({
    area_code: z.string().min(1, "Area code is required"),
    mobile: z.string().min(5, "Phone number is required"),
    code: z.string().min(4, "Verification code is required"),
    password: z.string().optional(),
    current_code: z.string().optional(),
  });

  type MobileBindFormValues = z.infer<typeof formSchema>;

  const form = useForm<MobileBindFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      area_code: "1",
      mobile: "",
      code: "",
      password: "",
      current_code: "",
    },
  });

  const onSubmit = async (values: MobileBindFormValues) => {
    if (loading) return;
    const credential =
      verifyBy === "code" && email ? "current_code" : "password";
    setLoading(true);
    try {
      await updateBindMobile({
        area_code: values.area_code,
        mobile: values.mobile,
        code: values.code,
        [credential]: values[credential] || undefined,
      });
      toast.success(
        t("currentCredential.signInAgain", "Updated. Please sign in again.")
      );
      setOpen(false);
      Logout();
    } catch {
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={open} onOpenChange={setOpen}>
      {children}
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-[425px]">
            <Modal.Header>
              <Modal.Heading>
                {t("thirdParty.bindMobile", "Connect Mobile")}
              </Modal.Heading>
            </Modal.Header>
            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <CurrentCredentialFields
                  email={email}
                  onVerifyByChange={setVerifyBy}
                  passwordName="password"
                  verifyBy={verifyBy}
                />
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex">
                          <FormField
                            control={form.control}
                            name="area_code"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <AreaCodeSelect
                                    className="w-32 rounded-r-none border-r-0"
                                    onChange={(value) => {
                                      if (value.phone) {
                                        form.setValue(field.name, value.phone);
                                      }
                                    }}
                                    placeholder="Area code..."
                                    simple
                                    value={field.value}
                                    whitelist={
                                      enable_whitelist ? whitelist : []
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Input
                            className="rounded-l-none"
                            placeholder="Enter your telephone..."
                            type="tel"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter code..."
                            type="text"
                            {...field}
                          />
                          <SendCode
                            params={{
                              telephone_area_code: form.watch("area_code"),
                              telephone: form.watch("mobile"),
                              type: 1,
                            }}
                            type="phone"
                          />
                        </div>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button className="w-full" loading={loading} type="submit">
                  {t("thirdParty.confirm", "Confirm")}
                </Button>
              </form>
            </Form>
            <Modal.CloseTrigger aria-label="Close" />
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

export default function ThirdPartyAccounts() {
  const { t } = useTranslation("profile");
  const { user, getUserInfo, common } = useGlobalStore();
  const { oauth_methods } = common;

  const accounts = [
    {
      id: "email",
      icon: "logos:mailgun-icon",
      name: "Email",
      type: "Basic",
      descriptionDefault: "Link your email address",
    },
    {
      id: "mobile",
      icon: "mdi:telephone",
      name: "Mobile",
      type: "Basic",
      descriptionDefault: "Link your mobile number",
    },
    {
      id: "telegram",
      icon: "logos:telegram",
      name: "Telegram",
      type: "OAuth",
      descriptionDefault: "Sign in with Telegram",
    },
    {
      id: "apple",
      icon: "uil:apple",
      name: "Apple",
      type: "OAuth",
      descriptionDefault: "Sign in with Apple",
    },
    {
      id: "google",
      icon: "logos:google",
      name: "Google",
      type: "OAuth",
      descriptionDefault: "Sign in with Google",
    },
    {
      id: "facebook",
      icon: "logos:facebook",
      name: "Facebook",
      type: "OAuth",
      descriptionDefault: "Sign in with Facebook",
    },
    {
      id: "github",
      icon: "uil:github",
      name: "GitHub",
      type: "OAuth",
      descriptionDefault: "Sign in with GitHub",
    },
    {
      id: "device",
      icon: "mdi:devices",
      name: "Device",
      type: "OAuth",
      descriptionDefault: "Sign in with Device ID",
    },
  ].filter((account) => oauth_methods?.includes(account.id));

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAccountAction = async (account: (typeof accounts)[number]) => {
    if (actionLoading) return;
    setActionLoading(account.id);

    const isBound = user?.auth_methods?.find(
      (auth) => auth.auth_type === account.id
    )?.auth_identifier;

    // Open the Telegram window synchronously inside the click gesture (only
    // when binding, i.e. not already bound); opening it after the awaited
    // backend call below is rejected by popup blockers.
    const telegramPopup =
      account.id === "telegram" && !isBound
        ? openTelegramAuthPopup("bind")
        : null;

    try {
      if (isBound) {
        await unbindOAuth({ method: account.id });
        await getUserInfo();
      } else {
        const res = await bindOAuth({
          method: account.id,
          // Trailing slash REQUIRED to match the provider-registered redirect
          // URI (e.g. Google Console: `<origin>/bind/<provider>/`). The
          // redirect loop was caused by the removed static bridge pages under
          // `public/bind/<provider>/`, not the slash.
          redirect: `${window.location.origin}/bind/${account.id}/`,
        });

        const redirectUrl = res.data?.data?.redirect;

        if (!redirectUrl) {
          closePopup(telegramPopup);
          return;
        }

        if (account.id === "telegram") {
          const payload = await requestTelegramAuthCallback(
            redirectUrl,
            telegramPopup
          );
          navigateToTelegramCallbackRoute("bind", payload);
          return;
        }

        window.location.href = redirectUrl;
      }
    } catch {
      closePopup(telegramPopup);
      toast.error(t("thirdParty.bindFailed", "Failed to connect"));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title>{t("thirdParty.title", "Connected Accounts")}</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="space-y-4">
          {accounts.map((account) => {
            const method = user?.auth_methods?.find(
              (auth) => auth.auth_type === account.id
            );
            let displayValue = "";

            switch (account.id) {
              case "email":
                displayValue = method?.auth_identifier || "";
                break;
              default:
                displayValue =
                  method?.auth_identifier ||
                  t(
                    `thirdParty.${account.id}.description`,
                    account.descriptionDefault
                  );
            }

            return (
              <div className="flex w-full flex-col gap-2" key={account.id}>
                <span className="flex gap-3 font-medium">
                  <Icon className="size-6" icon={account.icon} />
                  {account.name}
                </span>
                <div className="flex items-center gap-2">
                  <Input
                    className="flex-1 truncate bg-default"
                    disabled
                    value={displayValue}
                  />
                  {account.id === "email" ? (
                    <EmailBindDialog>
                      <Button
                        variant={
                          method?.auth_identifier ? "outline" : "default"
                        }
                      >
                        {method?.auth_identifier
                          ? t("thirdParty.update", "Update")
                          : t("thirdParty.bind", "Connect")}
                      </Button>
                    </EmailBindDialog>
                  ) : account.id === "mobile" ? (
                    <MobileBindDialog>
                      <Button
                        className="whitespace-nowrap"
                        variant={
                          method?.auth_identifier ? "outline" : "default"
                        }
                      >
                        {t(
                          method?.auth_identifier
                            ? "thirdParty.update"
                            : "thirdParty.bind",
                          method?.auth_identifier ? "Update" : "Connect"
                        )}
                      </Button>
                    </MobileBindDialog>
                  ) : (
                    <Button
                      className="whitespace-nowrap"
                      loading={actionLoading === account.id}
                      onClick={() => handleAccountAction(account)}
                      variant={method?.auth_identifier ? "outline" : "default"}
                    >
                      {t(
                        method?.auth_identifier
                          ? "thirdParty.unbind"
                          : "thirdParty.bind",
                        method?.auth_identifier ? "Disconnect" : "Connect"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card.Content>
    </Card>
  );
}
