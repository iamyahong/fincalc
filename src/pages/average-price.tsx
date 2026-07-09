import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import {
  BarChart2,
  Plus,
  X,
  RotateCcw,
  Save,
  Menu,
  Download,
  Upload,
  Trash2,
  FolderOpen,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { calculateAveragePrice } from "@/lib/calc/averagePrice";
import { cn } from "@/lib/utils";

const DOMAIN = "https://fincalc.net";
const STORAGE_KEY = "averagePrice.savedLists";
const MAX_ROWS = 50;
const DEFAULT_ROW_COUNT = 4;

// ─── Types ──────────────────────────────────────────────────────────────────

interface Row {
  priceStr: string; // raw on focus, formatted on blur
  qtyStr: string;
}

interface SavedList {
  id: string;
  name: string;
  rows: { price: number; qty: number }[];
  createdAt: string;
  updatedAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function emptyRows(n: number): Row[] {
  return Array.from({ length: n }, () => ({ priceStr: "", qtyStr: "" }));
}

function parsePrice(s: string): number {
  const n = parseFloat(s.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : n;
}

function parseQty(s: string): number {
  const n = parseFloat(s);
  return isNaN(n) || n < 0 ? 0 : n;
}

function fmtPrice(s: string): string {
  const n = parsePrice(s);
  if (n === 0 && s.replace(/[^0-9.]/g, "") === "") return "";
  return n.toLocaleString("ko-KR");
}

function fmtNum(n: number, decimals = 0): string {
  return n.toLocaleString("ko-KR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

// Format quantity, removing only trailing zeros AFTER a decimal point
function fmtQty(qty: number): string {
  if (qty === 0) return "0";
  // Determine actual number of significant decimal places
  const str = parseFloat(qty.toPrecision(10)).toString();
  const decimals = str.includes(".") ? str.split(".")[1].length : 0;
  return qty.toLocaleString("ko-KR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: Math.min(decimals, 8),
  });
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function loadFromStorage(): SavedList[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedList[];
  } catch {
    return [];
  }
}

function saveToStorage(lists: SavedList[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  } catch {
    /* storage full */
  }
}

function exportFilename(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `average-price-backup-${y}${m}${day}.json`;
}

// ─── Toast ───────────────────────────────────────────────────────────────────

function Toast({ msg }: { msg: string }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-200">
      {msg}
    </div>
  );
}

// ─── Saved List Panel ─────────────────────────────────────────────────────────

interface PanelProps {
  isKo: boolean;
  lists: SavedList[];
  onClose: () => void;
  onLoad: (list: SavedList) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

function SavedListPanel({
  isKo,
  lists,
  onClose,
  onLoad,
  onDelete,
  onExport,
  onImport,
  fileInputRef,
}: PanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} />
      {/* Panel */}
      <div className="w-80 sm:w-96 bg-background border-l border-border flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <h2 className="font-semibold text-foreground text-base">
            {isKo ? "저장된 목록" : "Saved Lists"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={isKo ? "패널 닫기" : "Close panel"}
            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Import / Export toolbar */}
        <div className="flex gap-2 px-4 py-3 border-b border-border shrink-0">
          <button
            type="button"
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm text-foreground hover:bg-accent transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            {isKo ? "내보내기" : "Export"}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm text-foreground hover:bg-accent transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            {isKo ? "가져오기" : "Import"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={onImport}
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {lists.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm">
              {isKo ? "저장된 목록이 없습니다." : "No saved lists yet."}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {lists.map((list) => (
                <li key={list.id} className="flex items-center gap-2 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">
                      {list.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {fmtDate(list.updatedAt)} · {list.rows.length}
                      {isKo ? "개" : " rows"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onLoad(list)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity shrink-0"
                    aria-label={isKo ? `${list.name} 불러오기` : `Load ${list.name}`}
                  >
                    <FolderOpen className="h-3 w-3" />
                    {isKo ? "불러오기" : "Load"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(list.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-border text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0"
                    aria-label={isKo ? `${list.name} 삭제` : `Delete ${list.name}`}
                  >
                    <Trash2 className="h-3 w-3" />
                    {isKo ? "삭제" : "Delete"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Educational Content ──────────────────────────────────────────────────────

function KoreanEducationalContent() {
  return (
    <div className="space-y-10 text-foreground">
      <section>
        <h2 className="text-xl font-bold mb-3">사용법</h2>
        <ol className="space-y-2 text-muted-foreground list-decimal list-inside leading-relaxed">
          <li>각 행에 <strong className="text-foreground">매수 가격 (₩)</strong>과 <strong className="text-foreground">수량</strong>을 입력하세요. 소수점 수량도 입력 가능합니다 (코인 등).</li>
          <li><strong className="text-foreground">➕ 행 추가</strong>: 새로운 매수 내역 행을 추가합니다. 최대 50행까지 입력할 수 있습니다.</li>
          <li><strong className="text-foreground">❌ 행 삭제</strong>: 해당 행을 삭제합니다. 행이 1개만 남으면 삭제할 수 없습니다.</li>
          <li><strong className="text-foreground">↻ 초기화</strong>: 모든 입력을 지우고 4개의 빈 행으로 초기화합니다.</li>
          <li><strong className="text-foreground">💾 저장</strong>: 현재 입력 내용을 이름을 붙여 브라우저에 저장합니다. 비어 있는 행은 저장되지 않습니다.</li>
          <li><strong className="text-foreground">☰ 목록</strong>: 저장된 내역을 조회, 불러오기, 삭제하거나 JSON 형식으로 내보내기/가져오기할 수 있습니다.</li>
        </ol>
        <p className="text-xs text-muted-foreground mt-3 p-3 rounded-lg bg-muted/30 border border-border">
          ⚠️ 브라우저의 데이터를 삭제하면 저장된 정보가 삭제됩니다. 중요한 데이터는 내보내기를 통해 백업하세요.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">작동법</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          평단가(평균 매수가)는 여러 번에 걸쳐 매수한 자산의 평균 가격을 계산합니다.
        </p>
        <div className="p-4 rounded-lg bg-muted/30 border border-border text-sm font-mono text-muted-foreground mb-3">
          평단가 = Σ(매수 가격 × 수량) ÷ Σ(수량)
        </div>
        <p className="text-muted-foreground leading-relaxed text-sm">
          <strong className="text-foreground">예시</strong>: 100원에 100개 매수, 이후 200원에 200개 추가 매수<br />
          → (100 × 100 + 200 × 200) ÷ (100 + 200) = 50,000 ÷ 300 ≈ <strong className="text-foreground">167원</strong>
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">위험성</h2>
        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-sm leading-relaxed text-amber-900 dark:text-amber-200 space-y-2">
          <p>
            평단가를 낮추기 위해 하락 중인 자산에 추가 매수하는 전략(물타기)은 위험성이 있습니다.
          </p>
          <p>
            가격이 하락하는 데에는 기업의 실적 악화, 사업 모델의 구조적 문제 등 근본적인 이유가 있을 수 있습니다. 단순히 평단가가 낮아진다는 이유만으로 추가 매수 결정을 내리지 마세요.
          </p>
          <p>
            모든 투자 결정은 충분한 분석과 본인의 판단에 따라 이루어져야 합니다. 이 계산기는 참고용이며, 투자 권유가 아닙니다.
          </p>
        </div>
      </section>
    </div>
  );
}

function EnglishEducationalContent() {
  return (
    <div className="space-y-10 text-foreground">
      <section>
        <h2 className="text-xl font-bold mb-3">How to Use</h2>
        <ol className="space-y-2 text-muted-foreground list-decimal list-inside leading-relaxed">
          <li>Enter the <strong className="text-foreground">Price (₩)</strong> and <strong className="text-foreground">Quantity</strong> in each row. Decimal quantities are supported (e.g., 0.5 BTC).</li>
          <li><strong className="text-foreground">➕ Add Row</strong>: Adds a new row for another purchase lot. Maximum 50 rows.</li>
          <li><strong className="text-foreground">❌ Delete Row</strong>: Removes that row. Disabled when only one row remains.</li>
          <li><strong className="text-foreground">↻ Reset</strong>: Clears all inputs and restores 4 empty rows.</li>
          <li><strong className="text-foreground">💾 Save</strong>: Saves the current inputs under a name in browser storage. Empty rows are excluded.</li>
          <li><strong className="text-foreground">☰ List</strong>: View, load, delete, export, and import saved lists in JSON format.</li>
        </ol>
        <p className="text-xs text-muted-foreground mt-3 p-3 rounded-lg bg-muted/30 border border-border">
          ⚠️ Clearing browser data will erase saved lists. Use Export to back up important data.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">How It Works</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          The average price (cost basis) is calculated across multiple purchase lots.
        </p>
        <div className="p-4 rounded-lg bg-muted/30 border border-border text-sm font-mono text-muted-foreground mb-3">
          Average Price = Σ(price × qty) ÷ Σ(qty)
        </div>
        <p className="text-muted-foreground leading-relaxed text-sm">
          <strong className="text-foreground">Example</strong>: Buy 100 units at ₩100, then 200 units at ₩200<br />
          → (100 × 100 + 200 × 200) ÷ (100 + 200) = 50,000 ÷ 300 ≈ <strong className="text-foreground">₩167</strong>
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Risk Warning</h2>
        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-sm leading-relaxed text-amber-900 dark:text-amber-200 space-y-2">
          <p>
            Averaging down — buying more of a declining asset to lower your average price — carries significant risk.
          </p>
          <p>
            A falling price may reflect fundamental issues such as deteriorating earnings, structural business problems, or loss of market position. Do not add to a losing position solely because your average cost looks lower.
          </p>
          <p>
            All investment decisions should be based on thorough analysis and your own judgment. This calculator is for reference only and is not investment advice.
          </p>
        </div>
      </section>
    </div>
  );
}

// ─── Save Modal ──────────────────────────────────────────────────────────────

interface SaveModalProps {
  isKo: boolean;
  defaultName: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

function SaveModal({ isKo, defaultName, onConfirm, onCancel }: SaveModalProps) {
  const [name, setName] = useState(defaultName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.select();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onConfirm(name.trim() || defaultName);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-background rounded-xl border border-border shadow-xl w-full max-w-sm p-6">
        <h3 className="font-semibold text-foreground mb-4">
          {isKo ? "저장 이름 입력" : "Save Name"}
        </h3>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            data-testid="save-name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={defaultName}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 mb-4"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-accent transition-colors"
            >
              {isKo ? "취소" : "Cancel"}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {isKo ? "저장" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AveragePricePage() {
  const { t, locale } = useI18n();
  const { locale: localeParam } = useParams<{ locale: string }>();
  const loc = localeParam ?? locale;
  const isKo = loc === "ko";

  const [rows, setRows] = useState<Row[]>(() => emptyRows(DEFAULT_ROW_COUNT));
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; key: number } | null>(null);
  const [saveModal, setSaveModal] = useState<{ open: boolean; defaultName: string; pendingRows: { price: number; qty: number }[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved lists from localStorage on mount
  useEffect(() => {
    setSavedLists(loadFromStorage());
  }, []);

  // Persist savedLists to localStorage whenever they change
  useEffect(() => {
    saveToStorage(savedLists);
  }, [savedLists]);

  function showToast(msg: string) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ msg, key: Date.now() });
    toastTimerRef.current = setTimeout(() => setToast(null), 2500);
  }

  // ── Derived calculations (live, no button) ─────────────────────────────────

  const calcRows = useMemo(
    () => rows.map((r) => ({ price: parsePrice(r.priceStr), qty: parseQty(r.qtyStr) })),
    [rows],
  );

  const { totalAmount, totalQty, avgPrice } = useMemo(
    () => calculateAveragePrice(calcRows),
    [calcRows],
  );

  const sumPrices = useMemo(
    () => calcRows.reduce((s, r) => s + r.price, 0),
    [calcRows],
  );

  const rowTotals = useMemo(
    () => calcRows.map((r) => r.price * r.qty),
    [calcRows],
  );

  // ── Row operations ─────────────────────────────────────────────────────────

  function updateRow(idx: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  function handleAddRow() {
    if (rows.length >= MAX_ROWS) return;
    setRows((prev) => [...prev, { priceStr: "", qtyStr: "" }]);
  }

  function handleDeleteRow(idx: number) {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleReset() {
    const msg = isKo
      ? "모든 입력을 초기화하시겠습니까?"
      : "Reset all inputs?";
    if (!window.confirm(msg)) return;
    setRows(emptyRows(DEFAULT_ROW_COUNT));
  }

  // ── Save / Load ────────────────────────────────────────────────────────────

  function handleSave() {
    const nonEmpty = calcRows
      .filter((r) => r.price !== 0 || r.qty !== 0)
      .filter((r) => r.qty > 0 || r.price > 0);

    if (nonEmpty.length === 0) {
      showToast(isKo ? "저장할 항목이 없습니다." : "Nothing to save.");
      return;
    }

    const defaultName = isKo ? `평단가 ${todayStr()}` : `Avg Price ${todayStr()}`;
    setSaveModal({ open: true, defaultName, pendingRows: nonEmpty });
  }

  function confirmSave(name: string) {
    if (!saveModal) return;
    const now = new Date().toISOString();
    const newList: SavedList = {
      id: crypto.randomUUID(),
      name,
      rows: saveModal.pendingRows,
      createdAt: now,
      updatedAt: now,
    };
    setSavedLists((prev) => [newList, ...prev]);
    setSaveModal(null);
    showToast(isKo ? "저장되었습니다." : "Saved.");
  }

  function handleLoad(list: SavedList) {
    const hasData = calcRows.some((r) => r.price !== 0 || r.qty !== 0);
    if (hasData) {
      const msg = isKo
        ? "현재 입력 내용이 사라집니다. 계속하시겠습니까?"
        : "Current inputs will be cleared. Continue?";
      if (!window.confirm(msg)) return;
    }
    setRows(
      list.rows.length > 0
        ? list.rows.map((r) => ({
            priceStr: r.price > 0 ? r.price.toLocaleString("ko-KR") : "",
            qtyStr: r.qty > 0 ? String(r.qty) : "",
          }))
        : emptyRows(DEFAULT_ROW_COUNT),
    );
    setPanelOpen(false);
    showToast(isKo ? "불러왔습니다." : "Loaded.");
  }

  function handleDelete(id: string) {
    const msg = isKo
      ? "정말 삭제하시겠습니까?"
      : "Delete this list?";
    if (!window.confirm(msg)) return;
    setSavedLists((prev) => prev.filter((l) => l.id !== id));
    showToast(isKo ? "삭제되었습니다." : "Deleted.");
  }

  // ── Export / Import ────────────────────────────────────────────────────────

  function handleExport() {
    if (savedLists.length === 0) {
      alert(isKo ? "내보낼 데이터가 없습니다." : "No data to export.");
      return;
    }
    const blob = new Blob([JSON.stringify(savedLists, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = exportFilename();
    link.click();
    URL.revokeObjectURL(url);
  }

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result as string) as SavedList[];
          if (!Array.isArray(parsed)) throw new Error("Invalid format");
          // Validate basic schema and merge (skip duplicate ids)
          setSavedLists((prev) => {
            const existingIds = new Set(prev.map((l) => l.id));
            const newItems = parsed.filter(
              (item) =>
                item.id &&
                item.name &&
                Array.isArray(item.rows) &&
                !existingIds.has(item.id),
            );
            const msg = isKo
              ? `${newItems.length}개 항목을 가져왔습니다.`
              : `Imported ${newItems.length} item${newItems.length !== 1 ? "s" : ""}.`;
            showToast(msg);
            return [...newItems, ...prev];
          });
        } catch {
          alert(isKo ? "유효하지 않은 파일입니다." : "Invalid file format.");
        }
      };
      reader.readAsText(file);
      // Reset file input so same file can be re-imported
      e.target.value = "";
    },
    [isKo],
  );

  // ─────────────────────────────────────────────────────────────────────────

  const koUrl = `${DOMAIN}/ko/average-price`;
  const enUrl = `${DOMAIN}/en/average-price`;
  const canonicalUrl = `${DOMAIN}/${loc}/average-price`;

  const avgPriceDisplay =
    avgPrice === null ? "-" : fmtNum(Math.round(avgPrice));

  return (
    <>
      <Helmet>
        <html lang={loc} />
        <title>{t.meta.avgPriceTitle}</title>
        <meta name="description" content={t.meta.avgPriceDesc} />
        <meta property="og:title" content={t.meta.avgPriceTitle} />
        <meta property="og:description" content={t.meta.avgPriceDesc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content={t.meta.siteName} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hrefLang="ko" href={koUrl} />
        <link rel="alternate" hrefLang="en" href={enUrl} />
        <link rel="alternate" hrefLang="x-default" href={koUrl} />
      </Helmet>

      {/* Toast */}
      {toast && <Toast key={toast.key} msg={toast.msg} />}

      {/* Save Modal */}
      {saveModal?.open && (
        <SaveModal
          isKo={isKo}
          defaultName={saveModal.defaultName}
          onConfirm={confirmSave}
          onCancel={() => setSaveModal(null)}
        />
      )}

      {/* Saved list panel */}
      {panelOpen && (
        <SavedListPanel
          isKo={isKo}
          lists={savedLists}
          onClose={() => setPanelOpen(false)}
          onLoad={handleLoad}
          onDelete={handleDelete}
          onExport={handleExport}
          onImport={handleImport}
          fileInputRef={fileInputRef}
        />
      )}

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/30">
            <BarChart2 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {t.nav.averagePrice}
          </h1>
        </div>

        {/* Calculator card */}
        <div className="rounded-xl border border-border bg-card overflow-hidden mb-6">
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/20 flex-wrap">
            <button
              type="button"
              onClick={handleAddRow}
              disabled={rows.length >= MAX_ROWS}
              aria-label={isKo ? "행 추가" : "Add row"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="h-3.5 w-3.5" />
              {isKo ? "행 추가" : "Add Row"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              aria-label={isKo ? "초기화" : "Reset"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm text-foreground hover:bg-accent transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {isKo ? "초기화" : "Reset"}
            </button>

            <div className="flex-1" />

            <button
              type="button"
              onClick={handleSave}
              aria-label={isKo ? "저장" : "Save"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm text-foreground hover:bg-accent transition-colors"
            >
              <Save className="h-3.5 w-3.5" />
              {isKo ? "저장" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setPanelOpen(true)}
              aria-label={isKo ? "저장 목록 열기" : "Open saved lists"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm text-foreground hover:bg-accent transition-colors"
            >
              <Menu className="h-3.5 w-3.5" />
              {isKo ? "목록" : "Lists"}
            </button>
          </div>

          {/* Input table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="px-3 py-2.5 text-center w-8 text-muted-foreground font-semibold">
                    #
                  </th>
                  <th className="px-3 py-2.5 text-right text-muted-foreground font-semibold">
                    <label className="sr-only" htmlFor="price-col-header">
                      {isKo ? "가격" : "Price"}
                    </label>
                    {isKo ? "가격 (₩)" : "Price (₩)"}
                  </th>
                  <th className="px-1 py-2.5 text-center text-muted-foreground w-6">
                    ×
                  </th>
                  <th className="px-3 py-2.5 text-right text-muted-foreground font-semibold">
                    {isKo ? "수량" : "Quantity"}
                  </th>
                  <th className="px-1 py-2.5 text-center text-muted-foreground w-6">
                    =
                  </th>
                  <th className="px-3 py-2.5 text-right text-muted-foreground font-semibold">
                    {isKo ? "합계 (₩)" : "Total (₩)"}
                  </th>
                  <th className="px-2 py-2.5 w-8" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={cn(
                      "border-b border-border/50",
                      idx % 2 === 0 ? "bg-background" : "bg-muted/10",
                    )}
                  >
                    <td className="px-3 py-2 text-center text-muted-foreground font-mono text-xs">
                      {idx + 1}
                    </td>
                    <td className="px-2 py-1.5">
                      <label className="sr-only" htmlFor={`price-${idx}`}>
                        {isKo ? `${idx + 1}번 행 가격` : `Row ${idx + 1} price`}
                      </label>
                      <input
                        id={`price-${idx}`}
                        type="text"
                        inputMode="decimal"
                        value={row.priceStr}
                        placeholder={isKo ? "가격" : "Price"}
                        onChange={(e) => updateRow(idx, { priceStr: e.target.value })}
                        onFocus={() =>
                          updateRow(idx, {
                            priceStr: row.priceStr.replace(/,/g, ""),
                          })
                        }
                        onBlur={() =>
                          updateRow(idx, { priceStr: fmtPrice(row.priceStr) })
                        }
                        className="w-full px-2 py-1.5 rounded-md border border-border bg-background text-foreground font-mono text-right text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/50 transition-colors"
                      />
                    </td>
                    <td className="px-1 py-2 text-center text-muted-foreground text-xs">
                      ×
                    </td>
                    <td className="px-2 py-1.5">
                      <label className="sr-only" htmlFor={`qty-${idx}`}>
                        {isKo ? `${idx + 1}번 행 수량` : `Row ${idx + 1} quantity`}
                      </label>
                      <input
                        id={`qty-${idx}`}
                        type="text"
                        inputMode="decimal"
                        value={row.qtyStr}
                        placeholder={isKo ? "수량" : "Qty"}
                        onChange={(e) => updateRow(idx, { qtyStr: e.target.value })}
                        className="w-full px-2 py-1.5 rounded-md border border-border bg-background text-foreground font-mono text-right text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/50 transition-colors"
                      />
                    </td>
                    <td className="px-1 py-2 text-center text-muted-foreground text-xs">
                      =
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-sm tabular-nums text-foreground">
                      {rowTotals[idx] > 0 ? fmtNum(rowTotals[idx]) : "0"}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(idx)}
                        disabled={rows.length <= 1}
                        aria-label={
                          isKo ? `${idx + 1}번 행 삭제` : `Delete row ${idx + 1}`
                        }
                        className="p-1 rounded text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Totals row */}
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/30">
                  <td className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground">
                    Σ
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-sm text-muted-foreground">
                    {fmtNum(sumPrices)}
                  </td>
                  <td />
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-sm text-muted-foreground">
                    {fmtQty(totalQty)}
                  </td>
                  <td />
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-sm font-semibold text-foreground">
                    {fmtNum(totalAmount)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Results section */}
          <div className="border-t border-border">
            <div className="grid grid-cols-3">
              <div className="p-4 border-r border-border bg-orange-50 dark:bg-orange-950/20">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400 mb-1">
                  {isKo ? "평균 가격" : "Average Price"}
                </p>
                <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums break-all text-orange-700 dark:text-orange-300">
                  {avgPriceDisplay}
                  {avgPrice !== null && (
                    <span className="text-sm ml-0.5">₩</span>
                  )}
                </p>
              </div>
              <div className="p-4 border-r border-border bg-blue-50 dark:bg-blue-950/20">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1">
                  {isKo ? "총 수량" : "Total Qty"}
                </p>
                <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums break-all text-blue-700 dark:text-blue-300">
                  {fmtQty(totalQty)}
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/30">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                  {isKo ? "총 금액" : "Total Amount"}
                </p>
                <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums break-all text-slate-700 dark:text-slate-300">
                  {fmtNum(totalAmount)}
                  <span className="text-sm ml-0.5">₩</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground mb-10">
          {t.common.disclaimer}
        </p>

        {/* Educational sections */}
        <div className="border-t border-border pt-10">
          {isKo ? <KoreanEducationalContent /> : <EnglishEducationalContent />}
        </div>
      </div>
    </>
  );
}
