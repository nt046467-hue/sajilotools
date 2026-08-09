"use client";

import { useState } from "react";
import { HeartPulse, PieChart, Utensils, Award } from "lucide-react";

export default function CalorieCalculatorTool() {
  const [dailyCalories, setDailyCalories] = useState<number>(2200);
  const [preset, setPreset] = useState<"balanced" | "high-protein" | "low-carb" | "custom">("high-protein");
  const [proteinPct, setProteinPct] = useState<number>(35);
  const [carbsPct, setCarbsPct] = useState<number>(40);
  const [fatPct, setFatPct] = useState<number>(25);
  const [mealsCount, setMealsCount] = useState<number>(4);

  function handlePresetChange(selected: "balanced" | "high-protein" | "low-carb" | "custom") {
    setPreset(selected);
    if (selected === "balanced") {
      setProteinPct(30);
      setCarbsPct(40);
      setFatPct(30);
    } else if (selected === "high-protein") {
      setProteinPct(35);
      setCarbsPct(40);
      setFatPct(25);
    } else if (selected === "low-carb") {
      setProteinPct(30);
      setCarbsPct(10);
      setFatPct(60);
    }
  }

  // Gram calculations
  // Protein = 4 kcal/g, Carbs = 4 kcal/g, Fat = 9 kcal/g
  const totalCal = Math.max(800, dailyCalories);
  const proteinGrams = Math.round((totalCal * (proteinPct / 100)) / 4);
  const carbsGrams = Math.round((totalCal * (carbsPct / 100)) / 4);
  const fatGrams = Math.round((totalCal * (fatPct / 100)) / 9);

  const totalRatio = proteinPct + carbsPct + fatPct;

  return (
    <div className="space-y-6">
      {/* Target Calories Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-2">
            Target Daily Calorie Intake (kcal)
          </label>
          <input
            type="number"
            min={800}
            max={10000}
            step={50}
            value={dailyCalories}
            onChange={(e) => setDailyCalories(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] text-base font-bold font-sora focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
          />
          {dailyCalories < 800 && (
            <p className="text-xs text-amber-500 mt-1 font-medium">
              Using 800 kcal minimum for calculation — very low intakes aren't supported.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-2">
            Macronutrient Diet Ratio Preset
          </label>
          <select
            value={preset}
            onChange={(e: any) => handlePresetChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40 font-medium"
          >
            <option value="high-protein">High Protein / Athlete (35% P / 40% C / 25% F)</option>
            <option value="balanced">Balanced Standard (30% P / 40% C / 30% F)</option>
            <option value="low-carb">Low Carb / Ketogenic (30% P / 10% C / 60% F)</option>
            <option value="custom">Custom Percentage Split</option>
          </select>
        </div>
      </div>

      {/* Custom Percentages Sliders */}
      {preset === "custom" && (
        <div className="p-4 rounded-xl bg-[#F7F5F0] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] space-y-4">
          <div className="flex items-center justify-between text-xs font-bold">
            <span>Custom Split Total: {totalRatio}%</span>
            {totalRatio !== 100 && (
              <span className="text-amber-500">Percentages should sum to 100%</span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1">
                Protein ({proteinPct}%)
              </label>
              <input
                type="range"
                min={10}
                max={60}
                value={proteinPct}
                onChange={(e) => setProteinPct(parseInt(e.target.value))}
                className="w-full h-2 bg-[#E4E0D8] dark:bg-[#141829] rounded-lg appearance-none cursor-pointer accent-[#F5A623]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1">
                Carbohydrates ({carbsPct}%)
              </label>
              <input
                type="range"
                min={5}
                max={70}
                value={carbsPct}
                onChange={(e) => setCarbsPct(parseInt(e.target.value))}
                className="w-full h-2 bg-[#E4E0D8] dark:bg-[#141829] rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1">
                Fats ({fatPct}%)
              </label>
              <input
                type="range"
                min={10}
                max={70}
                value={fatPct}
                onChange={(e) => setFatPct(parseInt(e.target.value))}
                className="w-full h-2 bg-[#E4E0D8] dark:bg-[#141829] rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Visual Macro Bar */}
      <div>
        <div className="h-3.5 w-full rounded-full bg-[#E4E0D8] dark:bg-[#1E2338] overflow-hidden flex">
          <div style={{ width: `${proteinPct}%` }} className="bg-[#F5A623] h-full" />
          <div style={{ width: `${carbsPct}%` }} className="bg-blue-500 h-full" />
          <div style={{ width: `${fatPct}%` }} className="bg-emerald-500 h-full" />
        </div>
        <div className="flex items-center justify-between text-xs text-[#71717A] mt-1.5 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5A623]" /> Protein ({proteinPct}%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Carbs ({carbsPct}%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Fats ({fatPct}%)
          </span>
        </div>
      </div>

      {/* Primary Gram Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Protein Card */}
        <div className="p-5 rounded-2xl bg-[#F7F5F0] dark:bg-[#1E2338] border-t-4 border-t-[#F5A623] border border-[#E4E0D8] dark:border-[#2A2F48]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] block mb-1">
            Daily Protein Target
          </span>
          <div className="text-3xl font-extrabold font-sora text-[#18181B] dark:text-[#F4F4F5]">
            {proteinGrams} <span className="text-sm font-normal text-[#71717A]">grams</span>
          </div>
          <span className="text-xs text-[#71717A] mt-1.5 block">
            {Math.round(totalCal * (proteinPct / 100))} kcal ({proteinPct}% of total)
          </span>
        </div>

        {/* Carbs Card */}
        <div className="p-5 rounded-2xl bg-[#F7F5F0] dark:bg-[#1E2338] border-t-4 border-t-blue-500 border border-[#E4E0D8] dark:border-[#2A2F48]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] block mb-1">
            Daily Carbohydrates
          </span>
          <div className="text-3xl font-extrabold font-sora text-[#18181B] dark:text-[#F4F4F5]">
            {carbsGrams} <span className="text-sm font-normal text-[#71717A]">grams</span>
          </div>
          <span className="text-xs text-[#71717A] mt-1.5 block">
            {Math.round(totalCal * (carbsPct / 100))} kcal ({carbsPct}% of total)
          </span>
        </div>

        {/* Fat Card */}
        <div className="p-5 rounded-2xl bg-[#F7F5F0] dark:bg-[#1E2338] border-t-4 border-t-emerald-500 border border-[#E4E0D8] dark:border-[#2A2F48]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] block mb-1">
            Daily Healthy Fats
          </span>
          <div className="text-3xl font-extrabold font-sora text-[#18181B] dark:text-[#F4F4F5]">
            {fatGrams} <span className="text-sm font-normal text-[#71717A]">grams</span>
          </div>
          <span className="text-xs text-[#71717A] mt-1.5 block">
            {Math.round(totalCal * (fatPct / 100))} kcal ({fatPct}% of total)
          </span>
        </div>
      </div>

      {/* Per Meal Breakdown */}
      <div className="p-5 rounded-2xl bg-[#1F2544] text-white dark:bg-[#141829] border border-[#2A2F48]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F5A623] flex items-center gap-1.5 font-sora">
            <Utensils size={16} /> Per-Meal Macronutrient Split Suggestion
          </span>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9AA3D6]">Meals per day:</span>
            <select
              value={mealsCount}
              onChange={(e) => setMealsCount(parseInt(e.target.value))}
              className="px-2 py-1 rounded-lg bg-[#141829] dark:bg-[#1E2338] border border-[#2A2F48] text-xs font-bold text-white focus:outline-none"
            >
              <option value={3}>3 Meals</option>
              <option value={4}>4 Meals</option>
              <option value={5}>5 Meals</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-xs text-[#9AA3D6] block">Calories per Meal</span>
            <span className="text-xl font-bold font-sora mt-0.5 block">
              {Math.round(totalCal / mealsCount)} kcal
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-xs text-[#9AA3D6] block">Protein per Meal</span>
            <span className="text-xl font-bold font-sora text-[#F5A623] mt-0.5 block">
              {Math.round(proteinGrams / mealsCount)}g
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-xs text-[#9AA3D6] block">Carbs / Fat per Meal</span>
            <span className="text-xl font-bold font-sora mt-0.5 block">
              {Math.round(carbsGrams / mealsCount)}g C / {Math.round(fatGrams / mealsCount)}g F
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
