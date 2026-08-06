"use client";

import { useState, useEffect } from "react";
import { ArrowLeftRight, Coins, RefreshCw, CheckCircle2, Search, Info, HelpCircle } from "lucide-react";

interface RateInfo {
  name: string;
  symbol: string;
  buy: number;
  sell: number;
  unit?: number;
  rawBuy?: number;
  rawSell?: number;
}

const DEFAULT_RATES: Record<string, RateInfo> = {
  USD: { name: "US Dollar", symbol: "$", buy: 138.28, sell: 138.88, unit: 1, rawBuy: 138.28, rawSell: 138.88 },
  EUR: { name: "Euro", symbol: "€", buy: 143.48, sell: 144.10, unit: 1, rawBuy: 143.48, rawSell: 144.10 },
  GBP: { name: "British Pound", symbol: "£", buy: 173.50, sell: 174.25, unit: 1, rawBuy: 173.50, rawSell: 174.25 },
  INR: { name: "Indian Rupee", symbol: "₹", buy: 1.60, sell: 1.6015, unit: 100, rawBuy: 160.00, rawSell: 160.15 },
  AUD: { name: "Australian Dollar", symbol: "A$", buy: 88.50, sell: 89.05, unit: 1, rawBuy: 88.50, rawSell: 89.05 },
  CAD: { name: "Canadian Dollar", symbol: "C$", buy: 98.40, sell: 99.00, unit: 1, rawBuy: 98.40, rawSell: 99.00 },
  AED: { name: "UAE Dirham", symbol: "AED", buy: 37.65, sell: 37.81, unit: 1, rawBuy: 37.65, rawSell: 37.81 },
  QAR: { name: "Qatari Riyal", symbol: "QAR", buy: 37.95, sell: 38.11, unit: 1, rawBuy: 37.95, rawSell: 38.11 },
  SAR: { name: "Saudi Riyal", symbol: "SAR", buy: 36.86, sell: 37.02, unit: 1, rawBuy: 36.86, rawSell: 37.02 },
  MYR: { name: "Malaysian Ringgit", symbol: "RM", buy: 31.15, sell: 31.30, unit: 1, rawBuy: 31.15, rawSell: 31.30 },
  JPY: { name: "Japanese Yen", symbol: "¥", buy: 0.952, sell: 0.956, unit: 10, rawBuy: 9.52, rawSell: 9.56 },
  KRW: { name: "South Korean Won", symbol: "₩", buy: 0.106, sell: 0.1064, unit: 100, rawBuy: 10.60, rawSell: 10.64 },
  CNY: { name: "Chinese Yuan", symbol: "¥", buy: 19.10, sell: 19.18, unit: 1, rawBuy: 19.10, rawSell: 19.18 },
  SGD: { name: "Singapore Dollar", symbol: "S$", buy: 103.20, sell: 103.65, unit: 1, rawBuy: 103.20, rawSell: 103.65 },
  CHF: { name: "Swiss Franc", symbol: "CHF", buy: 154.20, sell: 154.80, unit: 1, rawBuy: 154.20, rawSell: 154.80 },
  HKD: { name: "Hong Kong Dollar", symbol: "HK$", buy: 17.70, sell: 17.78, unit: 1, rawBuy: 17.70, rawSell: 17.78 },
  KWD: { name: "Kuwaiti Dinar", symbol: "KWD", buy: 450.10, sell: 452.05, unit: 1, rawBuy: 450.10, rawSell: 452.05 },
  BHD: { name: "Bahraini Dinar", symbol: "BHD", buy: 366.50, sell: 368.10, unit: 1, rawBuy: 366.50, rawSell: 368.10 },
  OMR: { name: "Omani Rial", symbol: "OMR", buy: 359.10, sell: 360.65, unit: 1, rawBuy: 359.10, rawSell: 360.65 },
  THB: { name: "Thai Baht", symbol: "฿", buy: 4.10, sell: 4.12, unit: 1, rawBuy: 4.10, rawSell: 4.12 },
};

function smartFormat(val: number | ""): number | "" {
  if (val === "" || isNaN(val)) return "";
  if (val === 0) return 0;
  const absVal = Math.abs(val);
  if (absVal < 0.01) {
    return Number(val.toFixed(4));
  } else if (absVal < 1) {
    return Number(val.toFixed(3));
  } else if (absVal < 1000) {
    return Number(val.toFixed(2));
  }
  return Number(val.toFixed(2));
}

export default function NrsCurrencyTool() {
  const [rates, setRates] = useState<Record<string, RateInfo>>(DEFAULT_RATES);
  const [rateDate, setRateDate] = useState<string>("");
  const [isOfficial, setIsOfficial] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  const [nprAmount, setNprAmount] = useState<number | "">(1000);
  const [targetCurr, setTargetCurr] = useState<string>("USD");
  const [rateType, setRateType] = useState<"buy" | "sell">("buy");
  const [foreignAmount, setForeignAmount] = useState<number | "">(0);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/forex");
      if (res.ok) {
        const data = await res.json();
        if (data.rates) {
          setRates(data.rates);
          setRateDate(data.date || "");
          if (data.isOfficialNRB !== undefined) {
            setIsOfficial(data.isOfficialNRB);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching live rates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  useEffect(() => {
    const activeRateObj = rates[targetCurr] || DEFAULT_RATES[targetCurr] || { buy: 138.28, sell: 138.88 };
    const r = rateType === "buy" ? activeRateObj.buy : activeRateObj.sell;

    if (typeof nprAmount === "number" && !isNaN(nprAmount) && r > 0) {
      setForeignAmount(smartFormat(nprAmount / r));
    } else {
      setForeignAmount("");
    }
  }, [nprAmount, targetCurr, rateType, rates]);

  const handleNprChange = (val: number | "") => {
    setNprAmount(val);
  };

  const handleForeignChange = (val: number | "") => {
    setForeignAmount(val);
    if (val === "" || isNaN(val)) {
      setNprAmount("");
      return;
    }
    const activeRateObj = rates[targetCurr] || DEFAULT_RATES[targetCurr] || { buy: 138.28, sell: 138.88 };
    const r = rateType === "buy" ? activeRateObj.buy : activeRateObj.sell;
    setNprAmount(smartFormat(val * r));
  };

  const handleSwap = () => {
    if (typeof foreignAmount === "number" && foreignAmount > 0) {
      const newNpr = 100;
      setNprAmount(newNpr);
    } else {
      setNprAmount(1000);
    }
  };

  const handleCurrencySelect = (curr: string) => {
    setTargetCurr(curr);
  };

  const currentRateInfo = rates[targetCurr] || DEFAULT_RATES[targetCurr] || { name: targetCurr, symbol: "", buy: 1, sell: 1, unit: 1 };
  const activeRateValue = rateType === "buy" ? currentRateInfo.buy : currentRateInfo.sell;
  const unit = currentRateInfo.unit || 1;
  const unitRateValue = rateType === "buy" ? (currentRateInfo.rawBuy || currentRateInfo.buy * unit) : (currentRateInfo.rawSell || currentRateInfo.sell * unit);

  const filteredRates = Object.entries(rates).filter(([code, data]) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return code.toLowerCase().includes(q) || data.name.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Live Status Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] shadow-xs">
        <div className="flex items-center gap-2">
          {loading ? (
            <RefreshCw size={16} className="animate-spin text-[#22C55E]" />
          ) : (
            <CheckCircle2 size={16} className="text-[#22C55E] shrink-0" />
          )}
          <div>
            <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] block">
              {loading
                ? "Fetching Nepal Rastra Bank (NRB) rates..."
                : `Official Nepal Rastra Bank (NRB) Exchange Rates`}
            </span>
            {!loading && rateDate && (
              <span className="text-[11px] text-[#71717A] dark:text-[#A1A1AA]">
                Published Date: <strong className="text-[#22C55E]">{rateDate}</strong> {isOfficial ? "(Verified NRB Daily Rates)" : ""}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-2.5">
          {/* Rate Type Selector */}
          <div className="flex p-1 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-xl text-xs flex-1 sm:flex-initial">
            <button
              onClick={() => setRateType("buy")}
              title="Bank Buys foreign currency from you"
              className={`flex-1 sm:flex-initial px-3 py-1 font-bold rounded-lg transition-colors ${
                rateType === "buy"
                  ? "bg-[#22C55E] text-white shadow-xs"
                  : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
              }`}
            >
              NRB Buy
            </button>
            <button
              onClick={() => setRateType("sell")}
              title="Bank Sells foreign currency to you"
              className={`flex-1 sm:flex-initial px-3 py-1 font-bold rounded-lg transition-colors ${
                rateType === "sell"
                  ? "bg-[#22C55E] text-white shadow-xs"
                  : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
              }`}
            >
              NRB Sell
            </button>
          </div>

          <button
            onClick={fetchRates}
            disabled={loading}
            className="p-2 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] hover:bg-[#F0EDE8] text-[#71717A] dark:text-[#A1A1AA] transition-colors shrink-0"
            title="Refresh Live NRB Exchange Rates"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Main Converter Card */}
      <div className="p-4 sm:p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl flex flex-col md:flex-row items-center gap-4 shadow-sm relative">
        {/* NPR Input */}
        <div className="flex-1 w-full space-y-2">
          <label className="block text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider">
            Nepali Rupees (NPR रु)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#A1A1AA]">
              रु
            </span>
            <input
              type="number"
              min={0}
              step="any"
              value={nprAmount}
              onChange={(e) => handleNprChange(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="0.00"
              className="w-full pl-9 pr-4 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E]/40"
            />
          </div>
        </div>

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          title="Recalculate / Refresh conversion"
          className="p-2.5 rounded-full bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] hover:border-[#22C55E] text-[#22C55E] shrink-0 my-1 md:my-0 transition-transform active:scale-95 shadow-xs"
        >
          <ArrowLeftRight size={18} />
        </button>

        {/* Foreign Input */}
        <div className="flex-1 w-full space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <label className="block text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider">
              {currentRateInfo.name} ({targetCurr})
            </label>
            <span className="text-[11px] font-bold text-[#22C55E]">
              {unit > 1 ? `${unit} ${targetCurr} = Rs. ${unitRateValue}` : `1 ${targetCurr} = Rs. ${activeRateValue}`}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={targetCurr}
              onChange={(e) => handleCurrencySelect(e.target.value)}
              className="px-3 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/40 cursor-pointer"
            >
              {Object.keys(rates).map((code) => (
                <option key={code} value={code}>
                  {code} - {rates[code].name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              step="any"
              value={foreignAmount}
              onChange={(e) => handleForeignChange(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="0.00"
              className="flex-1 px-4 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E]/40"
            />
          </div>
        </div>
      </div>

      {/* Guidance Alert */}
      <div className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-xs text-[#71717A] dark:text-[#A1A1AA] flex items-center gap-2">
        <Info size={15} className="text-[#22C55E] shrink-0" />
        <span>
          <strong>NRB Buy:</strong> Commercial banks buy foreign currency from you at this rate.{" "}
          <strong>NRB Sell:</strong> Commercial banks sell foreign currency to you at this rate.
        </span>
      </div>

      {/* Exchange Rates Grid & Search */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h4 className="text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5">
            <Coins size={14} className="text-[#22C55E]" /> All Official NRB Foreign Exchange Rates ({filteredRates.length})
          </h4>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search currency (e.g. USD, Yen, INR)..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-white dark:bg-[#141829] text-xs text-[#18181B] dark:text-[#F4F4F5] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/40"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {filteredRates.map(([code, data]) => {
            const isSelected = targetCurr === code;
            const u = data.unit || 1;
            const displayBuy = data.rawBuy !== undefined ? data.rawBuy : smartFormat(data.buy * u);
            const displaySell = data.rawSell !== undefined ? data.rawSell : smartFormat(data.sell * u);

            return (
              <button
                key={code}
                onClick={() => handleCurrencySelect(code)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-[#1F2544] text-white border-[#1F2544] dark:bg-[#22C55E] dark:text-[#0C0F1E] dark:border-[#22C55E] shadow-sm"
                    : "bg-white dark:bg-[#141829] border-[#E4E0D8] dark:border-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] hover:border-[#22C55E]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold">{code}</span>
                    {u > 1 && (
                      <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                        isSelected ? "bg-white/20 text-white dark:bg-black/20 dark:text-black" : "bg-[#FAFAF8] dark:bg-[#1E2338] text-[#71717A]"
                      }`}>
                        Per {u}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] opacity-75">{data.symbol}</span>
                </div>
                <div className="text-[11px] opacity-80 truncate mt-0.5">{data.name}</div>
                <div className="flex items-center justify-between text-[11px] font-semibold mt-2 pt-1 border-t border-current/10">
                  <span>Buy: Rs. {displayBuy}</span>
                  <span>Sell: Rs. {displaySell}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

