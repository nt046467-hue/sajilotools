"use client";

import { useState, useMemo, useEffect } from "react";
import NepaliDate from "nepali-date-converter";
import { Calendar, ArrowLeftRight, Copy, Check, Info, Clock, CalendarDays } from "lucide-react";
import CalculatorCrossLink from "@/components/tools/shared/CalculatorCrossLink";

const NEPALI_MONTHS_EN = [
  "Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

const NEPALI_MONTHS_NP = [
  "बैशाख", "जेठ", "असार", "श्रावण", "भाद्र", "आश्विन",
  "कार्तिक", "मंसिर", "पौष", "माघ", "फाल्गुन", "चैत्र"
];

const NEPALI_DAYS_FULL = [
  { np: "आइतबार", en: "Sunday" },
  { np: "सोमबार", en: "Monday" },
  { np: "मंगलबार", en: "Tuesday" },
  { np: "बुधबार", en: "Wednesday" },
  { np: "बिहीबार", en: "Thursday" },
  { np: "शुक्रबार", en: "Friday" },
  { np: "शनिबार", en: "Saturday" },
];

export default function NepaliDateConverterTool() {
  const [mode, setMode] = useState<"bs-to-ad" | "ad-to-bs">("bs-to-ad");

  // BS Input state
  const [bsYear, setBsYear] = useState<number>(2081);
  const [bsMonth, setBsMonth] = useState<number>(1);
  const [bsDay, setBsDay] = useState<number>(1);

  // AD Input state
  const [adDateStr, setAdDateStr] = useState<string>("");

  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  // Initialize with today's real date on client mount
  useEffect(() => {
    const today = new Date();
    try {
      const npToday = NepaliDate.fromAD(today);
      setBsYear(npToday.getYear());
      setBsMonth(npToday.getMonth() + 1);
      setBsDay(npToday.getDate());
    } catch {
      setBsYear(2081);
      setBsMonth(5);
      setBsDay(1);
    }
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    setAdDateStr(`${y}-${m}-${d}`);
    setMounted(true);
  }, []);

  // Quick preset: Set to Today
  const handleSetToday = () => {
    const today = new Date();
    try {
      const npToday = NepaliDate.fromAD(today);
      setBsYear(npToday.getYear());
      setBsMonth(npToday.getMonth() + 1);
      setBsDay(npToday.getDate());
    } catch { }
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    setAdDateStr(`${y}-${m}-${d}`);
  };

  // Conversion result calculation
  const result = useMemo(() => {
    if (!mounted) return null;
    setErrorMsg("");

    try {
      if (mode === "bs-to-ad") {
        const npDate = new NepaliDate(bsYear, bsMonth - 1, bsDay);
        const jsDate = npDate.toJsDate();
        const adYear = jsDate.getFullYear();
        const adMonthStr = jsDate.toLocaleString("en-US", { month: "long" });
        const adMonthShort = jsDate.toLocaleString("en-US", { month: "short" });
        const adDayNum = jsDate.getDate();
        const dayIdx = jsDate.getDay();

        return {
          bsFormattedNp: npDate.format("DD MMMM YYYY", "np"),
          bsFormattedEn: `${bsDay} ${NEPALI_MONTHS_EN[bsMonth - 1]} ${bsYear} BS`,
          bsMonthNameNp: NEPALI_MONTHS_NP[bsMonth - 1],
          bsMonthNameEn: NEPALI_MONTHS_EN[bsMonth - 1],
          adFormatted: `${adMonthStr} ${adDayNum}, ${adYear} AD`,
          adFormattedShort: `${adDayNum} ${adMonthShort} ${adYear}`,
          adIso: jsDate.toISOString().split("T")[0],
          dayOfWeekNp: NEPALI_DAYS_FULL[dayIdx].np,
          dayOfWeekEn: NEPALI_DAYS_FULL[dayIdx].en,
          dayOfWeek: `${NEPALI_DAYS_FULL[dayIdx].np} (${NEPALI_DAYS_FULL[dayIdx].en})`,
        };
      } else {
        const [y, m, d] = adDateStr.split("-").map(Number);
        if (!y || !m || !d) throw new Error("Invalid AD Date");
        const jsDate = new Date(y, m - 1, d);
        const npDate = NepaliDate.fromAD(jsDate);
        const adMonthStr = jsDate.toLocaleString("en-US", { month: "long" });
        const dayIdx = jsDate.getDay();

        return {
          bsFormattedNp: npDate.format("DD MMMM YYYY", "np"),
          bsFormattedEn: `${npDate.getDate()} ${NEPALI_MONTHS_EN[npDate.getMonth()]} ${npDate.getYear()} BS`,
          bsMonthNameNp: NEPALI_MONTHS_NP[npDate.getMonth()],
          bsMonthNameEn: NEPALI_MONTHS_EN[npDate.getMonth()],
          adFormatted: `${adMonthStr} ${d}, ${y} AD`,
          adFormattedShort: `${d} ${jsDate.toLocaleString("en-US", { month: "short" })} ${y}`,
          adIso: adDateStr,
          dayOfWeekNp: NEPALI_DAYS_FULL[dayIdx].np,
          dayOfWeekEn: NEPALI_DAYS_FULL[dayIdx].en,
          dayOfWeek: `${NEPALI_DAYS_FULL[dayIdx].np} (${NEPALI_DAYS_FULL[dayIdx].en})`,
        };
      }
    } catch {
      setErrorMsg("Date out of range or invalid (Supported BS range: 2000 BS to 2090 BS).");
      return null;
    }
  }, [mounted, mode, bsYear, bsMonth, bsDay, adDateStr]);

  const copyResult = () => {
    if (!result) return;
    const text = `Nepali Date Conversion:\n• BS Date: ${result.bsFormattedNp} (${result.bsFormattedEn})\n• AD Date: ${result.adFormatted}\n• Day: ${result.dayOfWeek}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const yearsOptions = Array.from({ length: 91 }, (_, i) => 2000 + i);

  return (
    <div className="space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="flex p-1.5 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
        <button
          onClick={() => setMode("bs-to-ad")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${mode === "bs-to-ad"
            ? "bg-[#DC2626] text-white shadow-md"
            : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
            }`}
        >

          <span>Bikram Sambat to English (BS ➔ AD)</span>
        </button>
        <button
          onClick={() => setMode("ad-to-bs")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${mode === "ad-to-bs"
            ? "bg-[#DC2626] text-white shadow-md"
            : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
            }`}
        >

          <span>English to Bikram Sambat (AD ➔ BS)</span>
        </button>
      </div>

      {/* Main Conversion Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Card */}
        <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={15} className="text-[#DC2626]" />
              <span>Select {mode === "bs-to-ad" ? "Bikram Sambat (BS) Date" : "English (AD) Date"}</span>
            </h4>
            <button
              onClick={handleSetToday}
              className="text-xs font-bold text-[#DC2626] bg-[#DC2626]/10 px-2.5 py-1 rounded-lg hover:bg-[#DC2626]/20 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Clock size={12} />
              <span>Today (आज)</span>
            </button>
          </div>

          {mode === "bs-to-ad" ? (
            /* BS Date Selectors */
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#71717A] mb-1.5">
                    Year (साल)
                  </label>
                  <select
                    value={bsYear}
                    onChange={(e) => setBsYear(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm outline-none focus:border-[#DC2626]"
                  >
                    {yearsOptions.map((y) => (
                      <option key={y} value={y}>
                        {y} BS
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#71717A] mb-1.5">
                    Month (महिना)
                  </label>
                  <select
                    value={bsMonth}
                    onChange={(e) => setBsMonth(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm outline-none focus:border-[#DC2626]"
                  >
                    {NEPALI_MONTHS_EN.map((m, idx) => (
                      <option key={m} value={idx + 1}>
                        {idx + 1}. {NEPALI_MONTHS_NP[idx]} ({m})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#71717A] mb-1.5">
                    Day (गते)
                  </label>
                  <select
                    value={bsDay}
                    onChange={(e) => setBsDay(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm outline-none focus:border-[#DC2626]"
                  >
                    {Array.from({ length: 32 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        {d} गते
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Jump Buttons */}
              <div className="pt-2 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setBsDay((prev) => Math.max(1, prev - 1))}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/10"
                >
                  -1 Day
                </button>
                <button
                  type="button"
                  onClick={() => setBsDay((prev) => Math.min(32, prev + 1))}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/10"
                >
                  +1 Day
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBsMonth(1);
                    setBsDay(1);
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-[#DC2626] hover:bg-[#DC2626]/10"
                >
                  Baisakh 1 (New Year)
                </button>
              </div>
            </div>
          ) : (
            /* AD Date Picker */
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#71717A] mb-1.5">
                  English Calendar Date (AD)
                </label>
                <input
                  type="date"
                  value={adDateStr}
                  onChange={(e) => setAdDateStr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm outline-none focus:border-[#DC2626]"
                />
              </div>
              <p className="text-[11px] text-zinc-500">
                Enter any Gregorian calendar date (Year-Month-Day) to convert into exact Bikram Sambat Miti.
              </p>
            </div>
          )}
        </div>

        {/* Result Card */}
        <div className="p-6 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl flex flex-col justify-between space-y-6 shadow-sm">
          {errorMsg ? (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-xs font-semibold text-rose-600 dark:text-rose-400">
              {errorMsg}
            </div>
          ) : result ? (
            <>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                    <CalendarDays size={13} className="text-[#DC2626]" />
                    <span>Converted Result ({mode === "bs-to-ad" ? "English AD" : "Bikram Sambat BS"})</span>
                  </span>
                  <button
                    onClick={copyResult}
                    className="flex items-center gap-1 text-xs font-bold text-[#DC2626] hover:underline cursor-pointer"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? "Copied!" : "Copy Details"}</span>
                  </button>
                </div>

                {/* Big Primary Output */}
                <div className="mt-4 p-4 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-2">
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#DC2626]">
                    {mode === "bs-to-ad" ? result.adFormatted : result.bsFormattedNp}
                  </div>
                  <div className="text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                    {mode === "bs-to-ad" ? `BS Miti: ${result.bsFormattedNp} (${result.bsFormattedEn})` : `English AD: ${result.adFormatted}`}
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="mt-4 space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#E4E0D8] dark:border-[#2A2F48]">
                    <span className="text-[#71717A]">Day of the Week (वार):</span>
                    <span className="font-bold text-[#18181B] dark:text-[#F4F4F5]">{result.dayOfWeek}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E4E0D8] dark:border-[#2A2F48]">
                    <span className="text-[#71717A]">Bikram Sambat (वि.सं.):</span>
                    <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">{result.bsFormattedEn}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E4E0D8] dark:border-[#2A2F48]">
                    <span className="text-[#71717A]">Gregorian (ई.सं. / AD):</span>
                    <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">{result.adIso}</span>
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {/* Educational Footnote */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-xs text-[#71717A] flex items-start gap-2">
            <Info size={16} className="text-[#DC2626] shrink-0 mt-0.5" />
            <span>Bikram Sambat (वि.सं.) is the official national calendar of Nepal (~56.7 years ahead of Gregorian AD). Supported range: 2000 BS to 2090 BS.</span>
          </div>
        </div>
      </div>

      {/* Cross links to Related Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <CalculatorCrossLink
          icon={CalendarDays}
          title="Nepali Calendar (BS Patro)"
          desc="View the complete monthly Bikram Sambat calendar grid with public holidays and festivals."
          href="/tools/nepal/nepali-calendar"
        />
        <CalculatorCrossLink
          icon={Clock}
          title="Age Calculator & Birthday Countdown"
          desc="Looking to calculate your exact age in years, months, days, and birthday countdown?"
          href="/tools/everyday/age-calculator"
        />
      </div>
    </div>
  );
}
