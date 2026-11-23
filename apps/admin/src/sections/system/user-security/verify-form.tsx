"use client";

import {
  ListBox,
  Select,
  SelectPopover as SelectContent,
  SelectIndicator,
  ListBoxItem as SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  Button as SheetButton,
  toast,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Switch } from "@workspace/ui/components/switch";
import { EnhancedInput } from "@workspace/ui/composed/enhanced-input";
import { Icon } from "@workspace/ui/composed/icon";
import { useQuery } from "@workspace/ui/hooks/query";
import {
  getSystemVerifyConfig as getVerifyConfig,
  putSystemVerifyConfig as updateVerifyConfig,
} from "@workspace/ui/services/admin/admin";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { SettingsFormBody } from "@/components/settings-form-body";

const verifySchema = z.object({
  captcha_type: z.string().optional(),
  turnstile_site_key: z.string().optional(),
  turnstile_secret: z.string().optional(),
  enable_user_login_captcha: z.boolean().optional(),
  enable_user_register_captcha: z.boolean().optional(),
  enable_admin_login_captcha: z.boolean().optional(),
  enable_user_reset_password_captcha: z.boolean().optional(),
});

type VerifyFormData = z.infer<typeof verifySchema>;

export default function VerifyConfig() {
  const { t } = useTranslation("system");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    data,
    refetch,
    isLoading: loadingConfig,
  } = useQuery({
    queryKey: ["getVerifyConfig"],
    queryFn: async () => {
      const { data } = await getVerifyConfig();
      return data.data;
    },
    enabled: open,
  });

  const form = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      captcha_type: "local",
      turnstile_site_key: "",
      turnstile_secret: "",
      enable_user_login_captcha: false,
      enable_user_register_captcha: false,
      enable_admin_login_captcha: false,
      enable_user_reset_password_captcha: false,
    },
  });

  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data, form]);

  async function onSubmit(values: VerifyFormData) {
    setLoading(true);
    try {
      await updateVerifyConfig(values as API.VerifyConfig);
      toast.success(t("verify.saveSuccess", "Save Successful"));
      refetch();
      setOpen(false);
    } catch {
      toast.danger(t("verify.saveFailed", "Save Failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet isOpen={open} onOpenChange={setOpen} placement="right">
      <Sheet.Trigger>
        <SheetButton
          className="settings-option justify-between"
          variant="ghost"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
              <Icon
                className="h-5 w-5 text-primary-500"
                icon="mdi:shield-check-outline"
              />
            </span>
            <span className="flex-1">
              <span className="block font-medium">
                {t("verify.title", "Security Verification")}
              </span>
              <span className="block text-muted text-sm">
                {t(
                  "verify.description",
                  "Configure Turnstile CAPTCHA and verification settings"
                )}
              </span>
            </span>
          </span>
          <Icon className="size-6" icon="mdi:chevron-right" />
        </SheetButton>
      </Sheet.Trigger>
      <Sheet.Backdrop>
        <Sheet.Content>
          <Sheet.Dialog className="w-[600px] max-w-full md:max-w-screen-md">
            <Sheet.Header>
              <Sheet.Heading>
                {t("verify.title", "Security Verification")}
              </Sheet.Heading>
            </Sheet.Header>
            <SettingsFormBody
              className="h-[calc(100dvh-48px-36px-36px-24px-env(safe-area-inset-top))] px-6"
              isLoading={loadingConfig}
            >
              <Form {...form}>
                <form
                  className="space-y-2 pt-4"
                  id="verify-form"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="captcha_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("verify.captchaType", "Captcha Type")}
                        </FormLabel>
                        <FormControl>
                          <Select
                            aria-label={t(
                              "verify.captchaTypePlaceholder",
                              "Select captcha type"
                            )}
                            onSelectionChange={(key) => {
                              if (key != null) field.onChange(String(key));
                            }}
                            placeholder={t(
                              "verify.captchaTypePlaceholder",
                              "Select captcha type"
                            )}
                            selectedKey={
                              field.value == null
                                ? undefined
                                : String(field.value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                              <SelectIndicator />
                            </SelectTrigger>
                            <SelectContent>
                              <ListBox>
                                <SelectItem id="local">
                                  {t(
                                    "verify.captchaTypeLocal",
                                    "Local Image Captcha"
                                  )}
                                </SelectItem>
                                <SelectItem id="slider">
                                  {t(
                                    "verify.captchaTypeSlider",
                                    "Local Slider Captcha"
                                  )}
                                </SelectItem>
                                <SelectItem id="turnstile">
                                  {t(
                                    "verify.captchaTypeTurnstile",
                                    "Cloudflare Turnstile"
                                  )}
                                </SelectItem>
                              </ListBox>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          {t(
                            "verify.captchaTypeDescription",
                            "Choose between local image captcha (offline) or Cloudflare Turnstile"
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("captcha_type") === "turnstile" && (
                    <>
                      <FormField
                        control={form.control}
                        name="turnstile_site_key"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t(
                                "verify.turnstileSiteKey",
                                "Turnstile Site Key"
                              )}
                            </FormLabel>
                            <FormControl>
                              <EnhancedInput
                                onValueChange={field.onChange}
                                placeholder={t(
                                  "verify.turnstileSiteKeyPlaceholder",
                                  "Enter Turnstile site key"
                                )}
                                value={field.value}
                              />
                            </FormControl>
                            <FormDescription>
                              {t(
                                "verify.turnstileSiteKeyDescription",
                                "Cloudflare Turnstile site key for frontend verification"
                              )}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="turnstile_secret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t(
                                "verify.turnstileSecret",
                                "Turnstile Secret Key"
                              )}
                            </FormLabel>
                            <FormControl>
                              <EnhancedInput
                                onValueChange={field.onChange}
                                placeholder={t(
                                  "verify.turnstileSecretPlaceholder",
                                  "Enter Turnstile secret key"
                                )}
                                type="password"
                                value={field.value}
                              />
                            </FormControl>
                            <FormDescription>
                              {t(
                                "verify.turnstileSecretDescription",
                                "Cloudflare Turnstile secret key for backend verification"
                              )}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <FormField
                    control={form.control}
                    name="enable_user_login_captcha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t(
                            "verify.enableUserLoginCaptcha",
                            "Enable User Login Captcha"
                          )}
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            className="!mt-0 float-end"
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          {t(
                            "verify.enableUserLoginCaptchaDescription",
                            "When enabled, users must pass captcha verification during login"
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enable_user_register_captcha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t(
                            "verify.enableUserRegisterCaptcha",
                            "Enable User Registration Captcha"
                          )}
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            className="!mt-0 float-end"
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          {t(
                            "verify.enableUserRegisterCaptchaDescription",
                            "When enabled, users must pass captcha verification during registration"
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enable_user_reset_password_captcha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t(
                            "verify.enableUserResetPasswordCaptcha",
                            "Enable User Password Reset Captcha"
                          )}
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            className="!mt-0 float-end"
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          {t(
                            "verify.enableUserResetPasswordCaptchaDescription",
                            "When enabled, users must pass captcha verification during password reset"
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enable_admin_login_captcha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t(
                            "verify.enableAdminLoginCaptcha",
                            "Enable Admin Authentication Captcha"
                          )}
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            className="!mt-0 float-end"
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          {t(
                            "verify.enableAdminLoginCaptchaDescription",
                            "When enabled, administrators must pass captcha verification during login"
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </SettingsFormBody>
            <Sheet.Footer className="flex-row justify-end gap-2 pt-3">
              <Button
                disabled={loading}
                onClick={() => setOpen(false)}
                variant="outline"
              >
                {t("common.cancel", "Cancel")}
              </Button>
              <Button
                disabled={loadingConfig}
                form="verify-form"
                loading={loading}
                type="submit"
              >
                {t("common.save", "Save Settings")}
              </Button>
            </Sheet.Footer>
            <Sheet.CloseTrigger aria-label="Close" />
          </Sheet.Dialog>
        </Sheet.Content>
      </Sheet.Backdrop>
    </Sheet>
  );
}
