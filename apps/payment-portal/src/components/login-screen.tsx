import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { supportedLngs } from "@/config";
import { NewsMarquee } from "./news-marquee";

interface LoginScreenProps {
  account: string;
  password: string;
  loading: boolean;
  configLoading: boolean;
  newsItems: string[];
  currentLanguage: string;
  siteLogo?: string;
  siteName?: string;
  captchaSlot?: ReactNode;
  onAccountChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onSubmit: () => void;
}

export function LoginScreen({
  account,
  password,
  loading,
  configLoading,
  newsItems,
  currentLanguage,
  siteLogo,
  siteName,
  captchaSlot,
  onAccountChange,
  onPasswordChange,
  onLanguageChange,
  onSubmit,
}: Readonly<LoginScreenProps>) {
  const { t } = useTranslation("app");

  return (
    <div className="portal-shell min-h-screen">
      <div className="grid min-h-screen lg:grid-cols-[2fr_3fr]">
        <section className="portal-news-side portal-news-side-light hidden lg:flex lg:items-center lg:justify-center lg:px-10 lg:py-12 xl:px-12">
          <NewsMarquee
            items={newsItems}
            siteLogo={siteLogo}
            siteName={siteName}
            subtitle={t(
              "news.subtitle",
              "滚动展示支付动态、配置变更和充值提醒。"
            )}
            title={t("news.title", "滚动新闻")}
          />
        </section>

        <section className="portal-form-side portal-form-side-light flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-xl">
            <div className="mb-6 flex justify-end">
              <div className="flex items-center gap-2">
                {supportedLngs.map((language) => (
                  <button
                    className={`portal-lang-btn portal-lang-btn-light ${
                      currentLanguage === language ? "is-active" : ""
                    }`}
                    key={language}
                    onClick={() => onLanguageChange(language)}
                    type="button"
                  >
                    {language === "zh-CN" ? "中文" : "EN"}
                  </button>
                ))}
              </div>
            </div>

            <div className="portal-login-card portal-login-card-light mx-auto w-full max-w-[420px]">
              <div className="mb-8 text-center">
                <h2 className="portal-login-title portal-login-title-light">
                  {t("login.title", "登录充值中心")}
                </h2>
              </div>

              <form
                className="space-y-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  onSubmit();
                }}
              >
                <label className="portal-field portal-field-light">
                  <span>{t("login.accountLabel", "账号 / 邮箱")}</span>
                  <input
                    autoComplete="username"
                    className="portal-input portal-input-light"
                    onChange={(event) => onAccountChange(event.target.value)}
                    placeholder={t(
                      "login.accountPlaceholder",
                      "请输入现有系统账号或邮箱"
                    )}
                    type="text"
                    value={account}
                  />
                </label>

                <label className="portal-field portal-field-light">
                  <span>{t("login.passwordLabel", "密码")}</span>
                  <input
                    autoComplete="current-password"
                    className="portal-input portal-input-light"
                    onChange={(event) => onPasswordChange(event.target.value)}
                    placeholder={t("login.passwordPlaceholder", "请输入密码")}
                    type="password"
                    value={password}
                  />
                </label>

                {captchaSlot ? (
                  <div className="portal-login-captcha">{captchaSlot}</div>
                ) : null}

                <button
                  className="portal-primary-btn portal-primary-btn-login w-full"
                  disabled={loading || configLoading}
                  type="submit"
                >
                  {configLoading
                    ? t("login.loadingConfig", "加载配置中...")
                    : loading
                      ? t("login.submitting", "登录中...")
                      : t("login.submit", "登录")}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
