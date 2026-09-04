"use client";

import { useState, useMemo } from "react";
import { Car, Calculator, Info, ShieldCheck, AlertTriangle, CheckCircle2, RefreshCw, RotateCcw } from "lucide-react";

type VehicleCategory = "two_wheeler" | "four_wheeler" | "ev" | "commercial";

interface ProvinceDef {
  key: string;
  nameEn: string;
  nameNp: string;
  adjustmentMultiplier: number; // Slight variation per province rate sheets
}

const PROVINCES: ProvinceDef[] = [
  { key: "bagmati", nameEn: "Bagmati Province (वाग्मती)", nameNp: "वाग्मती प्रदेश", adjustmentMultiplier: 1.0 },
  { key: "koshi", nameEn: "Koshi Province (कोशी)", nameNp: "कोशी प्रदेश", adjustmentMultiplier: 0.98 },
  { key: "madhesh", nameEn: "Madhesh Province (मधेश)", nameNp: "मधेश प्रदेश", adjustmentMultiplier: 0.95 },
  { key: "gandaki", nameEn: "Gandaki Province (गण्डकी)", nameNp: "गण्डकी प्रदेश", adjustmentMultiplier: 1.0 },
  { key: "lumbini", nameEn: "Lumbini Province (लुम्बिनी)", nameNp: "लुम्बिनी प्रदेश", adjustmentMultiplier: 0.98 },
  { key: "karnali", nameEn: "Karnali Province (कर्णाली)", nameNp: "कर्णाली प्रदेश", adjustmentMultiplier: 0.92 },
  { key: "sudurpashchim", nameEn: "Sudurpashchim Province (सुदूरपश्चिम)", nameNp: "सुदूरपश्चिम प्रदेश", adjustmentMultiplier: 0.92 },
];

import { useEffect } from "react";
import { usePersistedFormState } from "@/hooks/usePersistedFormState";

export default function VehicleTaxCalculatorTool() {
  const [formState, setFormState, { wasRestored, clearSaved }] = usePersistedFormState(
    "vehicle-tax-calculator",
    {
      category: "two_wheeler" as VehicleCategory,
      provinceKey: "bagmati",
      ccSlab: "126_150",
      carCcSlab: "1001_1500",
      evKwSlab: "51_100",
      commercialSlab: "minibus",
      isOverdue: false,
      overdueDelay: "up_to_30_days",
    }
  );

  // Read URL query parameters on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const pCat = params.get("category");
    const pProv = params.get("province");
    const pCc = params.get("cc");

    const updates: Partial<typeof formState> = {};
    if (pCat && ["two_wheeler", "four_wheeler", "ev", "commercial"].includes(pCat)) {
      updates.category = pCat as VehicleCategory;
    }
    if (pProv) updates.provinceKey = pProv;
    if (pCc) {
      updates.ccSlab = pCc;
      updates.carCcSlab = pCc;
    }

    if (Object.keys(updates).length > 0) {
      setFormState((prev) => ({ ...prev, ...updates }));
    }
  }, [setFormState]);

  const category = formState.category;
  const provinceKey = formState.provinceKey;
  const ccSlab = formState.ccSlab;
  const carCcSlab = formState.carCcSlab;
  const evKwSlab = formState.evKwSlab;
  const commercialSlab = formState.commercialSlab;
  const isOverdue = formState.isOverdue;
  const overdueDelay = formState.overdueDelay;

  const setCategory = (val: VehicleCategory) => setFormState((prev) => ({ ...prev, category: val }));
  const setProvinceKey = (val: string) => setFormState((prev) => ({ ...prev, provinceKey: val }));
  const setCcSlab = (val: string) => setFormState((prev) => ({ ...prev, ccSlab: val }));
  const setCarCcSlab = (val: string) => setFormState((prev) => ({ ...prev, carCcSlab: val }));
  const setEvKwSlab = (val: string) => setFormState((prev) => ({ ...prev, evKwSlab: val }));
  const setCommercialSlab = (val: string) => setFormState((prev) => ({ ...prev, commercialSlab: val }));
  const setIsOverdue = (val: boolean) => setFormState((prev) => ({ ...prev, isOverdue: val }));
  const setOverdueDelay = (val: string) => setFormState((prev) => ({ ...prev, overdueDelay: val }));

  // ── Calculation ─────────────────────────────────────────────────────────────
  const taxCalculation = useMemo(() => {
    let baseTax = 0;
    const selectedProvince = PROVINCES.find((p) => p.key === provinceKey) || PROVINCES[0];

    if (category === "two_wheeler") {
      switch (ccSlab) {
        case "up_to_125":
          baseTax = 3000;
          break;
        case "126_150":
          baseTax = 5000;
          break;
        case "151_225":
          baseTax = 6500;
          break;
        case "226_400":
          baseTax = 11000;
          break;
        case "401_above":
          baseTax = 20000;
          break;
        default:
          baseTax = 5000;
      }
    } else if (category === "four_wheeler") {
      switch (carCcSlab) {
        case "up_to_1000":
          baseTax = 21000;
          break;
        case "1001_1500":
          baseTax = 23500;
          break;
        case "1501_2000":
          baseTax = 27500;
          break;
        case "2001_2500":
          baseTax = 36500;
          break;
        case "2501_3000":
          baseTax = 44000;
          break;
        case "3001_above":
          baseTax = 60000;
          break;
        default:
          baseTax = 23500;
      }
    } else if (category === "ev") {
      switch (evKwSlab) {
        case "up_to_50":
          baseTax = 10000;
          break;
        case "51_100":
          baseTax = 15000;
          break;
        case "101_150":
          baseTax = 20000;
          break;
        case "151_200":
          baseTax = 30000;
          break;
        case "201_above":
          baseTax = 45000;
          break;
        default:
          baseTax = 15000;
      }
    } else if (category === "commercial") {
      switch (commercialSlab) {
        case "micro":
          baseTax = 12000;
          break;
        case "minibus":
          baseTax = 16000;
          break;
        case "bus":
          baseTax = 20000;
          break;
        case "truck":
          baseTax = 24000;
          break;
        default:
          baseTax = 16000;
      }
    }

    // Apply provincial rate factor
    const adjustedTax = Math.round(baseTax * selectedProvince.adjustmentMultiplier);
    const renewalFee = 500; // Flat renewal / administration fee
    let penaltyAmount = 0;

    if (isOverdue) {
      if (overdueDelay === "up_to_30_days") penaltyAmount = Math.round(adjustedTax * 0.05);
      else if (overdueDelay === "up_to_45_days") penaltyAmount = Math.round(adjustedTax * 0.1);
      else if (overdueDelay === "after_45_days") penaltyAmount = Math.round(adjustedTax * 0.2);
    }

    const totalPayable = adjustedTax + renewalFee + penaltyAmount;

    return {
      baseTax: adjustedTax,
      renewalFee,
      penaltyAmount,
      totalPayable,
      provinceName: selectedProvince.nameEn,
    };
  }, [category, provinceKey, ccSlab, carCcSlab, evKwSlab, commercialSlab, isOverdue, overdueDelay]);

  const [showProvinceTable, setShowProvinceTable] = useState(false);

  // 7-Province Comparison for currently selected CC / power slab
  const provinceComparison = useMemo(() => {
    let baseTaxRaw = 0;
    if (category === "two_wheeler") {
      switch (ccSlab) {
        case "up_to_125": baseTaxRaw = 3000; break;
        case "126_150": baseTaxRaw = 5000; break;
        case "151_225": baseTaxRaw = 6500; break;
        case "226_400": baseTaxRaw = 11000; break;
        case "401_above": baseTaxRaw = 20000; break;
        default: baseTaxRaw = 5000;
      }
    } else if (category === "four_wheeler") {
      switch (carCcSlab) {
        case "up_to_1000": baseTaxRaw = 21000; break;
        case "1001_1500": baseTaxRaw = 23500; break;
        case "1501_2000": baseTaxRaw = 27500; break;
        case "2001_2500": baseTaxRaw = 36500; break;
        case "2501_3000": baseTaxRaw = 44000; break;
        case "3001_above": baseTaxRaw = 60000; break;
        default: baseTaxRaw = 23500;
      }
    } else if (category === "ev") {
      switch (evKwSlab) {
        case "up_to_50": baseTaxRaw = 10000; break;
        case "51_100": baseTaxRaw = 15000; break;
        case "101_150": baseTaxRaw = 20000; break;
        case "151_200": baseTaxRaw = 30000; break;
        case "201_above": baseTaxRaw = 45000; break;
        default: baseTaxRaw = 15000;
      }
    } else {
      switch (commercialSlab) {
        case "micro": baseTaxRaw = 12000; break;
        case "minibus": baseTaxRaw = 16000; break;
        case "bus": baseTaxRaw = 20000; break;
        case "truck": baseTaxRaw = 24000; break;
        default: baseTaxRaw = 16000;
      }
    }

    return PROVINCES.map((prov) => {
      const tax = Math.round(baseTaxRaw * prov.adjustmentMultiplier);
      const total = tax + 500;
      return {
        key: prov.key,
        nameEn: prov.nameEn,
        nameNp: prov.nameNp,
        tax,
        total,
        isSelected: prov.key === provinceKey,
      };
    });
  }, [category, ccSlab, carCcSlab, evKwSlab, commercialSlab, provinceKey]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Restored State Banner */}
      {wasRestored && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span>💾 Restored your previous vehicle tax inputs</span>
          </div>
          <button
            onClick={clearSaved}
            className="text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 font-bold"
          >
            <RotateCcw size={12} /> Clear saved
          </button>
        </div>
      )}

      {/* Privacy & Legal Banner */}
      <div className="p-4 rounded-2xl bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2.5 text-sm font-medium">
        <ShieldCheck className="text-[#DC2626] shrink-0" size={18} />
        <span>
          🇳🇵 <strong>Blue Book Vehicle Tax Estimator (FY 2081/82 - 2082/83):</strong> Estimate annual road tax across all 7 provinces in Nepal.
        </span>
      </div>

      {/* Main Calculator Form */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-[#E4E0D8] dark:border-[#2A2F48] pb-4">
          <div className="w-10 h-10 rounded-xl bg-[#DC2626]/10 text-[#DC2626] flex items-center justify-center shrink-0">
            <Car size={22} />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-[#18181B] dark:text-[#F4F4F5]">
              Vehicle Blue Book Tax Estimator
            </h3>
            <p className="text-xs text-[#71717A] font-medium">
              Select vehicle category, province, and engine CC / capacity slab
            </p>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Vehicle Category Segmented Pill Controls */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="block text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider">
              Vehicle Category (सवारी साधन प्रकार)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
              {[
                { id: "two_wheeler" as VehicleCategory, label: "Two-Wheeler", sub: "Bike / Scooter", icon: "🛵" },
                { id: "four_wheeler" as VehicleCategory, label: "Four-Wheeler", sub: "Car / Jeep / Van", icon: "🚗" },
                { id: "ev" as VehicleCategory, label: "Electric (EV)", sub: "EV Car / Bike", icon: "⚡" },
                { id: "commercial" as VehicleCategory, label: "Commercial", sub: "Bus / Truck", icon: "🚌" },
              ].map((cat) => {
                const active = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      active
                        ? "bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] shadow-xs border border-[#DC2626] font-bold"
                        : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-extrabold">
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </div>
                    <span className="text-[10px] opacity-70 block mt-0.5">{cat.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Province Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider">
              Province (प्रदेश)
            </label>
            <select
              value={provinceKey}
              onChange={(e) => setProvinceKey(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#DC2626]/40"
            >
              {PROVINCES.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Capacity Slabs based on Category */}
          {category === "two_wheeler" && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider">
                Engine Capacity (CC)
              </label>
              <select
                value={ccSlab}
                onChange={(e) => setCcSlab(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#DC2626]/40"
              >
                <option value="up_to_125">Up to 125 CC</option>
                <option value="126_150">126 CC to 150 CC</option>
                <option value="151_225">151 CC to 225 CC</option>
                <option value="226_400">226 CC to 400 CC</option>
                <option value="401_above">401 CC &amp; Above</option>
              </select>
            </div>
          )}

          {category === "four_wheeler" && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider">
                Engine Displacement (CC)
              </label>
              <select
                value={carCcSlab}
                onChange={(e) => setCarCcSlab(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#DC2626]/40"
              >
                <option value="up_to_1000">Up to 1,000 CC</option>
                <option value="1001_1500">1,001 CC to 1,500 CC</option>
                <option value="1501_2000">1,501 CC to 2,000 CC</option>
                <option value="2001_2500">2,001 CC to 2,500 CC</option>
                <option value="2501_3000">2,501 CC to 3,000 CC</option>
                <option value="3001_above">3,001 CC &amp; Above</option>
              </select>
            </div>
          )}

          {category === "ev" && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider">
                Motor Power (kW)
              </label>
              <select
                value={evKwSlab}
                onChange={(e) => setEvKwSlab(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#DC2626]/40"
              >
                <option value="up_to_50">Up to 50 kW</option>
                <option value="51_100">51 kW to 100 kW</option>
                <option value="101_150">101 kW to 150 kW</option>
                <option value="151_200">151 kW to 200 kW</option>
                <option value="201_above">201 kW &amp; Above</option>
              </select>
            </div>
          )}

          {category === "commercial" && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider">
                Commercial Type
              </label>
              <select
                value={commercialSlab}
                onChange={(e) => setCommercialSlab(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#DC2626]/40"
              >
                <option value="micro">Microbus / Van</option>
                <option value="minibus">Minibus / Mini Truck</option>
                <option value="bus">Large Bus</option>
                <option value="truck">Heavy Truck / Tipper</option>
              </select>
            </div>
          )}

          {/* Overdue / Late Penalty Checkbox */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider">
              Renewal Deadline Status
            </label>
            <div className="flex items-center gap-3 pt-1">
              <label className="flex items-center gap-2 text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isOverdue}
                  onChange={(e) => setIsOverdue(e.target.checked)}
                  className="w-4 h-4 accent-[#DC2626] rounded"
                />
                Overdue / Past Renewal Date
              </label>
            </div>

            {isOverdue && (
              <select
                value={overdueDelay}
                onChange={(e) => setOverdueDelay(e.target.value)}
                className="w-full mt-2 px-3.5 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/5 text-[#18181B] dark:text-[#F4F4F5] text-xs font-bold focus:outline-none"
              >
                <option value="up_to_30_days">1 to 30 Days Overdue (+5% Fine)</option>
                <option value="up_to_45_days">31 to 45 Days Overdue (+10% Fine)</option>
                <option value="after_45_days">45+ Days Overdue (+20% Fine)</option>
              </select>
            )}
          </div>
        </div>

        {/* Calculation Result Breakdown */}
        <div className="p-5 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] space-y-4">
          <div className="flex items-center justify-between border-b border-[#E4E0D8] dark:border-[#2A2F48] pb-3">
            <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
              Estimated Total Payable Amount
            </span>
            <span className="text-2xl font-extrabold text-[#DC2626]">
              रू {taxCalculation.totalPayable.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="space-y-2 text-xs text-[#71717A]">
            <div className="flex justify-between">
              <span>Annual Road Tax ({taxCalculation.provinceName}):</span>
              <span className="font-bold text-[#18181B] dark:text-[#F4F4F5]">
                रू {taxCalculation.baseTax.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Admin &amp; Blue Book Renewal Stamp Fee:</span>
              <span className="font-bold text-[#18181B] dark:text-[#F4F4F5]">
                रू {taxCalculation.renewalFee.toLocaleString("en-IN")}
              </span>
            </div>
            {taxCalculation.penaltyAmount > 0 && (
              <div className="flex justify-between text-rose-500 font-bold">
                <span>Late Renewal Fine / Penalty:</span>
                <span>+ रू {taxCalculation.penaltyAmount.toLocaleString("en-IN")}</span>
              </div>
            )}
          </div>
        </div>

        {/* 7-Province Rate Comparison Collapsible Table */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] space-y-3 shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2">
                <Calculator size={16} className="text-[#DC2626]" />
                <span>All 7 Provinces Rate Comparison (सबै प्रदेशको कर तुलना)</span>
              </h4>
              <p className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
                Compare annual road tax for your selected vehicle bracket across Nepal. Tap any row to switch.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowProvinceTable(!showProvinceTable)}
              className="px-3 py-1.5 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-white dark:bg-[#141829] text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] hover:border-[#DC2626] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {showProvinceTable ? "Hide Comparison" : "Compare All 7 Provinces"}
            </button>
          </div>

          {showProvinceTable && (
            <div className="overflow-x-auto pt-2 border-t border-[#E4E0D8] dark:border-[#2A2F48]">
              <table className="w-full text-xs text-left min-w-[320px]">
                <thead>
                  <tr className="border-b border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A] uppercase text-[10px]">
                    <th className="pb-2 font-bold">Province (प्रदेश)</th>
                    <th className="pb-2 font-bold text-right">Annual Tax</th>
                    <th className="pb-2 font-bold text-right">Fee</th>
                    <th className="pb-2 font-bold text-right">Base Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E0D8]/60 dark:divide-[#2A2F48]/60 font-medium">
                  {provinceComparison.map((p) => (
                    <tr
                      key={p.key}
                      onClick={() => setProvinceKey(p.key)}
                      className={`cursor-pointer transition-colors ${
                        p.isSelected
                          ? "bg-[#DC2626]/10 font-bold text-[#DC2626]"
                          : "hover:bg-zinc-100 dark:hover:bg-white/5 text-[#18181B] dark:text-[#F4F4F5]"
                      }`}
                    >
                      <td className="py-2.5 flex items-center gap-1.5">
                        <span>{p.nameEn}</span>
                        {p.isSelected && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#DC2626] text-white font-bold">Selected</span>
                        )}
                      </td>
                      <td className="py-2.5 text-right font-mono">रू {p.tax.toLocaleString("en-IN")}</td>
                      <td className="py-2.5 text-right font-mono text-[#71717A]">रू 500</td>
                      <td className="py-2.5 text-right font-mono font-bold">रू {p.total.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Official Disclaimer Box */}
        <div className="p-4 rounded-xl bg-[#FFFBEB] dark:bg-[#451A03]/30 border border-[#FDE68A] dark:border-[#78350F] text-xs text-[#B45309] dark:text-[#FCD34D] space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <Info size={15} /> Official Disclaimer:
          </div>
          <p className="text-[11px] leading-relaxed">
            Rates are estimated based on published provincial finance acts for FY 2081/82 - 2082/83. Actual payable amount may vary slightly depending on third-party insurance requirements and specific Yatayat office administration fees. Always verify with your local Transport Management Office (यातायात व्यवस्था कार्यालय) before payment.
          </p>
        </div>
      </div>
    </div>
  );
}
