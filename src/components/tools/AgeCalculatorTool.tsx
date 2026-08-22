"use client";

import { useState, useMemo, useEffect } from "react";
import { Cake, Calendar, Copy, Check, Info } from "lucide-react";
import CalculatorCrossLink from "@/components/tools/shared/CalculatorCrossLink";

export default function AgeCalculatorTool() {
  const [dobStr, setDobStr] = useState<string>("2000-01-01");
  const [targetDateStr, setTargetDateStr] = useState<string>("");
  const [mounted, setMounted] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setTargetDateStr(new Date().toISOString().split("T")[0]);
    setMounted(true);
  }, []);

  const ageResult = useMemo(() => {
    if (!mounted || !dobStr || !targetDateStr) return null;

    try {
      const [dobY, dobM, dobD] = dobStr.split("-").map(Number);
      const [tY, tM, tD] = targetDateStr.split("-").map(Number);
      if (!dobY || !dobM || !dobD || !tY || !tM || !tD) return null;

      const dob = new Date(dobY, dobM - 1, dobD);
      const target = new Date(tY, tM - 1, tD);

      if (dob > target) return null;

      // Exact age breakdown
      let years = target.getFullYear() - dob.getFullYear();
      let months = target.getMonth() - dob.getMonth();
      let days = target.getDate() - dob.getDate();

      if (days < 0) {
        months--;
        const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
        days += prevMonth.getDate();
      }
      if (months < 0) {
        years--;
        months += 12;
      }

      // Total days & hours
      const diffMs = target.getTime() - dob.getTime();
      const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const totalHours = totalDays * 24;
      const totalWeeks = Math.floor(totalDays / 7);

      // Next Birthday Countdown
      let nextBday = new Date(target.getFullYear(), dob.getMonth(), dob.getDate());
      if (nextBday <= target) {
        nextBday = new Date(target.getFullYear() + 1, dob.getMonth(), dob.getDate());
      }
      const bdayDiffMs = nextBday.getTime() - target.getTime();
      const daysUntilBday = Math.ceil(bdayDiffMs / (1000 * 60 * 60 * 24));

      return {
        years,
        months,
        days,
        totalDays,
        totalWeeks,
        totalHours,
        daysUntilBday,
        formattedDob: dob.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      };
    } catch {
      return null;
    }
  }, [mounted, dobStr, targetDateStr]);

  const handleCopy = () => {
    if (!ageResult) return;
    const text = `Age: ${ageResult.years} years, ${ageResult.months} months, ${ageResult.days} days\nTotal Days Alive: ${ageResult.totalDays.toLocaleString()}\nNext Birthday: In ${ageResult.daysUntilBday} days`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Card */}
        <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-4">
          <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
            <Cake size={14} className="text-[#0D9488]" /> Select Dates
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#71717A] mb-1">
                Date of Birth (AD)
              </label>
              <input
                type="date"
                value={dobStr}
                onChange={(e) => setDobStr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#71717A] mb-1">
                Calculate Age As Of Date
              </label>
              <input
                type="date"
                value={targetDateStr}
                onChange={(e) => setTargetDateStr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
              />
            </div>
          </div>
        </div>

        {/* Output Card */}
        <div className="p-6 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl flex flex-col justify-between space-y-6">
          {ageResult ? (
            <>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
                    Calculated Age
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs font-bold text-[#0D9488] hover:underline"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy Result"}
                  </button>
                </div>

                <div className="mt-3 flex items-baseline gap-2 flex-wrap">
                  <span className="text-4xl font-extrabold text-[#0D9488]">
                    {ageResult.years}
                  </span>
                  <span className="text-lg font-bold text-[#18181B] dark:text-[#F4F4F5]">
                    years
                  </span>
                  <span className="text-sm font-semibold text-[#71717A]">
                    {ageResult.months} months, {ageResult.days} days
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-[#E4E0D8] dark:border-[#2A2F48] space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#71717A]">Total Days Lived:</span>
                    <span className="font-bold text-[#18181B] dark:text-[#F4F4F5]">
                      {ageResult.totalDays.toLocaleString()} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71717A]">Total Weeks Lived:</span>
                    <span className="font-bold text-[#18181B] dark:text-[#F4F4F5]">
                      {ageResult.totalWeeks.toLocaleString()} weeks
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71717A]">Total Hours Lived:</span>
                    <span className="font-bold text-[#18181B] dark:text-[#F4F4F5]">
                      {ageResult.totalHours.toLocaleString()} hours
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Birthday Banner */}
              <div className="p-4 rounded-xl bg-[#0D9488]/10 border border-[#0D9488]/20 text-xs">
                <div className="flex items-center gap-2 text-[#0D9488] font-bold mb-1">
                  <Cake size={15} /> Next Birthday Countdown
                </div>
                <span className="text-[#18181B] dark:text-[#F4F4F5] font-semibold">
                  {ageResult.daysUntilBday} day{ageResult.daysUntilBday !== 1 ? "s" : ""} remaining until your next birthday! 🎂
                </span>
              </div>
            </>
          ) : (
            <div className="text-xs text-[#71717A] text-center py-8">
              Select your birthdate to view age breakdown and birthday countdown.
            </div>
          )}
        </div>
      </div>

      {/* Cross link to Nepali Date Converter */}
      <div className="pt-2">
        <CalculatorCrossLink
          icon={Calendar}
          title="Nepali Date Converter (BS ↔ AD)"
          desc="Convert Bikram Sambat (वि.सं.) dates to English (AD) and calculate Nepali BS birthdate."
          href="/tools/nepal/nepali-date-converter"
        />
      </div>
    </div>
  );
}
