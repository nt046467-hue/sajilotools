"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Calculator,
  DollarSign,
  Calendar,
  Percent,
  Download,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  Layers,
  PieChart as PieChartIcon,
  HelpCircle,
  Home,
  Car,
  GraduationCap,
  User,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

interface AmortizationRow {
  month: number;
  year: number;
  openingBalance: number;
  emi: number;
  principalPaid: number;
  interestPaid: number;
  extraPayment: number;
  closingBalance: number;
}

interface YearlySummary {
  year: number;
  principalPaid: number;
  interestPaid: number;
  totalPaid: number;
  endingBalance: number;
}

const PRESETS = [
  { name: "Home Loan", icon: Home, amount: 5000000, interest: 10.5, tenureYears: 15 },
  { name: "Auto Loan", icon: Car, amount: 1500000, interest: 11.5, tenureYears: 5 },
  { name: "Education Loan", icon: GraduationCap, amount: 1000000, interest: 10.0, tenureYears: 7 },
  { name: "Personal Loan", icon: User, amount: 500000, interest: 13.5, tenureYears: 3 },
];

import { usePersistedFormState } from "@/hooks/usePersistedFormState";

export default function EmiCalculatorTool() {
  const [formState, setFormState, { wasRestored, clearSaved }] = usePersistedFormState(
    "emi-calculator",
    {
      amount: 1000000,
      interest: 11.5,
      tenureYears: 5,
      extraMonthlyPayment: 0,
      lumpSumAmount: 0,
      lumpSumMonth: 12,
    }
  );

  // Read URL query parameters on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const pAmt = parseFloat(params.get("amount") || "");
    const pRate = parseFloat(params.get("rate") || params.get("interest") || "");
    const pYears = parseFloat(params.get("years") || params.get("tenure") || "");

    const updates: Partial<typeof formState> = {};
    if (!isNaN(pAmt) && pAmt > 0) updates.amount = pAmt;
    if (!isNaN(pRate) && pRate > 0 && pRate <= 100) updates.interest = pRate;
    if (!isNaN(pYears) && pYears > 0 && pYears <= 50) updates.tenureYears = pYears;

    if (Object.keys(updates).length > 0) {
      setFormState((prev) => ({ ...prev, ...updates }));
    }
  }, [setFormState]);

  const amount = formState.amount;
  const interest = formState.interest;
  const tenureYears = formState.tenureYears;
  const extraMonthlyPayment = formState.extraMonthlyPayment;
  const lumpSumAmount = formState.lumpSumAmount;
  const lumpSumMonth = formState.lumpSumMonth;

  const setAmount = (val: number) => setFormState((prev) => ({ ...prev, amount: val }));
  const setInterest = (val: number) => setFormState((prev) => ({ ...prev, interest: val }));
  const setTenureYears = (val: number) => setFormState((prev) => ({ ...prev, tenureYears: val }));
  const setExtraMonthlyPayment = (val: number) => setFormState((prev) => ({ ...prev, extraMonthlyPayment: val }));
  const setLumpSumAmount = (val: number) => setFormState((prev) => ({ ...prev, lumpSumAmount: val }));
  const setLumpSumMonth = (val: number) => setFormState((prev) => ({ ...prev, lumpSumMonth: val }));

  const [scheduleView, setScheduleView] = useState<"yearly" | "monthly">("yearly");
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  const baseEmi = useMemo(() => {
    const p = amount;
    const r = interest / 12 / 100;
    const n = tenureYears * 12;

    if (p <= 0 || r <= 0 || n <= 0) return 0;
    return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }, [amount, interest, tenureYears]);

  const scheduleData = useMemo(() => {
    const p = amount;
    const r = interest / 12 / 100;
    const totalMonths = tenureYears * 12;

    if (p <= 0 || r <= 0 || totalMonths <= 0 || baseEmi <= 0) {
      return {
        rows: [],
        yearly: [],
        totalInterest: 0,
        totalPayment: 0,
        actualMonths: 0,
        interestSaved: 0,
        monthsSaved: 0,
      };
    }

    const rows: AmortizationRow[] = [];
    let currentBalance = p;
    let accumulatedInterest = 0;
    let accumulatedPayment = 0;
    let actualMonths = 0;

    for (let m = 1; m <= totalMonths; m++) {
      if (currentBalance <= 0) break;

      actualMonths = m;
      const openingBalance = currentBalance;
      const interestPaid = openingBalance * r;

      let extra = extraMonthlyPayment;
      if (m === lumpSumMonth) {
        extra += lumpSumAmount;
      }

      let currentEmi = baseEmi;
      let principalPaid = currentEmi - interestPaid;

      if (principalPaid + extra >= openingBalance) {
        principalPaid = openingBalance;
        currentEmi = principalPaid + interestPaid;
        extra = 0;
        currentBalance = 0;
      } else {
        currentBalance = openingBalance - (principalPaid + extra);
      }

      accumulatedInterest += interestPaid;
      accumulatedPayment += currentEmi + extra;

      rows.push({
        month: m,
        year: Math.ceil(m / 12),
        openingBalance: Math.round(openingBalance),
        emi: Math.round(currentEmi),
        principalPaid: Math.round(principalPaid),
        interestPaid: Math.round(interestPaid),
        extraPayment: Math.round(extra),
        closingBalance: Math.round(Math.max(0, currentBalance)),
      });

      if (currentBalance <= 0) break;
    }

    // Compute Yearly Aggregates
    const yearlyMap: Record<number, YearlySummary> = {};
    for (const row of rows) {
      if (!yearlyMap[row.year]) {
        yearlyMap[row.year] = {
          year: row.year,
          principalPaid: 0,
          interestPaid: 0,
          totalPaid: 0,
          endingBalance: row.closingBalance,
        };
      }
      yearlyMap[row.year].principalPaid += row.principalPaid + row.extraPayment;
      yearlyMap[row.year].interestPaid += row.interestPaid;
      yearlyMap[row.year].totalPaid += row.emi + row.extraPayment;
      yearlyMap[row.year].endingBalance = row.closingBalance;
    }

    const yearly = Object.values(yearlyMap);

    // Standard no-prepayment baseline for comparison
    const baseTotalPayment = baseEmi * totalMonths;
    const baseTotalInterest = baseTotalPayment - p;

    const interestSaved = Math.max(0, baseTotalInterest - accumulatedInterest);
    const monthsSaved = Math.max(0, totalMonths - actualMonths);

    return {
      rows,
      yearly,
      totalInterest: Math.round(accumulatedInterest),
      totalPayment: Math.round(accumulatedPayment),
      actualMonths,
      interestSaved: Math.round(interestSaved),
      monthsSaved,
    };
  }, [amount, interest, tenureYears, baseEmi, extraMonthlyPayment, lumpSumAmount, lumpSumMonth]);

  const pieChartData = useMemo(() => {
    return [
      { name: "Principal Borrowed", value: amount, color: "#22C55E" },
      { name: "Total Interest Paid", value: scheduleData.totalInterest, color: "#F43F5E" },
    ];
  }, [amount, scheduleData.totalInterest]);

  const areaChartData = useMemo(() => {
    return scheduleData.yearly.map((y) => ({
      name: `Yr ${y.year}`,
      Principal: Math.round(y.principalPaid),
      Interest: Math.round(y.interestPaid),
      "Remaining Loan": Math.round(y.endingBalance),
    }));
  }, [scheduleData.yearly]);

  const principalPercent = useMemo(() => {
    if (!scheduleData.totalPayment) return 50;
    return Math.round((amount / scheduleData.totalPayment) * 100);
  }, [amount, scheduleData.totalPayment]);

  const applyPreset = (p: typeof PRESETS[0]) => {
    setAmount(p.amount);
    setInterest(p.interest);
    setTenureYears(p.tenureYears);
  };

  const downloadCsv = () => {
    if (scheduleData.rows.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,Month,Year,Opening Balance,EMI,Principal Paid,Interest Paid,Extra Payment,Closing Balance\n";
    scheduleData.rows.forEach((r) => {
      csvContent += `${r.month},${r.year},${r.openingBalance},${r.emi},${r.principalPaid},${r.interestPaid},${r.extraPayment},${r.closingBalance}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `amortization_schedule_${amount}_npr.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Restored State Banner */}
      {wasRestored && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span>💾 Restored your previous calculation inputs</span>
          </div>
          <button
            onClick={clearSaved}
            className="text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 font-bold"
          >
            <RotateCcw size={12} /> Clear saved
          </button>
        </div>
      )}

      {/* Action & Presets Header */}
      <div className="p-4 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
            <Calculator size={14} className="text-[#22C55E]" /> Quick Loan Presets:
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PRESETS.map((p) => {
            const Icon = p.icon;
            const isSelected = amount === p.amount && interest === p.interest && tenureYears === p.tenureYears;
            return (
              <button
                key={p.name}
                onClick={() => applyPreset(p)}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                  isSelected
                    ? "bg-[#1F2544] text-white border-[#1F2544] dark:bg-[#22C55E] dark:text-[#0C0F1E] dark:border-[#22C55E]"
                    : "bg-[#FAFAF8] dark:bg-[#1E2338] border-[#E4E0D8] dark:border-[#2A2F48] text-[#18181B] dark:text-[#F4F4F5] hover:border-[#22C55E]"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isSelected ? "bg-white/20" : "bg-[#22C55E]/10 text-[#22C55E]"}`}>
                  <Icon size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold">{p.name}</div>
                  <div className="text-[10px] opacity-80">
                    Rs. {(p.amount / 100000).toLocaleString()}L @ {p.interest}%
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Loan Controls Column (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-5">
            <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign size={14} className="text-[#22C55E]" /> 1. Enter Loan Details
            </h4>

            {/* Loan Amount */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1">
                  Loan Amount You Need (सावाँ रकम)
                </label>
                <span className="text-sm font-bold text-[#1F2544] dark:text-[#22C55E]">
                  Rs. {amount.toLocaleString("en-IN")}
                </span>
              </div>
              <input
                type="range"
                min={50000}
                max={20000000}
                step={50000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full accent-[#22C55E] cursor-pointer"
              />
              <div className="mt-2 relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#A1A1AA] text-xs">
                  Rs.
                </span>
                <input
                  type="number"
                  min={0}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
                />
              </div>
            </div>

            {/* Interest Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1">
                  <Percent size={14} /> Interest Rate (% p.a. / ब्याज दर)
                </label>
                <span className="text-sm font-bold text-[#1F2544] dark:text-[#22C55E]">
                  {interest}% per year
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={25}
                step={0.25}
                value={interest}
                onChange={(e) => setInterest(Number(e.target.value))}
                className="w-full accent-[#22C55E] cursor-pointer"
              />
              <input
                type="number"
                step="0.1"
                min={0.1}
                value={interest}
                onChange={(e) => setInterest(Number(e.target.value))}
                className="mt-2 w-full px-3.5 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
              />
            </div>

            {/* Tenure */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={14} /> Loan Period / Tenure (भुक्तानी अवधि)
                </label>
                <span className="text-sm font-bold text-[#1F2544] dark:text-[#22C55E]">
                  {tenureYears} Years ({tenureYears * 12} Monthly Installments)
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full accent-[#22C55E] cursor-pointer"
              />
            </div>
          </div>

          {/* Prepayment / Extra Payment Modeling */}
          <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
              <TrendingDown size={14} className="text-[#22C55E]" /> 2. Prepayment / Extra Payment Planner
            </h4>

            <p className="text-xs text-[#71717A]">
              Want to pay off your loan faster? Add extra monthly or lump-sum payments to see how much interest you save!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#71717A] mb-1">
                  Extra Payment Every Month (Rs.)
                </label>
                <input
                  type="number"
                  min={0}
                  step={500}
                  value={extraMonthlyPayment || ""}
                  onChange={(e) => setExtraMonthlyPayment(Number(e.target.value))}
                  placeholder="e.g. 5000"
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-semibold text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#71717A] mb-1">
                  One-time Lump Sum Prepayment
                </label>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={lumpSumAmount || ""}
                  onChange={(e) => setLumpSumAmount(Number(e.target.value))}
                  placeholder="e.g. 100000"
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-semibold text-xs"
                />
              </div>
            </div>

            {lumpSumAmount > 0 && (
              <div>
                <label className="block text-xs font-bold text-[#71717A] mb-1">
                  Lump Sum Payment Month (Month 1 to {tenureYears * 12})
                </label>
                <input
                  type="number"
                  min={1}
                  max={tenureYears * 12}
                  value={lumpSumMonth}
                  onChange={(e) => setLumpSumMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-semibold text-xs"
                />
              </div>
            )}

            {(scheduleData.interestSaved > 0 || scheduleData.monthsSaved > 0) && (
              <div className="p-3.5 rounded-xl bg-[#F0FDF4] dark:bg-[#052E16]/40 border border-[#BBF7D0] dark:border-[#166534] text-xs text-[#166534] dark:text-[#86EFAC] space-y-1">
                <div className="font-bold flex items-center gap-1">
                  🎉 Prepayment Benefits Calculated:
                </div>
                <div>
                  Save <strong>Rs. {scheduleData.interestSaved.toLocaleString("en-IN")}</strong> in interest charges!
                </div>
                {scheduleData.monthsSaved > 0 && (
                  <div>
                    Finish paying off your loan <strong>{scheduleData.monthsSaved} months ({Math.round(scheduleData.monthsSaved / 12 * 10) / 10} yrs)</strong> earlier!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results & Visualizations Column (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main EMI Result Card */}
          <div className="p-6 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl space-y-6">
            <div>
              <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider block">
                Your Monthly Installment (मासिक किस्ता - EMI)
              </span>
              <div className="text-4xl font-extrabold text-[#1F2544] dark:text-[#22C55E] mt-1">
                Rs. {Math.round(baseEmi).toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-[#A1A1AA] mt-1">
                To be paid every month for {scheduleData.actualMonths} months
              </div>
            </div>

            {/* Total Breakdown Summary */}
            <div className="space-y-3 pt-4 border-t border-[#E4E0D8] dark:border-[#2A2F48]">
              <div className="flex justify-between text-sm">
                <span className="text-[#71717A] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] inline-block" />
                  Principal Borrowed:
                </span>
                <span className="font-bold text-[#18181B] dark:text-[#F4F4F5]">
                  Rs. {amount.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-[#71717A] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E] inline-block" />
                  Total Interest Charged:
                </span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  Rs. {scheduleData.totalInterest.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between text-sm font-bold pt-2 border-t border-[#E4E0D8] dark:border-[#2A2F48]">
                <span className="text-[#18181B] dark:text-[#F4F4F5]">Total Payable Amount:</span>
                <span className="text-[#22C55E]">
                  Rs. {scheduleData.totalPayment.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Principal vs Interest Donut Chart Visualization */}
            <div className="pt-3 border-t border-[#E4E0D8] dark:border-[#2A2F48] space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#71717A] uppercase tracking-wider">
                <span>Payment Share</span>
                <span>Principal ({principalPercent}%) vs Interest ({100 - principalPercent}%)</span>
              </div>
              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [`Rs. ${val.toLocaleString("en-IN")}`, ""]}
                      contentStyle={{ backgroundColor: "#141829", borderColor: "#1E2338", color: "#F4F4F5", borderRadius: "12px", fontSize: "12px" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Easy Explanation Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-2 text-xs">
            <div className="font-bold text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-1.5">
              <HelpCircle size={15} className="text-[#22C55E]" /> Easy Explanation (सरल व्याख्या)
            </div>
            <p className="text-[#71717A] leading-relaxed">
              When you borrow <strong>Rs. {amount.toLocaleString("en-IN")}</strong> at <strong>{interest}%</strong> for <strong>{tenureYears} years</strong>, you pay <strong>Rs. {Math.round(baseEmi).toLocaleString("en-IN")}</strong> every month.
            </p>
            <p className="text-[#71717A] leading-relaxed">
              Over the entire loan period, for every <strong>Rs. 100</strong> you pay to the bank, <strong>Rs. {principalPercent}</strong> goes towards repaying your original loan, and <strong>Rs. {100 - principalPercent}</strong> is the bank interest fee.
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Timeline Area Chart */}
      <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-3">
        <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
          <Layers size={14} className="text-[#22C55E]" /> Real Loan Repayment Timeline & Remaining Balance
        </h4>
        <p className="text-xs text-[#71717A]">
          See how your loan balance decreases over time and how principal vs interest shifts each year.
        </p>
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaChartData}>
              <XAxis dataKey="name" stroke="#A1A1AA" fontSize={11} />
              <YAxis stroke="#A1A1AA" fontSize={11} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip
                formatter={(val: number) => [`Rs. ${val.toLocaleString("en-IN")}`, ""]}
                contentStyle={{ backgroundColor: "#141829", borderColor: "#1E2338", color: "#F4F4F5", borderRadius: "12px", fontSize: "12px" }}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              <Area type="monotone" dataKey="Principal" stackId="1" stroke="#22C55E" fill="#22C55E" fillOpacity={0.6} />
              <Area type="monotone" dataKey="Interest" stackId="1" stroke="#F43F5E" fill="#F43F5E" fillOpacity={0.6} />
              <Area type="monotone" dataKey="Remaining Loan" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Full Amortization Table Section */}
      <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={() => setShowSchedule(!showSchedule)}
            className="flex items-center gap-2 text-xs font-bold text-[#71717A] uppercase tracking-wider hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
          >
            <Calendar size={16} className="text-[#22C55E]" />
            Full Repayment Schedule Table ({scheduleData.rows.length} Monthly Installments)
            {showSchedule ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showSchedule && (
            <div className="flex items-center gap-3">
              <div className="flex p-1 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-xl text-xs">
                <button
                  onClick={() => setScheduleView("yearly")}
                  className={`px-3 py-1 font-bold rounded-lg transition-colors ${
                    scheduleView === "yearly" ? "bg-[#22C55E] text-white" : "text-[#71717A]"
                  }`}
                >
                  Yearly Summary
                </button>
                <button
                  onClick={() => setScheduleView("monthly")}
                  className={`px-3 py-1 font-bold rounded-lg transition-colors ${
                    scheduleView === "monthly" ? "bg-[#22C55E] text-white" : "text-[#71717A]"
                  }`}
                >
                  Monthly Details
                </button>
              </div>

              <button
                onClick={downloadCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] hover:bg-[#22C55E] hover:text-white transition-colors"
              >
                <Download size={12} /> Export CSV
              </button>
            </div>
          )}
        </div>

        {showSchedule && (
          <div className="overflow-x-auto pt-2">
            {scheduleView === "yearly" ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E4E0D8] dark:border-[#1E2338] text-[#71717A] uppercase text-[10px]">
                    <th className="py-2.5 px-3 font-bold">Year</th>
                    <th className="py-2.5 px-3 font-bold">Principal Repaid</th>
                    <th className="py-2.5 px-3 font-bold">Interest Paid</th>
                    <th className="py-2.5 px-3 font-bold">Total Annual Paid</th>
                    <th className="py-2.5 px-3 font-bold text-right">Year-End Loan Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E0D8]/50 dark:divide-[#1E2338]">
                  {scheduleData.yearly.map((y) => (
                    <tr key={y.year} className="hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338]/50">
                      <td className="py-2.5 px-3 font-bold text-[#18181B] dark:text-[#F4F4F5]">Year {y.year}</td>
                      <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                        Rs. {y.principalPaid.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-3 text-rose-600 dark:text-rose-400 font-semibold">
                        Rs. {y.interestPaid.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#18181B] dark:text-[#F4F4F5]">
                        Rs. {y.totalPaid.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#71717A]">
                        Rs. {y.endingBalance.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E4E0D8] dark:border-[#1E2338] text-[#71717A] uppercase text-[10px]">
                    <th className="py-2.5 px-3 font-bold">Mth</th>
                    <th className="py-2.5 px-3 font-bold">Opening Bal</th>
                    <th className="py-2.5 px-3 font-bold">EMI</th>
                    <th className="py-2.5 px-3 font-bold">Principal</th>
                    <th className="py-2.5 px-3 font-bold">Interest</th>
                    <th className="py-2.5 px-3 font-bold">Extra</th>
                    <th className="py-2.5 px-3 font-bold text-right">Closing Bal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E0D8]/50 dark:divide-[#1E2338]">
                  {scheduleData.rows.map((r) => (
                    <tr key={r.month} className="hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338]/50">
                      <td className="py-2 px-3 font-bold text-[#18181B] dark:text-[#F4F4F5]">{r.month}</td>
                      <td className="py-2 px-3 font-mono text-[#71717A]">Rs. {r.openingBalance.toLocaleString("en-IN")}</td>
                      <td className="py-2 px-3 font-semibold text-[#18181B] dark:text-[#F4F4F5]">Rs. {r.emi.toLocaleString("en-IN")}</td>
                      <td className="py-2 px-3 text-emerald-600 font-semibold">Rs. {r.principalPaid.toLocaleString("en-IN")}</td>
                      <td className="py-2 px-3 text-rose-600 font-semibold">Rs. {r.interestPaid.toLocaleString("en-IN")}</td>
                      <td className="py-2 px-3 text-amber-600 font-semibold">
                        {r.extraPayment > 0 ? `Rs. ${r.extraPayment.toLocaleString("en-IN")}` : "-"}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-[#71717A]">Rs. {r.closingBalance.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
