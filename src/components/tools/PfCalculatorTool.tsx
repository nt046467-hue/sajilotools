"use client";

import { useState, useMemo } from "react";
import { Landmark, DollarSign, Percent, Calendar, Layers, ShieldCheck, Calculator } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from "recharts";
import CalculatorCrossLink from "./shared/CalculatorCrossLink";

export default function PfCalculatorTool() {
  const [basicSalary, setBasicSalary] = useState<number>(40000);
  const [employeePercent, setEmployeePercent] = useState<number>(10);
  const [employerPercent, setEmployerPercent] = useState<number>(10);
  const [annualRate, setAnnualRate] = useState<number>(8.0);
  const [yearsOfService, setYearsOfService] = useState<number>(20);
  const [salaryIncrement, setSalaryIncrement] = useState<number>(5);

  const pfCalculation = useMemo(() => {
    let currentSalary = basicSalary;
    let totalEmployeeContrib = 0;
    let totalEmployerContrib = 0;
    let corpus = 0;

    const monthlyRate = annualRate / 12 / 100;
    const yearlyBreakdown = [];

    for (let yr = 1; yr <= yearsOfService; yr++) {
      const monthlyEmp = currentSalary * (employeePercent / 100);
      const monthlyEmpr = currentSalary * (employerPercent / 100);
      const totalMonthlyDeposit = monthlyEmp + monthlyEmpr;

      for (let m = 1; m <= 12; m++) {
        totalEmployeeContrib += monthlyEmp;
        totalEmployerContrib += monthlyEmpr;
        corpus = (corpus + totalMonthlyDeposit) * (1 + monthlyRate);
      }

      const totalContrib = totalEmployeeContrib + totalEmployerContrib;
      const interestEarned = Math.max(0, corpus - totalContrib);

      yearlyBreakdown.push({
        name: `Yr ${yr}`,
        EmployeeContrib: Math.round(totalEmployeeContrib),
        EmployerContrib: Math.round(totalEmployerContrib),
        InterestEarned: Math.round(interestEarned),
      });

      // Annual salary increment
      if (salaryIncrement > 0) {
        currentSalary += currentSalary * (salaryIncrement / 100);
      }
    }

    const totalContrib = totalEmployeeContrib + totalEmployerContrib;
    const totalInterest = Math.max(0, corpus - totalContrib);

    return {
      totalEmployeeContrib: Math.round(totalEmployeeContrib),
      totalEmployerContrib: Math.round(totalEmployerContrib),
      totalContrib: Math.round(totalContrib),
      totalInterest: Math.round(totalInterest),
      maturityCorpus: Math.round(corpus),
      yearlyBreakdown,
    };
  }, [basicSalary, employeePercent, employerPercent, annualRate, yearsOfService, salaryIncrement]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-5">
            <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
              <Landmark size={14} className="text-[#22C55E]" /> Provident Fund (EPF / CIT / SSF) Parameters
            </h4>

            {/* Monthly Basic Salary */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1">
                  <DollarSign size={14} /> Monthly Basic Salary (Rs.)
                </label>
                <span className="text-sm font-bold text-[#1F2544] dark:text-[#22C55E]">
                  Rs. {basicSalary.toLocaleString("en-IN")}
                </span>
              </div>
              <input
                type="range"
                min={10000}
                max={500000}
                step={5000}
                value={basicSalary}
                onChange={(e) => setBasicSalary(Number(e.target.value))}
                className="w-full accent-[#22C55E]"
              />
              <input
                type="number"
                min={1000}
                value={basicSalary}
                onChange={(e) => setBasicSalary(Number(e.target.value))}
                className="mt-2 w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
              />
            </div>

            {/* Contributions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider mb-2">
                  Employee Contribution (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={33}
                  step={1}
                  value={employeePercent}
                  onChange={(e) => setEmployeePercent(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
                />
                <span className="text-[11px] text-[#A1A1AA] mt-1 block">Standard EPF in Nepal is 10%</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider mb-2">
                  Employer Match Contribution (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={33}
                  step={1}
                  value={employerPercent}
                  onChange={(e) => setEmployerPercent(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
                />
                <span className="text-[11px] text-[#A1A1AA] mt-1 block">Standard Employer Match is 10%</span>
              </div>
            </div>

            {/* Return Rate & Years & Increment */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Percent size={14} /> Expected Return Rate (% p.a.)
                </label>
                <input
                  type="number"
                  step="0.25"
                  min={1}
                  max={15}
                  value={annualRate}
                  onChange={(e) => setAnnualRate(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Calendar size={14} /> Years of Service
                </label>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={yearsOfService}
                  onChange={(e) => setYearsOfService(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider mb-2">
                  Annual Salary Hike (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={25}
                  value={salaryIncrement}
                  onChange={(e) => setSalaryIncrement(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
                />
              </div>
            </div>

            {/* Info note */}
            <div className="p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-xs text-[#71717A] flex items-start gap-2">
              <ShieldCheck size={16} className="text-[#22C55E] shrink-0 mt-0.5" />
              <span>
                <strong>Tax Exemptions in Nepal:</strong> Contributions to EPF/CIT/SSF up to 1/3rd of total salary (or max Rs. 5 Lakhs per year) are fully tax-deductible under the Nepal Income Tax Act.
              </span>
            </div>
          </div>

          {/* Cross-link to Tax Calculator */}
          <CalculatorCrossLink
            icon={Calculator}
            title="Nepal Income Tax / Salary TDS Calculator"
            desc="See how your EPF/CIT retirement contributions save you income tax under current slabs."
            href="/tools/finance/tax-calculator"
          />
        </div>

        {/* Results & Chart (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl space-y-6">
            <div>
              <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
                Total Maturity Corpus
              </span>
              <div className="text-4xl font-extrabold text-[#22C55E] mt-1">
                Rs. {pfCalculation.maturityCorpus.toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-[#A1A1AA] mt-1">
                Accumulated after {yearsOfService} years of service
              </div>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-[#E4E0D8] dark:border-[#2A2F48] text-sm">
              <div className="flex justify-between">
                <span className="text-[#71717A]">Employee Contribution:</span>
                <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                  Rs. {pfCalculation.totalEmployeeContrib.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717A]">Employer Match Contribution:</span>
                <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                  Rs. {pfCalculation.totalEmployerContrib.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717A]">Total Principal Invested:</span>
                <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                  Rs. {pfCalculation.totalContrib.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-[#E4E0D8] dark:border-[#2A2F48]">
                <span className="text-[#18181B] dark:text-[#F4F4F5]">Total Interest Gain:</span>
                <span className="text-[#22C55E]">
                  Rs. {pfCalculation.totalInterest.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Growth Chart */}
          <div className="p-5 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={14} className="text-[#22C55E]" /> Provident Fund Corpus Accumulation
            </h4>
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pfCalculation.yearlyBreakdown}>
                  <XAxis dataKey="name" stroke="#A1A1AA" fontSize={10} />
                  <YAxis stroke="#A1A1AA" fontSize={10} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip
                    formatter={(val: number) => [`Rs. ${val.toLocaleString("en-IN")}`, ""]}
                    contentStyle={{ backgroundColor: "#141829", borderColor: "#1E2338", color: "#F4F4F5", borderRadius: "12px", fontSize: "12px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Area type="monotone" dataKey="EmployeeContrib" name="Emp Contrib" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="EmployerContrib" name="Employer Match" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="InterestEarned" name="Interest Gain" stackId="1" stroke="#22C55E" fill="#22C55E" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
