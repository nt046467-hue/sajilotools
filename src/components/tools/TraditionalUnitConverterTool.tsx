"use client";

import { useState, useMemo } from "react";
import { Scale, ArrowLeftRight, Info, ShieldCheck, CheckCircle2 } from "lucide-react";

type CategoryTab = "weight" | "grain";

interface UnitDef {
  key: string;
  nameEn: string;
  nameNp: string;
  factorInBase: number; // Base unit for weight is kg; for grain is Liters
  desc: string;
}

// ── Weight Units (Base: Kilogram kg) ──────────────────────────────────────────
const WEIGHT_UNITS: UnitDef[] = [
  { key: "tola", nameEn: "Tola (तोला)", nameNp: "तोला", factorInBase: 0.011664, desc: "1 Tola = 11.664 grams" },
  { key: "pau", nameEn: "Pau (पाउ)", nameNp: "पाउ", factorInBase: 0.2, desc: "1 Pau = 200 grams (17.14 Tola)" },
  { key: "seer", nameEn: "Seer (सेर)", nameNp: "सेर", factorInBase: 0.8, desc: "1 Seer = 800 grams (4 Pau)" },
  { key: "dharni", nameEn: "Dharni (धार्नी)", nameNp: "धार्नी", factorInBase: 2.3328, desc: "1 Dharni = 2.3328 kg (12 Pau / 200 Tola)" },
  { key: "kg", nameEn: "Kilogram (kg)", nameNp: "किग्रा", factorInBase: 1.0, desc: "1 kg = 1,000 grams" },
  { key: "g", nameEn: "Gram (g)", nameNp: "ग्राम", factorInBase: 0.001, desc: "1 gram = 0.001 kg" },
];

// ── Grain / Volume Units (Base: Liter L) ──────────────────────────────────────
// Standard Rice/Grain approximation: 1 Pathi ≈ 4.544 Liters ≈ 3.6 kg
const GRAIN_UNITS: UnitDef[] = [
  { key: "mutthi", nameEn: "Mutthi (मुठ्ठी)", nameNp: "मुठ्ठी", factorInBase: 0.05, desc: "1 Mutthi ≈ 0.05 Liters (approx 40g grain)" },
  { key: "mana", nameEn: "Mana (माना)", nameNp: "माना", factorInBase: 0.568, desc: "1 Mana = 0.568 Liters (approx 450g grain)" },
  { key: "kuruwa", nameEn: "Kuruwa (कुरुवा)", nameNp: "कुरुवा", factorInBase: 1.136, desc: "1 Kuruwa = 2 Mana = 1.136 Liters (approx 900g grain)" },
  { key: "pathi", nameEn: "Pathi (पाथी)", nameNp: "पाथी", factorInBase: 4.544, desc: "1 Pathi = 8 Mana = 4.544 Liters (approx 3.6 kg grain)" },
  { key: "muri", nameEn: "Muri (मुरी)", nameNp: "मुरी", factorInBase: 90.88, desc: "1 Muri = 20 Pathi = 160 Mana = 90.88 Liters (approx 72 kg grain)" },
  { key: "liter", nameEn: "Liter (L)", nameNp: "लीटर", factorInBase: 1.0, desc: "1 Liter = 1,000 mL" },
  { key: "kg_grain", nameEn: "Kg (Approx. Grain Mass)", nameNp: "किग्रा (अन्न)", factorInBase: 1.262, desc: "Approx 1 kg grain ≈ 1.262 Liters" },
];

export default function TraditionalUnitConverterTool() {
  const [activeTab, setActiveTab] = useState<CategoryTab>("weight");

  // Weight State
  const [fromWeightUnit, setFromWeightUnit] = useState<string>("dharni");
  const [toWeightUnit, setToWeightUnit] = useState<string>("kg");
  const [weightValue, setWeightValue] = useState<string>("1");

  // Grain State
  const [fromGrainUnit, setFromGrainUnit] = useState<string>("muri");
  const [toGrainUnit, setToGrainUnit] = useState<string>("kg_grain");
  const [grainValue, setGrainValue] = useState<string>("1");

  // ── Calculation ─────────────────────────────────────────────────────────────
  const convertedWeight = useMemo(() => {
    const num = parseFloat(weightValue);
    if (isNaN(num) || num < 0) return 0;
    const fromDef = WEIGHT_UNITS.find((u) => u.key === fromWeightUnit);
    const toDef = WEIGHT_UNITS.find((u) => u.key === toWeightUnit);
    if (!fromDef || !toDef) return 0;

    const baseKg = num * fromDef.factorInBase;
    return baseKg / toDef.factorInBase;
  }, [weightValue, fromWeightUnit, toWeightUnit]);

  const convertedGrain = useMemo(() => {
    const num = parseFloat(grainValue);
    if (isNaN(num) || num < 0) return 0;
    const fromDef = GRAIN_UNITS.find((u) => u.key === fromGrainUnit);
    const toDef = GRAIN_UNITS.find((u) => u.key === toGrainUnit);
    if (!fromDef || !toDef) return 0;

    const baseL = num * fromDef.factorInBase;
    return baseL / toDef.factorInBase;
  }, [grainValue, fromGrainUnit, toGrainUnit]);

  const swapWeightUnits = () => {
    setFromWeightUnit(toWeightUnit);
    setToWeightUnit(fromWeightUnit);
  };

  const swapGrainUnits = () => {
    setFromGrainUnit(toGrainUnit);
    setToGrainUnit(fromGrainUnit);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Privacy Banner */}
      <div className="p-4 rounded-2xl bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2.5 text-sm font-medium">
        <ShieldCheck className="text-[#DC2626] shrink-0" size={18} />
        <span>
          🇳🇵 <strong>100% Client-Side Conversion:</strong> Traditional Nepali weight &amp; grain volume converter for markets and legal records.
        </span>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] shadow-sm">
        <button
          onClick={() => setActiveTab("weight")}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
            activeTab === "weight"
              ? "bg-[#DC2626] text-white shadow-md"
              : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
          }`}
        >
          <Scale size={18} />
          Weight (तोला / धार्नी / सेर)
        </button>
        <button
          onClick={() => setActiveTab("grain")}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
            activeTab === "grain"
              ? "bg-[#DC2626] text-white shadow-md"
              : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
          }`}
        >
          <Scale size={18} />
          Grain &amp; Volume (मुरी / पाथी / माना)
        </button>
      </div>

      {/* Weight Conversion Panel */}
      {activeTab === "weight" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] shadow-sm space-y-6">
          <h3 className="font-extrabold text-lg text-[#18181B] dark:text-[#F4F4F5]">
            Nepali Weight Converter (धार्नी ↔ Kg ↔ तोल)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* From Input */}
            <div className="md:col-span-5 space-y-2">
              <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider">
                From Value
              </label>
              <input
                type="number"
                value={weightValue}
                onChange={(e) => setWeightValue(e.target.value)}
                min="0"
                step="any"
                className="w-full px-4 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-extrabold text-lg focus:outline-none focus:ring-2 focus:ring-[#DC2626]/40"
              />
              <select
                value={fromWeightUnit}
                onChange={(e) => setFromWeightUnit(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#DC2626]/40"
              >
                {WEIGHT_UNITS.map((u) => (
                  <option key={u.key} value={u.key}>
                    {u.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="md:col-span-2 flex items-center justify-center pt-4 md:pt-6">
              <button
                onClick={swapWeightUnits}
                className="p-3 rounded-xl bg-[#DC2626]/10 text-[#DC2626] hover:bg-[#DC2626]/20 transition-all shadow-sm"
                title="Swap Units"
              >
                <ArrowLeftRight size={20} />
              </button>
            </div>

            {/* To Output */}
            <div className="md:col-span-5 space-y-2">
              <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider">
                Converted Output
              </label>
              <div className="px-4 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#DC2626] font-extrabold text-lg truncate">
                {convertedWeight.toLocaleString("en-US", { maximumFractionDigits: 4 })}
              </div>
              <select
                value={toWeightUnit}
                onChange={(e) => setToWeightUnit(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#DC2626]/40"
              >
                {WEIGHT_UNITS.map((u) => (
                  <option key={u.key} value={u.key}>
                    {u.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reference Breakdown */}
          <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] space-y-2 text-xs">
            <h4 className="font-bold text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-500" /> Traditional Weight Conversion Reference
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#71717A]">
              <div>• 1 Dharni (धार्नी) = 12 Pau = 200 Tola = <strong>2.3328 kg</strong></div>
              <div>• 1 Seer (सेर) = 4 Pau = <strong>800 grams</strong></div>
              <div>• 1 Pau (पाउ) = 17.14 Tola = <strong>200 grams</strong></div>
              <div>• 1 Tola (तोला) = 100 Lal = <strong>11.664 grams</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* Grain / Volume Conversion Panel */}
      {activeTab === "grain" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] shadow-sm space-y-6">
          <h3 className="font-extrabold text-lg text-[#18181B] dark:text-[#F4F4F5]">
            Nepali Grain &amp; Volume Converter (मुरी ↔ पाथी ↔ माना)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* From Input */}
            <div className="md:col-span-5 space-y-2">
              <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider">
                From Value
              </label>
              <input
                type="number"
                value={grainValue}
                onChange={(e) => setGrainValue(e.target.value)}
                min="0"
                step="any"
                className="w-full px-4 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-extrabold text-lg focus:outline-none focus:ring-2 focus:ring-[#DC2626]/40"
              />
              <select
                value={fromGrainUnit}
                onChange={(e) => setFromGrainUnit(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#DC2626]/40"
              >
                {GRAIN_UNITS.map((u) => (
                  <option key={u.key} value={u.key}>
                    {u.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="md:col-span-2 flex items-center justify-center pt-4 md:pt-6">
              <button
                onClick={swapGrainUnits}
                className="p-3 rounded-xl bg-[#DC2626]/10 text-[#DC2626] hover:bg-[#DC2626]/20 transition-all shadow-sm"
                title="Swap Units"
              >
                <ArrowLeftRight size={20} />
              </button>
            </div>

            {/* To Output */}
            <div className="md:col-span-5 space-y-2">
              <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider">
                Converted Output
              </label>
              <div className="px-4 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#DC2626] font-extrabold text-lg truncate">
                {convertedGrain.toLocaleString("en-US", { maximumFractionDigits: 4 })}
              </div>
              <select
                value={toGrainUnit}
                onChange={(e) => setToGrainUnit(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#DC2626]/40"
              >
                {GRAIN_UNITS.map((u) => (
                  <option key={u.key} value={u.key}>
                    {u.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grain Disclaimer / Note Box */}
          <div className="p-4 rounded-xl bg-[#FFFBEB] dark:bg-[#451A03]/30 border border-[#FDE68A] dark:border-[#78350F] text-xs text-[#B45309] dark:text-[#FCD34D] space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Info size={15} /> Regional &amp; Grain Density Disclaimer:
            </div>
            <p className="text-[11px] leading-relaxed">
              Traditional units like Muri, Pathi, and Mana are volume measurements. Weight equivalents in kilograms (e.g. 1 Pathi ≈ 3.6 kg, 1 Muri ≈ 72 kg) are standard agricultural averages for husked rice (चामल). Actual weight varies based on grain type (rice vs paddy vs wheat) and moisture content.
            </p>
          </div>

          {/* Grain Reference Table */}
          <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] space-y-2 text-xs">
            <h4 className="font-bold text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-500" /> Grain Volume Scale
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#71717A]">
              <div>• 1 Muri (मुरी) = 20 Pathi = 160 Mana = <strong>90.88 Liters</strong></div>
              <div>• 1 Pathi (पाथी) = 8 Mana = 4 Kuruwa = <strong>4.544 Liters</strong></div>
              <div>• 1 Kuruwa (कुरुवा) = 2 Mana = <strong>1.136 Liters</strong></div>
              <div>• 1 Mana (माना) = 10 Mutthi = <strong>0.568 Liters</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* Cross link to Universal Unit Converter */}
      <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50 flex items-center justify-between gap-4">
        <div className="text-xs text-teal-900 dark:text-teal-200">
          <strong>🌐 Looking for International Metric / Imperial Units?</strong> Convert Meters, Feet, Kilograms, Pounds, Liters, Gallons, Celsius, and Fahrenheit.
        </div>
        <a
          href="/tools/everyday/unit-converter"
          className="px-3 py-1.5 rounded-xl bg-[#0D9488] text-white text-xs font-bold hover:opacity-90 transition-opacity shrink-0"
        >
          Universal Units →
        </a>
      </div>
    </div>
  );
}
