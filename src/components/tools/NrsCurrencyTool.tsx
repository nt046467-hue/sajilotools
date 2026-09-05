"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ArrowUpDown,
  RefreshCw,
  Search,
  Copy,
  Check,
  Coins,
  ChevronDown,
  X,
  BadgeCheck,
  LayoutGrid,
  Table as TableIcon,
  TrendingUp,
  ShieldCheck,
  Building2,
  Globe,
} from "lucide-react";
import { formatNepaliComma } from "@/lib/nepali-number-utils";
import { getCurrencyMeta } from "@/lib/currency-meta";
import CurrencyFlag from "@/components/shared/CurrencyFlag";

export interface RateInfo {
  name: string;
  symbol: string;
  buy: number;    // Rate per 1 foreign unit
  sell: number;   // Rate per 1 foreign unit
  unit: number;   // Official NRB quotation unit (e.g. 100 for INR, 10 for JPY)
  rawBuy?: number;
  rawSell?: number;
}

// Baseline fallback rates (used before live data loads)
const DEFAULT_RATES: Record<string, RateInfo> = {
  USD: { name: "US Dollar",          symbol: "$",    buy: 138.28, sell: 138.88, unit: 1,   rawBuy: 138.28, rawSell: 138.88 },
  EUR: { name: "Euro",               symbol: "€",    buy: 143.48, sell: 144.10, unit: 1,   rawBuy: 143.48, rawSell: 144.10 },
  GBP: { name: "British Pound",      symbol: "£",    buy: 173.50, sell: 174.25, unit: 1,   rawBuy: 173.50, rawSell: 174.25 },
  INR: { name: "Indian Rupee",       symbol: "₹",    buy: 1.60,   sell: 1.6015, unit: 100, rawBuy: 160.00, rawSell: 160.15 },
  AUD: { name: "Australian Dollar",  symbol: "A$",   buy: 88.50,  sell: 89.05,  unit: 1,   rawBuy: 88.50,  rawSell: 89.05  },
  CAD: { name: "Canadian Dollar",    symbol: "C$",   buy: 98.40,  sell: 99.00,  unit: 1,   rawBuy: 98.40,  rawSell: 99.00  },
  AED: { name: "UAE Dirham",         symbol: "AED",  buy: 37.65,  sell: 37.81,  unit: 1,   rawBuy: 37.65,  rawSell: 37.81  },
  QAR: { name: "Qatari Riyal",       symbol: "QAR",  buy: 37.95,  sell: 38.11,  unit: 1,   rawBuy: 37.95,  rawSell: 38.11  },
  SAR: { name: "Saudi Riyal",        symbol: "SAR",  buy: 36.86,  sell: 37.02,  unit: 1,   rawBuy: 36.86,  rawSell: 37.02  },
  MYR: { name: "Malaysian Ringgit",  symbol: "RM",   buy: 31.15,  sell: 31.30,  unit: 1,   rawBuy: 31.15,  rawSell: 31.30  },
  JPY: { name: "Japanese Yen",       symbol: "¥",    buy: 0.952,  sell: 0.956,  unit: 10,  rawBuy: 9.52,   rawSell: 9.56   },
  KRW: { name: "South Korean Won",   symbol: "₩",    buy: 0.106,  sell: 0.1064, unit: 100, rawBuy: 10.60,  rawSell: 10.64  },
  CNY: { name: "Chinese Yuan",       symbol: "¥",    buy: 19.10,  sell: 19.18,  unit: 1,   rawBuy: 19.10,  rawSell: 19.18  },
  SGD: { name: "Singapore Dollar",   symbol: "S$",   buy: 103.20, sell: 103.65, unit: 1,   rawBuy: 103.20, rawSell: 103.65 },
  CHF: { name: "Swiss Franc",        symbol: "CHF",  buy: 154.20, sell: 154.80, unit: 1,   rawBuy: 154.20, rawSell: 154.80 },
  HKD: { name: "Hong Kong Dollar",   symbol: "HK$",  buy: 17.70,  sell: 17.78,  unit: 1,   rawBuy: 17.70,  rawSell: 17.78  },
  KWD: { name: "Kuwaiti Dinar",      symbol: "KWD",  buy: 450.10, sell: 452.05, unit: 1,   rawBuy: 450.10, rawSell: 452.05 },
  BHD: { name: "Bahraini Dinar",     symbol: "BHD",  buy: 366.50, sell: 368.10, unit: 1,   rawBuy: 366.50, rawSell: 368.10 },
  OMR: { name: "Omani Rial",         symbol: "OMR",  buy: 359.10, sell: 360.65, unit: 1,   rawBuy: 359.10, rawSell: 360.65 },
  THB: { name: "Thai Baht",          symbol: "฿",    buy: 4.10,   sell: 4.12,   unit: 1,   rawBuy: 4.10,   rawSell: 4.12   },
};

const POPULAR_REMITTANCE_CODES = ["USD", "AED", "QAR", "SAR", "INR", "MYR", "AUD", "EUR"];

function formatPrecision(num: number): string {
  if (num === 0) return "0.00";
  if (Math.abs(num) < 0.001) return num.toFixed(5);
  if (Math.abs(num) < 0.01)  return num.toFixed(4);
  if (Math.abs(num) < 1)     return num.toFixed(3);
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function NrsCurrencyTool() {
  // ── Rate state ──────────────────────────────────────────────────────────
  const [rates, setRates]                 = useState<Record<string, RateInfo>>(DEFAULT_RATES);
  const [rateDate, setRateDate]           = useState<string>("");
  const [isOfficial, setIsOfficial]       = useState<boolean>(true);
  const [loading, setLoading]             = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  // ── Conversion state ────────────────────────────────────────────────────
  /** "FOREIGN_TO_NPR": remittance direction (most common for Nepali workers abroad) */
  const [direction, setDirection]         = useState<"FOREIGN_TO_NPR" | "NPR_TO_FOREIGN">("FOREIGN_TO_NPR");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD");
  const [rateType, setRateType]           = useState<"buy" | "sell">("buy");
  const [amountInput, setAmountInput]     = useState<string>("1000");
  const [copied, setCopied]               = useState<boolean>(false);

  // ── Currency Picker Modal ────────────────────────────────────────────────
  const [currencyModalOpen, setCurrencyModalOpen] = useState<boolean>(false);
  const [modalSearch, setModalSearch]     = useState<string>("");
  const [modalCategory, setModalCategory] = useState<string>("all");

  // ── Rates Browser state ─────────────────────────────────────────────────
  const [ratesSearch, setRatesSearch]     = useState<string>("");
  const [ratesFilter, setRatesFilter]     = useState<string>("all");
  const [viewMode, setViewMode]           = useState<"grid" | "table">("grid");

  // ── Fetch live NRB rates ────────────────────────────────────────────────
  const fetchRates = useCallback(async (force = false) => {
    setLoading(true);
    try {
      const url = force ? `/api/forex?force=true&t=${Date.now()}` : "/api/forex";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.rates) {
          setRates(data.rates);
          setRateDate(data.date || "");
          if (data.isOfficialNRB !== undefined) setIsOfficial(data.isOfficialNRB);
          setLastRefreshed(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        }
      }
    } catch (err) {
      console.error("Error fetching live rates:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRates(); }, [fetchRates]);

  // ── Derived values ──────────────────────────────────────────────────────
  const activeRateObj = useMemo(() => (
    rates[selectedCurrency] || DEFAULT_RATES[selectedCurrency] || { name: selectedCurrency, symbol: selectedCurrency, buy: 1, sell: 1, unit: 1 }
  ), [rates, selectedCurrency]);

  // getCurrencyMeta is dynamic — handles ANY code NRB returns, even new ones
  const activeMeta = useMemo(() => getCurrencyMeta(selectedCurrency, activeRateObj.name), [selectedCurrency, activeRateObj.name]);

  const activeRate   = rateType === "buy" ? activeRateObj.buy : activeRateObj.sell;
  const unit         = activeRateObj.unit || 1;

  const numericInput = parseFloat(amountInput) || 0;

  const convertedResult = useMemo(() => {
    if (numericInput <= 0 || !activeRate) return 0;
    return direction === "FOREIGN_TO_NPR" ? numericInput * activeRate : numericInput / activeRate;
  }, [numericInput, activeRate, direction]);

  // ── Swap direction ──────────────────────────────────────────────────────
  const handleSwapDirection = () => {
    setDirection((prev) => prev === "FOREIGN_TO_NPR" ? "NPR_TO_FOREIGN" : "FOREIGN_TO_NPR");
    if (convertedResult > 0) setAmountInput(String(Math.round(convertedResult * 100) / 100));
  };

  // ── Copy result ─────────────────────────────────────────────────────────
  const handleCopyResult = () => {
    if (convertedResult <= 0) return;
    const text = direction === "FOREIGN_TO_NPR"
      ? `${numericInput.toLocaleString()} ${activeMeta.code} = रु ${formatNepaliComma(convertedResult.toFixed(2))} NPR (NRB ${rateType.toUpperCase()} Rate: 1 ${activeMeta.code} = Rs. ${activeRate}) via SajiloTools`
      : `NPR ${formatNepaliComma(numericInput)} = ${activeMeta.symbol} ${formatPrecision(convertedResult)} ${activeMeta.code} via SajiloTools`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectCurrency = (code: string) => { setSelectedCurrency(code); setCurrencyModalOpen(false); };

  // ── Quick presets ───────────────────────────────────────────────────────
  const presets = useMemo(() => {
    if (direction === "FOREIGN_TO_NPR") return [
      { label: "100",   val: 100   },
      { label: "500",   val: 500   },
      { label: "1,000", val: 1000  },
      { label: "2,500", val: 2500  },
      { label: "5,000", val: 5000  },
    ];
    return [
      { label: "5K",   val: 5000   },
      { label: "10K",  val: 10000  },
      { label: "50K",  val: 50000  },
      { label: "1L",   val: 100000 },
      { label: "5L",   val: 500000 },
    ];
  }, [direction]);

  // ── Modal currency list ─────────────────────────────────────────────────
  const modalCurrencies = useMemo(() => {
    const list = Object.keys(rates).map((code) => {
      const meta = getCurrencyMeta(code, rates[code].name);
      return { ...meta, rate: rates[code] };
    });

    return list.filter((item) => {
      const q = modalSearch.toLowerCase().trim();
      const matchesSearch = !q ||
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.country.toLowerCase().includes(q);
      const matchesCat =
        modalCategory === "all" ||
        (modalCategory === "popular" && item.popular) ||
        item.category === modalCategory;
      return matchesSearch && matchesCat;
    });
  }, [rates, modalSearch, modalCategory]);

  // ── Rates browser filter ────────────────────────────────────────────────
  const filteredRatesList = useMemo(() => {
    return Object.entries(rates).filter(([code, data]) => {
      const meta = getCurrencyMeta(code, data.name);
      const q = ratesSearch.toLowerCase().trim();
      const matchesQuery = !q ||
        code.toLowerCase().includes(q) ||
        data.name.toLowerCase().includes(q) ||
        meta.country.toLowerCase().includes(q);
      const matchesFilter =
        ratesFilter === "all" ||
        (ratesFilter === "popular" && meta.popular) ||
        meta.category === ratesFilter;
      return matchesQuery && matchesFilter;
    });
  }, [rates, ratesSearch, ratesFilter]);

  return (
    <div className="space-y-4 sm:space-y-6 w-full">

      {/* ── 1. COMPACT LIVE NRB HEADER ─────────────────────────────────── */}
      <div className="p-2.5 sm:p-4 rounded-2xl bg-[#FAFAF8] dark:bg-[#0C0F1E] border border-[#E4E0D8] dark:border-[#1E2338] shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center shrink-0">
            {loading
              ? <RefreshCw size={15} className="animate-spin text-[#22C55E]" />
              : <Building2 size={16} />
            }
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-[#18181B] dark:text-[#F4F4F5] truncate">
                Nepal Rastra Bank (NRB) Official Forex
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-[#22C55E]/10 text-[#22C55E]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                {isOfficial ? "Live Official" : "Live Data"}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#71717A] dark:text-[#A1A1AA] truncate">
              {rateDate
                ? <><span>Published: </span><strong>{rateDate}</strong>{lastRefreshed && <span className="opacity-70 hidden sm:inline"> • Checked {lastRefreshed}</span>}</>
                : "Loading central bank exchange rates..."
              }
            </p>
          </div>
        </div>

        {/* Buy/Sell Toggle + Refresh */}
        <div className="flex items-center gap-1.5 shrink-0 justify-between sm:justify-end">
          <div className="flex p-0.5 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-xl text-xs flex-1 sm:flex-initial">
            <button
              type="button"
              onClick={() => setRateType("buy")}
              title="Bank Buys foreign currency from you (Best for remittances to Nepal)"
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${rateType === "buy" ? "bg-[#22C55E] text-white shadow-2xs" : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"}`}
            >NRB Buy</button>
            <button
              type="button"
              onClick={() => setRateType("sell")}
              title="Bank Sells foreign currency to you (Best for studying or traveling abroad)"
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${rateType === "sell" ? "bg-[#22C55E] text-white shadow-2xs" : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"}`}
            >NRB Sell</button>
          </div>

          <button
            type="button"
            onClick={() => fetchRates(true)}
            disabled={loading}
            className="w-8 h-8 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] hover:bg-[#F0EDE8] dark:hover:bg-[#1E2338] text-[#71717A] dark:text-[#A1A1AA] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Refresh Live NRB Rates directly from Central Bank"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ── 2. WORKSTATION GRID (Full Width, Split on Laptop/Desktop) ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">

        {/* LEFT COLUMN: Primary Converter (7 cols on lg, 8 on xl) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#FAFAF8] dark:bg-[#0C0F1E] border border-[#E4E0D8] dark:border-[#1E2338] shadow-xs space-y-3 sm:space-y-4">

            {/* Send + Swap + Receive */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 relative">

              {/* YOU SEND panel */}
              <div className="flex-1 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#2A2F48] space-y-1 sm:space-y-1.5 focus-within:border-[#22C55E] transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#71717A]">
                    You Send
                  </span>

                  {/* Currency selector pill */}
                  {direction === "FOREIGN_TO_NPR" ? (
                    <button
                      type="button"
                      onClick={() => setCurrencyModalOpen(true)}
                      className="min-h-[34px] sm:min-h-[38px] flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] shadow-2xs text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] hover:border-[#22C55E] cursor-pointer transition-all active:scale-95"
                    >
                      <CurrencyFlag code={selectedCurrency} size="xs" />
                      <span>{activeMeta.code}</span>
                      <ChevronDown size={12} className="text-[#71717A]" />
                    </button>
                  ) : (
                    <div className="min-h-[34px] sm:min-h-[38px] flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] shadow-2xs">
                      <CurrencyFlag code="NPR" size="xs" />
                      <span>NPR (रु)</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-sm sm:text-lg font-bold text-[#71717A] font-mono select-none shrink-0">
                    {direction === "FOREIGN_TO_NPR" ? activeMeta.symbol : "रु"}
                  </span>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-transparent text-xl sm:text-3xl font-black font-mono text-[#18181B] dark:text-[#F4F4F5] focus:outline-none placeholder:text-[#A1A1AA] leading-none"
                  />
                  {amountInput && (
                    <button
                      type="button"
                      onClick={() => setAmountInput("")}
                      className="text-[#71717A] hover:text-[#18181B] dark:hover:text-white p-0.5 rounded-md cursor-pointer shrink-0"
                      title="Clear input"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="text-[10px] text-[#71717A] truncate font-medium">
                  {direction === "FOREIGN_TO_NPR"
                    ? `${activeMeta.name} · ${activeMeta.country}`
                    : "Nepalese Rupee · Nepal"}
                </div>
              </div>

              {/* SWAP button */}
              <div className="flex justify-center my-0 z-10 shrink-0 sm:self-center">
                <button
                  type="button"
                  onClick={handleSwapDirection}
                  title="Flip conversion direction"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-[#1E2338] border-2 border-[#E4E0D8] dark:border-[#2A2F48] shadow-sm hover:border-[#22C55E] text-[#22C55E] hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer group rotate-90 sm:rotate-0"
                >
                  <ArrowUpDown size={15} className="sm:hidden group-hover:rotate-180 transition-transform duration-300" />
                  <ArrowUpDown size={17} className="hidden sm:block group-hover:rotate-180 transition-transform duration-300" />
                </button>
              </div>

              {/* RECIPIENT GETS panel */}
              <div className="flex-1 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#2A2F48] space-y-1 sm:space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#71717A]">
                    Recipient Gets
                  </span>

                  {direction === "FOREIGN_TO_NPR" ? (
                    <div className="min-h-[34px] sm:min-h-[38px] flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] shadow-2xs">
                      <CurrencyFlag code="NPR" size="xs" />
                      <span>NPR (रु)</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCurrencyModalOpen(true)}
                      className="min-h-[34px] sm:min-h-[38px] flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] shadow-2xs text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] hover:border-[#22C55E] cursor-pointer transition-all active:scale-95"
                    >
                      <CurrencyFlag code={selectedCurrency} size="xs" />
                      <span>{activeMeta.code}</span>
                      <ChevronDown size={12} className="text-[#71717A]" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-sm sm:text-lg font-bold text-[#22C55E] font-mono select-none shrink-0">
                    {direction === "FOREIGN_TO_NPR" ? "रु" : activeMeta.symbol}
                  </span>
                  <div className="w-full text-xl sm:text-3xl font-black font-mono text-[#22C55E] truncate leading-none">
                    {convertedResult > 0
                      ? (direction === "FOREIGN_TO_NPR" ? formatNepaliComma(convertedResult.toFixed(2)) : formatPrecision(convertedResult))
                      : "0.00"
                    }
                  </div>
                </div>

                <div className="text-[10px] text-[#71717A] truncate font-medium">
                  {direction === "FOREIGN_TO_NPR"
                    ? "Nepalese Rupee (NPR)"
                    : `${activeMeta.name} (${activeMeta.code})`}
                </div>
              </div>
            </div>

            {/* Quick Amount Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider whitespace-nowrap shrink-0 mr-1">
                Quick:
              </span>
              {presets.map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => setAmountInput(String(p.val))}
                  className={`min-h-[30px] px-2.5 py-1 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                    amountInput === String(p.val)
                      ? "bg-[#22C55E] text-white shadow-2xs"
                      : "bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#2A2F48] text-[#18181B] dark:text-[#F4F4F5] hover:border-[#22C55E]"
                  }`}
                >
                  {direction === "FOREIGN_TO_NPR"
                    ? `${activeMeta.symbol}${p.label}`
                    : `रु${p.label}`}
                </button>
              ))}
            </div>

            {/* Result Banner */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#22C55E]/10 via-[#10B981]/10 to-[#059669]/10 border border-[#22C55E]/25">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#22C55E] flex items-center gap-1">
                  <BadgeCheck size={12} /> Official Conversion Result
                </span>
                <button
                  type="button"
                  onClick={handleCopyResult}
                  disabled={convertedResult <= 0}
                  className="min-h-[28px] sm:min-h-[32px] px-2.5 py-1 rounded-lg bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#2A2F48] shadow-2xs text-[10px] sm:text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] hover:border-[#22C55E] flex items-center gap-1 cursor-pointer shrink-0 transition-all active:scale-95 disabled:opacity-50"
                >
                  {copied
                    ? <><Check size={12} className="text-[#22C55E]" /><span className="text-[#22C55E]">Copied!</span></>
                    : <><Copy size={12} /><span>Copy</span></>
                  }
                </button>
              </div>

              {/* Main result — wraps nicely instead of truncating */}
              <div className="text-base sm:text-2xl font-black font-mono text-[#18181B] dark:text-white leading-snug break-words">
                {numericInput > 0 ? (
                  direction === "FOREIGN_TO_NPR" ? (
                    <>{numericInput.toLocaleString()} {activeMeta.code} = <span className="text-[#22C55E]">रु {formatNepaliComma(convertedResult.toFixed(2))} NPR</span></>
                  ) : (
                    <>रु {formatNepaliComma(numericInput)} NPR = <span className="text-[#22C55E]">{activeMeta.symbol} {formatPrecision(convertedResult)} {activeMeta.code}</span></>
                  )
                ) : <span className="text-[#71717A] font-medium text-sm">Enter an amount above to convert</span>}
              </div>

              <div className="text-[10px] sm:text-[11px] text-[#71717A] dark:text-[#A1A1AA] flex items-center gap-1.5 flex-wrap font-medium mt-1">
                <span>NRB {rateType.toUpperCase()}: 1 {activeMeta.code} = Rs. {activeRate.toFixed(2)}</span>
                {unit > 1 && <><span>·</span><span>Per {unit} units</span></>}
                <span>·</span>
                <span>1 NPR = {(1 / activeRate).toFixed(5)} {activeMeta.code}</span>
              </div>
            </div>
          </div>

          {/* Info cards (Side by side on tablet/desktop, stacked on mobile) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#0C0F1E] border border-[#E4E0D8] dark:border-[#1E2338] shadow-2xs flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center shrink-0 mt-0.5">
                <TrendingUp size={14} />
              </div>
              <div>
                <span className="font-bold text-[#18181B] dark:text-[#F4F4F5] block">NRB Buy vs Sell Rate</span>
                <p className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] leading-relaxed mt-0.5">
                  Banks <strong>Buy</strong> foreign currency from you (sending remittance to Nepal). Banks <strong>Sell</strong> foreign currency to you (traveling or tuition abroad).
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#0C0F1E] border border-[#E4E0D8] dark:border-[#1E2338] shadow-2xs flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck size={14} />
              </div>
              <div>
                <span className="font-bold text-[#18181B] dark:text-[#F4F4F5] block">100% Tax-Free Remittance</span>
                <p className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] leading-relaxed mt-0.5">
                  Official documented remittances sent to family members in Nepal are completely exempt from personal income tax under IRD Nepal regulations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Remittance Board (Laptop & Desktop) */}
        <div className="hidden lg:flex flex-col space-y-3.5 lg:col-span-5 xl:col-span-4">
          {/* Top Remittance Rates Card */}
          <div className="p-4 rounded-2xl sm:rounded-3xl bg-[#FAFAF8] dark:bg-[#0C0F1E] border border-[#E4E0D8] dark:border-[#1E2338] shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E4E0D8]/60 dark:border-[#1E2338]">
              <div>
                <h4 className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-[#22C55E]" /> Popular Remittance Rates
                </h4>
                <p className="text-[10px] text-[#71717A] dark:text-[#A1A1AA]">
                  Live NRB buy rates to NPR
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-[#22C55E]/10 text-[#22C55E]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" /> Live
              </span>
            </div>

            <div className="divide-y divide-[#E4E0D8]/60 dark:divide-[#1E2338]/60">
              {POPULAR_REMITTANCE_CODES.map((code) => {
                const data = rates[code];
                if (!data) return null;
                const meta = getCurrencyMeta(code, data.name);
                const isSelected = selectedCurrency === code;
                const u = data.unit || 1;
                const displayBuy = data.rawBuy !== undefined ? data.rawBuy : data.buy * u;

                return (
                  <div
                    key={code}
                    className={`py-2 px-2 rounded-xl flex items-center justify-between gap-2 transition-all ${
                      isSelected
                        ? "bg-[#22C55E]/10 border border-[#22C55E]/40"
                        : "hover:bg-white dark:hover:bg-[#141829]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <CurrencyFlag code={code} size="sm" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">
                            {code}
                          </span>
                          {u > 1 && (
                            <span className="text-[8px] font-semibold text-[#71717A]">
                              (Per {u})
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#71717A] truncate block max-w-[120px]">
                          {meta.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-bold font-mono text-[#18181B] dark:text-[#F4F4F5] block">
                          Rs. {displayBuy.toFixed(2)}
                        </span>
                        <span className="text-[9px] text-[#71717A] font-mono">
                          1 {code}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectCurrency(code)}
                        className={`min-h-[28px] px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#22C55E] text-white shadow-2xs"
                            : "bg-white dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-[#18181B] dark:text-[#F4F4F5] hover:border-[#22C55E]"
                        }`}
                      >
                        {isSelected ? "Active" : "Use"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick NRB Forex Notice Card */}
          <div className="p-3.5 rounded-2xl bg-[#FAFAF8] dark:bg-[#0C0F1E] border border-[#E4E0D8] dark:border-[#1E2338] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">
              <ShieldCheck size={14} className="text-[#22C55E]" />
              <span>Official Central Bank Source</span>
            </div>
            <p className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
              Rates are updated daily according to Nepal Rastra Bank's Foreign Exchange Department bulletin. Commercial bank counter rates may vary slightly due to transfer fees.
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. ALL OFFICIAL NRB RATES BROWSER (Full width) ─────────────── */}
      <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#FAFAF8] dark:bg-[#0C0F1E] border border-[#E4E0D8] dark:border-[#1E2338] shadow-xs space-y-3.5">

        {/* Header + view toggles */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h4 className="text-xs sm:text-sm font-bold text-[#18181B] dark:text-[#F4F4F5] uppercase tracking-wider flex items-center gap-1.5">
            <Coins size={15} className="text-[#22C55E]" />
            All Official NRB Rates ({filteredRatesList.length})
          </h4>

          <div className="flex p-0.5 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1 sm:px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${viewMode === "grid" ? "bg-[#22C55E] text-white shadow-2xs" : "text-[#71717A] hover:text-[#18181B]"}`}
              title="Cards View"
            >
              <LayoutGrid size={14} /><span className="hidden sm:inline">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1 sm:px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${viewMode === "table" ? "bg-[#22C55E] text-white shadow-2xs" : "text-[#71717A] hover:text-[#18181B]"}`}
              title="Table View"
            >
              <TableIcon size={14} /><span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            value={ratesSearch}
            onChange={(e) => setRatesSearch(e.target.value)}
            placeholder="Search by code or country (e.g. USD, UAE, Saudi, Yen)..."
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-white dark:bg-[#141829] text-xs text-[#18181B] dark:text-[#F4F4F5] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/40"
          />
        </div>

        {/* Filter tabs — Sleek, compact fintech pills */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {[
            { id: "all",     label: "All" },
            { id: "popular", label: "Popular" },
            { id: "gulf",    label: "Gulf" },
            { id: "major",   label: "Western" },
            { id: "asia",    label: "Asia" },
            { id: "europe",  label: "Europe" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setRatesFilter(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                ratesFilter === cat.id
                  ? "bg-[#22C55E] text-white font-semibold shadow-2xs"
                  : "bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* CARD VIEW — 4 columns on laptop/desktop */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {filteredRatesList.map(([code, data]) => {
              const meta = getCurrencyMeta(code, data.name);
              const isSelected = selectedCurrency === code;
              const u = data.unit || 1;
              const displayBuy  = data.rawBuy  !== undefined ? data.rawBuy  : data.buy  * u;
              const displaySell = data.rawSell !== undefined ? data.rawSell : data.sell * u;

              return (
                <div
                  key={code}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? "bg-[#22C55E]/10 border-[#22C55E] shadow-2xs ring-1 ring-[#22C55E]"
                      : "bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] hover:border-[#22C55E]/60"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="shrink-0">
                      {meta.iso2
                        ? <CurrencyFlag code={code} size="md" />
                        : <div className="w-8 h-6 rounded bg-[#E4E0D8] dark:bg-[#2A2F48] flex items-center justify-center"><Globe size={13} className="text-[#71717A]" /></div>
                      }
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">{code}</span>
                        {u > 1 && (
                          <span className="text-[9px] font-bold px-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">Per {u}</span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#71717A] truncate block">{meta.name}</span>
                      <div className="flex items-center gap-2 text-[11px] font-mono mt-0.5">
                        <span>Buy: <strong className="text-[#18181B] dark:text-[#F4F4F5]">Rs.{displayBuy.toFixed(2)}</strong></span>
                        <span className="text-[#71717A]">•</span>
                        <span>Sell: <strong className="text-[#18181B] dark:text-[#F4F4F5]">Rs.{displaySell.toFixed(2)}</strong></span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => { handleSelectCurrency(code); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      isSelected
                        ? "bg-[#22C55E] text-white shadow-2xs"
                        : "bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-[#18181B] dark:text-[#F4F4F5] hover:border-[#22C55E]"
                    }`}
                  >
                    {isSelected ? "Active" : "Convert"}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="overflow-x-auto rounded-xl border border-[#E4E0D8] dark:border-[#1E2338]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white dark:bg-[#141829] border-b border-[#E4E0D8] dark:border-[#1E2338] text-[#71717A] uppercase text-[10px] tracking-wider font-bold">
                  <th className="p-2.5 sm:p-3">Currency</th>
                  <th className="p-2.5 sm:p-3">Unit</th>
                  <th className="p-2.5 sm:p-3">NRB Buy (रु)</th>
                  <th className="p-2.5 sm:p-3">NRB Sell (रु)</th>
                  <th className="p-2.5 sm:p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E0D8]/60 dark:divide-[#1E2338]">
                {filteredRatesList.map(([code, data]) => {
                  const meta = getCurrencyMeta(code, data.name);
                  const isSelected = selectedCurrency === code;
                  const u = data.unit || 1;
                  const displayBuy  = data.rawBuy  !== undefined ? data.rawBuy  : data.buy  * u;
                  const displaySell = data.rawSell !== undefined ? data.rawSell : data.sell * u;

                  return (
                    <tr key={code} className={`hover:bg-white dark:hover:bg-[#141829] transition-colors ${isSelected ? "bg-[#22C55E]/5" : ""}`}>
                      <td className="p-2.5 sm:p-3 font-bold text-[#18181B] dark:text-[#F4F4F5]">
                        <div className="flex items-center gap-2">
                          <CurrencyFlag code={code} size="md" fallbackName={data.name} />
                          <div>
                            <div>{code}</div>
                            <div className="text-[10px] font-normal text-[#71717A]">{meta.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-2.5 sm:p-3 font-mono font-medium text-[#71717A]">{u > 1 ? `${u} Units` : "1 Unit"}</td>
                      <td className="p-2.5 sm:p-3 font-mono font-bold text-[#18181B] dark:text-[#F4F4F5]">Rs. {displayBuy.toFixed(2)}</td>
                      <td className="p-2.5 sm:p-3 font-mono font-bold text-[#18181B] dark:text-[#F4F4F5]">Rs. {displaySell.toFixed(2)}</td>
                      <td className="p-2.5 sm:p-3 text-right">
                        <button
                          type="button"
                          onClick={() => { handleSelectCurrency(code); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          className={`min-h-[30px] px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#22C55E] text-white shadow-2xs"
                              : "bg-white dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-[#18181B] dark:text-[#F4F4F5] hover:border-[#22C55E]"
                          }`}
                        >
                          {isSelected ? "Active" : "Convert"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 5. CURRENCY PICKER MODAL / BOTTOM SHEET ─────────────────────── */}
      {currencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={() => setCurrencyModalOpen(false)} />

          <div className="relative w-full max-w-lg bg-white dark:bg-[#141829] border-t sm:border border-[#E4E0D8] dark:border-[#1E2338] rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col z-10 animate-in zoom-in-95 duration-150">
            {/* Modal header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E0D8]/60 dark:border-[#1E2338]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center shrink-0">
                  <Coins size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-[#18181B] dark:text-[#F4F4F5]">
                      Select Foreign Currency
                    </h3>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#22C55E]/10 text-[#22C55E]">
                      NRB Official
                    </span>
                  </div>
                  <p className="text-[11px] text-[#71717A] dark:text-[#A1A1AA]">
                    Choose from central bank official published forex
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCurrencyModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[#71717A] hover:text-[#18181B] dark:hover:text-white hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338] cursor-pointer transition-colors"
                title="Close modal"
              >
                <X size={17} />
              </button>
            </div>

            {/* Modal search */}
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
              <input
                type="text"
                autoFocus
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                placeholder="Search by currency code, country (USD, UAE, Yen)..."
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#0C0F1E] text-xs sm:text-sm text-[#18181B] dark:text-[#F4F4F5] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/40 transition-all placeholder:text-[#71717A]"
              />
              {modalSearch && (
                <button
                  type="button"
                  onClick={() => setModalSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#18181B] dark:hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Modal category tabs — strictly no horizontal scrollbar */}
            <div
              className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px] shrink-0"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {[
                { id: "all",     label: "All" },
                { id: "popular", label: "Popular" },
                { id: "gulf",    label: "Gulf" },
                { id: "major",   label: "Western" },
                { id: "asia",    label: "Asia" },
                { id: "europe",  label: "Europe" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setModalCategory(t.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap cursor-pointer transition-all ${
                    modalCategory === t.id
                      ? "bg-[#22C55E] text-white font-semibold shadow-2xs"
                      : "bg-[#FAFAF8] dark:bg-[#0C0F1E] border border-[#E4E0D8] dark:border-[#1E2338] text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Modal currency list with sleek custom-scrollbar */}
            <div
              className="overflow-y-auto space-y-1.5 flex-1 pr-1.5 custom-scrollbar max-h-[50vh]"
            >
              {modalCurrencies.map((c) => {
                const isSelected = selectedCurrency === c.code;
                const u = c.rate?.unit || 1;
                const buyRate = c.rate?.buy ? c.rate.buy : 0;
                const displayBuy = c.rate?.rawBuy !== undefined ? c.rate.rawBuy : buyRate * u;

                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelectCurrency(c.code)}
                    className={`w-full p-2.5 sm:p-3 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#22C55E]/10 border border-[#22C55E] shadow-2xs"
                        : "bg-[#FAFAF8] dark:bg-[#0C0F1E] hover:bg-white dark:hover:bg-[#1E2338] border border-transparent hover:border-[#E4E0D8] dark:hover:border-[#2A2F48]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <CurrencyFlag code={c.code} size="lg" fallbackName={c.name} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-bold text-[#18181B] dark:text-[#F4F4F5]">
                            {c.code}
                          </span>
                          <span className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] truncate">
                            {c.name}
                          </span>
                          {u > 1 && (
                            <span className="text-[9px] font-bold px-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                              Per {u}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#71717A] block truncate">
                          {c.country}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right font-mono">
                        <div className="text-xs sm:text-sm font-bold text-[#18181B] dark:text-[#F4F4F5]">
                          Rs. {displayBuy.toFixed(2)}
                        </div>
                        <span className="text-[9px] text-[#71717A]">NRB Buy</span>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-[#22C55E] text-white flex items-center justify-center shrink-0">
                          <Check size={13} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}

              {modalCurrencies.length === 0 && (
                <div className="text-center py-8 text-xs text-[#71717A]">
                  No currencies match &quot;{modalSearch}&quot;
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
