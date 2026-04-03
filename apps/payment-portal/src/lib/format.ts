import type { TFunction } from "i18next";
import { formatDate as formatPortalDate } from "@workspace/ui/utils/formatting";

export function formatCurrency(
  amount: number,
  language: string,
  currency: string
): string {
  try {
    return new Intl.NumberFormat(language, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (_error) {
    return new Intl.NumberFormat(language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
}

export function formatTimestamp(timestamp: number, _language: string): string {
  if (!timestamp) return "-";

  return formatPortalDate(timestamp) || "-";
}

export function getOrderTypeLabel(type: number, t: TFunction): string {
  if (type === 4) return t("type.recharge", "Recharge");
  return t("type.unknown", "Unknown Type");
}

export function getOrderStatusLabel(status: number, t: TFunction): string {
  const key = `status.${status}`;
  return t(key, {
    defaultValue: t("status.unknown", "Unknown Status"),
  });
}
