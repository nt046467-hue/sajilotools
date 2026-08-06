"use client";

import { useState, useMemo } from "react";
import { Activity, Copy, Check, Info } from "lucide-react";

type UnitSystem = "metric" | "imperial";

interface WhoCategory {
  label: string;
  minBmi: number;
  maxBmi: number;
  color: string;
  badgeClass: string;
}

const WHO_CATEGORIES: WhoCategory[] = [
  { label: "Underweight", minBmi: 0, maxBmi: 18.49, color: "#3B82F6", badgeClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  { label: "Normal weight", minBmi: 18.5, maxBmi: 24.99, color: "#22C55E", badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  { label: "Overweight", minBmi: 25, maxBmi: 29.99, color: "#F59E0B", badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  { label: "Obese", minBmi: 30, maxBmi: 999, color: "#EF4444", badgeClass: "bg-rose-500/15 text-rose-600 dark:text-rose-400" },
];

export default function BmiCalculatorTool() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");

  // Metric State
  const [heightCm, setHeightCm] = useState<string>("170");
  const [weightKg, setWeightKg] = useState<string>("68");

  // Imperial State
  const [heightFt, setHeightFt] = useState<string>("5");
  const [heightIn, setHeightIn] = useState<string>("7");
  const [weightLb, setWeightLb] = useState<string>("150");

  const [copied, setCopied] = useState<boolean>(false);

  const bmiResult = useMemo(() => {
    let bmi: number;

    if (unitSystem === "metric") {
      const cm = parseFloat(heightCm);
      const kg = parseFloat(weightKg);
      if (isNaN(cm) || isNaN(kg) || cm <= 0 || kg <= 0) return null;
      const meters = cm / 100;
      bmi = kg / (meters * meters);
    } else {
      const ft = parseFloat(heightFt) || 0;
      const inch = parseFloat(heightIn) || 0;
      const lb = parseFloat(weightLb);
      const totalInches = ft * 12 + inch;
      if (isNaN(lb) || totalInches <= 0 || lb <= 0) return null;
      bmi = (lb / (totalInches * totalInches)) * 703;
    }

    if (isNaN(bmi) || !isFinite(bmi)) return null;

    const category = WHO_CATEGORIES.find((c) => bmi >= c.minBmi && bmi <= c.maxBmi) || WHO_CATEGORIES[WHO_CATEGORIES.length - 1];

    // Calculate percentage position on visual bar (15 to 35 range)
    const clampedBmi = Math.max(15, Math.min(35, bmi));
    const positionPct = ((clampedBmi - 15) / (35 - 15)) * 100;

    return {
      bmi: Number(bmi.toFixed(1)),
      category,
      positionPct,
    };
  }, [unitSystem, heightCm, weightKg, heightFt, heightIn, weightLb]);

  const handleCopy = () => {
    if (!bmiResult) return;
    const text = `BMI: ${bmiResult.bmi} (${bmiResult.category.label})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Unit Toggle Bar */}
      <div className="flex p-1.5 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
        <button
          onClick={() => setUnitSystem("metric")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-center ${
            unitSystem === "metric"
              ? "bg-[#0D9488] text-white shadow-md"
              : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
          }`}
        >
          Metric Units (cm, kg)
        </button>
        <button
          onClick={() => setUnitSystem("imperial")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-center ${
            unitSystem === "imperial"
              ? "bg-[#0D9488] text-white shadow-md"
              : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
          }`}
        >
          Imperial Units (ft/in, lbs)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Card */}
        <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-5">
          <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
            <Activity size={14} className="text-[#0D9488]" /> Enter Measurements
          </h4>

          {unitSystem === "metric" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#71717A] mb-1">
                  Height (Centimeters)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder="170"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-bold text-[#71717A]">
                    cm
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#71717A] mb-1">
                  Weight (Kilograms)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="68"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-bold text-[#71717A]">
                    kg
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#71717A] mb-1">
                  Height (Feet &amp; Inches)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      value={heightFt}
                      onChange={(e) => setHeightFt(e.target.value)}
                      placeholder="5"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-[#71717A]">
                      ft
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={heightIn}
                      onChange={(e) => setHeightIn(e.target.value)}
                      placeholder="7"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-[#71717A]">
                      in
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#71717A] mb-1">
                  Weight (Pounds)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={weightLb}
                    onChange={(e) => setWeightLb(e.target.value)}
                    placeholder="150"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-bold text-[#71717A]">
                    lbs
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Output Card */}
        <div className="p-6 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl flex flex-col justify-between space-y-6">
          {bmiResult ? (
            <>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
                    Calculated BMI Score
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs font-bold text-[#0D9488] hover:underline"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy Result"}
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-extrabold text-[#0D9488]">
                      {bmiResult.bmi}
                    </span>
                    <span className={`px-3 py-1 rounded-xl text-xs font-extrabold ${bmiResult.category.badgeClass}`}>
                      {bmiResult.category.label}
                    </span>
                  </div>

                  {/* Visual Range Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="h-3 w-full rounded-full bg-gradient-to-r from-blue-500 via-emerald-500 via-amber-500 to-rose-500 relative">
                      <div
                        className="w-4 h-4 rounded-full bg-white border-2 border-[#18181B] dark:border-[#F4F4F5] absolute top-1/2 -translate-y-1/2 -translate-x-1/2 shadow-md transition-all duration-300"
                        style={{ left: `${bmiResult.positionPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-[#71717A] font-semibold">
                      <span>18.5</span>
                      <span>25.0</span>
                      <span>30.0</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-xs text-[#71717A] flex items-start gap-2">
                <Info size={16} className="text-[#0D9488] shrink-0 mt-0.5" />
                <span>
                  BMI categories are defined by World Health Organization (WHO) clinical thresholds for adult men and women.
                </span>
              </div>
            </>
          ) : (
            <div className="text-xs text-[#71717A] text-center py-8">
              Enter height and weight values to calculate your Body Mass Index.
            </div>
          )}
        </div>
      </div>

      {/* WHO Reference Range Cards */}
      <div className="p-6 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl space-y-4">
        <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
          <Info size={14} className="text-[#0D9488]" /> WHO Adult BMI Reference Range
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-3 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-1">
            <span className="text-blue-500 font-bold block">Underweight</span>
            <span className="text-[#71717A] text-[11px] block">&lt; 18.5</span>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-1">
            <span className="text-emerald-500 font-bold block">Normal weight</span>
            <span className="text-[#71717A] text-[11px] block">18.5 – 24.9</span>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-1">
            <span className="text-amber-500 font-bold block">Overweight</span>
            <span className="text-[#71717A] text-[11px] block">25.0 – 29.9</span>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-1">
            <span className="text-rose-500 font-bold block">Obese</span>
            <span className="text-[#71717A] text-[11px] block">≥ 30.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
