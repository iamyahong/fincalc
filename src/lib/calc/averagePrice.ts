export interface CalcRow {
  price: number;
  qty: number;
}

export interface AveragePriceResult {
  totalAmount: number;
  totalQty: number;
  avgPrice: number | null; // null when totalQty === 0
}

export function calculateAveragePrice(rows: CalcRow[]): AveragePriceResult {
  const totalAmount = rows.reduce((sum, r) => sum + r.price * r.qty, 0);
  const totalQty = rows.reduce((sum, r) => sum + r.qty, 0);
  const avgPrice = totalQty === 0 ? null : totalAmount / totalQty;
  return { totalAmount, totalQty, avgPrice };
}
