const DEFAULT_AMOUNTS = [1000, 2000, 5000, 10_000];
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
    .map((item) => {
      const num = Number(item.trim());
      // If values look like dollars (< 10000), convert to cents
      if (Number.isFinite(num) && num > 0) {
        return num < 10_000 ? num * 100 : num;
      }
      return Number.NaN;
    })
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
export const supportedLngs = [
  "en-US",
  "zh-CN",
  "zh-TW",
  "zh-HK",
  "ja-JP",
] as const;

export const portalConfig = {
  currency: import.meta.env.VITE_PAYMENT_PORTAL_CURRENCY,
  rechargeAmounts: parseAmounts(import.meta.env.VITE_PAYMENT_PORTAL_AMOUNTS),
  minCustomAmount: Math.max(
    parseNumber(import.meta.env.VITE_PAYMENT_PORTAL_MIN_CUSTOM_AMOUNT, 100),
    100
  ),
  newsItems: parseNews(import.meta.env.VITE_PAYMENT_PORTAL_NEWS),
};
