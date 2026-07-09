import React, { useState, useRef, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { TrendingUp, Share2, Image } from "lucide-react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { useI18n } from "@/lib/i18n";
import { calcCompound, type CompoundResult } from "@/lib/calc/compound";
import { cn } from "@/lib/utils";

const DOMAIN = "https://fincalc.net";
const DEFAULT_PRINCIPAL = 1_000_000;
const DEFAULT_PERIODS = 20;
const DEFAULT_RATE = 5;

const FORMULA_HTML = katex.renderToString("F = P(1 + r)^{n}", {
  displayMode: true,
  throwOnError: false,
});

const RULE72_HTML = katex.renderToString("t \\approx \\dfrac{72}{r}", {
  displayMode: true,
  throwOnError: false,
});

function formatWon(n: number): string {
  return Math.round(n).toLocaleString("ko-KR");
}

function parseAmount(s: string): number {
  const n = parseFloat(s.replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? 0 : Math.max(0, Math.round(n));
}

function KatexDisplay({ html }: { html: string }) {
  return (
    <div
      className="overflow-x-auto py-2 text-foreground"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function ComparisonTable({ locale }: { locale: string }) {
  const headers =
    locale === "ko"
      ? ["기간", "단리 이자", "복리 이자"]
      : ["Period", "Simple Interest", "Compound Interest"];
  const rows =
    locale === "ko"
      ? [
          ["1기간", "₩1,000", "₩1,000"],
          ["2기간", "₩1,000", "₩1,100"],
          ["3기간", "₩1,000", "₩1,210"],
          ["합계", "₩3,000", "₩3,310"],
        ]
      : [
          ["1", "₩1,000", "₩1,000"],
          ["2", "₩1,000", "₩1,100"],
          ["3", "₩1,000", "₩1,210"],
          ["Total", "₩3,000", "₩3,310"],
        ];

  return (
    <div className="overflow-x-auto mt-4 mb-2">
      <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-muted/60">
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-2.5 text-left font-semibold text-foreground border-b border-border"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={cn(
                "border-b border-border last:border-0",
                i === rows.length - 1
                  ? "bg-primary/5 font-semibold"
                  : "hover:bg-muted/30",
              )}
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={cn(
                    "px-4 py-2.5",
                    j > 0 ? "font-mono tabular-nums" : "",
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
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
            <strong className="text-foreground">초기 금액(원금)</strong>을
            입력하세요. 예: 1,000,000원
          </li>
          <li>
            <strong className="text-foreground">복리 횟수(기간)</strong>를
            입력하세요. 연복리 기준으로 몇 년 간 투자할지를 의미합니다.
            (1~100)
          </li>
          <li>
            <strong className="text-foreground">수익률(%)</strong>을 연간
            기준으로 입력하세요. 음수 입력도 가능합니다.
          </li>
          <li>
            <strong className="text-foreground">계산하기</strong> 버튼을
            클릭하면 각 기간별 복리 수익과 최종 금액을 확인할 수 있습니다.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3 text-foreground">복리의 의미</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          복리(複利, Compound Interest)는 이자에 이자가 붙는 방식입니다.
          단리(單利)와 달리, 복리는 매 기간 발생한 이자가 원금에 합산되어 다음
          기간의 기준이 됩니다. 이 차이는 기간이 길어질수록 크게 벌어집니다.
        </p>
        <p className="text-sm text-muted-foreground mb-1">
          원금 ₩10,000 · 수익률 10% · 3기간 비교
        </p>
        <ComparisonTable locale="ko" />
        <p className="text-sm text-muted-foreground mt-2">
          단리는 원금(10,000원)에만 이자가 붙어 매 기간 1,000원이지만, 복리는
          누적 이자에도 이자가 붙어 3기간 후 합계가 310원 더 많습니다. 기간이
          길어질수록 이 차이는 기하급수적으로 커집니다.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3 text-foreground">복리의 공식</h2>
        <KatexDisplay html={FORMULA_HTML} />
        <div className="text-sm text-muted-foreground space-y-1 mt-3">
          <p>
            <strong className="text-foreground">F</strong> — 최종 금액(미래
            가치, Future Value)
          </p>
          <p>
            <strong className="text-foreground">P</strong> — 초기 금액(원금,
            Principal)
          </p>
          <p>
            <strong className="text-foreground">r</strong> — 기간당 수익률
            (예: 5% → r = 0.05)
          </p>
          <p>
            <strong className="text-foreground">n</strong> — 기간 수
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3 text-foreground">72의 법칙</h2>
        <KatexDisplay html={RULE72_HTML} />
        <p className="text-muted-foreground leading-relaxed mt-3">
          원금이 2배가 되는 데 걸리는 기간을 간단히 계산하는 방법입니다. 예를
          들어, 연간 수익률이 6%라면 72 ÷ 6 = <strong>12년</strong> 만에 원금이
          약 2배가 됩니다.
        </p>
        <p className="text-muted-foreground leading-relaxed mt-2">
          <strong className="text-foreground">왜 69.3이 아닌 72인가?</strong>{" "}
          수학적으로 정확한 값은 ln(2) × 100 ≈ 69.3이지만, 72는 1, 2, 3, 4, 6,
          8, 9, 12, 24, 36 등으로 나누어지기 때문에 암산이 훨씬 편리합니다.
          실용적인 수익률 범위(6~10%)에서는 72의 근삿값이 충분히 정확합니다.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3 text-foreground">활용법</h2>
        <ul className="space-y-2 text-muted-foreground list-disc list-inside leading-relaxed">
          <li>
            <strong className="text-foreground">장기 투자 계획</strong> —
            은퇴 자금, 목돈 마련 등 장기 투자의 목표 금액을 계산할 때 활용하세요.
          </li>
          <li>
            <strong className="text-foreground">대출 비교</strong> — 연이율을
            수익률로 입력하면 대출 원리금 상환액 추정에도 사용할 수 있습니다.
          </li>
          <li>
            <strong className="text-foreground">인플레이션 계산</strong> —
            수익률에 예상 인플레이션율을 입력하면 실질 구매력 변화를 확인할 수
            있습니다.
          </li>
          <li>
            <strong className="text-foreground">투자 시나리오 비교</strong> —
            서로 다른 수익률로 여러 번 계산해 투자 시나리오를 비교해 보세요.
          </li>
        </ul>
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
            Enter the <strong className="text-foreground">initial amount</strong>{" "}
            (principal) in Korean Won. Example: 1,000,000
          </li>
          <li>
            Enter the{" "}
            <strong className="text-foreground">number of periods</strong>. This
            represents how many years you plan to invest, based on annual
            compounding. (1–100)
          </li>
          <li>
            Enter the{" "}
            <strong className="text-foreground">annual rate of return</strong>{" "}
            (%). Negative values are supported.
          </li>
          <li>
            Click <strong className="text-foreground">Calculate</strong> to see
            the compound returns and final amount for each period.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3 text-foreground">
          What Is Compound Interest?
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          Compound interest is interest calculated on both the initial principal
          and the accumulated interest from previous periods. Unlike simple
          interest, compound interest grows exponentially — the interest you earn
          also earns interest. This difference becomes dramatic over long time
          horizons.
        </p>
        <p className="text-sm text-muted-foreground mb-1">
          ₩10,000 principal · 10% rate · 3 periods
        </p>
        <ComparisonTable locale="en" />
        <p className="text-sm text-muted-foreground mt-2">
          Simple interest pays ₩1,000 per period on the original principal only.
          Compound interest reinvests earnings, resulting in ₩310 more after
          just 3 periods. Over decades, this compounding effect is enormous.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3 text-foreground">The Formula</h2>
        <KatexDisplay html={FORMULA_HTML} />
        <div className="text-sm text-muted-foreground space-y-1 mt-3">
          <p>
            <strong className="text-foreground">F</strong> — Future Value (final
            amount)
          </p>
          <p>
            <strong className="text-foreground">P</strong> — Principal (initial
            investment)
          </p>
          <p>
            <strong className="text-foreground">r</strong> — Rate per period
            (e.g., 5% → r = 0.05)
          </p>
          <p>
            <strong className="text-foreground">n</strong> — Number of periods
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3 text-foreground">Rule of 72</h2>
        <KatexDisplay html={RULE72_HTML} />
        <p className="text-muted-foreground leading-relaxed mt-3">
          A simple mental math trick: divide 72 by the annual return rate to
          estimate how many years it takes for an investment to double. At 6%
          annual return, your investment doubles in approximately{" "}
          <strong className="text-foreground">72 ÷ 6 = 12 years</strong>.
        </p>
        <p className="text-muted-foreground leading-relaxed mt-2">
          <strong className="text-foreground">Why 72 and not 69.3?</strong> The
          mathematically precise value is ln(2) × 100 ≈ 69.3, but 72 has many
          more divisors (1, 2, 3, 4, 6, 8, 9, 12, 24, 36), making mental
          arithmetic far easier. For typical return rates of 6–10%, the
          approximation is accurate enough.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3 text-foreground">Use Cases</h2>
        <ul className="space-y-2 text-muted-foreground list-disc list-inside leading-relaxed">
          <li>
            <strong className="text-foreground">Retirement planning</strong> —
            Calculate how your savings grow over decades toward a target amount.
          </li>
          <li>
            <strong className="text-foreground">Loan comparisons</strong> — Enter
            the annual interest rate to estimate total repayment amounts.
          </li>
          <li>
            <strong className="text-foreground">Inflation adjustment</strong> —
            Use the expected inflation rate to see how purchasing power changes
            over time.
          </li>
          <li>
            <strong className="text-foreground">Investment scenarios</strong> —
            Compare different return rate assumptions side by side.
          </li>
        </ul>
      </section>
    </div>
  );
}

export default function CompoundPage() {
  const { t, locale } = useI18n();
  const { locale: localeParam } = useParams<{ locale: string }>();
  const loc = localeParam ?? locale;

  const [principalText, setPrincipalText] = useState(
    formatWon(DEFAULT_PRINCIPAL),
  );
  const [periodsText, setPeriodsText] = useState(String(DEFAULT_PERIODS));
  const [rateText, setRateText] = useState(String(DEFAULT_RATE));
  const [result, setResult] = useState<CompoundResult>(() =>
    calcCompound(DEFAULT_PRINCIPAL, DEFAULT_PERIODS, DEFAULT_RATE),
  );
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const captureRef = useRef<HTMLDivElement>(null);

  const numFmt =
    loc === "ko"
      ? new Intl.NumberFormat("ko-KR")
      : new Intl.NumberFormat("en-US");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const init = params.get("init");
    const p = params.get("periods");
    const r = params.get("rate");
    if (init !== null || p !== null || r !== null) {
      const newPrincipal =
        init !== null
          ? Math.max(0, Math.round(Number(init)))
          : DEFAULT_PRINCIPAL;
      const newPeriods =
        p !== null
          ? Math.min(100, Math.max(1, Math.round(Number(p))))
          : DEFAULT_PERIODS;
      const newRate =
        r !== null
          ? Math.min(1000, Math.max(-100, Number(r)))
          : DEFAULT_RATE;
      setPrincipalText(formatWon(newPrincipal));
      setPeriodsText(String(newPeriods));
      setRateText(String(newRate));
      setResult(calcCompound(newPrincipal, newPeriods, newRate));
    }
  }, []);

  const handleCalculate = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const p = parseAmount(principalText);
      const n = Math.min(100, Math.max(1, Math.round(Number(periodsText))));
      const r = Math.min(1000, Math.max(-100, Number(rateText)));
      setPrincipalText(formatWon(p));
      setPeriodsText(String(n));
      setRateText(String(r));
      setResult(calcCompound(p, n, r));
    },
    [principalText, periodsText, rateText],
  );

  const handleShare = useCallback(async () => {
    try {
      const url = new URL(window.location.href);
      url.search = "";
      url.searchParams.set("init", String(result.principal));
      url.searchParams.set("periods", String(result.periods));
      url.searchParams.set("rate", String(result.ratePercent));
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard access denied */
    }
  }, [result]);

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
      link.download = `fincalc-${loc}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("PNG export failed:", err);
    } finally {
      setDownloading(false);
    }
  }, [downloading, loc]);

  const koUrl = `${DOMAIN}/ko`;
  const enUrl = `${DOMAIN}/en`;
  const canonicalUrl = `${DOMAIN}/${loc}`;

  const isKo = loc === "ko";
  const labels = {
    principal: isKo ? "초기 금액 (₩)" : "Initial Amount (₩)",
    periods: isKo ? "복리 횟수 (기간)" : "Number of Periods",
    rate: isKo ? "수익률 (%)" : "Rate of Return (%)",
    totalProfit: isKo ? "총 수익" : "Total Profit",
    finalAmount: isKo ? "최종 금액" : "Final Amount",
    period: isKo ? "기간" : "Period",
    profit: isKo ? "수익 (₩)" : "Profit (₩)",
    total: isKo ? "총액 (₩)" : "Total (₩)",
    returnRate: isKo ? "수익률" : "Return",
    shareBtn: copied
      ? isKo
        ? "복사됨!"
        : "Copied!"
      : t.common.share,
    downloadBtn: downloading
      ? isKo
        ? "저장 중..."
        : "Saving..."
      : t.common.downloadImage,
  };

  const isProfit = result.totalProfit >= 0;

  return (
    <>
      <Helmet>
        <html lang={loc} />
        <title>{t.meta.compoundTitle}</title>
        <meta name="description" content={t.meta.compoundDesc} />
        <meta property="og:title" content={t.meta.compoundTitle} />
        <meta property="og:description" content={t.meta.compoundDesc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content={t.meta.siteName} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hrefLang="ko" href={koUrl} />
        <link rel="alternate" hrefLang="en" href={enUrl} />
        <link rel="alternate" hrefLang="x-default" href={koUrl} />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/30">
            <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {t.nav.compound}
          </h1>
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleCalculate}
          className="rounded-xl border border-border bg-card p-6 mb-6 space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {labels.principal}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={principalText}
                onChange={(e) => setPrincipalText(e.target.value)}
                onBlur={() => {
                  const n = parseAmount(principalText);
                  setPrincipalText(formatWon(n));
                }}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono text-right focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {labels.periods}
              </label>
              <input
                type="number"
                min="1"
                max="100"
                step="1"
                value={periodsText}
                onChange={(e) => setPeriodsText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono text-right focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {labels.rate}
              </label>
              <input
                type="number"
                min="-100"
                max="1000"
                step="0.01"
                value={rateText}
                onChange={(e) => setRateText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono text-right focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
              />
            </div>
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
          {/* Capture region for PNG */}
          <div
            ref={captureRef}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            {/* Summary cards */}
            <div className="grid grid-cols-2">
              <div className="p-5 border-r border-border bg-green-50 dark:bg-green-950/20">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-400 mb-2">
                  {labels.totalProfit}
                </p>
                <p
                  className={cn(
                    "text-2xl sm:text-3xl font-bold font-mono tabular-nums",
                    isProfit
                      ? "text-green-700 dark:text-green-300"
                      : "text-red-600 dark:text-red-400",
                  )}
                >
                  {isProfit ? "+" : ""}
                  {numFmt.format(result.totalProfit)}
                  <span className="text-lg ml-0.5">₩</span>
                </p>
              </div>
              <div className="p-5 bg-orange-50 dark:bg-orange-950/20">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400 mb-2">
                  {labels.finalAmount}
                </p>
                <p className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-orange-700 dark:text-orange-300">
                  {numFmt.format(result.finalAmount)}
                  <span className="text-lg ml-0.5">₩</span>
                </p>
              </div>
            </div>

            {/* Detail table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-t border-border">
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground w-12">
                      {labels.period}
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">
                      {labels.profit}
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">
                      {labels.total}
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground w-24">
                      {labels.returnRate}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, idx) => (
                    <tr
                      key={row.period}
                      className={cn(
                        "border-t border-border/50 transition-colors",
                        idx % 2 === 0
                          ? "bg-background"
                          : "bg-muted/20",
                      )}
                    >
                      <td className="px-4 py-2.5 text-right text-muted-foreground font-mono tabular-nums">
                        {row.period}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-2.5 text-right font-mono tabular-nums",
                          row.profit < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-foreground",
                        )}
                      >
                        {numFmt.format(row.profit)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums text-foreground">
                        {numFmt.format(row.total)}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-2.5 text-right font-mono tabular-nums",
                          row.cumulativeRate < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-green-600 dark:text-green-400",
                        )}
                      >
                        {row.cumulativeRate >= 0 ? "+" : ""}
                        {row.cumulativeRate.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
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
          <p className="text-xs text-muted-foreground">
            {t.common.disclaimer}
          </p>
        </div>

        {/* Educational sections */}
        <div className="border-t border-border pt-10">
          {isKo ? <KoreanEducationalContent /> : <EnglishEducationalContent />}
        </div>
      </div>
    </>
  );
}
