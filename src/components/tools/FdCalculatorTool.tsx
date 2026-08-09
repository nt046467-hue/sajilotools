"use client";

import { useState, useMemo } from "react";
import { Vault, DollarSign, Percent, Calendar, ShieldCheck, Layers } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from "recharts";

type CompoundingFreq = "monthly" | "quarterly" | "semi-annually" | "annually";

export default function FdCalculatorTool() {
  const [principal, setPrincipal] = useState<number>(500000); // Rs 5 Lakhs
  const [interestRate, setInterestRate] = useState<number>(8.5); // 8.5% APR
  const [tenureYears, setTenureYears] = useState<number>(3); // 3 Years
  const [frequency, setFrequency] = useState<CompoundingFreq>("quarterly");
  const [deductTds, setDeductTds] = useState<boolean>(true); // 5% TDS in Nepal

  const fdCalculation = useMemo(() => {
    const p = principal;
    const r = interestRate / 100;
    const t = tenureYears;

    if (p <= 0 || r <= 0 || t <= 0) {
      return {
        grossInterest: 0,
        tdsTax: 0,
        netInterest: 0,
        maturityAmount: 0,
        yearlyData: [],
      };
    }

    let n = 4; // Quarterly default
    if (frequency === "monthly") n = 12;
    if (frequency === "semi-annually") n = 2;
    if (frequency === "annually") n = 1;

    // Compound Interest Formula: A = P(1 + r/n)^(n*t)
    const maturityAmountGross = p * Math.pow(1 + r / n, n * t);
    const grossInterest = maturityAmountGross - p;

    // 5% TDS Tax in Nepal on FD interest earnings
    const tdsTax = deductTds ? grossInterest * 0.05 : 0;
    const netInterest = grossInterest - tdsTax;
    const maturityAmount = p + netInterest;

    // Yearly timeline data for chart
    const yearlyData = [];
    for (let yr = 1; yr <= t; yr++) {
      const yrGrossA = p * Math.pow(1 + r / n, n * yr);
      const yrGrossInterest = yrGrossA - p;
      const yrTds = deductTds ? yrGrossInterest * 0.05 : 0;
      yearlyData.push({
        name: `Yr ${yr}`,
        Principal: Math.round(p),
        Interest: Math.round(yrGrossInterest - yrTds),
      });
    }

    return {
      grossInterest: Math.round(grossInterest),
      tdsTax: Math.round(tdsTax),
      netInterest: Math.round(netInterest),
      maturityAmount: Math.round(maturityAmount),
      yearlyData,
    };
  }, [principal, interestRate, tenureYears, frequency, deductTds]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-5">
            <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
              <Vault size={14} className="text-[#22C55E]" /> Fixed Deposit (FD) Parameters
            </h4>

            {/* Principal Deposit */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1">
                  <DollarSign size={14} /> Total Principal Deposit (Rs.)
                </label>
                <span className="text-sm font-bold text-[#1F2544] dark:text-[#22C55E]">
                  Rs. {principal.toLocaleString("en-IN")}
                </span>
              </div>
              <input
                type="range"
                min={10000}
                max={10000000}
                step={25000}
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full accent-[#22C55E]"
              />
              <input
                type="number"
                min={1000}
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
                  {interestRate}%
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={18}
                step={0.25}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full accent-[#22C55E]"
              />
              <input
                type="number"
                step="0.1"
                min={0.5}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="mt-2 w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
              />
            </div>

            {/* Tenure & Compounding */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Calendar size={14} /> Tenure (Years)
                </label>
                <select
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-xs"
                >
                  {[1, 2, 3, 4, 5, 7, 10, 15].map((y) => (
                    <option key={y} value={y}>
                      {y} Year{y > 1 ? "s" : ""} ({y * 12} Months)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider mb-2">
                  Compounding Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as CompoundingFreq)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-xs"
                >
                  <option value="quarterly">Quarterly (Standard in Nepal)</option>
                  <option value="monthly">Monthly Compounding</option>
                  <option value="semi-annually">Semi-Annually (6 Months)</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
            </div>

            {/* TDS Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
              <div>
                <label className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] block flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#22C55E]" /> Deduct 5% TDS Tax (Nepal Rule)
                </label>
                <span className="text-[11px] text-[#71717A]">
                  Nepal Income Tax Act levies a 5% Tax Deducted at Source (TDS) on bank FD interest gains.
                </span>
              </div>
              <input
                type="checkbox"
                checked={deductTds}
                onChange={(e) => setDeductTds(e.target.checked)}
                className="w-4 h-4 accent-[#22C55E] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Results & Chart (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl space-y-6">
            <div>
              <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
                Total Maturity Amount
              </span>
              <div className="text-4xl font-extrabold text-[#22C55E] mt-1">
                Rs. {fdCalculation.maturityAmount.toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-[#A1A1AA] mt-1">
                After {tenureYears} year{tenureYears > 1 ? "s" : ""} maturity period
              </div>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-[#E4E0D8] dark:border-[#2A2F48] text-sm">
              <div className="flex justify-between">
                <span className="text-[#71717A]">Principal Deposit:</span>
                <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                  Rs. {principal.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717A]">Gross Interest Earned:</span>
                <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                  Rs. {fdCalculation.grossInterest.toLocaleString("en-IN")}
                </span>
              </div>
              {deductTds && (
                <div className="flex justify-between text-rose-600 dark:text-rose-400">
                  <span>5% TDS Tax Deduction:</span>
                  <span className="font-semibold">
                    - Rs. {fdCalculation.tdsTax.toLocaleString("en-IN")}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-2 border-t border-[#E4E0D8] dark:border-[#2A2F48]">
                <span className="text-[#18181B] dark:text-[#F4F4F5]">Net Interest Gain:</span>
                <span className="text-[#22C55E]">
                  Rs. {fdCalculation.netInterest.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Growth Chart */}
          <div className="p-5 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={14} className="text-[#22C55E]" /> Fixed Deposit Growth Curve
            </h4>
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fdCalculation.yearlyData}>
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
