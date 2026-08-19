"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Calculator,
  Info,
  ShieldCheck,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Download,
  Share2,
  Landmark,
} from "lucide-react";
import { PDFDocument } from "pdf-lib";
import CalculatorCrossLink from "./shared/CalculatorCrossLink";
import { SITE_URL } from "@/lib/site-config";

export type FiscalYear = "2083/84" | "2082/83";

export const TAX_RATES_LAST_VERIFIED = "2 August 2026";
export const TAX_VERIFICATION_NOTE = "based on Budget Speech FY 2083/84 and pending final Finance Act 2083";

interface Slab {
  limit: number;
  rate: number;
  label: string;
}

import { usePersistedFormState } from "@/hooks/usePersistedFormState";
import { RotateCcw } from "lucide-react";

export default function TaxCalculatorTool() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read initial params from URL or defaults
  const initialFy = (searchParams.get("fy") as FiscalYear) || "2083/84";
  const initialIncome = Number(searchParams.get("salary")) || 75000;
  const initialStatus = (searchParams.get("status") as "single" | "married") || "single";
  const initialBonus = Number(searchParams.get("bonus")) || 1;
  const initialOther = Number(searchParams.get("other")) || 0;
  const initialSsf = searchParams.get("ssf") !== "0";
  const initialRetire = Number(searchParams.get("retire")) || 0;
  const initialLife = Number(searchParams.get("life")) || 0;
  const initialHealth = Number(searchParams.get("health")) || 0;
  const initialFemale = searchParams.get("female") === "1";

  const [formState, setFormState, { wasRestored, clearSaved }] = usePersistedFormState(
    "tax-calculator",
    {
      fiscalYear: (initialFy === "2082/83" ? "2082/83" : "2083/84") as FiscalYear,
      monthlyIncome: initialIncome,
      status: (initialStatus === "married" ? "married" : "single") as "single" | "married",
      bonusMonths: initialBonus,
      otherIncome: initialOther,
      hasSsf: initialSsf,
      retirementContrib: initialRetire,
      lifeInsurance: initialLife,
      healthInsurance: initialHealth,
      isFemaleTaxpayer: initialFemale,
    }
  );

  const fiscalYear = formState.fiscalYear;
  const monthlyIncome = formState.monthlyIncome;
  const status = formState.status;
  const bonusMonths = formState.bonusMonths;
  const otherIncome = formState.otherIncome;
  const hasSsf = formState.hasSsf;
  const retirementContrib = formState.retirementContrib;
  const lifeInsurance = formState.lifeInsurance;
  const healthInsurance = formState.healthInsurance;
  const isFemaleTaxpayer = formState.isFemaleTaxpayer;

  const setFiscalYear = (val: FiscalYear) => setFormState((prev) => ({ ...prev, fiscalYear: val }));
  const setMonthlyIncome = (val: number) => setFormState((prev) => ({ ...prev, monthlyIncome: val }));
  const setStatus = (val: "single" | "married") => setFormState((prev) => ({ ...prev, status: val }));
  const setBonusMonths = (val: number) => setFormState((prev) => ({ ...prev, bonusMonths: val }));
  const setOtherIncome = (val: number) => setFormState((prev) => ({ ...prev, otherIncome: val }));
  const setHasSsf = (val: boolean) => setFormState((prev) => ({ ...prev, hasSsf: val }));
  const setRetirementContrib = (val: number) => setFormState((prev) => ({ ...prev, retirementContrib: val }));
  const setLifeInsurance = (val: number) => setFormState((prev) => ({ ...prev, lifeInsurance: val }));
  const setHealthInsurance = (val: number) => setFormState((prev) => ({ ...prev, healthInsurance: val }));
  const setIsFemaleTaxpayer = (val: boolean) => setFormState((prev) => ({ ...prev, isFemaleTaxpayer: val }));
  const isFemaleRebate = isFemaleTaxpayer;

  const [viewMode, setViewMode] = useState<"monthly" | "annual">("annual");
  const [showDeductions, setShowDeductions] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [shareCopied, setShareCopied] = useState<boolean>(false);

  // Debounced URL sync
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams();
      if (fiscalYear !== "2083/84") params.set("fy", fiscalYear);
      if (monthlyIncome !== 75000) params.set("salary", String(monthlyIncome));
      if (status !== "single") params.set("status", status);
      if (bonusMonths !== 1) params.set("bonus", String(bonusMonths));
      if (otherIncome !== 0) params.set("other", String(otherIncome));
      if (!hasSsf) params.set("ssf", "0");
      if (retirementContrib !== 0) params.set("retire", String(retirementContrib));
      if (lifeInsurance !== 0) params.set("life", String(lifeInsurance));
      if (healthInsurance !== 0) params.set("health", String(healthInsurance));
      if (isFemaleRebate) params.set("female", "1");

      const qs = params.toString();
      const newUrl = qs ? `${pathname}?${qs}` : pathname;
      router.replace(newUrl, { scroll: false });
    }, 400);
    return () => clearTimeout(timeout);
  }, [
    fiscalYear,
    monthlyIncome,
    status,
    bonusMonths,
    otherIncome,
    hasSsf,
    retirementContrib,
    lifeInsurance,
    healthInsurance,
    isFemaleRebate,
    pathname,
    router,
  ]);

  const taxCalculation = useMemo(() => {
    const annualBaseSalary = monthlyIncome * (12 + bonusMonths);
    const grossIncome = annualBaseSalary + otherIncome;

    if (grossIncome <= 0) {
      return {
        grossIncome: 0,
        taxableIncome: 0,
        totalDeductions: 0,
        totalTax: 0,
        effectiveRate: 0,
        monthlyTax: 0,
        monthlyNet: 0,
        annualNet: 0,
        slabs: [],
        deductionsBreakdown: [],
      };
    }

    // Deductions calculation
    const maxRetirementCap = Math.min(grossIncome / 3, 500000);
    const allowedRetirement = Math.min(retirementContrib, maxRetirementCap);
    const allowedLifeInsurance = Math.min(lifeInsurance, 40000);
    const allowedHealthInsurance = Math.min(healthInsurance, 20000);

    const totalDeductions = allowedRetirement + allowedLifeInsurance + allowedHealthInsurance;
    const taxableIncome = Math.max(0, grossIncome - totalDeductions);

    // Slabs based on Fiscal Year
    let slabsConfig: Slab[] = [];

    if (fiscalYear === "2083/84") {
      const sstRate = hasSsf ? 0.0 : 0.01;
      slabsConfig = [
        { limit: 1000000, rate: sstRate, label: hasSsf ? "First Rs. 10 Lakhs (0% SST - SSF Exempt)" : "First Rs. 10 Lakhs (1% SST)" },
        { limit: 500000, rate: 0.10, label: "Next Rs. 5 Lakhs (10%)" },
        { limit: 1000000, rate: 0.20, label: "Next Rs. 10 Lakhs (20%)" },
        { limit: 1500000, rate: 0.27, label: "Next Rs. 15 Lakhs (27%)" },
        { limit: Infinity, rate: 0.29, label: "Above Rs. 40 Lakhs (29%)" },
      ];
    } else {
      const sstRate = hasSsf ? 0.0 : 0.01;
      if (status === "single") {
        slabsConfig = [
          { limit: 500000, rate: sstRate, label: hasSsf ? "First Rs. 5 Lakhs (0% SST - SSF Exempt)" : "First Rs. 5 Lakhs (1% SST)" },
          { limit: 200000, rate: 0.10, label: "Next Rs. 2 Lakhs (10%)" },
          { limit: 300000, rate: 0.20, label: "Next Rs. 3 Lakhs (20%)" },
          { limit: 1000000, rate: 0.30, label: "Next Rs. 10 Lakhs (30%)" },
          { limit: 3000000, rate: 0.36, label: "Next Rs. 30 Lakhs (36%)" },
          { limit: Infinity, rate: 0.39, label: "Above Rs. 50 Lakhs (39%)" },
        ];
      } else {
        slabsConfig = [
          { limit: 600000, rate: sstRate, label: hasSsf ? "First Rs. 6 Lakhs (0% SST - SSF Exempt)" : "First Rs. 6 Lakhs (1% SST)" },
          { limit: 200000, rate: 0.10, label: "Next Rs. 2 Lakhs (10%)" },
          { limit: 300000, rate: 0.20, label: "Next Rs. 3 Lakhs (20%)" },
          { limit: 900000, rate: 0.30, label: "Next Rs. 9 Lakhs (30%)" },
          { limit: 3000000, rate: 0.36, label: "Next Rs. 30 Lakhs (36%)" },
          { limit: Infinity, rate: 0.39, label: "Above Rs. 50 Lakhs (39%)" },
        ];
      }
    }

    let remaining = taxableIncome;
    let rawTax = 0;
    const computedSlabs: { label: string; taxable: number; tax: number; rate: number }[] = [];

    for (const slab of slabsConfig) {
      if (remaining <= 0) break;
      const taxableChunk = Math.min(remaining, slab.limit);
      const taxChunk = taxableChunk * slab.rate;
      rawTax += taxChunk;
      computedSlabs.push({
        label: slab.label,
        taxable: Math.round(taxableChunk),
        tax: Math.round(taxChunk),
        rate: slab.rate * 100,
      });
      remaining -= taxableChunk;
    }

    const femaleRebateAmount = isFemaleRebate ? rawTax * 0.10 : 0;
    const finalTax = Math.max(0, rawTax - femaleRebateAmount);

    const annualNet = grossIncome - finalTax;
    const monthlyTax = Math.round(finalTax / 12);
    const monthlyNet = Math.round(annualNet / 12);
    const effectiveRate = grossIncome > 0 ? (finalTax / grossIncome) * 100 : 0;

    return {
      grossIncome: Math.round(grossIncome),
      taxableIncome: Math.round(taxableIncome),
      totalDeductions: Math.round(totalDeductions),
      totalTax: Math.round(finalTax),
      effectiveRate: Math.round(effectiveRate * 10) / 10,
      monthlyTax,
      monthlyNet,
      annualNet: Math.round(annualNet),
      slabs: computedSlabs,
      deductionsBreakdown: [
        { label: "Retirement (EPF/CIT/SSF)", amount: allowedRetirement, cap: maxRetirementCap },
        { label: "Life Insurance Premium", amount: allowedLifeInsurance, cap: 40000 },
        { label: "Health Insurance Premium", amount: allowedHealthInsurance, cap: 20000 },
        ...(isFemaleRebate ? [{ label: "10% Female Tax Rebate", amount: femaleRebateAmount, cap: Infinity }] : []),
      ],
    };
  }, [
    fiscalYear,
    monthlyIncome,
    status,
    bonusMonths,
    otherIncome,
    hasSsf,
    retirementContrib,
    lifeInsurance,
    healthInsurance,
    isFemaleRebate,
  ]);

  const copyBreakdown = useCallback(() => {
    const slabText = taxCalculation.slabs
      .map((s) => `  - ${s.label}: Rs. ${s.tax.toLocaleString("en-IN")}`)
      .join("\n");

    const text = `Nepal Income Tax Calculation (FY ${fiscalYear})
Marital Status: ${status === "single" ? "Single" : "Married"} | SSF Contributor: ${hasSsf ? "Yes" : "No"}

Monthly Base Salary: Rs. ${monthlyIncome.toLocaleString("en-IN")}
Annual Gross Income: Rs. ${taxCalculation.grossIncome.toLocaleString("en-IN")}
Total Deductions: Rs. ${taxCalculation.totalDeductions.toLocaleString("en-IN")}
Taxable Base Income: Rs. ${taxCalculation.taxableIncome.toLocaleString("en-IN")}

Slab Breakdown:
${slabText || "  - No taxable income"}

Total Tax Payable:
  - Annual Tax: Rs. ${taxCalculation.totalTax.toLocaleString("en-IN")}
  - Monthly Tax: Rs. ${taxCalculation.monthlyTax.toLocaleString("en-IN")}
  - Effective Tax Rate: ${taxCalculation.effectiveRate}%

Net Take-Home Pay:
  - Annual Net Income: Rs. ${taxCalculation.annualNet.toLocaleString("en-IN")}
  - Monthly Net Income: Rs. ${taxCalculation.monthlyNet.toLocaleString("en-IN")}

Calculated via SajiloTools (${SITE_URL})`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [fiscalYear, status, hasSsf, monthlyIncome, taxCalculation]);

  const copyShareLink = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Nepal Income Tax & Salary TDS Calculator — SajiloTools",
          text: `Check out my Nepal Income Tax / Salary TDS calculation: Monthly Base Salary Rs. ${monthlyIncome.toLocaleString("en-IN")}, Annual Tax Rs. ${taxCalculation.totalTax.toLocaleString("en-IN")}`,
          url: window.location.href,
        });
        return;
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  }, [monthlyIncome, taxCalculation]);

  const downloadPdfReport = useCallback(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1600;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, 1200, 1600);

    // Header Banner
    ctx.fillStyle = "#1F2544";
    ctx.fillRect(0, 0, 1200, 140);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 34px sans-serif";
    ctx.fillText("SajiloTools — Nepal Income Tax Report", 60, 65);

    ctx.fillStyle = "#F5A623";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(`Fiscal Year: ${fiscalYear}  |  Generated on ${new Date().toLocaleDateString("en-US")}`, 60, 105);

    let y = 190;

    // Section 1: Inputs
    ctx.fillStyle = "#18181B";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText("1. Salary & Tax Parameters", 60, y);
    y += 35;

    ctx.fillStyle = "#FAFAF8";
    ctx.fillRect(60, y, 1080, 140);
    ctx.strokeStyle = "#E4E0D8";
    ctx.lineWidth = 2;
    ctx.strokeRect(60, y, 1080, 140);

    ctx.fillStyle = "#52525B";
    ctx.font = "18px sans-serif";
    ctx.fillText(`Monthly Base Salary: Rs. ${monthlyIncome.toLocaleString("en-IN")}`, 90, y + 40);
    ctx.fillText(`Bonus / Festival Allowance: ${bonusMonths} month(s)`, 600, y + 40);
    ctx.fillText(`SSF Contributor: ${hasSsf ? "Yes (0% SST Exempt)" : "No (1% SST Applies)"}`, 90, y + 85);
    ctx.fillText(`Marital Status: ${status === "single" ? "Single" : "Married"}`, 600, y + 85);
    ctx.fillText(`Female Rebate (10%): ${isFemaleRebate ? "Applied" : "Not Applied"}`, 90, y + 125);

    y += 180;

    // Section 2: Summary Box
    ctx.fillStyle = "#18181B";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText("2. Calculation Summary", 60, y);
    y += 35;

    ctx.fillStyle = "#F0FDF4";
    ctx.fillRect(60, y, 1080, 170);
    ctx.strokeStyle = "#BBF7D0";
    ctx.strokeRect(60, y, 1080, 170);

    ctx.fillStyle = "#166534";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(`Annual Gross Income: Rs. ${taxCalculation.grossIncome.toLocaleString("en-IN")}`, 90, y + 45);
    ctx.fillText(`Total Allowed Deductions: Rs. ${taxCalculation.totalDeductions.toLocaleString("en-IN")}`, 600, y + 45);

    ctx.fillText(`Taxable Base Income: Rs. ${taxCalculation.taxableIncome.toLocaleString("en-IN")}`, 90, y + 95);
    ctx.fillText(`Effective Tax Rate: ${taxCalculation.effectiveRate}%`, 600, y + 95);

    ctx.fillStyle = "#DC2626";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText(`Total Annual Tax: Rs. ${taxCalculation.totalTax.toLocaleString("en-IN")}  (Monthly: Rs. ${taxCalculation.monthlyTax.toLocaleString("en-IN")})`, 90, y + 145);

    y += 210;

    // Section 3: Slabs Table
    ctx.fillStyle = "#18181B";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText("3. Tax Slab Breakdown", 60, y);
    y += 35;

    ctx.fillStyle = "#1F2544";
    ctx.fillRect(60, y, 1080, 45);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("Tax Slab Range", 80, y + 28);
    ctx.fillText("Taxable Amount", 650, y + 28);
    ctx.fillText("Tax Payable", 930, y + 28);
    y += 45;

    taxCalculation.slabs.forEach((slab, idx) => {
      ctx.fillStyle = idx % 2 === 0 ? "#FFFFFF" : "#FAFAF8";
      ctx.fillRect(60, y, 1080, 45);
      ctx.strokeStyle = "#E4E0D8";
      ctx.strokeRect(60, y, 1080, 45);

      ctx.fillStyle = "#18181B";
      ctx.font = "16px sans-serif";
      ctx.fillText(slab.label, 80, y + 28);
      ctx.fillText(`Rs. ${slab.taxable.toLocaleString("en-IN")}`, 650, y + 28);

      ctx.fillStyle = "#DC2626";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText(`Rs. ${slab.tax.toLocaleString("en-IN")}`, 930, y + 28);

      y += 45;
    });

    y += 35;

    // Take-Home Pay Box
    ctx.fillStyle = "#1F2544";
    ctx.fillRect(60, y, 1080, 95);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("Annual Net Take-Home Pay:", 90, y + 40);
    ctx.fillText(`Rs. ${taxCalculation.annualNet.toLocaleString("en-IN")}`, 430, y + 40);

    ctx.fillStyle = "#22C55E";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("Monthly Net Take-Home Pay:", 90, y + 75);
    ctx.fillText(`Rs. ${taxCalculation.monthlyNet.toLocaleString("en-IN")}`, 430, y + 75);

    ctx.fillStyle = "#A1A1AA";
    ctx.font = "14px sans-serif";
    ctx.fillText(`Generated via SajiloTools Nepal Tax Calculator — ${SITE_URL}/tools/finance/tax-calculator`, 60, 1540);

    const pngDataUrl = canvas.toDataURL("image/png");
    const base64Data = pngDataUrl.replace(/^data:image\/png;base64,/, "");
    const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);
    const pngImage = await pdfDoc.embedPng(imageBytes);

    const { width, height } = page.getSize();
    page.drawImage(pngImage, { x: 0, y: 0, width, height });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Nepal-Income-Tax-Report-${fiscalYear.replace("/", "-")}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [fiscalYear, monthlyIncome, bonusMonths, hasSsf, status, isFemaleRebate, taxCalculation]);

  return (
    <div className="space-y-6">
      {/* Restored State Banner */}
      {wasRestored && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span>💾 Restored your previous tax calculation inputs</span>
          </div>
          <button
            onClick={clearSaved}
            className="text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 font-bold"
          >
            <RotateCcw size={12} /> Clear saved
          </button>
        </div>
      )}

      {/* Top Header & Year Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338]">
        <div>
          <h3 className="text-base font-bold text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2">
            <Calculator size={18} className="text-[#22C55E]" />
            Nepal Income Tax Calculator
          </h3>
          <p className="text-xs text-[#71717A] mt-0.5">
            Updated with latest IRD budget tax slabs and Social Security Fund (SSF) rules
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider whitespace-nowrap">
            Fiscal Year:
          </label>
          <select
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value as FiscalYear)}
            className="px-3 py-1.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#22C55E]/40"
          >
            <option value="2083/84">FY 2083/84 (Current - Budget 2083)</option>
            <option value="2082/83">FY 2082/83 (Archived / Historical)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
              1. Salary & Income Details
            </h4>

            {/* Marital status toggle */}
            {fiscalYear === "2082/83" ? (
              <div>
                <label className="block text-xs font-bold text-[#71717A] mb-1.5">Marital Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setStatus("single")}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                      status === "single"
                        ? "bg-[#1F2544] text-white border-[#1F2544] dark:bg-[#22C55E] dark:text-[#0C0F1E]"
                        : "border-[#E4E0D8] dark:border-[#1E2338] text-[#71717A]"
                    }`}
                  >
                    Single (अविवाहित)
                  </button>
                  <button
                    onClick={() => setStatus("married")}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                      status === "married"
                        ? "bg-[#1F2544] text-white border-[#1F2544] dark:bg-[#22C55E] dark:text-[#0C0F1E]"
                        : "border-[#E4E0D8] dark:border-[#1E2338] text-[#71717A]"
                    }`}
                  >
                    Married (दम्पती)
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#F0FDF4] dark:bg-[#052E16]/40 border border-[#BBF7D0] dark:border-[#166534] text-xs text-[#166534] dark:text-[#86EFAC] flex items-start gap-2">
                <Info size={16} className="mt-0.5 shrink-0" />
                <span>
                  <strong>FY 2083/84 Unified Slabs:</strong> Married/unmarried distinction removed for FY 2083/84 — unified slabs apply to all individuals up to Rs. 10 Lakhs at 1%.
                </span>
              </div>
            )}

            {/* Monthly Salary */}
            <div>
              <label className="block text-xs font-bold text-[#71717A] mb-1">
                Monthly Salary (मासिक तलब)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#A1A1AA] text-sm">
                  Rs.
                </span>
                <input
                  type="number"
                  min={0}
                  value={monthlyIncome || ""}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-base focus:outline-none focus:ring-2 focus:ring-[#22C55E]/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Bonus Months */}
              <div>
                <label className="block text-xs font-bold text-[#71717A] mb-1">
                  Bonus / Festival Allowance
                </label>
                <select
                  value={bonusMonths}
                  onChange={(e) => setBonusMonths(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-semibold text-xs"
                >
                  <option value={0}>0 Month (No bonus)</option>
                  <option value={1}>1 Month (Dashain / Festival)</option>
                  <option value={2}>2 Months (Festival + Performance)</option>
                  <option value={3}>3 Months Bonus</option>
                </select>
              </div>

              {/* Other Income */}
              <div>
                <label className="block text-xs font-bold text-[#71717A] mb-1">
                  Other Annual Allowances / Income
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#A1A1AA] text-xs">
                    Rs.
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={otherIncome || ""}
                    onChange={(e) => setOtherIncome(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-semibold text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Deductions & Exemptions Section */}
          <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-4">
            <button
              onClick={() => setShowDeductions(!showDeductions)}
              className="w-full flex items-center justify-between text-xs font-bold text-[#71717A] uppercase tracking-wider"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#22C55E]" />
                2. Deductions, Exemptions & SSF
              </span>
              {showDeductions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showDeductions && (
              <div className="space-y-4 pt-2 border-t border-[#E4E0D8] dark:border-[#1E2338]">
                {/* SSF Waiver Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
                  <div>
                    <label className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] block">
                      Social Security Fund (SSF) Contributor?
                    </label>
                    <span className="text-[11px] text-[#71717A]">
                      Contributing to SSF waives the 1% Social Security Tax on the first slab.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasSsf}
                    onChange={(e) => setHasSsf(e.target.checked)}
                    className="w-4 h-4 accent-[#22C55E] cursor-pointer"
                  />
                </div>

                {/* Retirement Fund */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-[#71717A]">
                      Annual Voluntary EPF / CIT / SSF Contribution
                    </label>
                    <span className="text-[10px] text-[#A1A1AA]">Max: Lower of Rs. 5L or 1/3 Income</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#A1A1AA] text-xs">
                      Rs.
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={retirementContrib || ""}
                      onChange={(e) => setRetirementContrib(Number(e.target.value))}
                      placeholder="e.g. 100000"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-semibold text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Life Insurance */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-[#71717A]">Life Insurance Premium</label>
                      <span className="text-[10px] text-[#A1A1AA]">Max Rs. 40,000</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#A1A1AA] text-xs">
                        Rs.
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={40000}
                        value={lifeInsurance || ""}
                        onChange={(e) => setLifeInsurance(Number(e.target.value))}
                        placeholder="e.g. 40000"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-semibold text-xs"
                      />
                    </div>
                  </div>

                  {/* Health Insurance */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-[#71717A]">Health Insurance Premium</label>
                      <span className="text-[10px] text-[#A1A1AA]">Max Rs. 20,000</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#A1A1AA] text-xs">
                        Rs.
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={20000}
                        value={healthInsurance || ""}
                        onChange={(e) => setHealthInsurance(Number(e.target.value))}
                        placeholder="e.g. 20000"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-semibold text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Female Tax Rebate */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
                  <div>
                    <label className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] block">
                      Female Tax Rebate (10%)
                    </label>
                    <span className="text-[11px] text-[#71717A]">
                      Individual female filers receive a 10% rebate on total calculated income tax.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isFemaleRebate}
                    onChange={(e) => setIsFemaleTaxpayer(e.target.checked)}
                    className="w-4 h-4 accent-[#22C55E] cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cross-Link to PF Calculator */}
          <CalculatorCrossLink
            icon={Landmark}
            title="Provident Fund (EPF / CIT / SSF) Calculator"
            desc="Project your retirement savings corpus and calculate annual tax-exempt contributions."
            href="/tools/finance/pf-calculator"
          />
        </div>

        {/* Results Column (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-4 sm:p-6 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl space-y-6">
            {/* View Mode Toggle & Action Buttons Header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
                Tax Calculation Summary
              </span>
              <div className="flex p-1 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-xl">
                <button
                  onClick={() => setViewMode("monthly")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    viewMode === "monthly"
                      ? "bg-[#22C55E] text-white"
                      : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setViewMode("annual")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    viewMode === "annual"
                      ? "bg-[#22C55E] text-white"
                      : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                  }`}
                >
                  Annual
                </button>
              </div>
            </div>

            {/* Main Tax Display */}
            <div>
              <div className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
                Estimated {viewMode === "monthly" ? "Monthly" : "Annual"} Tax
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                Rs. {(viewMode === "monthly" ? taxCalculation.monthlyTax : taxCalculation.totalTax).toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-[#71717A] mt-1 flex items-center gap-2">
                <span>Effective Tax Rate: <strong>{taxCalculation.effectiveRate}%</strong></span>
              </div>
            </div>

            {/* Action Buttons: Copy Breakdown, Download PDF, Share Scenario */}
            {taxCalculation.grossIncome > 0 && (
              <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2 pt-2 border-t border-[#E4E0D8] dark:border-[#2A2F48]">
                <button
                  onClick={copyBreakdown}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all w-full sm:w-auto ${
                    copied
                      ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                      : "bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] border border-[#E4E0D8] dark:border-[#2A2F48] hover:bg-[#F0EDE8] dark:hover:bg-[#252A42]"
                  }`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied Breakdown" : "Copy Breakdown"}
                </button>

                <button
                  onClick={downloadPdfReport}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-[#1F2544] dark:bg-[#22C55E] text-white dark:text-[#0C0F1E] hover:opacity-90 transition-all shadow-sm w-full sm:w-auto"
                >
                  <Download size={14} /> Download PDF
                </button>

                <button
                  onClick={copyShareLink}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all w-full sm:w-auto ${
                    shareCopied
                      ? "bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                      : "bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] border border-[#E4E0D8] dark:border-[#2A2F48] hover:bg-[#F0EDE8] dark:hover:bg-[#252A42]"
                  }`}
                >
                  <Share2 size={14} /> {shareCopied ? "Link Copied!" : "Share Link"}
                </button>
              </div>
            )}

            {/* Take-Home Breakdown */}
            <div className="space-y-2.5 pt-4 border-t border-[#E4E0D8] dark:border-[#2A2F48] text-sm">
              <div className="flex justify-between">
                <span className="text-[#71717A]">Gross Income:</span>
                <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                  Rs. {(viewMode === "monthly" ? Math.round(taxCalculation.grossIncome / 12) : taxCalculation.grossIncome).toLocaleString("en-IN")}
                </span>
              </div>

              {taxCalculation.totalDeductions > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Allowed Deductions:</span>
                  <span className="font-semibold">
                    - Rs. {(viewMode === "monthly" ? Math.round(taxCalculation.totalDeductions / 12) : taxCalculation.totalDeductions).toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-[#71717A]">Taxable Base:</span>
                <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                  Rs. {(viewMode === "monthly" ? Math.round(taxCalculation.taxableIncome / 12) : taxCalculation.taxableIncome).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between font-bold pt-2 border-t border-[#E4E0D8] dark:border-[#2A2F48]">
                <span className="text-[#18181B] dark:text-[#F4F4F5]">Net Take-Home Pay:</span>
                <span className="text-[#22C55E]">
                  Rs. {(viewMode === "monthly" ? taxCalculation.monthlyNet : taxCalculation.annualNet).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Tax Slab Breakdown Table */}
          <div className="p-5 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={14} /> Tax Slab Breakdown ({fiscalYear})
            </h4>

            <div className="space-y-2">
              {taxCalculation.slabs.map((slab, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] text-xs"
                >
                  <div>
                    <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5] block">
                      {slab.label}
                    </span>
                    <span className="text-[10px] text-[#A1A1AA]">
                      Taxable: Rs. {slab.taxable.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    Rs. {slab.tax.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Date & Disclaimer */}
          <div className="p-4 rounded-xl bg-[#F0FDF4] dark:bg-[#052E16]/30 border border-[#BBF7D0] dark:border-[#166534] text-xs text-[#166534] dark:text-[#86EFAC] flex items-start gap-2">
            <Check size={16} className="mt-0.5 shrink-0 text-[#22C55E]" />
            <span>
              <strong>Rates last verified:</strong> {TAX_RATES_LAST_VERIFIED} — {TAX_VERIFICATION_NOTE}.
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFBEB] dark:bg-[#451A03]/30 border border-[#FDE68A] dark:border-[#78350F] text-xs text-[#B45309] dark:text-[#FCD34D] flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>
              <strong>Disclaimer:</strong> This calculator provides estimations based on current Inland Revenue Department (IRD) Nepal tax policy guidelines. Always verify tax calculations with your employer payroll or a certified tax professional before filing.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
