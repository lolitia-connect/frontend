import { Button, Form, Input, Label, Spinner, TextField } from "@heroui/react";
import { AuthShell } from "@workspace/ui/composed/auth-shell";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Preferences } from "@/components/preferences";

interface LoginScreenProps {
  account: string;
  captchaSlot?: ReactNode;
  configLoading: boolean;
  error?: string;
  loading: boolean;
  onAccountChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (account: string, password: string) => void;
  password: string;
  siteLogo?: string;
  siteName?: string;
}

export function LoginScreen({
  account,
  password,
  loading,
  configLoading,
  siteLogo,
  siteName,
  captchaSlot,
  error,
  onAccountChange,
  onPasswordChange,
  onSubmit,
}: Readonly<LoginScreenProps>) {
  const [interactive, setInteractive] = useState(false);
  useEffect(() => setInteractive(true), []);
  const { t } = useTranslation("app");

  return (
    <AuthShell>
      <Link
        className="mb-6 flex flex-col items-center gap-3 text-center"
        href="/"
      >
        {siteLogo && (
          <Image
            alt={siteName || "Logo"}
            className="object-contain"
            height={48}
            src={siteLogo}
            unoptimized
            width={48}
          />
        )}
        {siteName && (
          <span className="max-w-full break-words font-semibold text-2xl">
            {siteName}
          </span>
        )}
      </Link>
      <div className="mb-6 text-center">
        <h1 className="mb-3 font-bold text-2xl">
          {t("login.title", "登录充值中心")}
        </h1>
        <p className="font-medium text-muted">
          {t("login.description", "登录现有账号，为账户余额充值。")}
        </p>
      </div>
      <Form
        className="grid gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (loading || configLoading) return;
          onSubmit(account, password);
        }}
      >
        <TextField
          autoComplete="username"
          isDisabled={!interactive}
          name="account"
          onChange={onAccountChange}
          value={account}
        >
          <Label className="sr-only">
            {t("login.accountLabel", "账号 / 邮箱")}
          </Label>
          <Input
            className="h-10 w-full"
            placeholder={t(
              "login.accountPlaceholder",
              "请输入现有系统账号或邮箱"
            )}
          />
        </TextField>
        <TextField
          autoComplete="current-password"
          isDisabled={!interactive}
          name="password"
          onChange={onPasswordChange}
          type="password"
          value={password}
        >
          <Label className="sr-only">{t("login.passwordLabel", "密码")}</Label>
          <Input
            className="h-10 w-full"
            placeholder={t("login.passwordPlaceholder", "请输入密码")}
          />
        </TextField>
        {error && <p role="alert">{error}</p>}
        {captchaSlot}
        <Button isDisabled={loading || configLoading} type="submit">
          {(loading || configLoading) && (
            <Spinner aria-hidden="true" color="current" size="sm" />
          )}
          {configLoading
            ? t("login.loadingConfig", "加载配置中...")
            : loading
              ? t("login.submitting", "登录中...")
              : t("login.submit", "登录")}
        </Button>
      </Form>
      <div className="mt-8">
        <Preferences variant="auth" />
      </div>
    </AuthShell>
  );
}
