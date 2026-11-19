import { renderToStaticMarkup } from "react-dom/server";
import { I18nextProvider, useTranslation } from "react-i18next";
import { describe, expect, it } from "vitest";
import { LanguageProvider, useLanguage } from "../integrations/language";
import { createI18nInstance } from "./i18n";

function Heading() {
  const { t } = useTranslation("components");
  const { language } = useLanguage();
  return <h1 lang={language}>{t("welcome")}</h1>;
}

function createRequest(language: string) {
  return createI18nInstance({
    lng: language,
    fallbackLng: "en-US",
    supportedLngs: ["en-US", "zh-CN"],
    ns: ["components"],
    resources: {
      "en-US": { components: { welcome: "Welcome" } },
      "zh-CN": { components: { welcome: "欢迎" } },
    },
  });
}

function renderRequest(instance: ReturnType<typeof createRequest>) {
  return renderToStaticMarkup(
    <I18nextProvider i18n={instance}>
      <LanguageProvider defaultLanguage={instance.language}>
        <Heading />
      </LanguageProvider>
    </I18nextProvider>
  );
}

describe("request-scoped SSR translations", () => {
  it("keeps overlapping requests and language context isolated", async () => {
    const english = createRequest("en-US");
    const chinese = createRequest("zh-CN");
    const markup = await Promise.all(
      [english, chinese, english].map(async (instance) => {
        await Promise.resolve();
        return renderRequest(instance);
      })
    );
    expect(markup).toEqual([
      '<h1 lang="en-US">Welcome</h1>',
      '<h1 lang="zh-CN">欢迎</h1>',
      '<h1 lang="en-US">Welcome</h1>',
    ]);
  });
});
