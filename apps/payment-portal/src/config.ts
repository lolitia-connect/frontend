const DEFAULT_AMOUNTS = [10, 20, 50, 100];
const DEFAULT_NEWS = [
  "Existing backend login is reused directly for authentication.",
  "Enabled payment methods are loaded from the current portal payment API.",
  "Recharge records keep using the existing order list interface.",
];

function parseNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseAmounts(value?: string): number[] {
  if (!value) return DEFAULT_AMOUNTS;

  const parsed = value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item > 0);

  return parsed.length > 0 ? parsed : DEFAULT_AMOUNTS;
}

function parseNews(value?: string): string[] {
  if (!value) return DEFAULT_NEWS;

  const parsed = value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  return parsed.length > 0 ? parsed : DEFAULT_NEWS;
}

export const fallbackLng = "en-US";
export const supportedLngs = ["en-US", "zh-CN"] as const;

export const portalConfig = {
  currency: import.meta.env.VITE_PAYMENT_PORTAL_CURRENCY,
  rechargeAmounts: parseAmounts(import.meta.env.VITE_PAYMENT_PORTAL_AMOUNTS),
  minCustomAmount: Math.max(
    parseNumber(import.meta.env.VITE_PAYMENT_PORTAL_MIN_CUSTOM_AMOUNT, 1),
    1
  ),
  newsItems: parseNews(import.meta.env.VITE_PAYMENT_PORTAL_NEWS),
};
