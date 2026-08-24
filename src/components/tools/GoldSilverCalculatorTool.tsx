"use client";

import { useState, useEffect, useMemo } from "react";
import { Gem, RefreshCw, Scale, Info, Edit3, Check, RotateCcw } from "lucide-react";

type MetalType = "fineGold" | "tejabiGold" | "silver";
type WeightUnit = "tola" | "gram" | "aana" | "lal";

interface RateData {
  fineGoldPerTola: number;
  tejabiGoldPerTola: number;
  silverPerTola: number;
  date: string;
  isLive?: boolean;
}

const TOLA_IN_GRAMS = 11.6638;
const TOLA_IN_AANA = 16; // 1 Tola = 16 Aana in Nepal
const TOLA_IN_LAL = 64; // 1 Tola = 64 Lal (1 Aana = 4 Lal)

export default function GoldSilverCalculatorTool() {
  const [rates, setRates] = useState<RateData>({
    fineGoldPerTola: 283200,
    tejabiGoldPerTola: 282500,
    silverPerTola: 4320,
    date: new Date().toISOString().split("T")[0],
    isLive: false,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [metal, setMetal] = useState<MetalType>("fineGold");
  const [unit, setUnit] = useState<WeightUnit>("tola");
  const [weight, setWeight] = useState<number>(1);
  const [makingCharges, setMakingCharges] = useState<number>(0);

  // Custom rate override states
  const [isCustomRate, setIsCustomRate] = useState<boolean>(false);
  const [customFineGold, setCustomFineGold] = useState<number>(283200);
  const [customTejabiGold, setCustomTejabiGold] = useState<number>(282500);
  const [customSilver, setCustomSilver] = useState<number>(4320);

  useEffect(() => {
    async function fetchRates() {
      try {
        setLoading(true);
        const res = await fetch("/api/gold-silver");
        if (res.ok) {
          const data: RateData = await res.json();
          setRates(data);
          setCustomFineGold(data.fineGoldPerTola);
          setCustomTejabiGold(data.tejabiGoldPerTola);
          setCustomSilver(data.silverPerTola);
        }
      } catch (err) {
        console.error("Failed to load gold rates:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRates();
  }, []);

  const ratePerTola = useMemo(() => {
    if (isCustomRate) {
      if (metal === "fineGold") return customFineGold;
      if (metal === "tejabiGold") return customTejabiGold;
      return customSilver;
    }
    if (metal === "fineGold") return rates.fineGoldPerTola;
    if (metal === "tejabiGold") return rates.tejabiGoldPerTola;
    return rates.silverPerTola;
  }, [metal, rates, isCustomRate, customFineGold, customTejabiGold, customSilver]);

  const ratePerGram = useMemo(() => ratePerTola / TOLA_IN_GRAMS, [ratePerTola]);
  const ratePerAana = useMemo(() => ratePerTola / TOLA_IN_AANA, [ratePerTola]);
  const ratePerLal = useMemo(() => ratePerTola / TOLA_IN_LAL, [ratePerTola]);

  const weightInTola = useMemo(() => {
    if (unit === "tola") return weight;
    if (unit === "gram") return weight / TOLA_IN_GRAMS;
    if (unit === "aana") return weight / TOLA_IN_AANA;
    return weight / TOLA_IN_LAL;
  }, [weight, unit]);

  const rawMetalCost = useMemo(() => weightInTola * ratePerTola, [weightInTola, ratePerTola]);
  const totalCost = useMemo(() => rawMetalCost + makingCharges, [rawMetalCost, makingCharges]);

  const resetToOfficialRates = () => {
    setIsCustomRate(false);
    setCustomFineGold(rates.fineGoldPerTola);
    setCustomTejabiGold(rates.tejabiGoldPerTola);
    setCustomSilver(rates.silverPerTola);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Live Nepal Rates */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <Gem size={20} className="text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2">
              Nepal Gold &amp; Silver Live Rates (नेपाल सुन-चाँदी मूल्य)
              {loading ? (
                <RefreshCw size={13} className="animate-spin text-[#22C55E]" />
              ) : rates.isLive ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  LIVE FENEGOSIDA
                </span>
              ) : null}
            </h3>
            <p className="text-xs text-[#71717A]">
              FENEGOSIDA Rates for {rates.date} (Per Tola / प्रति तोला)
            </p>
          </div>
        </div>

        {/* Rates badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-300 font-bold">
            Fine Gold: Rs. {ratePerTolaForDisplay(metal === "fineGold" ? ratePerTola : rates.fineGoldPerTola)}
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900/40 text-yellow-700 dark:text-yellow-300 font-bold">
            Tejabi: Rs. {ratePerTolaForDisplay(metal === "tejabiGold" ? ratePerTola : rates.tejabiGoldPerTola)}
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold">
            Silver: Rs. {ratePerTolaForDisplay(metal === "silver" ? ratePerTola : rates.silverPerTola)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                <Scale size={14} className="text-[#22C55E]" /> Calculator Controls
              </h4>

              {/* Rate Mode Toggle */}
              <button
                type="button"
                onClick={() => {
                  if (isCustomRate) resetToOfficialRates();
                  else setIsCustomRate(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] transition-colors"
              >
                {isCustomRate ? <RotateCcw size={13} /> : <Edit3 size={13} />}
                <span>{isCustomRate ? "Reset to Official Rate" : "Custom Rate Input"}</span>
              </button>
            </div>

            {/* Custom Rate Input Fields */}
            {isCustomRate && (
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                <div className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Edit3 size={13} /> Custom Rate per Tola (प्रति तोला दर)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#71717A] mb-1">Fine Gold Rate</label>
                    <input
                      type="number"
                      value={customFineGold}
                      onChange={(e) => setCustomFineGold(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#71717A] mb-1">Tejabi Rate</label>
                    <input
                      type="number"
                      value={customTejabiGold}
                      onChange={(e) => setCustomTejabiGold(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#71717A] mb-1">Silver Rate</label>
                    <input
                      type="number"
                      value={customSilver}
                      onChange={(e) => setCustomSilver(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-xs font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Metal Selector */}
            <div>
              <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider mb-2">
                Select Metal / Quality (धातु छान्नुहोस्)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMetal("fineGold")}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-colors ${
                    metal === "fineGold"
                      ? "bg-amber-500 text-white shadow-sm"
                      : "bg-[#FAFAF8] dark:bg-[#1E2338] text-[#71717A] border border-[#E4E0D8] dark:border-[#1E2338]"
                  }`}
                >
                  Fine Gold (छापावाल 24K)
                </button>
                <button
                  type="button"
                  onClick={() => setMetal("tejabiGold")}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-colors ${
                    metal === "tejabiGold"
                      ? "bg-yellow-600 text-white shadow-sm"
                      : "bg-[#FAFAF8] dark:bg-[#1E2338] text-[#71717A] border border-[#E4E0D8] dark:border-[#1E2338]"
                  }`}
                >
                  Tejabi Gold (तेजाबी 22K)
                </button>
                <button
                  type="button"
                  onClick={() => setMetal("silver")}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-colors ${
                    metal === "silver"
                      ? "bg-slate-600 text-white shadow-sm"
                      : "bg-[#FAFAF8] dark:bg-[#1E2338] text-[#71717A] border border-[#E4E0D8] dark:border-[#1E2338]"
                  }`}
                >
                  Silver (चाँदी)
                </button>
              </div>
            </div>

            {/* Quick Conversion Presets (One-tap Aana, Lal, Tola) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
                  Quick Amount Presets (छिटो चयन)
                </label>
                <span className="text-[11px] text-[#22C55E] font-semibold">1 Tola = 16 Aana = 64 Lal</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "1 Aana (१ आना)", u: "aana" as const, w: 1 },
                  { label: "1 Lal (१ लाल)", u: "lal" as const, w: 1 },
                  { label: "1 Tola (१ तोला)", u: "tola" as const, w: 1 },
                  { label: "8 Aana (आधा तोला)", u: "aana" as const, w: 8 },
                  { label: "10 Grams (१० ग्राम)", u: "gram" as const, w: 10 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setUnit(preset.u);
                      setWeight(preset.w);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                      unit === preset.u && weight === preset.w
                        ? "bg-[#22C55E] text-white border-[#22C55E]"
                        : "bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] border-[#E4E0D8] dark:border-[#2A2F48] hover:border-[#22C55E]"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Unit & Weight Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider mb-2">
                  Weight Unit (इकाइ)
                </label>
                <div className="grid grid-cols-4 gap-1 p-1 bg-[#FAFAF8] dark:bg-[#1E2338] rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48]">
                  {(
                    [
                      { id: "tola", label: "Tola (तोला)" },
                      { id: "gram", label: "Gram (ग्राम)" },
                      { id: "aana", label: "Aana (आना)" },
                      { id: "lal", label: "Lal (लाल)" },
                    ] as const
                  ).map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setUnit(u.id)}
                      className={`py-1.5 text-[11px] font-bold rounded-lg transition-colors ${
                        unit === u.id
                          ? "bg-[#22C55E] text-white"
                          : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider mb-2">
                  Weight Quantity (मात्रा)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={0.01}
                  value={weight}
                  onChange={(e) => setWeight(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
                />
              </div>
            </div>

            {/* Optional Making Charges */}
            <div>
              <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider mb-1">
                Making Charges / Jyala (ज्याला / जर्ती) - Optional
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#A1A1AA] text-xs">
                  Rs.
                </span>
                <input
                  type="number"
                  min={0}
                  value={makingCharges || ""}
                  onChange={(e) => setMakingCharges(Number(e.target.value))}
                  placeholder="e.g. 2500"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
                />
              </div>
            </div>

            {/* Weight Equivalence Box */}
            <div className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] space-y-1.5 text-xs text-[#71717A]">
              <div className="font-bold text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-1.5">
                <Info size={14} className="text-[#22C55E]" /> Equivalent Weight Conversions (माप रूपान्तरण):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                <div className="p-2 rounded-lg bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-center">
                  <div className="text-[10px] text-[#71717A]">Tola</div>
                  <div className="text-xs font-bold">{weightInTola.toFixed(4)}</div>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-center">
                  <div className="text-[10px] text-[#71717A]">Grams</div>
                  <div className="text-xs font-bold">{(weightInTola * TOLA_IN_GRAMS).toFixed(3)}</div>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-center">
                  <div className="text-[10px] text-[#71717A]">Aana</div>
                  <div className="text-xs font-bold">{(weightInTola * TOLA_IN_AANA).toFixed(2)}</div>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-center">
                  <div className="text-[10px] text-[#71717A]">Lal</div>
                  <div className="text-xs font-bold">{(weightInTola * TOLA_IN_LAL).toFixed(1)}</div>
                </div>
              </div>
            </div>

            {/* Quick Answer Summary / Conversion Reference Card */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2 text-xs">
              <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center justify-between">
                <span>Nepal Gold Weight Conversion Standard</span>
                <span className="text-[11px] font-mono font-bold bg-amber-500/20 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded">FENEGOSIDA Standard</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px] font-medium text-[#18181B] dark:text-[#F4F4F5]">
                <div className="p-2 rounded bg-white dark:bg-[#141829] border border-amber-500/20">
                  <div className="text-[10px] text-[#71717A]">1 Tola (तोला)</div>
                  <div className="font-bold text-amber-600 dark:text-amber-400">16 Aana / 64 Lal</div>
                  <div className="text-[9px] text-[#A1A1AA]">11.6638 Grams</div>
                </div>
                <div className="p-2 rounded bg-white dark:bg-[#141829] border border-amber-500/20">
                  <div className="text-[10px] text-[#71717A]">1 Aana (आना)</div>
                  <div className="font-bold text-amber-600 dark:text-amber-400">4 Lal (लाल)</div>
                  <div className="text-[9px] text-[#A1A1AA]">0.7290 Grams</div>
                </div>
                <div className="p-2 rounded bg-white dark:bg-[#141829] border border-amber-500/20">
                  <div className="text-[10px] text-[#71717A]">1 Lal (लाल)</div>
                  <div className="font-bold text-amber-600 dark:text-amber-400">0.25 Aana</div>
                  <div className="text-[9px] text-[#A1A1AA]">0.1822 Grams</div>
                </div>
                <div className="p-2 rounded bg-white dark:bg-[#141829] border border-amber-500/20">
                  <div className="text-[10px] text-[#71717A]">10 Grams (१० ग्राम)</div>
                  <div className="font-bold text-amber-600 dark:text-amber-400">0.8573 Tola</div>
                  <div className="text-[9px] text-[#A1A1AA]">13.718 Aana</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Column (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl space-y-6">
            <div>
              <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
                Total Estimated Price (कुल रकम)
              </span>
              <div className="text-4xl font-extrabold text-[#22C55E] mt-1">
                Rs. {Math.round(totalCost).toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-[#A1A1AA] mt-1">
                For {weight} {unit} of{" "}
                {metal === "fineGold"
                  ? "Fine Gold (छापावाल)"
                  : metal === "tejabiGold"
                  ? "Tejabi Gold (तेजाबी)"
                  : "Silver (चाँदी)"}
              </div>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-[#E4E0D8] dark:border-[#2A2F48] text-sm">
              <div className="flex justify-between">
                <span className="text-[#71717A]">Raw Metal Value:</span>
                <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                  Rs. {Math.round(rawMetalCost).toLocaleString("en-IN")}
                </span>
              </div>
              {makingCharges > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#71717A]">Making Charges (ज्याला):</span>
                  <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                    + Rs. {makingCharges.toLocaleString("en-IN")}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-[#E4E0D8] dark:border-[#2A2F48]">
                <span className="text-[#71717A]">Rate per Tola:</span>
                <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                  Rs. {Math.round(ratePerTola).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717A]">Rate per Gram:</span>
                <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                  Rs. {Math.round(ratePerGram).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717A]">Rate per Aana (आना):</span>
                <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                  Rs. {Math.round(ratePerAana).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717A]">Rate per Lal (लाल):</span>
                <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                  Rs. {Math.round(ratePerLal).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ratePerTolaForDisplay(rate: number): string {
  return Math.round(rate).toLocaleString("en-IN");
}
