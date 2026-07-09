export type CompoundMethod = "annual" | "semi" | "quarterly" | "monthly" | "daily";
export type RateUnit = "year" | "month";
export type DurationUnit = "year" | "month";

export interface InstallmentResult {
  totalProfit: number;
  finalAmount: number;
  totalInvested: number;
  monthlyRows: Array<{
    month: number;
    principal: number;
    profit: number;
    total: number;
  }>;
  yearlyRows: Array<{
    year: number;
    principal: number;
    profit: number;
    total: number;
  }>;
}

const CAPITALIZE_PERIOD: Record<Exclude<CompoundMethod, "daily">, number> = {
  annual: 12,
  semi: 6,
  quarterly: 3,
  monthly: 1,
};

export function calcInstallment(
  startAmount: number,
  monthlyDeposit: number,
  duration: number,
  durationUnit: DurationUnit,
  rateValue: number,
  rateUnit: RateUnit,
  method: CompoundMethod,
): InstallmentResult {
  const p = Math.round(startAmount);
  const m = Math.round(monthlyDeposit);
  const totalMonths = Math.round(
    durationUnit === "year" ? duration * 12 : duration,
  );

  // Convert to nominal annual rate: if monthly input, multiply by 12
  const nominalAnnualRate =
    rateUnit === "year" ? rateValue / 100 : (rateValue / 100) * 12;

  let workingBalance = 0; // principal + capitalized interest
  let pendingBuffer = 0; // interest accrued but not yet capitalized
  let totalCashIn = 0;

  // For yearly rows: track balance at start of each year
  let prevYearBalance = 0;
  let yearDeposits = 0;

  const monthlyRows: InstallmentResult["monthlyRows"] = [];
  const yearlyRows: InstallmentResult["yearlyRows"] = [];

  for (let month = 1; month <= totalMonths; month++) {
    const isFirstMonthOfYear = (month - 1) % 12 === 0;
    if (isFirstMonthOfYear) {
      prevYearBalance = workingBalance + pendingBuffer;
      yearDeposits = 0;
    }

    // 1. Add deposit (month 1 = start amount; month 2+ = monthly deposit)
    const deposit = month === 1 ? p : m;
    workingBalance += deposit;
    totalCashIn += deposit;
    yearDeposits += deposit;

    // 2. Accrue interest
    if (method === "daily") {
      const dailyRate = nominalAnnualRate / 360;
      const totalBefore = workingBalance + pendingBuffer;
      const factor = Math.pow(1 + dailyRate, 30);
      const earned = totalBefore * (factor - 1);
      // Daily compounding capitalizes continuously — apply immediately
      workingBalance += pendingBuffer + earned;
      pendingBuffer = 0;
    } else {
      const monthlyRate = nominalAnnualRate / 12;
      // Accumulate monthly interest in buffer (calculated on current working balance)
      pendingBuffer += workingBalance * monthlyRate;

      // Capitalize at end of each compound period (and on final month)
      const capitalizePeriod = CAPITALIZE_PERIOD[method];
      if (month % capitalizePeriod === 0 || month === totalMonths) {
        workingBalance += pendingBuffer;
        pendingBuffer = 0;
      }
    }

    // 3. Record monthly row
    const balance = workingBalance + pendingBuffer;
    const totalRounded = Math.round(balance);
    monthlyRows.push({
      month,
      principal: totalCashIn,
      profit: totalRounded - totalCashIn,
      total: totalRounded,
    });

    // 4. Record yearly row at end of each 12-month block (or final month)
    if (month % 12 === 0 || month === totalMonths) {
      const year = Math.ceil(month / 12);
      const yearEndTotal = Math.round(workingBalance + pendingBuffer);
      // principal = balance at start of this year + deposits made this year
      const yearPrincipal = Math.round(prevYearBalance) + yearDeposits;
      yearlyRows.push({
        year,
        principal: yearPrincipal,
        profit: yearEndTotal - yearPrincipal,
        total: yearEndTotal,
      });
    }
  }

  const finalAmount =
    monthlyRows.length > 0 ? monthlyRows[monthlyRows.length - 1].total : p;
  const totalProfit = finalAmount - totalCashIn;

  return {
    totalProfit,
    finalAmount,
    totalInvested: totalCashIn,
    monthlyRows,
    yearlyRows,
  };
}
