"use client";

import { useState, useMemo } from "react";
import { Percent, DollarSign, Calendar, Layers, Vault } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from "recharts";
import CalculatorCrossLink from "./shared/CalculatorCrossLink";

type InterestType = "simple" | "compound";
type CompoundingFreq = "monthly" | "quarterly" | "semi-annually" | "annually";

export default function InterestCalculatorTool() {
  const [interestType, setInterestType] = useState<InterestType>("compound");
  const [principal, setPrincipal] = useState<number>(100000);
  const [annualRate, setAnnualRate] = useState<number>(10);
  const [timeYears, setTimeYears] = useState<number>(5);
  const [frequency, setFrequency] = useState<CompoundingFreq>("annually");

  const calculation = useMemo(() => {
    const p = principal;
    const r = annualRate / 100;
    const t = timeYears;

    if (p <= 0 || r <= 0 || t <= 0) {
      return {
        totalInterest: 0,
        totalAmount: 0,
        yearlyData: [],
      };
    }

    const yearlyData = [];

    if (interestType === "simple") {
      const totalInterest = p * r * t;
      const totalAmount = p + totalInterest;

      for (let yr = 1; yr <= t; yr++) {
        const yrInterest = p * r * yr;
        yearlyData.push({
          name: `Yr ${yr}`,
          Principal: Math.round(p),
          Interest: Math.round(yrInterest),
        });
      }

      return {
        totalInterest: Math.round(totalInterest),
        totalAmount: Math.round(totalAmount),
        yearlyData,
      };
    } else {
      let n = 1;
      if (frequency === "monthly") n = 12;
      if (frequency === "quarterly") n = 4;
      if (frequency === "semi-annually") n = 2;

      const totalAmount = p * Math.pow(1 + r / n, n * t);
      const totalInterest = totalAmount - p;

      for (let yr = 1; yr <= t; yr++) {
        const yrAmount = p * Math.pow(1 + r / n, n * yr);
        const yrInterest = yrAmount - p;
        yearlyData.push({
          name: `Yr ${yr}`,
          Principal: Math.round(p),
          Interest: Math.round(yrInterest),
        });
      }

      return {
        totalInterest: Math.round(totalInterest),
        totalAmount: Math.round(totalAmount),
        yearlyData,
      };
    }
  }, [interestType, principal, annualRate, timeYears, frequency]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-5">
            {/* Calculation Mode Toggle */}
            <div>
              <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider mb-2">
                Interest Calculation Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setInterestType("compound")}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-colors ${
                    interestType === "compound"
                      ? "bg-[#1F2544] text-white dark:bg-[#22C55E] dark:text-[#0C0F1E]"
                      : "bg-[#FAFAF8] dark:bg-[#1E2338] text-[#71717A] border border-[#E4E0D8] dark:border-[#1E2338]"
                  }`}
                >
                  Compound Interest (साधारण ब्याज + चक्रब्याज)
                </button>
                <button
                  type="button"
                  onClick={() => setInterestType("simple")}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-colors ${
                    interestType === "simple"
                      ? "bg-[#1F2544] text-white dark:bg-[#22C55E] dark:text-[#0C0F1E]"
                      : "bg-[#FAFAF8] dark:bg-[#1E2338] text-[#71717A] border border-[#E4E0D8] dark:border-[#1E2338]"
                  }`}
                >
                  Simple Interest (साधारण ब्याज)
                </button>
              </div>
            </div>

            {/* Principal */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1">
                  <DollarSign size={14} /> Principal Amount (Rs.)
                </label>
                <span className="text-sm font-bold text-[#1F2544] dark:text-[#22C55E]">
                  Rs. {principal.toLocaleString("en-IN")}
                </span>
              </div>
              <input
                type="range"
                min={5000}
                max={5000000}
                step={5000}
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full accent-[#22C55E]"
              />
              <input
                type="number"
                min={100}
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="mt-2 w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
              />
            </div>

            {/* Interest Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1">
                  <Percent size={14} /> Annual Interest Rate (% p.a.)
                </label>
                <span className="text-sm font-bold text-[#1F2544] dark:text-[#22C55E]">
                  {annualRate}%
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                step={0.5}
                value={annualRate}
                onChange={(e) => setAnnualRate(Number(e.target.value))}
                className="w-full accent-[#22C55E]"
              />
              <input
                type="number"
                step="0.1"
                min={0.1}
                value={annualRate}
                onChange={(e) => setAnnualRate(Number(e.target.value))}
                className="mt-2 w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
              />
            </div>

            {/* Tenure & Frequency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Calendar size={14} /> Time Period (Years)
                </label>
                <select
                  value={timeYears}
                  onChange={(e) => setTimeYears(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-xs"
                >
                  {[1, 2, 3, 4, 5, 7, 10, 15, 20].map((y) => (
                    <option key={y} value={y}>
                      {y} Year{y > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {interestType === "compound" && (
                <div>
                  <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider mb-2">
                    Compounding Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as CompoundingFreq)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-xs"
                  >
                    <option value="annually">Annually (Yearly)</option>
                    <option value="semi-annually">Semi-Annually (6 Months)</option>
                    <option value="quarterly">Quarterly (4 Times/Year)</option>
                    <option value="monthly">Monthly (12 Times/Year)</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Cross-Link to FD Calculator */}
          <CalculatorCrossLink
            icon={Vault}
            title="Fixed Deposit (FD) Calculator"
            desc="Calculating bank FD returns in Nepal? Includes 5% TDS tax auto-deduction."
            href="/tools/finance/fd-calculator"
          />
        </div>

        {/* Results & Chart (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl space-y-6">
            <div>
              <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
                Total Maturity Value
              </span>
              <div className="text-4xl font-extrabold text-[#22C55E] mt-1">
                Rs. {calculation.totalAmount.toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-[#A1A1AA] mt-1">
                Over {timeYears} year{timeYears > 1 ? "s" : ""} tenure
              </div>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-[#E4E0D8] dark:border-[#2A2F48] text-sm">
              <div className="flex justify-between">
                <span className="text-[#71717A]">Principal Amount:</span>
                <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                  Rs. {principal.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-[#E4E0D8] dark:border-[#2A2F48]">
                <span className="text-[#18181B] dark:text-[#F4F4F5]">Total Interest Gain:</span>
                <span className="text-[#22C55E]">
                  Rs. {calculation.totalInterest.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Growth Chart */}
          <div className="p-5 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={14} className="text-[#22C55E]" /> Growth Timeline
            </h4>
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={calculation.yearlyData}>
                  <XAxis dataKey="name" stroke="#A1A1AA" fontSize={10} />
                  <YAxis stroke="#A1A1AA" fontSize={10} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip
                    formatter={(val: number) => [`Rs. ${val.toLocaleString("en-IN")}`, ""]}
                    contentStyle={{ backgroundColor: "#141829", borderColor: "#1E2338", color: "#F4F4F5", borderRadius: "12px", fontSize: "12px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Area type="monotone" dataKey="Principal" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="Interest" stackId="1" stroke="#22C55E" fill="#22C55E" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
