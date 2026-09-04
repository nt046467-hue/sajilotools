"use client";

import { useState, useMemo } from "react";
import { Receipt, DollarSign, Percent, Copy, Check, Info } from "lucide-react";

type VatMode = "exclusive" | "inclusive"; // exclusive = Add 13% VAT; inclusive = Extract/Remove 13% VAT

import { useEffect } from "react";
import { usePersistedFormState } from "@/hooks/usePersistedFormState";
import { RotateCcw } from "lucide-react";

export default function VatCalculatorTool() {
  const [formState, setFormState, { wasRestored, clearSaved }] = usePersistedFormState(
    "vat-calculator",
    {
      amount: 10000,
      mode: "exclusive" as VatMode,
      vatRate: 13,
    }
  );

  const [copied, setCopied] = useState<boolean>(false);

  // Read URL query parameters on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const pAmt = parseFloat(params.get("amount") || "");
    const pMode = params.get("mode");
    const pRate = parseFloat(params.get("rate") || "");

    const updates: Partial<typeof formState> = {};
    if (!isNaN(pAmt) && pAmt > 0) updates.amount = pAmt;
    if (pMode && (pMode === "exclusive" || pMode === "inclusive")) updates.mode = pMode as VatMode;
    if (!isNaN(pRate) && pRate > 0 && pRate <= 100) updates.vatRate = pRate;

    if (Object.keys(updates).length > 0) {
      setFormState((prev) => ({ ...prev, ...updates }));
    }
  }, [setFormState]);

  const amount = formState.amount;
  const mode = formState.mode;
  const vatRate = formState.vatRate;

  const setAmount = (val: number) => setFormState((prev) => ({ ...prev, amount: val }));
  const setMode = (val: VatMode) => setFormState((prev) => ({ ...prev, mode: val }));
  const setVatRate = (val: number) => setFormState((prev) => ({ ...prev, vatRate: val }));

  const vatCalculation = useMemo(() => {
    const val = amount;
    const rate = vatRate / 100;

    if (val <= 0 || rate <= 0) {
      return {
        netAmount: 0,
        vatAmount: 0,
        grossAmount: 0,
      };
    }

    if (mode === "exclusive") {
      // Add VAT: Net Amount + 13% = Gross Amount
      const netAmount = val;
      const vatAmount = netAmount * rate;
      const grossAmount = netAmount + vatAmount;
      return {
        netAmount: Math.round(netAmount * 100) / 100,
        vatAmount: Math.round(vatAmount * 100) / 100,
        grossAmount: Math.round(grossAmount * 100) / 100,
      };
    } else {
      // Remove VAT: Gross Amount = Net Amount * (1 + 13%) => Net = Gross / 1.13
      const grossAmount = val;
      const netAmount = grossAmount / (1 + rate);
      const vatAmount = grossAmount - netAmount;
      return {
        netAmount: Math.round(netAmount * 100) / 100,
        vatAmount: Math.round(vatAmount * 100) / 100,
        grossAmount: Math.round(grossAmount * 100) / 100,
      };
    }
  }, [amount, mode, vatRate]);

  const copyBreakdown = () => {
    const text = `Nepal 13% VAT Breakdown:\nNet Price: Rs. ${vatCalculation.netAmount.toLocaleString("en-IN")}\nVAT (${vatRate}%): Rs. ${vatCalculation.vatAmount.toLocaleString("en-IN")}\nTotal (Gross): Rs. ${vatCalculation.grossAmount.toLocaleString("en-IN")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const quickAmounts = [1000, 5000, 10000, 25000, 50000, 100000, 500000];

  return (
    <div className="space-y-6">
      {/* Restored State Banner */}
      {wasRestored && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span>💾 Restored your previous VAT calculation inputs</span>
          </div>
          <button
            onClick={clearSaved}
            className="text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 font-bold"
          >
            <RotateCcw size={12} /> Clear saved
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Parameters */}
        <div className="space-y-5 p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
              <Receipt size={14} className="text-[#22C55E]" /> Nepal VAT Calculation Mode
            </h4>
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMode("exclusive")}
              className={`p-3 rounded-xl border text-xs font-bold transition-colors flex flex-col items-center gap-1 ${
                mode === "exclusive"
                  ? "bg-[#1F2544] text-white border-[#1F2544] dark:bg-[#22C55E] dark:text-[#0C0F1E] dark:border-[#22C55E]"
                  : "border-[#E4E0D8] dark:border-[#1E2338] text-[#71717A] bg-[#FAFAF8] dark:bg-[#1E2338]"
              }`}
            >
              <span>Add VAT (+13%)</span>
              <span className="text-[10px] font-normal opacity-80">Price excluding VAT</span>
            </button>
            <button
              onClick={() => setMode("inclusive")}
              className={`p-3 rounded-xl border text-xs font-bold transition-colors flex flex-col items-center gap-1 ${
                mode === "inclusive"
                  ? "bg-[#1F2544] text-white border-[#1F2544] dark:bg-[#22C55E] dark:text-[#0C0F1E] dark:border-[#22C55E]"
                  : "border-[#E4E0D8] dark:border-[#1E2338] text-[#71717A] bg-[#FAFAF8] dark:bg-[#1E2338]"
              }`}
            >
              <span>Remove / Extract VAT</span>
              <span className="text-[10px] font-normal opacity-80">Price including VAT</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider mb-2 flex items-center gap-1">
              <DollarSign size={14} /> {mode === "exclusive" ? "Net Price (Pre-VAT)" : "Gross Total Price (VAT Inclusive)"} (Rs.)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#A1A1AA]">
                रु
              </span>
              <input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E]/40"
              />
            </div>
          </div>

          {/* Rate Selector (Default 13%) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1">
                <Percent size={14} /> VAT Rate (% in Nepal)
              </label>
              <span className="text-xs font-bold text-[#22C55E]">13% Standard</span>
            </div>
            <input
              type="number"
              min={1}
              max={30}
              value={vatRate}
              onChange={(e) => setVatRate(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
            />
          </div>

          {/* Quick Select Buttons */}
          <div>
            <label className="block text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-2">
              Quick Preset Amounts:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  onClick={() => setAmount(q)}
                  className="px-2.5 py-1 rounded-lg border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-xs font-semibold text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] transition-colors"
                >
                  Rs. {q.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="p-6 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
                Total Invoice Price (Gross)
              </span>
              <button
                onClick={copyBreakdown}
                className="flex items-center gap-1 text-xs font-bold text-[#22C55E] hover:underline"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy Breakdown"}
              </button>
            </div>
            <div className="text-4xl font-extrabold text-[#1F2544] dark:text-[#22C55E] mt-2">
              Rs. {vatCalculation.grossAmount.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-[#A1A1AA] mt-1">
              Final bill amount payable
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#E4E0D8] dark:border-[#2A2F48]">
            <div className="flex justify-between text-sm">
              <span className="text-[#71717A]">Net Base Price (Pre-VAT)</span>
              <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                Rs. {vatCalculation.netAmount.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#71717A]">Nepal VAT ({vatRate}%) Amount</span>
              <span className="font-bold text-[#22C55E]">
                + Rs. {vatCalculation.vatAmount.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-[#E4E0D8] dark:border-[#2A2F48]">
              <span className="text-[#18181B] dark:text-[#F4F4F5]">Total Price (Inclusive)</span>
              <span className="text-[#22C55E]">
                Rs. {vatCalculation.grossAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-xs text-[#71717A] flex items-start gap-2">
            <Info size={16} className="text-[#22C55E] shrink-0 mt-0.5" />
            <span>
              In Nepal, Value Added Tax (VAT) is governed by the Value Added Tax Act 2052 with a standard single rate of 13%.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
