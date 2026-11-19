import "server-only";

import type { Resource } from "i18next";
import { fallbackLng, supportedLngs } from "./i18n";
import { fallbackNamespaces } from "./locale-resources";

export async function loadInitialTranslations(
  language: string
): Promise<Resource> {
  if (language === fallbackLng || !supportedLngs.includes(language)) return {};

  const entries = await Promise.all(
    fallbackNamespaces.map(async (namespace) => [
      namespace,
      (
        await import(
          `../../public/assets/locales/${language}/${namespace}.json`
        )
      ).default,
    ])
  );
  return { [language]: Object.fromEntries(entries) };
}
