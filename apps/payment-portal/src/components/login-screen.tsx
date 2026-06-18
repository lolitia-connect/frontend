import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { LanguageSwitch } from "@workspace/ui/composed/language-switch";
import { ThemeSwitch } from "@workspace/ui/composed/theme-switch";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface LoginScreenProps {
  account: string;
  password: string;
  loading: boolean;
  configLoading: boolean;
  siteLogo?: string;
  siteName?: string;
  captchaSlot?: ReactNode;
  onAccountChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
}

export function LoginScreen({
  account,
  password,
  loading,
  configLoading,
  siteLogo,
  siteName,
  captchaSlot,
  onAccountChange,
  onPasswordChange,
  onSubmit,
}: Readonly<LoginScreenProps>) {
  const { t } = useTranslation("app");

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-5 py-7">
      <div className="flex w-full max-w-[520px] flex-col rounded-2xl bg-background p-8 shadow md:max-w-[560px] md:py-10 lg:shadow">
        <div className="flex w-full max-w-[480px] flex-col items-stretch self-center">
          {/* Header */}
          <div className="mb-6 flex flex-col items-center">
            {siteLogo && (
              <img
                alt={siteName || "Logo"}
                className="mb-3 h-12 w-auto object-contain"
                src={siteLogo}
              />
            )}
            {siteName && (
              <span className="mb-2 font-semibold text-2xl">{siteName}</span>
            )}
            <h1 className="mb-2 font-bold text-2xl">
              {t("login.title", "登录充值中心")}
            </h1>
          </div>

          {/* Login form */}
          <form
            className="grid gap-6"
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit();
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="account">
                {t("login.accountLabel", "账号 / 邮箱")}
              </Label>
              <Input
                autoComplete="username"
                id="account"
                onChange={(event) => onAccountChange(event.target.value)}
                placeholder={t(
                  "login.accountPlaceholder",
                  "请输入现有系统账号或邮箱"
                )}
                type="text"
                value={account}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">
                {t("login.passwordLabel", "密码")}
              </Label>
              <Input
                autoComplete="current-password"
                id="password"
                onChange={(event) => onPasswordChange(event.target.value)}
                placeholder={t("login.passwordPlaceholder", "请输入密码")}
                type="password"
                value={password}
              />
            </div>

            {captchaSlot ? <div>{captchaSlot}</div> : null}

            <Button
              className="w-full"
              disabled={loading || configLoading}
              type="submit"
            >
              {configLoading
                ? t("login.loadingConfig", "加载配置中...")
                : loading
                  ? t("login.submitting", "登录中...")
                  : t("login.submit", "登录")}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LanguageSwitch />
              <ThemeSwitch />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
