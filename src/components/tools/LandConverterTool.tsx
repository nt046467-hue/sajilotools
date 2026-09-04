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

const SQFT_PER_KANAL = 5445;
const SQFT_PER_MARLA = 272.25;

type RateUnit = "aana" | "ropani" | "kattha" | "bigha" | "sqft";

interface PresetItem {
  label: string;
  labelNp: string;
  sqft: number;
}

const LAND_PRESETS: PresetItem[] = [
  { label: "1 Ropani", labelNp: "१ रोपनी", sqft: SQFT_PER_ROPANI },
  { label: "4 Aana", labelNp: "४ आना (घडेरी)", sqft: SQFT_PER_AANA * 4 },
  { label: "1 Bigha", labelNp: "१ बिघा", sqft: SQFT_PER_BIGHA },
  { label: "1 Kattha", labelNp: "१ कठ्ठा", sqft: SQFT_PER_KATTHA },
  { label: "1 Kanal", labelNp: "१ कनाल", sqft: SQFT_PER_KANAL },
];

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

  // Derived Sudurpashchim breakdown (Kanal & Marla)
  const sudurpashchim = useMemo(() => {
    let rem = Math.max(0, totalSqFt);
    const kanal = Math.floor(rem / SQFT_PER_KANAL);
    rem %= SQFT_PER_KANAL;
    const marla = Math.round((rem / SQFT_PER_MARLA) * 100) / 100;
    return { kanal, marla };
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

  // Handler for Sudurpashchim system inputs
  const handleSudurpashchimInput = (kanal: number, marla: number) => {
    const computedSqFt =
      (Math.max(0, kanal) * SQFT_PER_KANAL) +
      (Math.max(0, marla) * SQFT_PER_MARLA);
    setTotalSqFt(computedSqFt);
  };

  const copySummary = () => {
    const text = `Nepal Land Conversion Summary:\n- Pahad System: ${pahad.r} Ropani, ${pahad.a} Aana, ${pahad.p} Paisa, ${pahad.d} Daam\n- Terai System: ${terai.b} Bigha, ${terai.k} Kattha, ${terai.dh} Dhur\n- Sudurpashchim System: ${sudurpashchim.kanal} Kanal, ${sudurpashchim.marla} Marla\n- Square Feet: ${sqftVal} sq ft\n- Square Meters: ${sqmVal} m²\n- Hectares: ${hectareVal} ha\n- Acres: ${acreVal} acre\nTotal Estimated Price: Rs. ${totalPrice.toLocaleString("en-IN")}\nSource: Government of Nepal Survey Department (नापी विभाग) standard conversion factors.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Copy Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338]">
        <div>
          <h3 className="text-base font-bold text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2">
            <Ruler size={18} className="text-[#DC2626]" />
            Nepal Land Area Unit Converter
          </h3>
          <p className="text-xs text-[#71717A] mt-0.5">
            Convert seamlessly between Ropani-Aana-Paisa-Daam, Bigha-Kattha-Dhur, Kanal-Marla, Sq Ft & Metric.
          </p>
        </div>

        <button
          onClick={copySummary}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] hover:border-[#DC2626] transition-colors"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          {copied ? "Copied All!" : "Copy Results"}
        </button>
      </div>

      {/* Quick Presets Bar */}
      <div className="p-3.5 rounded-2xl bg-[#FAFAF8] dark:bg-[#1A1F36] border border-[#E4E0D8] dark:border-[#2A2F48] flex items-center flex-wrap gap-2">
        <span className="text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] mr-1 flex items-center gap-1">
          <RefreshCw size={13} /> Quick Presets:
        </span>
        {LAND_PRESETS.map((preset) => {
          const isActive = Math.abs(totalSqFt - preset.sqft) < 0.1;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => setTotalSqFt(preset.sqft)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-[#DC2626] text-white shadow-sm"
                  : "bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] border border-[#E4E0D8] dark:border-[#1E2338] hover:border-[#DC2626]"
              }`}
            >
              {preset.label} <span className="text-[10px] opacity-80">({preset.labelNp})</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setTotalSqFt(0)}
          className="ml-auto text-xs font-medium text-[#71717A] hover:text-[#DC2626] px-2 py-1"
        >
          Clear
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

      {/* Sudurpashchim System Card (Kanal & Marla) */}
      <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#DC2626] font-bold text-xs uppercase tracking-wider">
            <Ruler size={16} /> Sudurpashchim System (कनाल - मर्ला)
          </div>
          <span className="text-[10px] text-[#71717A] bg-[#FAFAF8] dark:bg-[#1E2338] px-2 py-0.5 rounded-full border border-[#E4E0D8] dark:border-[#2A2F48]">
            सुदूरपश्चिम / Karnali
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#71717A] mb-1">Kanal (कनाल)</label>
            <input
              type="number"
              min={0}
              value={sudurpashchim.kanal}
              onChange={(e) => handleSudurpashchimInput(Number(e.target.value), sudurpashchim.marla)}
              className="w-full px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#71717A] mb-1">Marla (मर्ला)</label>
            <input
              type="number"
              min={0}
              value={sudurpashchim.marla}
              onChange={(e) => handleSudurpashchimInput(sudurpashchim.kanal, Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
            />
          </div>
        </div>
        <p className="text-[10px] text-[#71717A]">
          1 Kanal = 5,445 sq ft &nbsp;·&nbsp; 20 Marla = 1 Kanal &nbsp;·&nbsp; 1 Marla = 272.25 sq ft
        </p>
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

      {/* Official Source Citation */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-2">
        <div className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">Official Source — आधिकारिक स्रोत</div>
        <div className="text-xs text-[#52525B] dark:text-[#A1A1AA] space-y-1">
          <p>📋 <strong>नापी विभाग</strong> (Survey Department, GoN) — standard conversion factors for all Nepal land units.</p>
          <p>📋 <strong>भूमि व्यवस्था तथा अभिलेख विभाग</strong> (Department of Land Management &amp; Archive) — Ministry of Land Management, Cooperatives and Poverty Alleviation.</p>
          <p className="text-[10px] text-[#71717A] pt-0.5">
            Conversion rates: 1 Ropani = 5,476 sq ft &nbsp;·&nbsp; 1 Bigha = 72,900 sq ft (20 Kattha) &nbsp;·&nbsp; 1 Kattha = 20 Dhur &nbsp;·&nbsp; 1 Aana = 4 Paisa = 16 Daam &nbsp;·&nbsp; 1 Kanal = 5,445 sq ft = 20 Marla
          </p>
        </div>
      </div>

      {/* Regional Disclaimer */}
      <div className="p-3.5 rounded-xl bg-[#FFFBEB] dark:bg-[#451A03]/30 border border-[#FDE68A] dark:border-[#78350F] text-xs text-[#B45309] dark:text-[#FCD34D] flex items-start gap-2">
        <Info size={16} className="shrink-0 mt-0.5" />
        <span>
          <strong>Disclaimer:</strong> Standard official factors per नापी विभाग (Survey Department, Government of Nepal) are used. Regional variants may exist. Always verify against Lalpurja (जग्गाधनी प्रमाणपुर्जा) or official Survey Department field maps before any legal transaction.
        </span>
      </div>
    </div>
  );
}
