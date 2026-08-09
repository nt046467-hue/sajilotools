"use client";

import { useState } from "react";
import { Flame, Activity, Scale, Zap, Info } from "lucide-react";

export default function BmrTdeeCalculatorTool() {
  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">("imperial");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState<number>(28);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [weightLbs, setWeightLbs] = useState<number>(154);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [heightFeet, setHeightFeet] = useState<number>(5);
  const [heightInches, setHeightInches] = useState<number>(9);
  const [activityLevel, setActivityLevel] = useState<number>(1.55); // Moderately Active default
  const [formula, setFormula] = useState<"mifflin" | "harris">("mifflin");

  // Calculate weight in kg and height in cm
  const effectiveWeightKg =
    unitSystem === "metric" ? weightKg : Math.max(1, weightLbs * 0.45359237);
  const effectiveHeightCm =
    unitSystem === "metric"
      ? heightCm
      : Math.max(1, (heightFeet * 12 + heightInches) * 2.54);

  // BMR Calculations
  let bmr = 0;
  if (formula === "mifflin") {
    // Mifflin-St Jeor Equation
    bmr = 10 * effectiveWeightKg + 6.25 * effectiveHeightCm - 5 * age + (gender === "male" ? 5 : -161);
  } else {
    // Revised Harris-Benedict Equation
    if (gender === "male") {
      bmr = 13.397 * effectiveWeightKg + 4.799 * effectiveHeightCm - 5.677 * age + 88.362;
    } else {
      bmr = 9.247 * effectiveWeightKg + 3.098 * effectiveHeightCm - 4.33 * age + 447.593;
    }
  }

  const tdee = Math.round(bmr * activityLevel);
  const roundedBmr = Math.round(bmr);

  return (
    <div className="space-y-6">
      {/* Unit Toggle & Formula */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#F7F5F0] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] block mb-1">
            Measurement Units
          </span>
          <div className="flex rounded-lg border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] p-0.5">
            <button
              onClick={() => setUnitSystem("imperial")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                unitSystem === "imperial"
                  ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E]"
                  : "text-[#71717A]"
              }`}
            >
              Imperial (lbs, ft/in)
            </button>
            <button
              onClick={() => setUnitSystem("metric")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                unitSystem === "metric"
                  ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E]"
                  : "text-[#71717A]"
              }`}
            >
              Metric (kg, cm)
            </button>
          </div>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] block mb-1">
            BMR Formula
          </span>
          <select
            value={formula}
            onChange={(e: any) => setFormula(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] text-xs font-semibold"
          >
            <option value="mifflin">Mifflin-St Jeor (Standard / Recommended)</option>
            <option value="harris">Revised Harris-Benedict</option>
          </select>
        </div>
      </div>

      {/* Form Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Gender */}
        <div>
          <label className="block text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-2">
            Gender
          </label>
          <div className="flex rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] p-1">
            <button
              onClick={() => setGender("male")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                gender === "male"
                  ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E]"
                  : "text-[#71717A]"
              }`}
            >
              Male
            </button>
            <button
              onClick={() => setGender("female")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                gender === "female"
                  ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E]"
                  : "text-[#71717A]"
              }`}
            >
              Female
            </button>
          </div>
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-2">
            Age (years)
          </label>
          <input
            type="number"
            min={15}
            max={100}
            value={age}
            onChange={(e) => setAge(parseInt(e.target.value) || 20)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
          />
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-2">
            Weight ({unitSystem === "imperial" ? "lbs" : "kg"})
          </label>
          {unitSystem === "imperial" ? (
            <input
              type="number"
              value={weightLbs}
              onChange={(e) => setWeightLbs(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
            />
          ) : (
            <input
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
            />
          )}
        </div>

        {/* Height */}
        <div>
          <label className="block text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-2">
            Height ({unitSystem === "imperial" ? "ft & in" : "cm"})
          </label>
          {unitSystem === "imperial" ? (
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="ft"
                value={heightFeet}
                onChange={(e) => setHeightFeet(parseInt(e.target.value) || 0)}
                className="w-1/2 px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
              />
              <input
                type="number"
                placeholder="in"
                value={heightInches}
                onChange={(e) => setHeightInches(parseInt(e.target.value) || 0)}
                className="w-1/2 px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
              />
            </div>
          ) : (
            <input
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
            />
          )}
        </div>
      </div>

      {/* Activity Level Selector */}
      <div>
        <label className="block text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-2">
          Daily Physical Activity Level
        </label>
        <select
          value={activityLevel}
          onChange={(e) => setActivityLevel(parseFloat(e.target.value))}
          className="w-full px-4 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40 font-medium"
        >
          <option value={1.2}>Sedentary: Desk job, little to no exercise (x1.2)</option>
          <option value={1.375}>Lightly Active: Light exercise 1–3 days/week (x1.375)</option>
          <option value={1.55}>Moderately Active: Moderate exercise 3–5 days/week (x1.55)</option>
          <option value={1.725}>Very Active: Heavy exercise 6–7 days/week (x1.725)</option>
          <option value={1.9}>Extra Active: Intense daily training or physical job (x1.9)</option>
        </select>
      </div>

      {/* Primary Results Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-[#1F2544] text-white dark:bg-[#141829] border border-[#2A2F48] shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F5A623] flex items-center gap-1.5">
              <Flame size={16} /> Basal Metabolic Rate (BMR)
            </span>
          </div>
          <div className="text-4xl font-extrabold font-sora mt-1">
            {roundedBmr} <span className="text-sm font-normal text-[#9AA3D6]">kcal/day</span>
          </div>
          <p className="text-xs text-[#9AA3D6] mt-2 leading-relaxed">
            Calories burned completely at rest to maintain vital organ functions (heart, brain, lungs).
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#D97706] text-[#0C0F1E] shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 opacity-90">
              <Zap size={16} /> Total Energy Expenditure (TDEE)
            </span>
          </div>
          <div className="text-4xl font-extrabold font-sora mt-1">
            {tdee} <span className="text-sm font-medium opacity-90">kcal/day</span>
          </div>
          <p className="text-xs opacity-90 mt-2 leading-relaxed">
            Your daily calorie burn combining your BMR and physical activity. This is your maintenance intake.
          </p>
        </div>
      </div>

      {/* Calorie Goals Matrix */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-1.5">
          <Activity size={14} /> Calorie Target Matrix Based on Your TDEE
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[#18181B] dark:text-[#F4F4F5]">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block mb-1">
              Weight Loss (-500 kcal)
            </span>
            <div className="text-2xl font-bold font-sora">{Math.max(1200, tdee - 500)}</div>
            <span className="text-[11px] text-[#71717A] mt-1 block">~1 lb (0.45 kg) loss / week</span>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#18181B] dark:text-[#F4F4F5]">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block mb-1">
              Mild Weight Loss (-250 kcal)
            </span>
            <div className="text-2xl font-bold font-sora">{Math.max(1200, tdee - 250)}</div>
            <span className="text-[11px] text-[#71717A] mt-1 block">~0.5 lb (0.22 kg) loss / week</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#18181B] dark:text-[#F4F4F5]">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
              Maintenance (0 kcal)
            </span>
            <div className="text-2xl font-bold font-sora">{tdee}</div>
            <span className="text-[11px] text-[#71717A] mt-1 block">Maintain current weight</span>
          </div>

          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#18181B] dark:text-[#F4F4F5]">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block mb-1">
              Muscle Gain (+300 kcal)
            </span>
            <div className="text-2xl font-bold font-sora">{tdee + 300}</div>
            <span className="text-[11px] text-[#71717A] mt-1 block">Controlled lean bulking</span>
          </div>
        </div>
      </div>
    </div>
  );
}
