"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Cake,
  Calendar,
  Copy,
  Check,
  Info,
  Clock,
  ShieldCheck,
  AlertCircle,
  Hourglass,
  CalendarDays,
  Hash,
  Activity,
  ArrowRightLeft,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import {
  calculateAge,
  type CalendarType,
  type AgeCalculationResult,
} from "@/lib/age-calculator";
import {
  BS_YEARS_OPTIONS,
  NEPALI_MONTHS_EN,
  NEPALI_MONTHS_NP,
  getDaysInBsMonth,
  getTodayBs,
  bsToAdDate,
  adToBsDate,
} from "@/lib/bs-date-utils";
import CalculatorCrossLink from "@/components/tools/shared/CalculatorCrossLink";

/* ── Reusable Custom Select Wrapper ──────────────────────────────────────────── */
function CustomSelect({
  value,
  onChange,
  children,
  className = "",
}: {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={`w-full appearance-none pl-2 sm:pl-2.5 pr-7 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#DC2626]/40 cursor-pointer ${className}`}
      >
        {children}
      </select>
      <ChevronDown
        size={13}
        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400"
      />
    </div>
  );
}

export default function AgeCalculatorTool() {
  const [mounted, setMounted] = useState<boolean>(false);

  // DOB State
  const [dobCalendar, setDobCalendar] = useState<CalendarType>("BS");
  const [dobAdStr, setDobAdStr] = useState<string>("2001-08-28");
  const [dobBsYear, setDobBsYear] = useState<number>(2058);
  const [dobBsMonth, setDobBsMonth] = useState<number>(5); // 1-indexed (5 = Bhadra)
  const [dobBsDay, setDobBsDay] = useState<number>(12);

  // Target / As Of State
  const [targetCalendar, setTargetCalendar] = useState<CalendarType>("AD");
  const [targetAdStr, setTargetAdStr] = useState<string>("");
  const [targetBsYear, setTargetBsYear] = useState<number>(2081);
  const [targetBsMonth, setTargetBsMonth] = useState<number>(5);
  const [targetBsDay, setTargetBsDay] = useState<number>(1);

  const [copied, setCopied] = useState<boolean>(false);

  // Initialize with real system dates on client mount
  useEffect(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    setTargetAdStr(`${y}-${m}-${d}`);

    try {
      const todayBs = getTodayBs();
      setTargetBsYear(todayBs.year);
      setTargetBsMonth(todayBs.month);
      setTargetBsDay(todayBs.day);
    } catch {
      setTargetBsYear(2081);
      setTargetBsMonth(5);
      setTargetBsDay(1);
    }

    setMounted(true);
  }, []);

  // Clamp DOB BS day if month changes and day exceeds month length
  useEffect(() => {
    if (dobCalendar === "BS") {
      const maxDays = getDaysInBsMonth(dobBsYear, dobBsMonth);
      if (dobBsDay > maxDays) {
        setDobBsDay(maxDays);
      }
    }
  }, [dobBsYear, dobBsMonth, dobBsDay, dobCalendar]);

  // Clamp Target BS day if month changes
  useEffect(() => {
    if (targetCalendar === "BS") {
      const maxDays = getDaysInBsMonth(targetBsYear, targetBsMonth);
      if (targetBsDay > maxDays) {
        setTargetBsDay(maxDays);
      }
    }
  }, [targetBsYear, targetBsMonth, targetBsDay, targetCalendar]);

  // Quick preset: Set target to today
  const handleSetTargetToday = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    setTargetAdStr(`${y}-${m}-${d}`);

    const todayBs = getTodayBs();
    setTargetBsYear(todayBs.year);
    setTargetBsMonth(todayBs.month);
    setTargetBsDay(todayBs.day);
  };

  // Real-time Dual Calendar Cross Reference for DOB
  const dobEquivalent = useMemo(() => {
    if (dobCalendar === "BS") {
      try {
        const ad = bsToAdDate(dobBsYear, dobBsMonth, dobBsDay);
        return {
          cal: "AD",
          label: "AD (ई.सं.)",
          val: ad.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        };
      } catch {
        return null;
      }
    } else {
      try {
        const ad = new Date(dobAdStr);
        if (isNaN(ad.getTime())) return null;
        const bs = adToBsDate(ad);
        return {
          cal: "BS",
          label: "BS (वि.सं.)",
          val: bs.formattedNp,
        };
      } catch {
        return null;
      }
    }
  }, [dobCalendar, dobBsYear, dobBsMonth, dobBsDay, dobAdStr]);

  // Real-time Dual Calendar Cross Reference for Target Date
  const targetEquivalent = useMemo(() => {
    if (targetCalendar === "BS") {
      try {
        const ad = bsToAdDate(targetBsYear, targetBsMonth, targetBsDay);
        return {
          cal: "AD",
          label: "AD (ई.सं.)",
          val: ad.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        };
      } catch {
        return null;
      }
    } else {
      try {
        const ad = new Date(targetAdStr);
        if (isNaN(ad.getTime())) return null;
        const bs = adToBsDate(ad);
        return {
          cal: "BS",
          label: "BS (वि.सं.)",
          val: bs.formattedNp,
        };
      } catch {
        return null;
      }
    }
  }, [targetCalendar, targetBsYear, targetBsMonth, targetBsDay, targetAdStr]);

  // Main Age Calculation
  const calculation = useMemo<{ result: AgeCalculationResult | null; error: string | null }>(() => {
    if (!mounted) return { result: null, error: null };

    try {
      const result = calculateAge(
        {
          calendar: dobCalendar,
          adDateStr: dobAdStr,
          bsYear: dobBsYear,
          bsMonth: dobBsMonth,
          bsDay: dobBsDay,
        },
        {
          calendar: targetCalendar,
          adDateStr: targetAdStr,
          bsYear: targetBsYear,
          bsMonth: targetBsMonth,
          bsDay: targetBsDay,
        }
      );
      return { result, error: null };
    } catch (err: any) {
      return { result: null, error: err?.message || "Invalid date selection." };
    }
  }, [
    mounted,
    dobCalendar,
    dobAdStr,
    dobBsYear,
    dobBsMonth,
    dobBsDay,
    targetCalendar,
    targetAdStr,
    targetBsYear,
    targetBsMonth,
    targetBsDay,
  ]);

  const handleCopy = () => {
    const res = calculation.result;
    if (!res) return;

    const summary = [
      `Exact Age: ${res.years} Years, ${res.months} Months, ${res.days} Days`,
      `Date of Birth: ${res.dobBs.formattedEn} (${res.dobAdFormatted})`,
      `Calculated As Of: ${res.targetBs.formattedEn} (${res.targetAdFormatted})`,
      `Total Days Alive: ${res.totalDays.toLocaleString()}`,
      `Total Weeks: ${res.totalWeeks.toLocaleString()}`,
      `Total Hours: ${res.totalHours.toLocaleString()}`,
      `Next Birthday: In ${res.nextBirthday.daysUntil} days (${res.nextBirthday.bsFormattedEn} / ${res.nextBirthday.adFormatted})`,
    ].join("\n");

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const dobMaxDays = getDaysInBsMonth(dobBsYear, dobBsMonth);
  const targetMaxDays = getDaysInBsMonth(targetBsYear, targetBsMonth);

  return (
    <div className="space-y-6">
      {/* ── Explanatory Dual Calendar Banner ─────────────────────────────────── */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-zinc-100/90 dark:bg-[#12162B] border border-zinc-200/80 dark:border-zinc-800/80 text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-2 sm:gap-2.5 shadow-sm">
        <Info size={16} className="text-[#DC2626] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Dual Calendar (BS ↔ AD):</strong> Nepal uses <strong>Bikram Sambat (वि.सं.)</strong> for government docs, and <strong>AD (ई.सं.)</strong> for international forms. This tool supports both with authentic BS month-day counts.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* ── Input Panel ──────────────────────────────────────────────────── */}
        <div className="lg:col-span-6 p-3.5 sm:p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-5 shadow-sm">
          {/* Section 1: DOB */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-[11px] sm:text-xs font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                <Cake size={15} className="text-[#DC2626] shrink-0" />
                <span>DATE OF BIRTH (जन्म मिति)</span>
              </h4>

              {/* DOB Calendar Toggle */}
              <div className="flex p-0.5 rounded-xl bg-zinc-100 dark:bg-[#12162B] border border-[#E4E0D8] dark:border-zinc-800 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setDobCalendar("BS")}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                    dobCalendar === "BS"
                      ? "bg-white dark:bg-[#1E2338] text-zinc-900 dark:text-white shadow-sm border border-zinc-200/80 dark:border-zinc-700 font-extrabold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  BS (वि.सं.)
                </button>
                <button
                  type="button"
                  onClick={() => setDobCalendar("AD")}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                    dobCalendar === "AD"
                      ? "bg-white dark:bg-[#1E2338] text-zinc-900 dark:text-white shadow-sm border border-zinc-200/80 dark:border-zinc-700 font-extrabold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  AD (ई.सं.)
                </button>
              </div>
            </div>

            {/* DOB Controls */}
            {dobCalendar === "BS" ? (
              <div className="space-y-2.5">
                {/* 12-col grid: Year=4, Month=5, Day=3 — gives month enough room for full Nepali names */}
                <div className="grid grid-cols-12 gap-1.5 sm:gap-3">
                  {/* BS Year */}
                  <div className="col-span-4">
                    <label className="block text-[10px] sm:text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-1">
                      YEAR (साल)
                    </label>
                    <CustomSelect
                      value={dobBsYear}
                      onChange={(e) => setDobBsYear(Number(e.target.value))}
                    >
                      {BS_YEARS_OPTIONS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </CustomSelect>
                  </div>

                  {/* BS Month */}
                  <div className="col-span-5">
                    <label className="block text-[10px] sm:text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-1">
                      MONTH (महिना)
                    </label>
                    <CustomSelect
                      value={dobBsMonth}
                      onChange={(e) => setDobBsMonth(Number(e.target.value))}
                    >
                      {NEPALI_MONTHS_EN.map((m, idx) => (
                        <option key={m} value={idx + 1}>
                          {idx + 1}. {NEPALI_MONTHS_NP[idx]}
                        </option>
                      ))}
                    </CustomSelect>
                  </div>

                  {/* BS Day (Dynamically bounded) */}
                  <div className="col-span-3">
                    <label className="block text-[10px] sm:text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-1">
                      DAY (गते)
                    </label>
                    <CustomSelect
                      value={dobBsDay}
                      onChange={(e) => setDobBsDay(Number(e.target.value))}
                    >
                      {Array.from({ length: dobMaxDays }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </CustomSelect>
                  </div>
                </div>

                {/* Real-time DOB Cross-Reference Card */}
                {dobEquivalent && (
                  <div className="p-2 sm:p-2.5 rounded-xl bg-zinc-50 dark:bg-[#101426] border border-zinc-200/70 dark:border-zinc-800 text-[11px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-zinc-600 dark:text-zinc-400">
                    <span>
                      <ArrowRightLeft size={11} className="inline mr-1 text-zinc-400" />
                      {dobBsYear} {NEPALI_MONTHS_EN[dobBsMonth - 1]} {dobBsDay} <span className="text-zinc-400">({dobMaxDays}d)</span>
                    </span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {dobEquivalent.label}: <span className="font-mono font-bold text-[#DC2626]">{dobEquivalent.val}</span>
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-1.5">
                    BIRTH DATE (जन्म मिति — AD)
                  </label>
                  <input
                    type="date"
                    value={dobAdStr}
                    onChange={(e) => setDobAdStr(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm outline-none focus:ring-2 focus:ring-[#DC2626]/40"
                  />
                </div>

                {/* Real-time AD to BS Cross-Reference Card */}
                {dobEquivalent && (
                  <div className="p-2 sm:p-2.5 rounded-xl bg-zinc-50 dark:bg-[#101426] border border-zinc-200/70 dark:border-zinc-800 text-[11px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-zinc-600 dark:text-zinc-400">
                    <span>
                      <ArrowRightLeft size={11} className="inline mr-1 text-zinc-400" />
                      Equivalent in Nepali Patro
                    </span>
                    <span className="font-mono font-bold text-[#DC2626]">{dobEquivalent.val}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <hr className="border-zinc-200 dark:border-zinc-800" />

          {/* Section 2: Target Date / As Of */}
          <div className="space-y-3">
            <div className="flex flex-col gap-2">
              <h4 className="text-[11px] sm:text-xs font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                <CalendarDays size={15} className="text-[#DC2626] shrink-0" />
                <span>CALCULATE AGE AS OF (उमेर गणना मिति)</span>
              </h4>

              <div className="flex items-center gap-2 self-start">
                <button
                  type="button"
                  onClick={handleSetTargetToday}
                  className="text-[11px] sm:text-xs font-bold text-[#DC2626] bg-[#DC2626]/10 px-2.5 py-1 rounded-lg hover:bg-[#DC2626]/20 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Clock size={12} /> Today (आज)
                </button>

                {/* Target Calendar Toggle */}
                <div className="flex p-0.5 rounded-xl bg-zinc-100 dark:bg-[#12162B] border border-[#E4E0D8] dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setTargetCalendar("BS")}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                      targetCalendar === "BS"
                        ? "bg-white dark:bg-[#1E2338] text-zinc-900 dark:text-white shadow-sm border border-zinc-200/80 dark:border-zinc-700 font-extrabold"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    BS
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetCalendar("AD")}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                      targetCalendar === "AD"
                        ? "bg-white dark:bg-[#1E2338] text-zinc-900 dark:text-white shadow-sm border border-zinc-200/80 dark:border-zinc-700 font-extrabold"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    AD
                  </button>
                </div>
              </div>
            </div>

            {targetCalendar === "BS" ? (
              <div className="space-y-2.5">
                <div className="grid grid-cols-12 gap-1.5 sm:gap-3">
                  <div className="col-span-4">
                    <label className="block text-[10px] sm:text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-1">
                      YEAR (साल)
                    </label>
                    <CustomSelect
                      value={targetBsYear}
                      onChange={(e) => setTargetBsYear(Number(e.target.value))}
                    >
                      {BS_YEARS_OPTIONS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </CustomSelect>
                  </div>
                  <div className="col-span-5">
                    <label className="block text-[10px] sm:text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-1">
                      MONTH (महिना)
                    </label>
                    <CustomSelect
                      value={targetBsMonth}
                      onChange={(e) => setTargetBsMonth(Number(e.target.value))}
                    >
                      {NEPALI_MONTHS_EN.map((m, idx) => (
                        <option key={m} value={idx + 1}>
                          {idx + 1}. {NEPALI_MONTHS_NP[idx]}
                        </option>
                      ))}
                    </CustomSelect>
                  </div>
                  <div className="col-span-3">
                    <label className="block text-[10px] sm:text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-1">
                      DAY (गते)
                    </label>
                    <CustomSelect
                      value={targetBsDay}
                      onChange={(e) => setTargetBsDay(Number(e.target.value))}
                    >
                      {Array.from({ length: targetMaxDays }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </CustomSelect>
                  </div>
                </div>

                {/* Real-time Target Cross-Reference Card */}
                {targetEquivalent && (
                  <div className="p-2 sm:p-2.5 rounded-xl bg-zinc-50 dark:bg-[#101426] border border-zinc-200/70 dark:border-zinc-800 text-[11px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-zinc-600 dark:text-zinc-400">
                    <span>
                      <ArrowRightLeft size={11} className="inline mr-1 text-zinc-400" />
                      As of: <strong>{targetBsYear} {NEPALI_MONTHS_EN[targetBsMonth - 1]} {targetBsDay}</strong>
                    </span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {targetEquivalent.label}: <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{targetEquivalent.val}</span>
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-1.5">
                    TARGET DATE (गणना मिति — AD)
                  </label>
                  <input
                    type="date"
                    value={targetAdStr}
                    onChange={(e) => setTargetAdStr(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm outline-none focus:ring-2 focus:ring-[#DC2626]/40"
                  />
                </div>

                {/* Real-time AD to BS Cross-Reference Card */}
                {targetEquivalent && (
                  <div className="p-2 sm:p-2.5 rounded-xl bg-zinc-50 dark:bg-[#101426] border border-zinc-200/70 dark:border-zinc-800 text-[11px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-zinc-600 dark:text-zinc-400">
                    <span>
                      <ArrowRightLeft size={11} className="inline mr-1 text-zinc-400" />
                      Equivalent in Nepali Patro
                    </span>
                    <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{targetEquivalent.val}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Results Output Panel ─────────────────────────────────────────── */}
        <div className="lg:col-span-6 flex flex-col justify-between p-3.5 sm:p-6 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl space-y-4 sm:space-y-5 shadow-sm">
          {calculation.error ? (
            <div className="p-3 sm:p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs sm:text-sm font-semibold flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{calculation.error}</span>
            </div>
          ) : calculation.result ? (
            <div className="space-y-4 sm:space-y-5" aria-live="polite">
              {/* Primary Age Banner */}
              <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-2 shadow-sm text-center">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#71717A]">
                  YOUR EXACT AGE (तपाईंको उमेर)
                </span>
                <div className="flex items-center justify-center gap-1.5 sm:gap-4 pt-1">
                  <div className="text-center min-w-[60px] sm:min-w-[80px]">
                    <div className="text-2xl sm:text-4xl font-black text-[#DC2626]">
                      {calculation.result.years}
                    </div>
                    <div className="text-[10px] sm:text-xs font-bold text-zinc-500 mt-0.5">YEARS (वर्ष)</div>
                  </div>
                  <span className="text-lg sm:text-2xl font-light text-zinc-300 dark:text-zinc-700">:</span>
                  <div className="text-center min-w-[60px] sm:min-w-[80px]">
                    <div className="text-2xl sm:text-4xl font-black text-zinc-800 dark:text-zinc-200">
                      {calculation.result.months}
                    </div>
                    <div className="text-[10px] sm:text-xs font-bold text-zinc-500 mt-0.5">MONTHS (महिना)</div>
                  </div>
                  <span className="text-lg sm:text-2xl font-light text-zinc-300 dark:text-zinc-700">:</span>
                  <div className="text-center min-w-[60px] sm:min-w-[80px]">
                    <div className="text-2xl sm:text-4xl font-black text-zinc-800 dark:text-zinc-200">
                      {calculation.result.days}
                    </div>
                    <div className="text-[10px] sm:text-xs font-bold text-zinc-500 mt-0.5">DAYS (दिन)</div>
                  </div>
                </div>
              </div>

              {/* Next Birthday Card */}
              <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-orange-500/10 border border-amber-500/20 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                    <Cake size={14} className="text-amber-500 shrink-0" /> NEXT BIRTHDAY (अर्को जन्मदिन)
                  </div>
                  <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold bg-amber-500 text-white shadow-sm whitespace-nowrap">
                    {calculation.result.nextBirthday.isToday
                      ? "🎉 Today! (आज)"
                      : calculation.result.nextBirthday.isTomorrow
                      ? "Tomorrow! (भोलि)"
                      : `In ${calculation.result.nextBirthday.daysUntil} Days`}
                  </span>
                </div>

                <div className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pt-0.5">
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {calculation.result.nextBirthday.bsFormattedEn}
                    </span>{" "}
                    <span className="text-zinc-500 font-normal">
                      ({calculation.result.nextBirthday.adFormatted})
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    Celebrated in {dobCalendar}
                  </div>
                </div>
              </div>

              {/* Dual Calendar Conversion Details */}
              <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-2 text-xs">
                <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  CALENDAR CROSS-REFERENCE (पात्रो विवरण)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-600 dark:text-zinc-300">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
                    <div className="text-[9px] sm:text-[10px] text-zinc-400 font-bold uppercase">BIRTH DATE (जन्म मिति)</div>
                    <div className="font-bold text-[#DC2626] mt-0.5 text-[11px] sm:text-xs">{calculation.result.dobBs.formattedEn}</div>
                    <div className="text-[10px] sm:text-[11px] text-zinc-500">{calculation.result.dobAdFormatted} AD</div>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
                    <div className="text-[9px] sm:text-[10px] text-zinc-400 font-bold uppercase">TARGET DATE (गणना मिति)</div>
                    <div className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5 text-[11px] sm:text-xs">{calculation.result.targetBs.formattedEn}</div>
                    <div className="text-[10px] sm:text-[11px] text-zinc-500">{calculation.result.targetAdFormatted} AD</div>
                  </div>
                </div>
              </div>

              {/* Lifetime Statistics */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center text-xs">
                <div className="p-2 sm:p-3 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338]">
                  <div className="text-[8px] sm:text-[10px] uppercase font-bold text-zinc-400">TOTAL DAYS (जम्मा दिन)</div>
                  <div className="text-xs sm:text-lg font-black text-zinc-800 dark:text-zinc-200 mt-0.5">
                    {calculation.result.totalDays.toLocaleString()}
                  </div>
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338]">
                  <div className="text-[8px] sm:text-[10px] uppercase font-bold text-zinc-400">TOTAL WEEKS (जम्मा हप्ता)</div>
                  <div className="text-xs sm:text-lg font-black text-zinc-800 dark:text-zinc-200 mt-0.5">
                    {calculation.result.totalWeeks.toLocaleString()}
                  </div>
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338]">
                  <div className="text-[8px] sm:text-[10px] uppercase font-bold text-zinc-400">TOTAL HOURS (जम्मा घण्टा)</div>
                  <div className="text-xs sm:text-lg font-black text-zinc-800 dark:text-zinc-200 mt-0.5">
                    {calculation.result.totalHours.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#DC2626] text-white font-bold text-xs hover:bg-[#b91c1c] transition-all shadow-sm cursor-pointer"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? "Copied!" : "COPY AGE SUMMARY (उमेर विवरण प्रतिलिपि)"}</span>
                </button>

                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[10px] sm:text-[11px] text-zinc-500">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span>100% In-Browser Privacy</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-400 space-y-2">
              <Hourglass size={32} className="animate-pulse text-zinc-300 dark:text-zinc-700" />
              <p className="text-xs">Select your birth date to calculate exact age</p>
            </div>
          )}
        </div>
      </div>

      {/* Cross Links to Other Nepal & Everyday Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <CalculatorCrossLink
          icon={CalendarDays}
          title="Nepali Date Converter (BS ↔ AD)"
          desc="Convert any historical or future date between BS and AD"
          href="/tools/nepal/nepali-date-converter"
        />
        <CalculatorCrossLink
          icon={Calendar}
          title="Nepali Calendar (BS Patro)"
          desc="Monthly Bikram Sambat calendar with festivals and tithis"
          href="/tools/nepal/nepali-calendar"
        />
        <CalculatorCrossLink
          icon={Hash}
          title="Nepali Number Converter"
          desc="Bidirectional Nepali number and words converter"
          href="/tools/nepal/nepali-number-words"
        />
        <CalculatorCrossLink
          icon={Activity}
          title="BMI Calculator"
          desc="Calculate Body Mass Index and ideal healthy weight"
          href="/tools/everyday/bmi-calculator"
        />
      </div>
    </div>
  );
}
