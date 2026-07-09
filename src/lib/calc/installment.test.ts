import { describe, it, expect } from "vitest";
import { calcInstallment } from "./installment";
import { calcCompound } from "./compound";

const TOL = 1; // ±1 KRW rounding tolerance

describe("calcInstallment", () => {
  it("reference case: start=100K, monthly=100K, 3yr, 5% annual, 연복리", () => {
    const result = calcInstallment(100_000, 100_000, 3, "year", 5, "year", "annual");

    expect(result.totalInvested).toBe(3_600_000);
    expect(result.finalAmount).toBe(3_885_456);
    expect(result.totalProfit).toBe(285_456);

    // All 3 yearly rows within ±1 KRW
    expect(result.yearlyRows).toHaveLength(3);

    const y1 = result.yearlyRows[0];
    expect(Math.abs(y1.principal - 1_200_000)).toBeLessThanOrEqual(TOL);
    expect(Math.abs(y1.profit - 32_500)).toBeLessThanOrEqual(TOL);
    expect(Math.abs(y1.total - 1_232_500)).toBeLessThanOrEqual(TOL);

    const y2 = result.yearlyRows[1];
    expect(Math.abs(y2.principal - 2_432_500)).toBeLessThanOrEqual(TOL);
    expect(Math.abs(y2.profit - 94_125)).toBeLessThanOrEqual(TOL);
    expect(Math.abs(y2.total - 2_526_625)).toBeLessThanOrEqual(TOL);

    const y3 = result.yearlyRows[2];
    expect(Math.abs(y3.principal - 3_726_625)).toBeLessThanOrEqual(TOL);
    expect(Math.abs(y3.profit - 158_831)).toBeLessThanOrEqual(TOL);
    expect(Math.abs(y3.total - 3_885_456)).toBeLessThanOrEqual(TOL);
  });

  it("zero monthly deposit: behaves like basic compound interest on startAmount", () => {
    const result = calcInstallment(100_000, 0, 3, "year", 5, "year", "annual");
    const compound = calcCompound(100_000, 3, 5);

    expect(result.totalInvested).toBe(100_000);
    expect(result.finalAmount).toBe(compound.finalAmount); // 115,763
    expect(result.totalProfit).toBe(compound.finalAmount - 100_000);
    expect(result.yearlyRows).toHaveLength(3);
  });

  it("zero rate: finalAmount equals totalInvested, no profit", () => {
    const result = calcInstallment(100_000, 100_000, 3, "year", 0, "year", "annual");

    expect(result.totalInvested).toBe(3_600_000);
    expect(result.finalAmount).toBe(3_600_000);
    expect(result.totalProfit).toBe(0);
    expect(result.monthlyRows.every((r) => r.profit === 0)).toBe(true);
  });

  it("strictly increasing final amounts: annual < semi < quarterly < monthly < daily", () => {
    const inputs = [100_000, 100_000, 3, "year" as const, 5, "year" as const] as const;
    const annual = calcInstallment(...inputs, "annual").finalAmount;
    const semi = calcInstallment(...inputs, "semi").finalAmount;
    const quarterly = calcInstallment(...inputs, "quarterly").finalAmount;
    const monthly = calcInstallment(...inputs, "monthly").finalAmount;
    const daily = calcInstallment(...inputs, "daily").finalAmount;

    expect(annual).toBeLessThan(semi);
    expect(semi).toBeLessThan(quarterly);
    expect(quarterly).toBeLessThan(monthly);
    expect(monthly).toBeLessThan(daily);
  });

  it("month-unit input: 36개월 = 3년 produces identical result to reference case", () => {
    const byYear = calcInstallment(100_000, 100_000, 3, "year", 5, "year", "annual");
    const byMonth = calcInstallment(100_000, 100_000, 36, "month", 5, "year", "annual");

    expect(byMonth.finalAmount).toBe(byYear.finalAmount);
    expect(byMonth.totalProfit).toBe(byYear.totalProfit);
    expect(byMonth.totalInvested).toBe(byYear.totalInvested);
    expect(byMonth.yearlyRows).toHaveLength(byYear.yearlyRows.length);
  });

  it("monthly rows: 36 rows returned, last row total equals finalAmount", () => {
    const result = calcInstallment(100_000, 100_000, 3, "year", 5, "year", "annual");

    expect(result.monthlyRows).toHaveLength(36);
    const lastMonthly = result.monthlyRows[35];
    expect(lastMonthly.month).toBe(36);
    expect(lastMonthly.total).toBe(result.finalAmount);
    expect(lastMonthly.principal + lastMonthly.profit).toBe(lastMonthly.total);
  });
});
