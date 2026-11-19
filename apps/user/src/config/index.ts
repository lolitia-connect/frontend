export { fallbackLng, getInitialI18nNamespaces, supportedLngs } from "./i18n";
export { fallbackNamespaces, fallbackResources } from "./locale-resources";

export const CDN_URL =
  process.env.NEXT_PUBLIC_CDN_URL || "https://cdn.jsdmirror.com";
export const TUTORIAL_DOCUMENT =
  process.env.NEXT_PUBLIC_TUTORIAL_DOCUMENT || "true";
export const USER_EMAIL = process.env.NEXT_PUBLIC_USER_EMAIL;
export const USER_PASSWORD = process.env.NEXT_PUBLIC_USER_PASSWORD;
