"use client";

import { useState, useMemo } from "react";
import { GraduationCap, Copy, Check, Info, ArrowLeftRight } from "lucide-react";

type ScalePreset = "neb" | "linear" | "custom";

interface GradeBracket {
  minGpa: number;
  minPct: number;
  grade: string;
  gpaRange: string;
  remark: string;
  badgeColor: string;
}

const NEB_GRADE_BRACKETS: GradeBracket[] = [
  { minGpa: 3.61, minPct: 90, grade: "A+", gpaRange: "3.61 - 4.0", remark: "Outstanding", badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  { minGpa: 3.21, minPct: 80, grade: "A", gpaRange: "3.21 - 3.60", remark: "Excellent", badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  { minGpa: 2.81, minPct: 70, grade: "B+", gpaRange: "2.81 - 3.20", remark: "Very Good", badgeColor: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  { minGpa: 2.41, minPct: 60, grade: "B", gpaRange: "2.41 - 2.80", remark: "Good", badgeColor: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  { minGpa: 2.01, minPct: 50, grade: "C+", gpaRange: "2.01 - 2.40", remark: "Satisfactory", badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  { minGpa: 1.61, minPct: 40, grade: "C", gpaRange: "1.61 - 2.00", remark: "Acceptable", badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  { minGpa: 1.21, minPct: 35, grade: "D", gpaRange: "1.21 - 1.60", remark: "Basic", badgeColor: "bg-orange-500/15 text-orange-600 dark:text-orange-400" },
  { minGpa: 0, minPct: 0, grade: "NG", gpaRange: "< 1.21", remark: "Not Graded", badgeColor: "bg-rose-500/15 text-rose-600 dark:text-rose-400" },
];

// Helper: look up grade bracket by GPA value
function findBracketByGpa(gpa: number): GradeBracket {
  return NEB_GRADE_BRACKETS.find((b) => gpa >= b.minGpa) || NEB_GRADE_BRACKETS[NEB_GRADE_BRACKETS.length - 1];
}

export default function GpaPercentageConverterTool() {
  const [direction, setDirection] = useState<"gpa-to-pct" | "pct-to-gpa">("gpa-to-pct");
  const [scalePreset, setScalePreset] = useState<ScalePreset>("neb");
  const [gpaInput, setGpaInput] = useState<string>("3.6");
  const [pctInput, setPctInput] = useState<string>("77.5");
  const [customMaxGpa, setCustomMaxGpa] = useState<string>("4.0");
  const [copied, setCopied] = useState<boolean>(false);

  // Math conversions
  const conversionResult = useMemo(() => {
    if (direction === "gpa-to-pct") {
      const gpa = parseFloat(gpaInput);
      if (isNaN(gpa) || gpa < 0) return null;

      let pct: number;
      let formulaStr: string;

      if (scalePreset === "neb") {
        pct = gpa * 25;
        if (pct < 0) pct = 0;
        if (pct > 100) pct = 100;
        formulaStr = `Percentage = ${gpa} × 25 = ${pct.toFixed(2)}%`;
      } else if (scalePreset === "linear") {
        pct = (gpa / 4.0) * 100;
        formulaStr = `Percentage = (${gpa} / 4.0) × 100 = ${pct.toFixed(2)}%`;
      } else {
        const maxG = parseFloat(customMaxGpa) || 4.0;
        pct = (gpa / maxG) * 100;
        formulaStr = `Percentage = (${gpa} / ${maxG}) × 100 = ${pct.toFixed(2)}%`;
      }

      // Grade lookup by GPA value (not percentage) for accurate NEB grading
      const bracket = findBracketByGpa(gpa);

      return {
        convertedPct: pct.toFixed(2),
        gpa: gpa.toFixed(2),
        formula: formulaStr,
        bracket,
      };
    } else {
      const pct = parseFloat(pctInput);
      if (isNaN(pct) || pct < 0 || pct > 100) return null;

      let gpa: number;
      let formulaStr: string;

      if (scalePreset === "neb") {
        gpa = pct / 25;
        if (gpa > 4.0) gpa = 4.0;
        formulaStr = `GPA = ${pct} / 25 = ${gpa.toFixed(2)}`;
      } else if (scalePreset === "linear") {
        gpa = (pct / 100) * 4.0;
        formulaStr = `GPA = (${pct} / 100) × 4.0 = ${gpa.toFixed(2)}`;
      } else {
        const maxG = parseFloat(customMaxGpa) || 4.0;
        gpa = (pct / 100) * maxG;
        formulaStr = `GPA = (${pct} / 100) × ${maxG} = ${gpa.toFixed(2)}`;
      }

      // Grade lookup by computed GPA value for consistency
      const bracket = findBracketByGpa(gpa);

      return {
        convertedGpa: gpa.toFixed(2),
        pct: pct.toFixed(2),
        formula: formulaStr,
        bracket,
      };
    }
  }, [direction, scalePreset, gpaInput, pctInput, customMaxGpa]);

  const handleCopy = () => {
    if (!conversionResult) return;
    const text = direction === "gpa-to-pct"
      ? `GPA: ${conversionResult.gpa} = Percentage: ${conversionResult.convertedPct}% (Grade ${conversionResult.bracket.grade})`
      : `Percentage: ${conversionResult.pct}% = GPA: ${conversionResult.convertedGpa} (Grade ${conversionResult.bracket.grade})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Direction & Scale Switcher Bar */}
      <div className="flex items-center justify-between p-2 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] flex-wrap gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 font-bold text-sm text-[#18181B] dark:text-[#F4F4F5]">
          <GraduationCap size={18} className="text-[#0D9488]" />
          <span>{direction === "gpa-to-pct" ? "GPA → Percentage" : "Percentage → GPA"}</span>
        </div>
        <button
          onClick={() => setDirection((prev) => (prev === "gpa-to-pct" ? "pct-to-gpa" : "gpa-to-pct"))}
          className="p-2 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-[#0D9488] hover:scale-105 transition-transform flex items-center gap-1.5 text-xs font-bold"
          title="Switch Conversion Direction"
        >
          <ArrowLeftRight size={15} />
          <span>Swap</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Card */}
        <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-5">
          <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
            <GraduationCap size={14} className="text-[#0D9488]" /> Enter Academic Score
          </h4>

          {/* Grading Preset Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#71717A] mb-1.5">
              Grading System Standard
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => setScalePreset("neb")}
                className={`py-2 px-2.5 rounded-xl border font-semibold text-center transition-colors ${
                  scalePreset === "neb"
                    ? "bg-[#0D9488] text-white border-[#0D9488]"
                    : "border-[#E4E0D8] dark:border-[#1E2338] text-[#71717A] hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338]"
                }`}
              >
                NEB Nepal (4.0)
              </button>
              <button
                onClick={() => setScalePreset("linear")}
                className={`py-2 px-2.5 rounded-xl border font-semibold text-center transition-colors ${
                  scalePreset === "linear"
                    ? "bg-[#0D9488] text-white border-[#0D9488]"
                    : "border-[#E4E0D8] dark:border-[#1E2338] text-[#71717A] hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338]"
                }`}
              >
                Linear 4.0
              </button>
              <button
                onClick={() => setScalePreset("custom")}
                className={`py-2 px-2.5 rounded-xl border font-semibold text-center transition-colors ${
                  scalePreset === "custom"
                    ? "bg-[#0D9488] text-white border-[#0D9488]"
                    : "border-[#E4E0D8] dark:border-[#1E2338] text-[#71717A] hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338]"
                }`}
              >
                Custom Scale
              </button>
            </div>
          </div>

          {scalePreset === "custom" && (
            <div>
              <label className="block text-xs font-semibold text-[#71717A] mb-1">
                Maximum GPA Scale
              </label>
              <input
                type="number"
                value={customMaxGpa}
                onChange={(e) => setCustomMaxGpa(e.target.value)}
                placeholder="e.g. 4.0 or 5.0"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
              />
            </div>
          )}

          {/* Dynamic Score Input */}
          {direction === "gpa-to-pct" ? (
            <div>
              <label className="block text-xs font-semibold text-[#71717A] mb-1">
                GPA Score
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max={scalePreset === "custom" ? customMaxGpa : "4.0"}
                value={gpaInput}
                onChange={(e) => setGpaInput(e.target.value)}
                placeholder="e.g. 3.65"
                className="w-full px-4 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-lg focus:outline-none focus:border-[#0D9488]"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-[#71717A] mb-1">
                Percentage Score (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={pctInput}
                onChange={(e) => setPctInput(e.target.value)}
                placeholder="e.g. 82.5"
                className="w-full px-4 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-lg focus:outline-none focus:border-[#0D9488]"
              />
            </div>
          )}
        </div>

        {/* Output Card */}
        <div className="p-6 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl flex flex-col justify-between space-y-6">
          {conversionResult ? (
            <>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
                    Converted Grade Output
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs font-bold text-[#0D9488] hover:underline"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy Result"}
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    {direction === "gpa-to-pct" ? (
                      <>
                        <span className="text-4xl font-extrabold text-[#0D9488]">
                          {conversionResult.convertedPct}%
                        </span>
                        <span className="text-sm font-semibold text-[#71717A]">
                          (Equivalent Percentage)
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl font-extrabold text-[#0D9488]">
                          {conversionResult.convertedGpa}
                        </span>
                        <span className="text-sm font-semibold text-[#71717A]">
                          (Equivalent GPA)
                        </span>
                      </>
                    )}
                  </div>

                  {/* Grade Badge & Remark */}
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-xl text-xs font-extrabold ${conversionResult.bracket.badgeColor}`}>
                      Grade: {conversionResult.bracket.grade} ({conversionResult.bracket.remark})
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-xs font-mono text-[#71717A]">
                    {conversionResult.formula}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-xs text-[#71717A] flex items-start gap-2">
                <Info size={16} className="text-[#0D9488] shrink-0 mt-0.5" />
                <span>
                  NEB formula used: <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">Percentage = GPA × 25</span> as per National Examination Board Nepal guidelines.
                </span>
              </div>
            </>
          ) : (
            <div className="text-xs text-[#71717A] text-center py-8">
              Enter a valid score to view percentage and grade equivalence.
            </div>
          )}
        </div>
      </div>

      {/* Grade Scale Reference Grid */}
      <div className="p-6 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl space-y-4">
        <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
          <Info size={14} className="text-[#0D9488]" /> Official NEB Nepal Grade Scale Reference
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {NEB_GRADE_BRACKETS.map((b) => (
            <div
              key={b.grade}
              className="p-3 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#18181B] dark:text-[#F4F4F5]">{b.grade}</span>
                <span className="text-[10px] text-[#71717A] font-medium">{b.gpaRange} GPA</span>
              </div>
              <div className="text-[#71717A] text-[11px] font-semibold">{b.minPct}% &amp; above</div>
              <div className="text-[10px] text-[#0D9488] font-bold">{b.remark}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
