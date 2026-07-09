import { describe, it, expect } from "vitest";
import { calculateAveragePrice } from "./averagePrice";

describe("calculateAveragePrice", () => {
  it("reference case: (100×100) + (200×200) → avgPrice ≈ 166.67, total 50,000", () => {
    const result = calculateAveragePrice([
      { price: 100, qty: 100 },
      { price: 200, qty: 200 },
    ]);
    expect(result.totalAmount).toBe(50_000);
    expect(result.totalQty).toBe(300);
    expect(result.avgPrice).not.toBeNull();
    expect(result.avgPrice!).toBeGreaterThan(166.6);
    expect(result.avgPrice!).toBeLessThan(166.7);
    // Rounded display value should be 167
    expect(Math.round(result.avgPrice!)).toBe(167);
  });

  it("zero quantity: avgPrice is null (not NaN, not 0)", () => {
    const result = calculateAveragePrice([{ price: 100, qty: 0 }]);
    expect(result.avgPrice).toBeNull();
    expect(result.totalAmount).toBe(0);
    expect(result.totalQty).toBe(0);
  });

  it("empty rows array: all zeros, avgPrice is null", () => {
    const result = calculateAveragePrice([]);
    expect(result.totalAmount).toBe(0);
    expect(result.totalQty).toBe(0);
    expect(result.avgPrice).toBeNull();
  });

  it("decimal quantities (crypto case): 0.5 BTC at 60M + 0.3 BTC at 50M", () => {
    const result = calculateAveragePrice([
      { price: 60_000_000, qty: 0.5 },
      { price: 50_000_000, qty: 0.3 },
    ]);
    expect(result.totalAmount).toBeCloseTo(45_000_000, 0);
    expect(result.totalQty).toBeCloseTo(0.8, 10);
    expect(result.avgPrice).not.toBeNull();
    // 45,000,000 / 0.8 = 56,250,000
    expect(result.avgPrice!).toBeCloseTo(56_250_000, 0);
  });

  it("mixed zero and non-zero rows: zero row contributes 0 to all totals", () => {
    const result = calculateAveragePrice([
      { price: 100, qty: 10 },
      { price: 0, qty: 0 },
      { price: 200, qty: 5 },
    ]);
    // totalAmount = 1000 + 0 + 1000 = 2000
    // totalQty = 10 + 0 + 5 = 15
    // avgPrice = 2000 / 15 ≈ 133.33
    expect(result.totalAmount).toBe(2_000);
    expect(result.totalQty).toBe(15);
    expect(result.avgPrice).not.toBeNull();
    expect(result.avgPrice!).toBeCloseTo(133.33, 1);
  });
});
