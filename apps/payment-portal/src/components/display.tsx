import { unitConversion } from "@workspace/ui/utils/unit-conversions";
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
    const formattedValue = `${symbol}${unitConversion("centsToDollars", value as number)?.toFixed(2) ?? "0.00"}`;
    return formattedValue;
  }

  if (type === "number") {
    return value ? value.toString() : "0";
  }

  return "0";
}
