"use client";

import { useState, useMemo } from "react";
import { Ruler, DollarSign, Copy, Check, Info, RefreshCw } from "lucide-react";

// Standard Nepal Land Units Conversion Rates to Square Feet:
// Pahad System:
// 1 Ropani = 5476 sq ft
// 1 Aana = 342.25 sq ft
// 1 Paisa = 85.5625 sq ft
// 1 Daam = 21.390625 sq ft
//
// Terai System:
// 1 Bigha = 72900 sq ft (13.31 Ropani)
// 1 Kattha = 3645 sq ft (20 Kattha = 1 Bigha)
// 1 Dhur = 182.25 sq ft (20 Dhur = 1 Kattha)
//
// Metric / Imperial:
// 1 Sq. Meter = 10.7639104 sq ft
// 1 Hectare = 10,000 m² = 107639.104 sq ft
// 1 Acre = 43560 sq ft

const SQFT_PER_ROPANI = 5476;
const SQFT_PER_AANA = 342.25;
const SQFT_PER_PAISA = 85.5625;
const SQFT_PER_DAAM = 21.390625;

const SQFT_PER_BIGHA = 72900;
const SQFT_PER_KATTHA = 3645;
const SQFT_PER_DHUR = 182.25;

const SQFT_PER_SQM = 10.7639104;
const SQFT_PER_HECTARE = 107639.104;
const SQFT_PER_ACRE = 43560;

type RateUnit = "aana" | "ropani" | "kattha" | "bigha" | "sqft";

export default function LandConverterTool() {
  // Canonical unrounded state stored in single totalSqFt variable to prevent progressive rounding drift
  const [totalSqFt, setTotalSqFt] = useState<number>(5476); // Default 1 Ropani

  // Price Valuation Calculator State
  const [pricePerUnit, setPricePerUnit] = useState<number>(3500000); // Default 35 Lakhs
  const [priceUnit, setPriceUnit] = useState<RateUnit>("aana");

  const [copied, setCopied] = useState<boolean>(false);

  // Derived Pahad breakdown
  const pahad = useMemo(() => {
    let rem = Math.max(0, totalSqFt);
    const r = Math.floor(rem / SQFT_PER_ROPANI);
    rem %= SQFT_PER_ROPANI;
    const a = Math.floor(rem / SQFT_PER_AANA);
    rem %= SQFT_PER_AANA;
    const p = Math.floor(rem / SQFT_PER_PAISA);
    rem %= SQFT_PER_PAISA;
    const d = Math.round((rem / SQFT_PER_DAAM) * 100) / 100;
    return { r, a, p, d };
  }, [totalSqFt]);

  // Derived Terai breakdown
  const terai = useMemo(() => {
    let rem = Math.max(0, totalSqFt);
    const b = Math.floor(rem / SQFT_PER_BIGHA);
    rem %= SQFT_PER_BIGHA;
    const k = Math.floor(rem / SQFT_PER_KATTHA);
    rem %= SQFT_PER_KATTHA;
    const dh = Math.round((rem / SQFT_PER_DHUR) * 100) / 100;
    return { b, k, dh };
  }, [totalSqFt]);

  // Derived Standard Units
  const sqftVal = Math.round(totalSqFt * 100) / 100;
  const sqmVal = Math.round((totalSqFt / SQFT_PER_SQM) * 100) / 100;
  const hectareVal = Math.round((totalSqFt / SQFT_PER_HECTARE) * 10000) / 10000;
  const acreVal = Math.round((totalSqFt / SQFT_PER_ACRE) * 10000) / 10000;

  // Land Price Valuation Calculation
  const totalPrice = useMemo(() => {
    if (pricePerUnit <= 0 || totalSqFt <= 0) return 0;

    let sqftUnitFactor = SQFT_PER_AANA;
    if (priceUnit === "ropani") sqftUnitFactor = SQFT_PER_ROPANI;
    if (priceUnit === "kattha") sqftUnitFactor = SQFT_PER_KATTHA;
    if (priceUnit === "bigha") sqftUnitFactor = SQFT_PER_BIGHA;
    if (priceUnit === "sqft") sqftUnitFactor = 1;

    const unitsCount = totalSqFt / sqftUnitFactor;
    return Math.round(unitsCount * pricePerUnit);
  }, [totalSqFt, pricePerUnit, priceUnit]);

  // Handler for Pahad system inputs
  const handlePahadInput = (r: number, a: number, p: number, d: number) => {
    const computedSqFt =
      (Math.max(0, r) * SQFT_PER_ROPANI) +
      (Math.max(0, a) * SQFT_PER_AANA) +
      (Math.max(0, p) * SQFT_PER_PAISA) +
      (Math.max(0, d) * SQFT_PER_DAAM);
    setTotalSqFt(computedSqFt);
  };

  // Handler for Terai system inputs
  const handleTeraiInput = (b: number, k: number, dh: number) => {
    const computedSqFt =
      (Math.max(0, b) * SQFT_PER_BIGHA) +
      (Math.max(0, k) * SQFT_PER_KATTHA) +
      (Math.max(0, dh) * SQFT_PER_DHUR);
    setTotalSqFt(computedSqFt);
  };

  const copySummary = () => {
    const text = `Nepal Land Conversion Summary:\n- Pahad System: ${pahad.r} Ropani, ${pahad.a} Aana, ${pahad.p} Paisa, ${pahad.d} Daam\n- Terai System: ${terai.b} Bigha, ${terai.k} Kattha, ${terai.dh} Dhur\n- Square Feet: ${sqftVal} sq ft\n- Square Meters: ${sqmVal} m²\n- Hectares: ${hectareVal} ha\n- Acres: ${acreVal} acre\nTotal Estimated Price: Rs. ${totalPrice.toLocaleString("en-IN")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Copy Action */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338]">
        <div>
          <h3 className="text-base font-bold text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2">
            <Ruler size={18} className="text-[#DC2626]" />
            Nepal Land Area Unit Converter
          </h3>
          <p className="text-xs text-[#71717A] mt-0.5">
            Convert seamlessly between Ropani-Aana-Paisa-Daam, Bigha-Kattha-Dhur, Sq Ft, Sq M, Hectare & Acre.
          </p>
        </div>

        <button
          onClick={copySummary}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] hover:border-[#DC2626] transition-colors"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          {copied ? "Copied All!" : "Copy Results"}
        </button>
      </div>

      {/* Pahad System Card */}
      <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-[#DC2626] font-bold text-xs uppercase tracking-wider">
          <Ruler size={16} /> Pahad / Hilly System (रोपनी - आना - पैसा - दाम)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#71717A] mb-1">Ropani (रोपनी)</label>
            <input
              type="number"
              min={0}
              value={pahad.r}
              onChange={(e) => handlePahadInput(Number(e.target.value), pahad.a, pahad.p, pahad.d)}
              className="w-full px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#71717A] mb-1">Aana (आना)</label>
            <input
              type="number"
              min={0}
              value={pahad.a}
              onChange={(e) => handlePahadInput(pahad.r, Number(e.target.value), pahad.p, pahad.d)}
              className="w-full px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#71717A] mb-1">Paisa (पैसा)</label>
            <input
              type="number"
              min={0}
              value={pahad.p}
              onChange={(e) => handlePahadInput(pahad.r, pahad.a, Number(e.target.value), pahad.d)}
              className="w-full px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#71717A] mb-1">Daam (दाम)</label>
            <input
              type="number"
              min={0}
              value={pahad.d}
              onChange={(e) => handlePahadInput(pahad.r, pahad.a, pahad.p, Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
            />
          </div>
        </div>
      </div>

      {/* Terai System Card */}
      <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-[#DC2626] font-bold text-xs uppercase tracking-wider">
          <Ruler size={16} /> Terai System (बिघा - कठ्ठा - धुर)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#71717A] mb-1">Bigha (बिघा)</label>
            <input
              type="number"
              min={0}
              value={terai.b}
              onChange={(e) => handleTeraiInput(Number(e.target.value), terai.k, terai.dh)}
              className="w-full px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#71717A] mb-1">Kattha (कठ्ठा)</label>
            <input
              type="number"
              min={0}
              value={terai.k}
              onChange={(e) => handleTeraiInput(terai.b, Number(e.target.value), terai.dh)}
              className="w-full px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#71717A] mb-1">Dhur (धुर)</label>
            <input
              type="number"
              min={0}
              value={terai.dh}
              onChange={(e) => handleTeraiInput(terai.b, terai.k, Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
            />
          </div>
        </div>
      </div>

      {/* Metric & Imperial Standard Units Card */}
      <div className="p-6 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl space-y-4">
        <div className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
          Standard Units (वर्ग फिट / मिटर / हेक्टर / एकड)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#71717A] mb-1">Square Feet (Sq. Ft.)</label>
            <input
              type="number"
              min={0}
              value={sqftVal}
              onChange={(e) => setTotalSqFt(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#71717A] mb-1">Square Meters (m²)</label>
            <input
              type="number"
              min={0}
              value={sqmVal}
              onChange={(e) => setTotalSqFt(Number(e.target.value) * SQFT_PER_SQM)}
              className="w-full px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#71717A] mb-1">Hectare (हेक्टर)</label>
            <input
              type="number"
              min={0}
              value={hectareVal}
              onChange={(e) => setTotalSqFt(Number(e.target.value) * SQFT_PER_HECTARE)}
              className="w-full px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#71717A] mb-1">Acre (एकड)</label>
            <input
              type="number"
              min={0}
              value={acreVal}
              onChange={(e) => setTotalSqFt(Number(e.target.value) * SQFT_PER_ACRE)}
              className="w-full px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
            />
          </div>
        </div>
      </div>

      {/* Land Price & Valuation Calculator Extension */}
      <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-4">
        <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
          <DollarSign size={16} className="text-[#DC2626]" /> Land Valuation / Price Calculator (जग्गाको मूल्य हिसाब)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-[#71717A] mb-1">
              Rate / Price Per Unit (Rs.)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#A1A1AA] text-xs">
                Rs.
              </span>
              <input
                type="number"
                min={0}
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(Number(e.target.value))}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#71717A] mb-1">
              Rate Unit
            </label>
            <select
              value={priceUnit}
              onChange={(e) => setPriceUnit(e.target.value as RateUnit)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-xs"
            >
              <option value="aana">Per Aana (प्रति आना)</option>
              <option value="ropani">Per Ropani (प्रति रोपनी)</option>
              <option value="kattha">Per Kattha (प्रति कठ्ठा)</option>
              <option value="bigha">Per Bigha (प्रति बिघा)</option>
              <option value="sqft">Per Square Feet (प्रति वर्ग फिट)</option>
            </select>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] flex items-center justify-between">
          <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
            Total Land Value:
          </span>
          <span className="text-2xl font-extrabold text-[#DC2626]">
            Rs. {totalPrice.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Regional Disclaimer */}
      <div className="p-3.5 rounded-xl bg-[#FFFBEB] dark:bg-[#451A03]/30 border border-[#FDE68A] dark:border-[#78350F] text-xs text-[#B45309] dark:text-[#FCD34D] flex items-start gap-2">
        <Info size={16} className="shrink-0 mt-0.5" />
        <span>
          <strong>Disclaimer:</strong> Standard official Nepal land factors are used (1 Ropani = 5,476 sq ft, 1 Bigha = 72,900 sq ft). For official land purchase or legal registration, always verify measurements against Lalpurja (जग्गाधनी प्रमाणपुर्जा) or official Survey Department maps.
        </span>
      </div>
    </div>
  );
}
