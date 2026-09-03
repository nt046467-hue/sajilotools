"use client";

import { useState, useMemo } from "react";
import {
  Copy,
  Check,
  Info,
  Coins,
  ArrowLeftRight,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  Hash,
  Keyboard,
  CalendarDays,
  Cake,
  Languages,
  Landmark,
  Bookmark,
  Lightbulb,
  FileText,
} from "lucide-react";
import {
  nepaliDigitsToArabic,
  arabicDigitsToNepali,
  formatNepaliComma,
  formatNepaliDigitsComma,
  normalizeNumericInput,
} from "@/lib/nepali-number-utils";
import {
  numberToNepaliWords,
  numberToEnglishWords,
  nepaliWordsToNumber,
} from "@/lib/nepali-number-parser";
import CalculatorCrossLink from "@/components/tools/shared/CalculatorCrossLink";

export default function NepaliNumberToWordsTool() {
  const [direction, setDirection] = useState<"number-to-words" | "words-to-number">("number-to-words");
  const [currencyMode, setCurrencyMode] = useState<boolean>(true);

  // Direction 1: Number -> Words input
  const [numInput, setNumInput] = useState<string>("45678");

  // Direction 2: Words -> Number input
  const [wordsInput, setWordsInput] = useState<string>("पैंतालीस हजार छ सय अठहत्तर");

  // Copy feedback states
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const triggerCopy = (key: string, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // ── Mode 1: Number -> Words Computation ──────────────────────────────────────
  const numberResult = useMemo(() => {
    const raw = numInput.trim();
    if (!raw) return null;

    const normalized = normalizeNumericInput(raw);
    if (!normalized || isNaN(Number(normalized))) {
      return {
        error: "कृपया मान्य अङ्क प्रविष्ट गर्नुहोस् (Please enter a valid number).",
      };
    }

    const nepaliWords = numberToNepaliWords(normalized, { currency: currencyMode });
    const englishWords = numberToEnglishWords(normalized, { currency: currencyMode });
    const formattedArabic = formatNepaliComma(normalized);
    const formattedNepali = formatNepaliDigitsComma(normalized);
    const chequeFormat = currencyMode
      ? `रु ${formattedArabic}/- (${nepaliWords})`
      : undefined;

    return {
      nepaliWords,
      englishWords,
      formattedArabic,
      formattedNepali,
      chequeFormat,
      cleanNumber: normalized,
      error: null,
    };
  }, [numInput, currencyMode]);

  // ── Mode 2: Words -> Number Computation ──────────────────────────────────────
  const wordsResult = useMemo(() => {
    const raw = wordsInput.trim();
    if (!raw) return null;

    const parsed = nepaliWordsToNumber(raw, { currency: currencyMode });
    return parsed;
  }, [wordsInput, currencyMode]);

  // Quick presets for Mode 1
  const numberPresets = [
    { label: "1,000", val: "1000" },
    { label: "45,678", val: "45678" },
    { label: "1 Lakh (१ लाख)", val: "100000" },
    { label: "1.45 Lakh", val: "145000" },
    { label: "5.5 Lakh", val: "550000" },
    { label: "1 Crore (१ करोड)", val: "10000000" },
    { label: "Rs. 1,250.50", val: "1250.50" },
  ];

  // Quick presets for Mode 2 (Devanagari, Romanized Nepali, English)
  const wordPresets = [
    { label: "पैंतालीस हजार", val: "पैंतालीस हजार" },
    { label: "paitalis hajar", val: "paitalis hajar" },
    { label: "ek lakh", val: "ek lakh" },
  ];

  const handleSwap = () => {
    if (direction === "number-to-words") {
      if (numberResult && !numberResult.error) {
        // Strip "रुपैयाँ मात्र" to give clean words to the other side
        const cleanWords = (numberResult.nepaliWords ?? "")
          .replace(" रुपैयाँ मात्र", "")
          .replace(" रुपैयाँ", "")
          .replace(" मात्र", "")
          .trim();
        setWordsInput(cleanWords || numberResult.nepaliWords || "");
      }
      setDirection("words-to-number");
    } else {
      if (wordsResult && wordsResult.success && wordsResult.value !== undefined) {
        setNumInput(String(wordsResult.value));
      }
      setDirection("number-to-words");
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Real Website-Grade Mode Bar ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 rounded-2xl bg-[#FAFAF8] dark:bg-[#12162B] border border-[#E4E0D8] dark:border-[#222944] shadow-sm">
        {/* Segmented Control */}
        <div className="flex flex-1 p-1 rounded-xl bg-zinc-200/60 dark:bg-[#0A0D18] gap-1.5 border border-zinc-200/50 dark:border-zinc-800/60">
          <button
            type="button"
            onClick={() => setDirection("number-to-words")}
            className={`flex-1 py-2.5 px-3.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              direction === "number-to-words"
                ? "bg-white dark:bg-[#1E243D] text-zinc-900 dark:text-white shadow-sm border border-zinc-200/70 dark:border-zinc-700 font-extrabold"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-semibold"
            }`}
          >
            <Hash
              size={15}
              className={direction === "number-to-words" ? "text-[#DC2626]" : "text-zinc-400"}
            />
            <span>Number ➔ Words</span>
          </button>

          <button
            type="button"
            onClick={() => setDirection("words-to-number")}
            className={`flex-1 py-2.5 px-3.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              direction === "words-to-number"
                ? "bg-white dark:bg-[#1E243D] text-zinc-900 dark:text-white shadow-sm border border-zinc-200/70 dark:border-zinc-700 font-extrabold"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-semibold"
            }`}
          >
            <Languages
              size={15}
              className={direction === "words-to-number" ? "text-[#DC2626]" : "text-zinc-400"}
            />
            <span>Words ➔ Number</span>
          </button>
        </div>

        {/* Toolbar: Currency Mode + Swap Button */}
        <div className="flex items-center justify-between sm:justify-end gap-2 px-1 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setCurrencyMode(!currencyMode)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
              currencyMode
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold"
                : "bg-white dark:bg-[#1E243D] border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
            title="Toggle currency mode (adds 'रुपैयाँ मात्र' / 'Rupees Only' and paisa support)"
          >
            <Landmark size={14} className={currencyMode ? "text-emerald-500" : "text-zinc-400"} />
            <span>Currency: {currencyMode ? "रु (NPR Active)" : "Off"}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                currencyMode ? "bg-emerald-500 animate-pulse" : "bg-zinc-300 dark:bg-zinc-600"
              }`}
            />
          </button>

          <button
            type="button"
            onClick={handleSwap}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1E243D] text-zinc-700 dark:text-zinc-300 hover:text-[#DC2626] dark:hover:text-[#DC2626] hover:border-[#DC2626]/40 transition-all text-xs font-semibold cursor-pointer shadow-sm"
            title="Swap input and output mode"
          >
            <ArrowLeftRight size={14} />
            <span className="inline">Swap</span>
          </button>
        </div>
      </div>

      {/* ── MODE 1: NUMBER TO WORDS ────────────────────────────────────────── */}
      {direction === "number-to-words" && (
        <div className="space-y-6">
          {/* Input Card */}
          <div className="p-4 sm:p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="number-input-field"
                className="block text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5"
              >
                <Hash size={15} className="text-[#DC2626] shrink-0" />
                <span>NUMBER (अङ्क वा संख्या)</span>
              </label>
              <button
                type="button"
                onClick={() => setNumInput("")}
                className="text-xs font-semibold text-zinc-500 hover:text-[#DC2626] flex items-center gap-1 cursor-pointer shrink-0"
              >
                <RotateCcw size={12} /> Clear
              </button>
            </div>

            <div className="relative">
              {currencyMode && (
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400 select-none">
                  रु / Rs.
                </span>
              )}
              <input
                id="number-input-field"
                type="text"
                value={numInput}
                onChange={(e) => setNumInput(e.target.value)}
                placeholder="e.g. 45678 or ४५६७८ or 1250.50"
                className={`w-full ${currencyMode ? "pl-16 sm:pl-20" : "pl-4"} pr-4 py-3.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-extrabold text-xl focus:outline-none focus:ring-2 focus:ring-[#DC2626]/40`}
              />
            </div>

            {/* Formatted Digit Previews */}
            {numberResult && !numberResult.error && (
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium pt-1 text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-1.5 bg-[#FAFAF8] dark:bg-[#1E2338] px-3 py-1.5 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48]">
                  <span className="text-zinc-400">Nepali Digits:</span>
                  <span className="font-bold text-[#DC2626] font-mono">{numberResult.formattedNepali}</span>
                  <button
                    type="button"
                    onClick={() => triggerCopy("npDigits", numberResult.formattedNepali || "")}
                    className="ml-1 text-zinc-400 hover:text-zinc-800 dark:hover:text-white cursor-pointer"
                    title="Copy Devanagari Digits"
                  >
                    {copiedKey === "npDigits" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  </button>
                </div>
                <div className="flex items-center gap-1.5 bg-[#FAFAF8] dark:bg-[#1E2338] px-3 py-1.5 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48]">
                  <span className="text-zinc-400">Standard:</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">{numberResult.formattedArabic}</span>
                  <button
                    type="button"
                    onClick={() => triggerCopy("arDigits", numberResult.formattedArabic || "")}
                    className="ml-1 text-zinc-400 hover:text-zinc-800 dark:hover:text-white cursor-pointer"
                    title="Copy Standard Digits"
                  >
                    {copiedKey === "arDigits" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            )}

            {/* Presets */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-xs font-bold text-[#71717A] flex items-center gap-1">
                <Bookmark size={13} className="text-[#DC2626]" /> Examples:
              </span>
              {numberPresets.map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => setNumInput(p.val)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                    numInput === p.val
                      ? "border-[#DC2626] bg-[#DC2626]/10 text-[#DC2626] font-bold"
                      : "border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] hover:border-[#DC2626]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Display */}
          {numberResult?.error ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/30 space-y-3 shadow-xs">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    संख्या अमान्य छ (Invalid Number Format)
                  </div>
                  <div className="text-xs text-amber-800/85 dark:text-amber-300/85 leading-relaxed">
                    {numberResult.error}
                  </div>
                </div>
              </div>
            </div>
          ) : numberResult ? (
            <div className="space-y-4" aria-live="polite">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nepali Words Card */}
                <div className="p-4 sm:p-6 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                      <Languages size={14} className="text-[#DC2626]" /> Nepali Words (नेपाली शब्दमा)
                    </span>
                    <button
                      type="button"
                      onClick={() => triggerCopy("npWords", numberResult.nepaliWords || "")}
                      className="flex items-center gap-1 text-xs font-bold text-[#DC2626] hover:underline cursor-pointer"
                    >
                      {copiedKey === "npWords" ? <Check size={14} /> : <Copy size={14} />}
                      {copiedKey === "npWords" ? "Copied!" : "Copy Words"}
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-lg font-bold text-[#DC2626] min-h-[90px] flex items-center leading-relaxed select-all">
                    {numberResult.nepaliWords}
                  </div>
                </div>

                {/* English Words (Lakh/Crore) Card */}
                <div className="p-4 sm:p-6 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                      <FileText size={14} className="text-zinc-500" /> English Words (Lakh / Crore)
                    </span>
                    <button
                      type="button"
                      onClick={() => triggerCopy("enWords", numberResult.englishWords || "")}
                      className="flex items-center gap-1 text-xs font-bold text-[#DC2626] hover:underline cursor-pointer"
                    >
                      {copiedKey === "enWords" ? <Check size={14} /> : <Copy size={14} />}
                      {copiedKey === "enWords" ? "Copied!" : "Copy Words"}
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-base font-bold text-[#18181B] dark:text-[#F4F4F5] min-h-[90px] flex items-center leading-relaxed select-all">
                    {numberResult.englishWords}
                  </div>
                </div>
              </div>

              {/* Official Cheque / Voucher Format Preview Card */}
              {currencyMode && (
                <div className="p-4 rounded-2xl bg-white dark:bg-[#141829] border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-start sm:items-center gap-2.5">
                    <Landmark size={18} className="text-emerald-500 shrink-0 mt-0.5 sm:mt-0" />
                    <div>
                      <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        Banking Cheque &amp; Bill Format
                      </div>
                      <div className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                        {numberResult.chequeFormat}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerCopy("chequeFmt", numberResult.chequeFormat || "")}
                    className="self-end sm:self-center px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {copiedKey === "chequeFmt" ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedKey === "chequeFmt" ? "Copied!" : "Copy Cheque Text"}</span>
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* ── MODE 2: NEPALI WORDS TO NUMBER ─────────────────────────────────── */}
      {direction === "words-to-number" && (
        <div className="space-y-6">
          {/* Input Card */}
          <div className="p-4 sm:p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="words-input-field"
                className="block text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5"
              >
                <Languages size={15} className="text-[#DC2626] shrink-0" />
                <span>WORDS (नेपाली / अंग्रेजी शब्दमा)</span>
              </label>
              <button
                type="button"
                onClick={() => setWordsInput("")}
                className="text-xs font-semibold text-zinc-500 hover:text-[#DC2626] flex items-center gap-1 cursor-pointer shrink-0"
              >
                <RotateCcw size={12} /> Clear
              </button>
            </div>

            <textarea
              id="words-input-field"
              rows={3}
              value={wordsInput}
              onChange={(e) => setWordsInput(e.target.value)}
              placeholder="e.g. पैंतालीस हजार, paitalis hajar, ek lakh, forty five thousand..."
              className="w-full p-3.5 sm:p-4 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#DC2626]/40 leading-relaxed"
            />

            {/* Quick Examples */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-xs font-bold text-[#71717A] flex items-center gap-1 mr-1">
                <Bookmark size={12} className="text-[#DC2626]" /> Examples:
              </span>
              {wordPresets.map((wp) => (
                <button
                  key={wp.label}
                  type="button"
                  onClick={() => setWordsInput(wp.val)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    wordsInput === wp.val
                      ? "border-[#DC2626] bg-[#DC2626]/10 text-[#DC2626] font-bold"
                      : "border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] hover:border-[#DC2626]"
                  }`}
                >
                  {wp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Display */}
          {wordsResult && !wordsResult.success ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/30 space-y-3 shadow-xs">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    {wordsResult.error || "संख्या पहिचान हुन सकेन (Unable to Recognize Number)"}
                  </div>
                  {wordsResult.errorDetail && (
                    <div className="text-xs text-amber-800/85 dark:text-amber-300/85 leading-relaxed">
                      {wordsResult.errorDetail}
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Smart "Did you mean" primary chip */}
              {wordsResult.didYouMean && (
                <div className="p-3 rounded-xl bg-amber-500/15 dark:bg-amber-950/40 border border-amber-500/40 flex flex-wrap items-center justify-between gap-2.5 ml-0 sm:ml-7">
                  <div className="text-xs text-amber-950 dark:text-amber-200">
                    <span className="font-bold">के तपाईंको भनाइ: </span>
                    <span className="font-extrabold text-[#DC2626] text-sm underline decoration-dotted underline-offset-2">
                      {wordsResult.didYouMean}
                    </span>{" "}
                    हो?
                  </div>
                  <button
                    type="button"
                    onClick={() => setWordsInput(wordsResult.didYouMean!)}
                    className="px-3 py-1.5 rounded-lg bg-[#DC2626] text-white text-xs font-bold hover:bg-[#b91c1c] active:scale-95 transition-all shadow-sm flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <span>सच्याउनुहोस् (Apply &amp; Convert)</span>
                  </button>
                </div>
              )}
            </div>
          ) : wordsResult && wordsResult.success ? (
            <div className="space-y-4" aria-live="polite">
              {/* Primary Numbers Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Standard Arabic Digits */}
                <div className="p-4 sm:p-6 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
                      Standard Arabic Number
                    </span>
                    <button
                      type="button"
                      onClick={() => triggerCopy("resAr", wordsResult.formattedArabic || "")}
                      className="flex items-center gap-1 text-xs font-bold text-[#DC2626] hover:underline cursor-pointer"
                    >
                      {copiedKey === "resAr" ? <Check size={14} /> : <Copy size={14} />}
                      {copiedKey === "resAr" ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white min-h-[80px] sm:min-h-[90px] flex items-center font-mono select-all">
                    {wordsResult.isCurrency ? "Rs. " : ""}
                    {wordsResult.formattedArabic}
                  </div>
                </div>

                {/* Devanagari Digits */}
                <div className="p-4 sm:p-6 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
                      Nepali Digits (नेपाली अङ्क)
                    </span>
                    <button
                      type="button"
                      onClick={() => triggerCopy("resNp", wordsResult.formattedNepali || "")}
                      className="flex items-center gap-1 text-xs font-bold text-[#DC2626] hover:underline cursor-pointer"
                    >
                      {copiedKey === "resNp" ? <Check size={14} /> : <Copy size={14} />}
                      {copiedKey === "resNp" ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-3xl font-black text-[#DC2626] min-h-[90px] flex items-center font-mono select-all">
                    {wordsResult.isCurrency ? "रु " : ""}
                    {wordsResult.formattedNepali}
                  </div>
                </div>
              </div>

              {/* Canonical Words Preview from Converted Number */}
              {wordsResult.nepaliWords && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-2 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      <span>Devanagari Words</span>
                      <button
                        type="button"
                        onClick={() => triggerCopy("convNpWords", wordsResult.nepaliWords || "")}
                        className="text-[#DC2626] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === "convNpWords" ? <Check size={12} /> : <Copy size={12} />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <div className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                      {wordsResult.nepaliWords}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-2 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      <span>English Words (Lakh/Crore)</span>
                      <button
                        type="button"
                        onClick={() => triggerCopy("convEnWords", wordsResult.englishWords || "")}
                        className="text-[#DC2626] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === "convEnWords" ? <Check size={12} /> : <Copy size={12} />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <div className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                      {wordsResult.englishWords}
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Voucher & Cheque Preview */}
              {currencyMode && wordsResult.chequeFormat && (
                <div className="p-4 rounded-2xl bg-white dark:bg-[#141829] border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-start sm:items-center gap-2.5">
                    <Landmark size={18} className="text-emerald-500 shrink-0 mt-0.5 sm:mt-0" />
                    <div>
                      <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        Cheque / Bank Voucher Standard
                      </div>
                      <div className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                        {wordsResult.chequeFormat}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerCopy("wordsCheque", wordsResult.chequeFormat || "")}
                    className="self-end sm:self-center px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {copiedKey === "wordsCheque" ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedKey === "wordsCheque" ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* South Asian Scale Reference Grid */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-3 shadow-sm">
        <div className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Coins size={14} className="text-[#DC2626]" /> Nepali / South Asian Number Scale Hierarchy
          </span>
          <span className="text-[10px] uppercase tracking-wider text-[#A1A1AA]">Standard Grouping</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
            <div className="text-[11px] font-bold text-[#DC2626]">1 Hajar (हजार)</div>
            <div className="font-mono text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">1,000 (१,०००)</div>
            <div className="text-[10px] text-[#71717A]">One Thousand</div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
            <div className="text-[11px] font-bold text-[#DC2626]">1 Lakh (लाख)</div>
            <div className="font-mono text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">1,00,000 (१,००,०००)</div>
            <div className="text-[10px] text-[#71717A]">100 Thousand</div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
            <div className="text-[11px] font-bold text-[#DC2626]">1 Crore (करोड)</div>
            <div className="font-mono text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">1,00,00,000 (१,००,००,०००)</div>
            <div className="text-[10px] text-[#71717A]">10 Million</div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
            <div className="text-[11px] font-bold text-[#DC2626]">1 Arab (अरब)</div>
            <div className="font-mono text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">1,00,00,00,000</div>
            <div className="text-[10px] text-[#71717A]">1 Billion (1,000M)</div>
          </div>
        </div>
      </div>

      {/* Cheque / Banking & Privacy Standard Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-xs text-[#71717A] flex items-start gap-2">
          <Info size={16} className="text-[#DC2626] shrink-0 mt-0.5" />
          <span>
            <strong>Bank Cheque &amp; Invoicing:</strong> Standard format in Nepal uses Lakh/Crore words ending with <em>"रुपैयाँ मात्र"</em> (or <em>"Rupees ... Only"</em>) to prevent unauthorized alteration.
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-xs text-[#71717A] flex items-start gap-2">
          <ShieldCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" />
          <span>
            <strong>100% Private &amp; In-Browser:</strong> Conversion occurs completely on your device using client-side JavaScript. No numbers or financial figures are sent to any external server.
          </span>
        </div>
      </div>

      {/* Related Cross Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <CalculatorCrossLink
          icon={Keyboard}
          title="Nepali Unicode Typing"
          desc="Type in Romanized English and convert to Devanagari"
          href="/tools/nepal/nepali-unicode"
        />
        <CalculatorCrossLink
          icon={CalendarDays}
          title="Nepali Date Converter (BS ↔ AD)"
          desc="Bikram Sambat to Gregorian calendar conversion"
          href="/tools/nepal/nepali-date-converter"
        />
        <CalculatorCrossLink
          icon={Hash}
          title="Nepal Land Converter"
          desc="Convert Ropani, Aana, Paisa, Daam, Bigha, Kattha"
          href="/tools/nepal/land-converter"
        />
        <CalculatorCrossLink
          icon={Cake}
          title="Age Calculator (BS + AD)"
          desc="Calculate exact age using BS or AD birthdates"
          href="/tools/everyday/age-calculator"
        />
      </div>
    </div>
  );
}
