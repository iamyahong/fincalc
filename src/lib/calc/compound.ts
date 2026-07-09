export interface CompoundRow {
  period: number;
  profit: number;
  total: number;
  cumulativeRate: number;
}

export interface CompoundResult {
  principal: number;
  periods: number;
  ratePercent: number;
  finalAmount: number;
  totalProfit: number;
  rows: CompoundRow[];
}

export function calcCompound(
  principal: number,
  periods: number,
  ratePercent: number,
): CompoundResult {
  const r = ratePercent / 100;
  const p = Math.round(principal);
  const n = Math.max(0, Math.round(periods));

  const rows: CompoundRow[] = [];
  let prevTotal = p;

  for (let i = 1; i <= n; i++) {
    const total = Math.round(p * Math.pow(1 + r, i));
    const profit = total - prevTotal;
    const cumulativeRate =
      p !== 0 ? Math.round(((total / p) - 1) * 10000) / 100 : 0;
    rows.push({ period: i, profit, total, cumulativeRate });
    prevTotal = total;
  }

  const finalAmount = n > 0 ? rows[n - 1].total : p;
  const totalProfit = finalAmount - p;

  return {
    principal: p,
    periods: n,
    ratePercent,
    finalAmount,
    totalProfit,
    rows,
  };
}
