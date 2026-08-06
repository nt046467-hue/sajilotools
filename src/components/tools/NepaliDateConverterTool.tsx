"use client";

import { useState, useMemo, useEffect } from "react";
import NepaliDate from "nepali-date-converter";
import { Calendar, ArrowLeftRight, Copy, Check, Info, Cake } from "lucide-react";

type ToolMode = "converter" | "age";

const NEPALI_MONTHS_EN = [
  "Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

const NEPALI_DAYS_NP = [
  "आइतबार (Sunday)",
  "सोमबार (Monday)",
  "मंगलबार (Tuesday)",
  "बुधबार (Wednesday)",
  "बिहीबार (Thursday)",
  "शुक्रबार (Friday)",
  "शनिबार (Saturday)"
];

export default function NepaliDateConverterTool() {
  const [toolMode, setToolMode] = useState<ToolMode>("converter");
  const [mode, setMode] = useState<"bs-to-ad" | "ad-to-bs">("bs-to-ad");

  // BS Input state
  const [bsYear, setBsYear] = useState<number>(2083);
  const [bsMonth, setBsMonth] = useState<number>(4);
  const [bsDay, setBsDay] = useState<number>(1);

  // AD Input state — use empty string for SSR, hydrate on client
  const [adDateStr, setAdDateStr] = useState<string>("");

  // Age Calculator state
  const [ageInputMode, setAgeInputMode] = useState<"bs" | "ad">("bs");
  const [ageBsYear, setAgeBsYear] = useState<number>(2057);
  const [ageBsMonth, setAgeBsMonth] = useState<number>(1);
  const [ageBsDay, setAgeBsDay] = useState<number>(1);
  const [ageAdDateStr, setAgeAdDateStr] = useState<string>("2000-04-14");

  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  // Hydrate client-only date values after mount
  useEffect(() => {
    setAdDateStr(new Date().toISOString().split("T")[0]);
    setMounted(true);
  }, []);

  // Conversion result
  const result = useMemo(() => {
    setErrorMsg("");
    try {
      if (mode === "bs-to-ad") {
        const npDate = new NepaliDate(bsYear, bsMonth - 1, bsDay);
        const jsDate = npDate.toJsDate();
        const adYear = jsDate.getFullYear();
        const adMonthStr = jsDate.toLocaleString("en-US", { month: "long" });
        const adDayNum = jsDate.getDate();
        const dayOfWeekIndex = jsDate.getDay();
        return {
          bsFormattedNp: npDate.format("DD MMMM YYYY", "np"),
          bsFormattedEn: `${bsDay} ${NEPALI_MONTHS_EN[bsMonth - 1]} ${bsYear}`,
          adFormatted: `${adMonthStr} ${adDayNum}, ${adYear}`,
          adIso: jsDate.toISOString().split("T")[0],
          dayOfWeek: NEPALI_DAYS_NP[dayOfWeekIndex],
        };
      } else {
        const [y, m, d] = adDateStr.split("-").map(Number);
        if (!y || !m || !d) throw new Error("Invalid AD Date");
        const jsDate = new Date(y, m - 1, d);
        const npDate = NepaliDate.fromAD(jsDate);
        const adMonthStr = jsDate.toLocaleString("en-US", { month: "long" });
        return {
          bsFormattedNp: npDate.format("DD MMMM YYYY", "np"),
          bsFormattedEn: `${npDate.getDate()} ${NEPALI_MONTHS_EN[npDate.getMonth()]} ${npDate.getYear()}`,
          adFormatted: `${adMonthStr} ${d}, ${y}`,
          adIso: adDateStr,
          dayOfWeek: NEPALI_DAYS_NP[jsDate.getDay()],
        };
      }
    } catch {
      setErrorMsg("Date out of range or invalid date (Supported BS range: 2000 BS to 2090 BS).");
      return null;
    }
  }, [mode, bsYear, bsMonth, bsDay, adDateStr]);

  // Age calculation
  const ageResult = useMemo(() => {
    if (!mounted) return null;
    try {
      let dobJsDate: Date;

      if (ageInputMode === "bs") {
        const npDate = new NepaliDate(ageBsYear, ageBsMonth - 1, ageBsDay);
        dobJsDate = npDate.toJsDate();
      } else {
        const [y, m, d] = ageAdDateStr.split("-").map(Number);
        if (!y || !m || !d) return null;
        dobJsDate = new Date(y, m - 1, d);
      }

      const today = new Date();
      if (dobJsDate > today) return null;

      // Calculate age in years, months, days (AD)
      let ageYears = today.getFullYear() - dobJsDate.getFullYear();
      let ageMonths = today.getMonth() - dobJsDate.getMonth();
      let ageDays = today.getDate() - dobJsDate.getDate();

      if (ageDays < 0) {
        ageMonths--;
        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        ageDays += prevMonth.getDate();
      }
      if (ageMonths < 0) {
        ageYears--;
        ageMonths += 12;
      }

      // DOB in both systems
      const dobNp = ageInputMode === "bs"
        ? new NepaliDate(ageBsYear, ageBsMonth - 1, ageBsDay)
        : NepaliDate.fromAD(dobJsDate);

      const dobBsStr = `${dobNp.getDate()} ${NEPALI_MONTHS_EN[dobNp.getMonth()]} ${dobNp.getYear()}`;
      const dobAdStr = dobJsDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

      // Next birthday calculation
      let nextBirthday = new Date(today.getFullYear(), dobJsDate.getMonth(), dobJsDate.getDate());
      if (nextBirthday <= today) {
        nextBirthday = new Date(today.getFullYear() + 1, dobJsDate.getMonth(), dobJsDate.getDate());
      }
      const diffMs = nextBirthday.getTime() - today.getTime();
      const daysUntilBirthday = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      // Total days alive
      const totalDays = Math.floor((today.getTime() - dobJsDate.getTime()) / (1000 * 60 * 60 * 24));

      return {
        years: ageYears,
        months: ageMonths,
        days: ageDays,
        totalDays,
        dobBs: dobBsStr,
        dobAd: dobAdStr,
        daysUntilBirthday,
      };
    } catch {
      return null;
    }
  }, [mounted, ageInputMode, ageBsYear, ageBsMonth, ageBsDay, ageAdDateStr]);

  const copyResult = () => {
    if (!result) return;
    const text = `Nepali Date Conversion:\nBS Date: ${result.bsFormattedNp} (${result.bsFormattedEn})\nAD Date: ${result.adFormatted}\nDay of Week: ${result.dayOfWeek}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const yearsOptions = Array.from({ length: 91 }, (_, i) => 2000 + i);

  return (
    <div className="space-y-6">
      {/* Tool Mode Tabs */}
      <div className="flex p-1.5 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
        <button
          onClick={() => setToolMode("converter")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${toolMode === "converter"
              ? "bg-[#DC2626] text-white shadow-md"
              : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
            }`}
        >
          <ArrowLeftRight size={16} />
          <span>BS ↔ AD Date Converter (मिति रूपान्तरण)</span>
        </button>
        <button
          onClick={() => setToolMode("age")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${toolMode === "age"
              ? "bg-[#DC2626] text-white shadow-md"
              : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
            }`}
        >
          <Cake size={16} />
          <span>Age Calculator (उमेर क्याल्कुलेटर)</span>

        </button>
      </div>

      {/* ═══ CONVERTER MODE ═══ */}
      {toolMode === "converter" && (
        <>
          {/* Mode Switcher */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
            <div className="flex items-center gap-2 px-4 py-2 font-bold text-sm text-[#18181B] dark:text-[#F4F4F5]">
              <Calendar size={18} className="text-[#DC2626]" />
              <span>{mode === "bs-to-ad" ? "BS (वि.सं.)" : "AD (ई.सं.)"}</span>
            </div>
            <button
              onClick={() => setMode((prev) => (prev === "bs-to-ad" ? "ad-to-bs" : "bs-to-ad"))}
              className="p-2.5 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-[#DC2626] hover:scale-105 transition-transform"
              title="Switch Conversion Mode"
            >
              <ArrowLeftRight size={16} />
            </button>
            <div className="flex items-center gap-2 px-4 py-2 font-bold text-sm text-[#18181B] dark:text-[#F4F4F5]">
              <span>{mode === "bs-to-ad" ? "AD (ई.सं.)" : "BS (वि.सं.)"}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input */}
            <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={14} className="text-[#DC2626]" /> Select {mode === "bs-to-ad" ? "BS Date (वि.सं.)" : "AD Date (ई.सं.)"}
              </h4>

              {mode === "bs-to-ad" ? (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#71717A] mb-1">BS Year</label>
                    <select value={bsYear} onChange={(e) => setBsYear(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-xs">
                      {yearsOptions.map((y) => (<option key={y} value={y}>{y} BS</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#71717A] mb-1">BS Month</label>
                    <select value={bsMonth} onChange={(e) => setBsMonth(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-xs">
                      {NEPALI_MONTHS_EN.map((m, idx) => (<option key={m} value={idx + 1}>{idx + 1}. {m}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#71717A] mb-1">BS Day</label>
                    <select value={bsDay} onChange={(e) => setBsDay(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-xs">
                      {Array.from({ length: 32 }, (_, i) => i + 1).map((d) => (<option key={d} value={d}>{d}</option>))}
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-[#71717A] mb-1">AD Date Picker</label>
                  <input type="date" value={adDateStr} onChange={(e) => setAdDateStr(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm" />
                </div>
              )}
            </div>

            {/* Result */}
            <div className="p-6 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl flex flex-col justify-between space-y-6">
              {errorMsg ? (
                <div className="text-xs font-semibold text-rose-600 dark:text-rose-400">{errorMsg}</div>
              ) : result ? (
                <>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider">Converted Date</span>
                      <button onClick={copyResult} className="flex items-center gap-1 text-xs font-bold text-[#DC2626] hover:underline">
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? "Copied" : "Copy Result"}
                      </button>
                    </div>
                    <div className="mt-3 space-y-1">
                      <div className="text-2xl font-extrabold text-[#DC2626] font-devanagari">{result.bsFormattedNp}</div>
                      <div className="text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5]">({result.bsFormattedEn})</div>
                      <div className="text-xs font-bold text-[#71717A] mt-2">
                        Equivalent AD: <span className="text-[#18181B] dark:text-[#F4F4F5] font-semibold tabular-nums">{result.adFormatted}</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[#E4E0D8] dark:border-[#2A2F48] space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Day of the Week:</span>
                      <span className="font-bold text-[#18181B] dark:text-[#F4F4F5]">{result.dayOfWeek}</span>
                    </div>
                  </div>
                </>
              ) : null}
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-xs text-[#71717A] flex items-start gap-2">
                <Info size={16} className="text-[#DC2626] shrink-0 mt-0.5" />
                <span>Bikram Sambat (वि.सं.) is the official national calendar of Nepal. It is ~56.7 years ahead of the Gregorian calendar (AD).</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══ AGE CALCULATOR MODE ═══ */}
      {toolMode === "age" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* DOB Input */}
          <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
              <Cake size={14} className="text-[#DC2626]" /> Enter Date of Birth
            </h4>

            {/* BS / AD Toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAgeInputMode("bs")}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${ageInputMode === "bs"
                    ? "bg-[#DC2626] text-white border-[#DC2626]"
                    : "border-[#E4E0D8] dark:border-[#1E2338] text-[#71717A]"
                  }`}
              >
                BS Date (वि.सं.)
              </button>
              <button
                onClick={() => setAgeInputMode("ad")}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${ageInputMode === "ad"
                    ? "bg-[#DC2626] text-white border-[#DC2626]"
                    : "border-[#E4E0D8] dark:border-[#1E2338] text-[#71717A]"
                  }`}
              >
                AD Date (ई.सं.)
              </button>
            </div>

            {ageInputMode === "bs" ? (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#71717A] mb-1">BS Year</label>
                  <select value={ageBsYear} onChange={(e) => setAgeBsYear(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-xs">
                    {yearsOptions.map((y) => (<option key={y} value={y}>{y} BS</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#71717A] mb-1">Month</label>
                  <select value={ageBsMonth} onChange={(e) => setAgeBsMonth(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-xs">
                    {NEPALI_MONTHS_EN.map((m, idx) => (<option key={m} value={idx + 1}>{idx + 1}. {m}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#71717A] mb-1">Day</label>
                  <select value={ageBsDay} onChange={(e) => setAgeBsDay(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-xs">
                    {Array.from({ length: 32 }, (_, i) => i + 1).map((d) => (<option key={d} value={d}>{d}</option>))}
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-[#71717A] mb-1">Date of Birth (AD)</label>
                <input type="date" value={ageAdDateStr} onChange={(e) => setAgeAdDateStr(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm" />
              </div>
            )}
          </div>

          {/* Age Result */}
          <div className="p-6 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl space-y-5">
            {ageResult ? (
              <>
                <div>
                  <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider">Your Age</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-[#DC2626]">{ageResult.years}</span>
                    <span className="text-lg font-bold text-[#18181B] dark:text-[#F4F4F5]">years</span>
                    <span className="text-lg font-semibold text-[#71717A]">{ageResult.months} months, {ageResult.days} days</span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-[#E4E0D8] dark:border-[#2A2F48] text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#71717A]">Date of Birth (BS):</span>
                    <span className="font-bold text-[#18181B] dark:text-[#F4F4F5]">{ageResult.dobBs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71717A]">Date of Birth (AD):</span>
                    <span className="font-bold text-[#18181B] dark:text-[#F4F4F5]">{ageResult.dobAd}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71717A]">Total Days Alive:</span>
                    <span className="font-bold text-[#18181B] dark:text-[#F4F4F5]">{ageResult.totalDays.toLocaleString("en-IN")} days</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 text-xs">
                  <div className="flex items-center gap-2 text-[#DC2626] font-bold mb-1">
                    <Cake size={15} /> Next Birthday Countdown
                  </div>
                  <span className="text-[#18181B] dark:text-[#F4F4F5] font-semibold">
                    {ageResult.daysUntilBirthday} day{ageResult.daysUntilBirthday !== 1 ? "s" : ""} until your next birthday! 🎂
                  </span>
                </div>
              </>
            ) : (
              <div className="text-xs text-[#71717A] text-center py-8">
                Enter your date of birth to see your age in both BS and AD calendars.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
