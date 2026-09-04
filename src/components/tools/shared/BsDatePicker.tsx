"use client";

import { useEffect, useMemo } from "react";
import {
  getDaysInBsMonth,
  getTodayBs,
  NEPALI_MONTHS_EN,
  NEPALI_MONTHS_NP,
  BS_YEARS_OPTIONS,
  MIN_BS_YEAR,
  MAX_BS_YEAR,
} from "@/lib/bs-date-utils";
import { ChevronLeft, ChevronRight, Calendar, Sparkles } from "lucide-react";

export interface BsDateValue {
  year: number;
  month: number; // 1-12
  day: number;   // 1-32
}

export interface BsDatePickerProps {
  value: BsDateValue;
  onChange: (date: BsDateValue) => void;
  showQuickActions?: boolean;
  minYear?: number;
  maxYear?: number;
  className?: string;
  labels?: {
    year?: string;
    month?: string;
    day?: string;
  };
}

export default function BsDatePicker({
  value,
  onChange,
  showQuickActions = true,
  minYear = MIN_BS_YEAR,
  maxYear = MAX_BS_YEAR,
  className = "",
  labels = {
    year: "Year (साल)",
    month: "Month (महिना)",
    day: "Day (गते)",
  },
}: BsDatePickerProps) {
  const { year, month, day } = value;

  // Real, authentic maximum days in selected BS month (29 to 32)
  const maxDays = useMemo(() => getDaysInBsMonth(year, month), [year, month]);

  // Clamp selected day if it exceeds the real length of the newly selected month/year
  useEffect(() => {
    if (day > maxDays) {
      onChange({ year, month, day: maxDays });
    }
  }, [maxDays, day, year, month, onChange]);

  // Filter year options by min/max
  const availableYears = useMemo(() => {
    return BS_YEARS_OPTIONS.filter((y) => y >= minYear && y <= maxYear);
  }, [minYear, maxYear]);

  // Intelligent step navigation with calendar month & year rollover
  const handleStepDay = (delta: -1 | 1) => {
    if (delta === 1) {
      if (day < maxDays) {
        onChange({ year, month, day: day + 1 });
      } else {
        // Roll over to next month
        if (month < 12) {
          onChange({ year, month: month + 1, day: 1 });
        } else if (year < maxYear) {
          onChange({ year: year + 1, month: 1, day: 1 });
        }
      }
    } else {
      if (day > 1) {
        onChange({ year, month, day: day - 1 });
      } else {
        // Roll back to previous month's last valid day
        if (month > 1) {
          const prevMonth = month - 1;
          const prevMax = getDaysInBsMonth(year, prevMonth);
          onChange({ year, month: prevMonth, day: prevMax });
        } else if (year > minYear) {
          const prevYear = year - 1;
          const prevMax = getDaysInBsMonth(prevYear, 12);
          onChange({ year: prevYear, month: 12, day: prevMax });
        }
      }
    }
  };

  const handleSetToday = () => {
    try {
      const today = getTodayBs();
      onChange({
        year: Math.min(Math.max(today.year, minYear), maxYear),
        month: today.month,
        day: today.day,
      });
    } catch {
      // Fallback
    }
  };

  const handleSetBaisakh1 = () => {
    onChange({ year, month: 1, day: 1 });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 3-Part Date Dropdowns (12-column mobile optimized grid) */}
      <div className="grid grid-cols-12 gap-2 sm:gap-3">
        {/* BS Year */}
        <div className="col-span-4">
          <label className="block text-[11px] sm:text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] mb-1.5 truncate">
            {labels.year}
          </label>
          <div className="relative">
            <select
              value={year}
              onChange={(e) => {
                const newYear = Number(e.target.value);
                const newMax = getDaysInBsMonth(newYear, month);
                onChange({
                  year: newYear,
                  month,
                  day: Math.min(day, newMax),
                });
              }}
              className="w-full appearance-none px-2.5 sm:px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-xs sm:text-sm outline-none focus:border-[#DC2626] transition-colors cursor-pointer"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y} BS
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* BS Month */}
        <div className="col-span-5">
          <label className="block text-[11px] sm:text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] mb-1.5 truncate">
            {labels.month}
          </label>
          <div className="relative">
            <select
              value={month}
              onChange={(e) => {
                const newMonth = Number(e.target.value);
                const newMax = getDaysInBsMonth(year, newMonth);
                onChange({
                  year,
                  month: newMonth,
                  day: Math.min(day, newMax),
                });
              }}
              className="w-full appearance-none px-2.5 sm:px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-xs sm:text-sm outline-none focus:border-[#DC2626] transition-colors cursor-pointer"
            >
              {NEPALI_MONTHS_EN.map((m, idx) => (
                <option key={m} value={idx + 1}>
                  {idx + 1}. {NEPALI_MONTHS_NP[idx]} ({m})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* BS Day (Dynamically bounded from 1 to maxDays) */}
        <div className="col-span-3">
          <label className="block text-[11px] sm:text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] mb-1.5 truncate">
            {labels.day}
          </label>
          <div className="relative">
            <select
              value={day}
              onChange={(e) =>
                onChange({
                  year,
                  month,
                  day: Number(e.target.value),
                })
              }
              className="w-full appearance-none px-2 sm:px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-xs sm:text-sm outline-none focus:border-[#DC2626] transition-colors cursor-pointer text-center"
            >
              {Array.from({ length: maxDays }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d} गते
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      {showQuickActions && (
        <div className="pt-1 flex items-center flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => handleStepDay(-1)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors inline-flex items-center gap-1 active:scale-[0.97]"
            title="Step back 1 day (rolls back to previous month)"
          >
            <ChevronLeft size={12} />
            <span>-1 Day</span>
          </button>
          <button
            type="button"
            onClick={() => handleStepDay(1)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors inline-flex items-center gap-1 active:scale-[0.97]"
            title="Step forward 1 day (rolls over to next month at end)"
          >
            <span>+1 Day</span>
            <ChevronRight size={12} />
          </button>
          <button
            type="button"
            onClick={handleSetToday}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors inline-flex items-center gap-1 active:scale-[0.97]"
          >
            <Calendar size={11} />
            <span>Today</span>
          </button>
          <button
            type="button"
            onClick={handleSetBaisakh1}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-[#DC2626] hover:bg-[#DC2626]/10 transition-colors inline-flex items-center gap-1 active:scale-[0.97]"
          >
            <Sparkles size={11} />
            <span>Baisakh 1 (New Year)</span>
          </button>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 ml-auto hidden sm:inline">
            Max {maxDays} days in {NEPALI_MONTHS_EN[month - 1]}
          </span>
        </div>
      )}
    </div>
  );
}
