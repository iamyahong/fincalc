import { describe, it, expect } from "vitest";
import { calcCompound } from "./compound";

describe("calcCompound", () => {
  it("default values: 1M principal, 20 periods, 5% rate", () => {
    const result = calcCompound(1_000_000, 20, 5);
    expect(result.finalAmount).toBe(2_653_298);
    expect(result.totalProfit).toBe(1_653_298);
    expect(result.rows).toHaveLength(20);
    expect(result.principal).toBe(1_000_000);
    expect(result.ratePercent).toBe(5);
  });

  it("zero rate returns principal unchanged for all periods", () => {
    const result = calcCompound(1_000_000, 20, 0);
    expect(result.finalAmount).toBe(1_000_000);
    expect(result.totalProfit).toBe(0);
    expect(result.rows).toHaveLength(20);
    expect(result.rows.every((r) => r.profit === 0)).toBe(true);
    expect(result.rows.every((r) => r.total === 1_000_000)).toBe(true);
  });

  it("negative rate reduces principal over time", () => {
    const result = calcCompound(1_000_000, 10, -10);
    expect(result.finalAmount).toBe(348_678);
    expect(result.totalProfit).toBe(-651_322);
    expect(result.rows).toHaveLength(10);
    expect(result.finalAmount).toBeLessThan(1_000_000);
  });

  it("single period", () => {
    const result = calcCompound(1_000, 1, 10);
    expect(result.rows).toHaveLength(1);
    expect(result.finalAmount).toBe(1_100);
    expect(result.totalProfit).toBe(100);
    expect(result.rows[0].period).toBe(1);
    expect(result.rows[0].cumulativeRate).toBe(10);
  });

  it("large period: 100 periods at 5%", () => {
    const result = calcCompound(1_000_000, 100, 5);
    expect(result.rows).toHaveLength(100);
    expect(result.finalAmount).toBe(131_501_258);
    expect(result.totalProfit).toBe(130_501_258);
    expect(result.rows[99].total).toBe(131_501_258);
  });
});
