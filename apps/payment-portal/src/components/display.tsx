import { usePortalStore } from "@/stores/global";

type DisplayType = "currency" | "number";

interface DisplayProps<T> {
  type?: DisplayType;
  value?: T;
}

export function Display<T extends number | undefined | null>({
  value = 0,
  type = "number",
}: DisplayProps<T>): string {
  const { common } = usePortalStore();
  const { currency } = common;

  if (type === "currency") {
    const symbol = currency?.currency_symbol ?? "$";
    return `${symbol}${(Number(value) || 0).toFixed(2)}`;
  }

  if (type === "number") {
    return value ? value.toString() : "0";
  }

  return "0";
}
