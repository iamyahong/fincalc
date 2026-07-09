import React, { useState, useRef, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { PiggyBank, Share2, Image } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import {
  calcInstallment,
  type CompoundMethod,
  type DurationUnit,
  type RateUnit,
  type InstallmentResult,
} from "@/lib/calc/installment";
import { cn } from "@/lib/utils";

const DOMAIN = "https://fincalc.net";
const DEFAULT_START = 100_000;
const DEFAULT_MONTHLY = 100_000;
const DEFAULT_DURATION = 3;
const DEFAULT_DURATION_UNIT: DurationUnit = "year";
const DEFAULT_RATE = 5;
const DEFAULT_RATE_UNIT: RateUnit = "year";
const DEFAULT_METHOD: CompoundMethod = "annual";

const METHOD_OPTIONS: { value: CompoundMethod; ko: string; en: string }[] = [
  { value: "annual", ko: "연복리", en: "Annual" },
  { value: "semi", ko: "반기복리", en: "Semi-annual" },
  { value: "quarterly", ko: "분기복리", en: "Quarterly" },
  { value: "monthly", ko: "월복리", en: "Monthly" },
  { value: "daily", ko: "일복리 (360/년)", en: "Daily (360/yr)" },
];

function formatWon(n: number): string {
  return Math.round(n).toLocaleString("ko-KR");
}

function parseAmount(s: string): number {
  const n = parseFloat(s.replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? 0 : Math.max(0, Math.round(n));
}

type UnitToggleProps = {
  value: "year" | "month";
  onChange: (v: "year" | "month") => void;
  yearLabel: string;
  monthLabel: string;
};

function UnitToggle({ value, onChange, yearLabel, monthLabel }: UnitToggleProps) {
  return (
    <div className="flex shrink-0 rounded-lg overflow-hidden border border-border">
      <button
        type="button"
        onClick={() => onChange("year")}
        className={cn(
          "px-3 py-2 text-sm font-medium transition-colors",
          value === "year"
            ? "bg-primary text-primary-foreground"
            : "bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
        )}
      >
        {yearLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange("month")}
        className={cn(
          "px-3 py-2 text-sm font-medium border-l border-border transition-colors",
          value === "month"
            ? "bg-primary text-primary-foreground"
            : "bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
        )}
      >
        {monthLabel}
      </button>
    </div>
  );
}

function KoreanEducationalContent() {
  return (
    <div className="space-y-10 text-foreground">
      <section>
        <h2 className="text-xl font-bold mb-3 text-foreground">사용법</h2>
        <ol className="space-y-2 text-muted-foreground list-decimal list-inside leading-relaxed">
          <li>
            <strong className="text-foreground">시작 금액 (₩)</strong>에
            투자를 시작하는 초기 금액을 입력하세요. 예: 100,000원
          </li>
          <li>
            <strong className="text-foreground">매월 적립 금액 (₩)</strong>에
            매달 추가로 투자할 금액을 입력하세요. 첫 달에는 적립되지 않고,
            두 번째 달부터 원금에 가산됩니다.
          </li>
          <li>
            <strong className="text-foreground">투자 기간</strong>을 입력하고
            단위(년/개월)를 선택하세요. 예: 3년 또는 36개월
          </li>
          <li>
            <strong className="text-foreground">이자율 (%)</strong>을 입력하고
            기준(년/월)을 선택하세요. 예: 연 5% 또는 월 0.4%
          </li>
          <li>
            <strong className="text-foreground">복리 방식</strong>을
            선택하세요. 연복리가 기본값입니다.
          </li>
          <li>
            <strong className="text-foreground">계산하기</strong> 버튼을
            클릭하면 매년(또는 매월) 원금, 수익, 최종 금액을 확인할 수
            있습니다.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3 text-foreground">복리 방식</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          복리 방식은 이자를 얼마나 자주 원금에 합산(자본화)하는지를
          결정합니다. 같은 이자율이라도 합산 주기가 짧을수록 최종 수익이 더
          커집니다.
        </p>
        <dl className="space-y-3">
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <dt className="font-semibold text-foreground">연복리 (Annual)</dt>
            <dd className="text-muted-foreground text-sm leading-relaxed mt-0.5">
              이자를 1년에 한 번 원금에 합산합니다. 가장 일반적인 방식으로,
              정기예금이나 장기 투자 상품에서 자주 사용됩니다.
            </dd>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <dt className="font-semibold text-foreground">반기복리 (Semi-annual)</dt>
            <dd className="text-muted-foreground text-sm leading-relaxed mt-0.5">
              이자를 6개월에 한 번 합산합니다. 연복리보다 조금 더 많은 이자를
              받을 수 있습니다.
            </dd>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <dt className="font-semibold text-foreground">분기복리 (Quarterly)</dt>
            <dd className="text-muted-foreground text-sm leading-relaxed mt-0.5">
              이자를 3개월(분기)마다 합산합니다. 일부 채권이나 금융 상품에서
              사용하는 방식입니다.
            </dd>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <dt className="font-semibold text-foreground">월복리 (Monthly)</dt>
            <dd className="text-muted-foreground text-sm leading-relaxed mt-0.5">
              이자를 매월 원금에 합산합니다. 은행 적금 등에서 자주 사용되며,
              분기복리보다 수익이 더 많습니다.
            </dd>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <dt className="font-semibold text-foreground">일복리 — 360/년 (Daily)</dt>
            <dd className="text-muted-foreground text-sm leading-relaxed mt-0.5">
              이자를 매일 합산합니다. 1개월 = 30일, 1년 = 360일 기준으로
              계산하며, 5가지 방식 중 가장 많은 이자가 발생합니다.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

function EnglishEducationalContent() {
  return (
    <div className="space-y-10 text-foreground">
      <section>
        <h2 className="text-xl font-bold mb-3 text-foreground">How to Use</h2>
        <ol className="space-y-2 text-muted-foreground list-decimal list-inside leading-relaxed">
          <li>
            Enter the{" "}
            <strong className="text-foreground">Initial Amount (₩)</strong> —
            your starting investment. Example: 100,000
          </li>
          <li>
            Enter the{" "}
            <strong className="text-foreground">Monthly Deposit (₩)</strong> —
            the amount you add each month. No deposit is made in month 1; it
            starts from month 2.
          </li>
          <li>
            Enter the{" "}
            <strong className="text-foreground">Investment Period</strong> and
            select years or months. Example: 3 years or 36 months.
          </li>
          <li>
            Enter the{" "}
            <strong className="text-foreground">Interest Rate (%)</strong> and
            select year or month as the unit. Example: 5%/year or 0.4%/month.
          </li>
          <li>
            Select the{" "}
            <strong className="text-foreground">Compound Method</strong>.
            Annual is the default.
          </li>
          <li>
            Click <strong className="text-foreground">Calculate</strong> to see
            the principal, profit, and final amount per year (or month).
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3 text-foreground">
          Compound Method
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The compound method determines how often earned interest is added
          (capitalized) back to your principal. With the same nominal annual
          rate, more frequent compounding produces a higher final balance.
        </p>
        <dl className="space-y-3">
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <dt className="font-semibold text-foreground">Annual</dt>
            <dd className="text-muted-foreground text-sm leading-relaxed mt-0.5">
              Interest is capitalized once per year. The most common method,
              used in term deposits and long-term investment products.
            </dd>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <dt className="font-semibold text-foreground">Semi-annual</dt>
            <dd className="text-muted-foreground text-sm leading-relaxed mt-0.5">
              Interest is capitalized every 6 months. Yields slightly more than
              annual compounding over the same period.
            </dd>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <dt className="font-semibold text-foreground">Quarterly</dt>
            <dd className="text-muted-foreground text-sm leading-relaxed mt-0.5">
              Interest is added to the principal every 3 months. Used in some
              bonds and structured financial products.
            </dd>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <dt className="font-semibold text-foreground">Monthly</dt>
            <dd className="text-muted-foreground text-sm leading-relaxed mt-0.5">
              Interest is capitalized each month. Common for savings accounts
              and installment plans.
            </dd>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <dt className="font-semibold text-foreground">Daily (360/yr)</dt>
            <dd className="text-muted-foreground text-sm leading-relaxed mt-0.5">
              Interest compounds every day, using 30 days/month and 360
              days/year. Generates the highest return of all five methods.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

export default function InstallmentPage() {
  const { t, locale } = useI18n();
  const { locale: localeParam } = useParams<{ locale: string }>();
  const loc = localeParam ?? locale;
  const isKo = loc === "ko";

  const [startText, setStartText] = useState(formatWon(DEFAULT_START));
  const [monthlyText, setMonthlyText] = useState(formatWon(DEFAULT_MONTHLY));
  const [durationText, setDurationText] = useState(String(DEFAULT_DURATION));
  const [durationUnit, setDurationUnit] = useState<DurationUnit>(DEFAULT_DURATION_UNIT);
  const [rateText, setRateText] = useState(String(DEFAULT_RATE));
  const [rateUnit, setRateUnit] = useState<RateUnit>(DEFAULT_RATE_UNIT);
  const [method, setMethod] = useState<CompoundMethod>(DEFAULT_METHOD);
  const [viewMode, setViewMode] = useState<"year" | "month">("year");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [calcParams, setCalcParams] = useState({
    start: DEFAULT_START,
    monthly: DEFAULT_MONTHLY,
    duration: DEFAULT_DURATION,
    durationUnit: DEFAULT_DURATION_UNIT,
    rate: DEFAULT_RATE,
    rateUnit: DEFAULT_RATE_UNIT,
    method: DEFAULT_METHOD,
  });
  const [result, setResult] = useState<InstallmentResult>(() =>
    calcInstallment(
      DEFAULT_START, DEFAULT_MONTHLY, DEFAULT_DURATION, DEFAULT_DURATION_UNIT,
      DEFAULT_RATE, DEFAULT_RATE_UNIT, DEFAULT_METHOD,
    ),
  );

  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const start = params.get("start");
    const monthly = params.get("monthly");
    const duration = params.get("duration");
    const durationUnitParam = params.get("durationUnit");
    const rate = params.get("rate");
    const rateUnitParam = params.get("rateUnit");
    const methodParam = params.get("method");

    if (!start && !monthly && !duration && !rate) return;

    const newStart = start ? Math.max(0, Math.round(Number(start))) : DEFAULT_START;
    const newMonthly = monthly ? Math.max(0, Math.round(Number(monthly))) : DEFAULT_MONTHLY;
    const newDuration = duration ? Math.max(1, Math.round(Number(duration))) : DEFAULT_DURATION;
    const newDurationUnit: DurationUnit =
      durationUnitParam === "month" ? "month" : "year";
    const newRate = rate ? Math.min(1000, Math.max(-100, Number(rate))) : DEFAULT_RATE;
    const newRateUnit: RateUnit = rateUnitParam === "month" ? "month" : "year";
    const validMethods: CompoundMethod[] = ["annual", "semi", "quarterly", "monthly", "daily"];
    const newMethod: CompoundMethod =
      methodParam && validMethods.includes(methodParam as CompoundMethod)
        ? (methodParam as CompoundMethod)
        : DEFAULT_METHOD;

    setStartText(formatWon(newStart));
    setMonthlyText(formatWon(newMonthly));
    setDurationText(String(newDuration));
    setDurationUnit(newDurationUnit);
    setRateText(String(newRate));
    setRateUnit(newRateUnit);
    setMethod(newMethod);

    const newResult = calcInstallment(
      newStart, newMonthly, newDuration, newDurationUnit,
      newRate, newRateUnit, newMethod,
    );
    setResult(newResult);
    setCalcParams({
      start: newStart, monthly: newMonthly, duration: newDuration,
      durationUnit: newDurationUnit, rate: newRate, rateUnit: newRateUnit, method: newMethod,
    });
  }, []);

  const numFmt =
    loc === "ko" ? new Intl.NumberFormat("ko-KR") : new Intl.NumberFormat("en-US");

  const handleCalculate = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const newStart = parseAmount(startText);
      const newMonthly = parseAmount(monthlyText);
      const newDuration = Math.max(1, Math.round(Number(durationText)));
      const newRate = Math.min(1000, Math.max(-100, Number(rateText)));
      setStartText(formatWon(newStart));
      setMonthlyText(formatWon(newMonthly));
      setDurationText(String(newDuration));
      setRateText(String(newRate));
      const newResult = calcInstallment(
        newStart, newMonthly, newDuration, durationUnit,
        newRate, rateUnit, method,
      );
      setResult(newResult);
      setCalcParams({
        start: newStart, monthly: newMonthly, duration: newDuration,
        durationUnit, rate: newRate, rateUnit, method,
      });
    },
    [startText, monthlyText, durationText, durationUnit, rateText, rateUnit, method],
  );

  const handleShare = useCallback(async () => {
    try {
      const url = new URL(window.location.href);
      url.search = "";
      url.searchParams.set("start", String(calcParams.start));
      url.searchParams.set("monthly", String(calcParams.monthly));
      url.searchParams.set("duration", String(calcParams.duration));
      url.searchParams.set("durationUnit", calcParams.durationUnit);
      url.searchParams.set("rate", String(calcParams.rate));
      url.searchParams.set("rateUnit", calcParams.rateUnit);
      url.searchParams.set("method", calcParams.method);
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard access denied */
    }
  }, [calcParams]);

  const handleDownload = useCallback(async () => {
    if (!captureRef.current || downloading) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `fincalc-installment-${loc}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("PNG export failed:", err);
    } finally {
      setDownloading(false);
    }
  }, [downloading, loc]);

  const koUrl = `${DOMAIN}/ko/installment`;
  const enUrl = `${DOMAIN}/en/installment`;
  const canonicalUrl = `${DOMAIN}/${loc}/installment`;

  const labels = {
    start: isKo ? "시작 금액 (₩)" : "Initial Amount (₩)",
    monthly: isKo ? "매월 적립 금액 (₩)" : "Monthly Deposit (₩)",
    monthlyHelper: isKo
      ? "두 번째 달부터 원금에 가산됩니다."
      : "Added to principal starting from month 2.",
    duration: isKo ? "투자 기간" : "Investment Period",
    rate: isKo ? "이자율 (%)" : "Interest Rate (%)",
    methodLabel: isKo ? "복리 방식" : "Compound Method",
    totalProfit: isKo ? "총 수익" : "Total Profit",
    finalAmount: isKo ? "최종 금액" : "Final Amount",
    totalInvested: isKo ? "총 투자금" : "Total Invested",
    yearLabel: isKo ? "년" : "Year",
    monthLabel: isKo ? "월" : "Month",
    principalCol: isKo ? "원금 (₩)" : "Principal (₩)",
    profitCol: isKo ? "수익 (₩)" : "Profit (₩)",
    totalCol: isKo ? "최종 금액 (₩)" : "Total (₩)",
    shareBtn: copied ? (isKo ? "복사됨!" : "Copied!") : t.common.share,
    downloadBtn: downloading
      ? isKo ? "저장 중..." : "Saving..."
      : t.common.downloadImage,
  };

  const displayRows = viewMode === "year" ? result.yearlyRows : result.monthlyRows;
  const isProfit = result.totalProfit >= 0;

  return (
    <>
      <Helmet>
        <html lang={loc} />
        <title>{t.meta.installmentTitle}</title>
        <meta name="description" content={t.meta.installmentDesc} />
        <meta property="og:title" content={t.meta.installmentTitle} />
        <meta property="og:description" content={t.meta.installmentDesc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content={t.meta.siteName} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hrefLang="ko" href={koUrl} />
        <link rel="alternate" hrefLang="en" href={enUrl} />
        <link rel="alternate" hrefLang="x-default" href={koUrl} />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30">
            <PiggyBank className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {t.nav.installment}
          </h1>
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleCalculate}
          className="rounded-xl border border-border bg-card p-6 mb-6 space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {labels.start}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={startText}
                onChange={(e) => setStartText(e.target.value)}
                onBlur={() => setStartText(formatWon(parseAmount(startText)))}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono text-right focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {labels.monthly}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={monthlyText}
                onChange={(e) => setMonthlyText(e.target.value)}
                onBlur={() => setMonthlyText(formatWon(parseAmount(monthlyText)))}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono text-right focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {labels.monthlyHelper}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {labels.duration}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="600"
                  step="1"
                  value={durationText}
                  onChange={(e) => setDurationText(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono text-right focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
                />
                <UnitToggle
                  value={durationUnit}
                  onChange={setDurationUnit}
                  yearLabel={isKo ? "년" : "yr"}
                  monthLabel={isKo ? "개월" : "mo"}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {labels.rate}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="-100"
                  max="1000"
                  step="0.01"
                  value={rateText}
                  onChange={(e) => setRateText(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono text-right focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
                />
                <UnitToggle
                  value={rateUnit}
                  onChange={setRateUnit}
                  yearLabel={isKo ? "년" : "yr"}
                  monthLabel={isKo ? "월" : "mo"}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {labels.methodLabel}
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as CompoundMethod)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors cursor-pointer"
            >
              {METHOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {isKo ? opt.ko : opt.en}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            {t.common.calculate}
          </button>
        </form>

        {/* Results */}
        <div className="space-y-4 mb-10">
          <div
            ref={captureRef}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            {/* Three summary cards */}
            <div className="grid grid-cols-3">
              <div className="p-4 border-r border-border bg-green-50 dark:bg-green-950/20">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-400 mb-1">
                  {labels.totalProfit}
                </p>
                <p
                  className={cn(
                    "text-lg sm:text-2xl font-bold font-mono tabular-nums break-all",
                    isProfit
                      ? "text-green-700 dark:text-green-300"
                      : "text-red-600 dark:text-red-400",
                  )}
                >
                  {isProfit ? "+" : ""}
                  {numFmt.format(result.totalProfit)}
                  <span className="text-sm ml-0.5">₩</span>
                </p>
              </div>
              <div className="p-4 border-r border-border bg-orange-50 dark:bg-orange-950/20">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400 mb-1">
                  {labels.finalAmount}
                </p>
                <p className="text-lg sm:text-2xl font-bold font-mono tabular-nums break-all text-orange-700 dark:text-orange-300">
                  {numFmt.format(result.finalAmount)}
                  <span className="text-sm ml-0.5">₩</span>
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/30">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                  {labels.totalInvested}
                </p>
                <p className="text-lg sm:text-2xl font-bold font-mono tabular-nums break-all text-slate-700 dark:text-slate-300">
                  {numFmt.format(result.totalInvested)}
                  <span className="text-sm ml-0.5">₩</span>
                </p>
              </div>
            </div>

            {/* Year / Month view toggle */}
            <div className="flex gap-2 px-4 pt-4">
              <button
                type="button"
                onClick={() => setViewMode("year")}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
                  viewMode === "year"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {labels.yearLabel}
              </button>
              <button
                type="button"
                onClick={() => setViewMode("month")}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
                  viewMode === "month"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {labels.monthLabel}
              </button>
            </div>

            {/* Detail table */}
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-t border-border">
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground w-16">
                      {viewMode === "year" ? labels.yearLabel : labels.monthLabel}
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">
                      {labels.principalCol}
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">
                      {labels.profitCol}
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">
                      {labels.totalCol}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayRows.map((row, idx) => {
                    const period =
                      "year" in row
                        ? (row as { year: number }).year
                        : (row as { month: number }).month;
                    const isLoss = row.profit < 0;
                    return (
                      <tr
                        key={period}
                        className={cn(
                          "border-t border-border/50 transition-colors",
                          idx % 2 === 0 ? "bg-background" : "bg-muted/20",
                        )}
                      >
                        <td className="px-4 py-2.5 text-right text-muted-foreground font-mono tabular-nums">
                          {period}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums text-foreground">
                          {numFmt.format(row.principal)}
                        </td>
                        <td
                          className={cn(
                            "px-4 py-2.5 text-right font-mono tabular-nums",
                            isLoss
                              ? "text-red-600 dark:text-red-400"
                              : "text-green-600 dark:text-green-400",
                          )}
                        >
                          {!isLoss && "+"}
                          {numFmt.format(row.profit)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums text-foreground font-semibold">
                          {numFmt.format(row.total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleShare}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg border font-medium text-sm transition-colors",
                copied
                  ? "border-green-400 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300"
                  : "border-border hover:bg-accent text-foreground",
              )}
            >
              <Share2 className="h-4 w-4" />
              {labels.shareBtn}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-accent text-foreground font-medium text-sm transition-colors disabled:opacity-50"
            >
              <Image className="h-4 w-4" />
              {labels.downloadBtn}
            </button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground">{t.common.disclaimer}</p>
        </div>

        {/* Educational sections */}
        <div className="border-t border-border pt-10">
          {isKo ? <KoreanEducationalContent /> : <EnglishEducationalContent />}
        </div>
      </div>
    </>
  );
}
