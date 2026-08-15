"use client";

import { useState, useMemo } from "react";
import { TrendingUp, DollarSign, Percent, Calendar, Layers } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from "recharts";

export default function SipCalculatorTool() {
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(5000); // Rs 5,000 / month
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(12); // 12% p.a.
  const [timePeriodYears, setTimePeriodYears] = useState<number>(10); // 10 Years
  const [stepUpPercent, setStepUpPercent] = useState<number>(0); // Step up % annually

  const sipCalculation = useMemo(() => {
    const months = timePeriodYears * 12;
    const monthlyRate = expectedReturnRate / 12 / 100;

    let currentMonthly = monthlyInvestment;
    let totalInvested = 0;
    let wealthValue = 0;

    const yearlyBreakdown: { year: number; invested: number; returns: number; totalValue: number }[] = [];

    for (let m = 1; m <= months; m++) {
      totalInvested += currentMonthly;
      wealthValue = (wealthValue + currentMonthly) * (1 + monthlyRate);

      // Step-up annual increase
      if (m % 12 === 0) {
        yearlyBreakdown.push({
          year: m / 12,
          invested: Math.round(totalInvested),
          returns: Math.round(Math.max(0, wealthValue - totalInvested)),
          totalValue: Math.round(wealthValue),
        });

        if (stepUpPercent > 0) {
          currentMonthly += currentMonthly * (stepUpPercent / 100);
        }
      }
    }

    const totalReturns = Math.max(0, wealthValue - totalInvested);

    return {
      totalInvested: Math.round(totalInvested),
      totalReturns: Math.round(totalReturns),
      totalValue: Math.round(wealthValue),
      yearlyBreakdown,
    };
  }, [monthlyInvestment, expectedReturnRate, timePeriodYears, stepUpPercent]);

  const investedPercent = useMemo(() => {
    if (!sipCalculation.totalValue) return 50;
    return Math.round((sipCalculation.totalInvested / sipCalculation.totalValue) * 100);
  }, [sipCalculation]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-5">
            <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={14} className="text-[#22C55E]" /> Systematic Investment Plan (SIP) Inputs
            </h4>

            {/* Monthly Investment */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1">
                  <DollarSign size={14} /> Monthly SIP Amount (Rs.)
                </label>
                <span className="text-sm font-bold text-[#1F2544] dark:text-[#22C55E]">
                  Rs. {monthlyInvestment.toLocaleString("en-IN")}
                </span>
              </div>
              <input
                type="range"
                min={500}
                max={200000}
                step={500}
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                className="w-full accent-[#22C55E]"
              />
              <input
                type="number"
                min={100}
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                className="mt-2 w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
              />
            </div>

            {/* Expected Return Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1">
                  <Percent size={14} /> Expected Return Rate (% p.a.)
                </label>
                <span className="text-sm font-bold text-[#1F2544] dark:text-[#22C55E]">
                  {expectedReturnRate}%
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                step={0.5}
                value={expectedReturnRate}
                onChange={(e) => setExpectedReturnRate(Number(e.target.value))}
                className="w-full accent-[#22C55E]"
              />
              <input
                type="number"
                step="0.1"
                min={1}
                value={expectedReturnRate}
                onChange={(e) => setExpectedReturnRate(Number(e.target.value))}
                className="mt-2 w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
              />
            </div>

            {/* Investment Tenure */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={14} /> Investment Period (Years)
                </label>
                <span className="text-sm font-bold text-[#1F2544] dark:text-[#22C55E]">
                  {timePeriodYears} Years ({timePeriodYears * 12} Months)
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={35}
                step={1}
                value={timePeriodYears}
                onChange={(e) => setTimePeriodYears(Number(e.target.value))}
                className="w-full accent-[#22C55E]"
              />
            </div>

            {/* Step-Up SIP option */}
            <div className="pt-3 border-t border-[#E4E0D8] dark:border-[#1E2338]">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp size={14} className="text-amber-500" /> Annual Step-up SIP (%)
                </label>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {stepUpPercent}% yearly increase
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={25}
                step={1}
                value={stepUpPercent}
                onChange={(e) => setStepUpPercent(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <span className="text-[11px] text-[#A1A1AA]">
                Automatically increases your monthly SIP contribution by {stepUpPercent}% every year.
              </span>
            </div>
          </div>
        </div>

        {/* Results & Growth Chart (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl space-y-6">
            <div>
              <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
                Expected Future Wealth Value
              </span>
              <div className="text-4xl font-extrabold text-[#22C55E] mt-1">
                Rs. {sipCalculation.totalValue.toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-[#A1A1AA] mt-1">
                After {timePeriodYears} years of monthly discipline
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#E4E0D8] dark:border-[#2A2F48]">
              <div className="flex justify-between text-sm">
                <span className="text-[#71717A]">Total Amount Invested</span>
                <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                  Rs. {sipCalculation.totalInvested.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#71717A]">Estimated Wealth Returns</span>
                <span className="font-semibold text-[#22C55E]">
                  + Rs. {sipCalculation.totalReturns.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Ratio Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-[#71717A] font-medium">
                <span>Invested ({investedPercent}%)</span>
                <span>Returns ({100 - investedPercent}%)</span>
              </div>
              <div className="h-3 w-full bg-[#22C55E] rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-[#1F2544] dark:bg-[#F5A623] transition-all"
                  style={{ width: `${investedPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="p-5 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={14} className="text-[#22C55E]" /> SIP Wealth Growth Curve
            </h4>
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sipCalculation.yearlyBreakdown.map((y) => ({ name: `Yr ${y.year}`, Invested: y.invested, Returns: y.returns }))}>
                  <XAxis dataKey="name" stroke="#A1A1AA" fontSize={10} />
                  <YAxis stroke="#A1A1AA" fontSize={10} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip
                    formatter={(val: number) => [`Rs. ${val.toLocaleString("en-IN")}`, ""]}
                    contentStyle={{ backgroundColor: "#141829", borderColor: "#1E2338", color: "#F4F4F5", borderRadius: "12px", fontSize: "12px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Area type="monotone" dataKey="Invested" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="Returns" stackId="1" stroke="#22C55E" fill="#22C55E" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
