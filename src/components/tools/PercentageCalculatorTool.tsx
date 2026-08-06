"use client";

import { useState, useMemo } from "react";
import { Percent, Copy, Check, Info, TrendingUp, TrendingDown } from "lucide-react";

type CalcMode = "mode1" | "mode2" | "mode3";

export default function PercentageCalculatorTool() {
  const [mode, setMode] = useState<CalcMode>("mode1");

  // Mode 1: What is X% of Y?
  const [m1Pct, setM1Pct] = useState<string>("15");
  const [m1Val, setM1Val] = useState<string>("200");

  // Mode 2: X is what % of Y?
  const [m2Part, setM2Part] = useState<string>("45");
  const [m2Total, setM2Total] = useState<string>("150");

  // Mode 3: Percentage change from X to Y
  const [m3Val1, setM3Val1] = useState<string>("500");
  const [m3Val2, setM3Val2] = useState<string>("750");

  const [copied, setCopied] = useState<boolean>(false);

  // Calculations
  const result1 = useMemo(() => {
    const p = parseFloat(m1Pct);
    const v = parseFloat(m1Val);
    if (isNaN(p) || isNaN(v)) return null;
    const res = (p / 100) * v;
    return {
      value: res,
      formula: `${p}% × ${v} = (${p} / 100) × ${v} = ${res}`,
    };
  }, [m1Pct, m1Val]);

  const result2 = useMemo(() => {
    const part = parseFloat(m2Part);
    const total = parseFloat(m2Total);
    if (isNaN(part) || isNaN(total) || total === 0) return null;
    const res = (part / total) * 100;
    return {
      value: res,
      formula: `(${part} / ${total}) × 100 = ${res.toFixed(2)}%`,
    };
  }, [m2Part, m2Total]);

  const result3 = useMemo(() => {
    const v1 = parseFloat(m3Val1);
    const v2 = parseFloat(m3Val2);
    if (isNaN(v1) || isNaN(v2) || v1 === 0) return null;
    const diff = v2 - v1;
    const pctChange = (diff / Math.abs(v1)) * 100;
    const isIncrease = pctChange >= 0;
    return {
      value: Math.abs(pctChange),
      diff,
      isIncrease,
      formula: `((${v2} - ${v1}) / |${v1}|) × 100 = ${pctChange >= 0 ? "+" : ""}${pctChange.toFixed(2)}%`,
    };
  }, [m3Val1, m3Val2]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="flex p-1.5 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
        <button
          onClick={() => setMode("mode1")}
          className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all text-center ${
            mode === "mode1"
              ? "bg-[#0D9488] text-white shadow-md"
              : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
          }`}
        >
          What is X% of Y?
        </button>
        <button
          onClick={() => setMode("mode2")}
          className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all text-center ${
            mode === "mode2"
              ? "bg-[#0D9488] text-white shadow-md"
              : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
          }`}
        >
          X is what % of Y?
        </button>
        <button
          onClick={() => setMode("mode3")}
          className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all text-center ${
            mode === "mode3"
              ? "bg-[#0D9488] text-white shadow-md"
              : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
          }`}
        >
          % Increase / Decrease
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Card */}
        <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-4">
          {mode === "mode1" && (
            <>
              <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                <Percent size={14} className="text-[#0D9488]" /> What is X% of Y?
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#71717A] mb-1">
                    Percentage (X %)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={m1Pct}
                      onChange={(e) => setM1Pct(e.target.value)}
                      placeholder="e.g. 15"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs font-bold text-[#71717A]">
                      %
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#71717A] mb-1">
                    Total Amount (Y)
                  </label>
                  <input
                    type="number"
                    value={m1Val}
                    onChange={(e) => setM1Val(e.target.value)}
                    placeholder="e.g. 200"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
                  />
                </div>
              </div>
            </>
          )}

          {mode === "mode2" && (
            <>
              <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                <Percent size={14} className="text-[#0D9488]" /> X is what % of Y?
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#71717A] mb-1">
                    Part Amount (X)
                  </label>
                  <input
                    type="number"
                    value={m2Part}
                    onChange={(e) => setM2Part(e.target.value)}
                    placeholder="e.g. 45"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#71717A] mb-1">
                    Total Amount (Y)
                  </label>
                  <input
                    type="number"
                    value={m2Total}
                    onChange={(e) => setM2Total(e.target.value)}
                    placeholder="e.g. 150"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
                  />
                </div>
              </div>
            </>
          )}

          {mode === "mode3" && (
            <>
              <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                <Percent size={14} className="text-[#0D9488]" /> Percentage Increase / Decrease
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#71717A] mb-1">
                    Original Initial Value (From X)
                  </label>
                  <input
                    type="number"
                    value={m3Val1}
                    onChange={(e) => setM3Val1(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#71717A] mb-1">
                    New Final Value (To Y)
                  </label>
                  <input
                    type="number"
                    value={m3Val2}
                    onChange={(e) => setM3Val2(e.target.value)}
                    placeholder="e.g. 750"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Result Card */}
        <div className="p-6 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl flex flex-col justify-between space-y-6">
          {mode === "mode1" && (
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
                  Result
                </span>
                {result1 && (
                  <button
                    onClick={() => handleCopy(`${m1Pct}% of ${m1Val} = ${result1.value}`)}
                    className="flex items-center gap-1 text-xs font-bold text-[#0D9488] hover:underline"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy Result"}
                  </button>
                )}
              </div>

              {result1 ? (
                <div className="mt-3 space-y-2">
                  <div className="text-3xl font-extrabold text-[#0D9488]">
                    {result1.value}
                  </div>
                  <p className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
                    <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">{m1Pct}%</span> of <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">{m1Val}</span> is equal to <span className="font-bold text-[#0D9488]">{result1.value}</span>.
                  </p>
                  <div className="p-3 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-xs font-mono text-[#71717A]">
                    Formula: {result1.formula}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[#71717A] py-8 text-center">
                  Enter valid values to see calculation result.
                </div>
              )}
            </div>
          )}

          {mode === "mode2" && (
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
                  Result
                </span>
                {result2 && (
                  <button
                    onClick={() => handleCopy(`${m2Part} is ${result2.value.toFixed(2)}% of ${m2Total}`)}
                    className="flex items-center gap-1 text-xs font-bold text-[#0D9488] hover:underline"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy Result"}
                  </button>
                )}
              </div>

              {result2 ? (
                <div className="mt-3 space-y-2">
                  <div className="text-3xl font-extrabold text-[#0D9488]">
                    {result2.value.toFixed(2)}%
                  </div>
                  <p className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
                    <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">{m2Part}</span> is <span className="font-bold text-[#0D9488]">{result2.value.toFixed(2)}%</span> of <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">{m2Total}</span>.
                  </p>
                  <div className="p-3 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-xs font-mono text-[#71717A]">
                    Formula: {result2.formula}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[#71717A] py-8 text-center">
                  Enter valid non-zero values to see calculation result.
                </div>
              )}
            </div>
          )}

          {mode === "mode3" && (
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
                  Result
                </span>
                {result3 && (
                  <button
                    onClick={() => handleCopy(`${result3.isIncrease ? "Increase" : "Decrease"} of ${result3.value.toFixed(2)}%`)}
                    className="flex items-center gap-1 text-xs font-bold text-[#0D9488] hover:underline"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy Result"}
                  </button>
                )}
              </div>

              {result3 ? (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center gap-2">
                    {result3.isIncrease ? (
                      <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <TrendingUp size={24} />
                      </span>
                    ) : (
                      <span className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        <TrendingDown size={24} />
                      </span>
                    )}
                    <div>
                      <div className="text-3xl font-extrabold text-[#18181B] dark:text-[#F4F4F5]">
                        {result3.isIncrease ? "+" : "-"}{result3.value.toFixed(2)}%
                      </div>
                      <span className={`text-xs font-bold ${result3.isIncrease ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        {result3.isIncrease ? "Percentage Increase" : "Percentage Decrease"}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
                    Moving from <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">{m3Val1}</span> to <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">{m3Val2}</span> is a difference of <span className="font-semibold">{result3.diff >= 0 ? `+${result3.diff}` : result3.diff}</span> ({result3.value.toFixed(2)}%).
                  </p>

                  <div className="p-3 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-xs font-mono text-[#71717A]">
                    Formula: {result3.formula}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[#71717A] py-8 text-center">
                  Enter valid values to compute percentage change.
                </div>
              )}
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-xs text-[#71717A] flex items-start gap-2">
            <Info size={16} className="text-[#0D9488] shrink-0 mt-0.5" />
            <span>
              All percentage formulas calculate instantly on your device without sending any data to servers.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
