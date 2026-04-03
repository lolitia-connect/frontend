export interface FeeBreakdown {
  amount: number;
  fee: number;
  total: number;
}

export function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}
