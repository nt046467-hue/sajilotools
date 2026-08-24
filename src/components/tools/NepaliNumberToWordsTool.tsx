"use client";

import { useState, useMemo } from "react";
import { FileText, Copy, Check, Info, Coins } from "lucide-react";

// Nepali digit words
const NEPALI_UNITS = ["", "एक", "दुई", "तीन", "चार", "पाँच", "छ", "सात", "आठ", "नौ"];
const NEPALI_TEENS = [
  "दस", "एघार", "बारह", "ते्रह", "चौध", "पन्ध्र", "सोह्र", "सत्र", "अठार", "उन्नाइस",
  "बीस", "एक्काइस", "बाइस", "ताइस", "चौबीस", "पच्चिस", "छब्बिस", "सत्ताइस", "अठ्ठाइस", "उनन्तीस",
  "तीस", "एकतीस", "बत्तीस", "तैंतीस", "चौंतीस", "पैंतीस", "छत्तीस", "सैंतीस", "अड्तीस", "उनन्चालीस",
  "चालीस", "एकचालीस", "बयालीस", "त्रिचालीस", "चौवालिस", "पैंतालीस", "छयालीस", "सत्चालिस", "अठचालीस", "उनन्चास",
  "पचास", "एकान्न", "बाउन्न", "त्रिपन्न", "चौन्न", "पचपन्न", "छप्पन्न", "सन्तान्न", "अन्ठाउन्न", "उनन्साठ्ठी",
  "साठ्ठी", "एकसठ्ठी", "बायसठ्ठी", "त्रिसठ्ठी", "चौंसठ्ठी", "पैंसठ्ठी", "छ्यासठ्ठी", "सतसठ्ठी", "अठसठ्ठी", "उनन्सत्तरी",
  "सत्तरी", "एकहत्तर", "बहत्तर", "त्रिहत्तर", "चौहत्तर", "पचहत्तर", "छ्याहत्तर", "सतहत्तर", "अठहत्तर", "उनासी",
  "असी", "एकासी", "बयासी", "त्रिरासी", "चौरासी", "पचासी", "छ्यासी", "सतासी", "अठासी", "उनान्नब्बे",
  "नब्बे", "एकानब्बे", "बयानब्बे", "त्रियानब्बे", "चौरानब्बे", "पञ्चानब्बे", "छ्यानब्बे", "सन्तानब्बे", "अन्ठानब्बे", "उनन्सय"
];

function twoDigitsToNepaliWord(num: number): string {
  if (num < 10) return NEPALI_UNITS[num];
  if (num < 100) return NEPALI_TEENS[num - 10];
  return "";
}

function numberToNepaliWords(num: number): string {
  if (num === 0) return "शून्य रुपैयाँ मात्र";
  if (isNaN(num) || num < 0) return "अमान्य अङ्क (Invalid Number)";

  let n = Math.floor(num);
  let result = "";

  // Arab (10^9 = 1,00,00,00,000)
  if (n >= 1000000000) {
    const arab = Math.floor(n / 1000000000);
    result += twoDigitsToNepaliWord(arab) + " अरब ";
    n %= 1000000000;
  }

  // Crore (10^7 = 1,00,00,000)
  if (n >= 10000000) {
    const crore = Math.floor(n / 10000000);
    result += twoDigitsToNepaliWord(crore) + " करोड ";
    n %= 10000000;
  }

  // Lakh (10^5 = 1,00,000)
  if (n >= 100000) {
    const lakh = Math.floor(n / 100000);
    result += twoDigitsToNepaliWord(lakh) + " लाख ";
    n %= 100000;
  }

  // Hajar (1,000)
  if (n >= 1000) {
    const hajar = Math.floor(n / 1000);
    result += twoDigitsToNepaliWord(hajar) + " हजार ";
    n %= 1000;
  }

  // Say (100)
  if (n >= 100) {
    const say = Math.floor(n / 100);
    result += NEPALI_UNITS[say] + " सय ";
    n %= 100;
  }

  // Remaining 1-99
  if (n > 0) {
    result += twoDigitsToNepaliWord(n) + " ";
  }

  return result.trim() + " रुपैयाँ मात्र";
}

// English words converter (Lakh/Crore system)
function numberToEnglishWords(num: number): string {
  if (num === 0) return "Zero Rupees Only";
  if (isNaN(num) || num < 0) return "Invalid Number";

  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function getTwoDigits(n: number): string {
    if (n < 20) return units[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? " " + units[n % 10] : "");
  }

  let n = Math.floor(num);
  let res = "";

  if (n >= 10000000) {
    const crore = Math.floor(n / 10000000);
    res += getTwoDigits(crore) + " Crore ";
    n %= 10000000;
  }

  if (n >= 100000) {
    const lakh = Math.floor(n / 100000);
    res += getTwoDigits(lakh) + " Lakh ";
    n %= 100000;
  }

  if (n >= 1000) {
    const thousand = Math.floor(n / 1000);
    res += getTwoDigits(thousand) + " Thousand ";
    n %= 1000;
  }

  if (n >= 100) {
    const hundred = Math.floor(n / 100);
    res += units[hundred] + " Hundred ";
    n %= 100;
  }

  if (n > 0) {
    res += getTwoDigits(n) + " ";
  }

  return res.trim() + " Rupees Only";
}

export default function NepaliNumberToWordsTool() {
  const [numAmount, setNumAmount] = useState<number>(45678);
  const [copiedNp, setCopiedNp] = useState<boolean>(false);
  const [copiedEn, setCopiedEn] = useState<boolean>(false);

  const nepaliWords = useMemo(() => numberToNepaliWords(numAmount), [numAmount]);
  const englishWords = useMemo(() => numberToEnglishWords(numAmount), [numAmount]);

  const copyNepali = () => {
    navigator.clipboard.writeText(nepaliWords);
    setCopiedNp(true);
    setTimeout(() => setCopiedNp(false), 1500);
  };

  const copyEnglish = () => {
    navigator.clipboard.writeText(englishWords);
    setCopiedEn(true);
    setTimeout(() => setCopiedEn(false), 1500);
  };

  const presets = [1000, 5000, 25000, 50000, 100000, 145000, 500000, 1500000];

  return (
    <div className="space-y-6">
      {/* Input Number Card */}
      <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-4">
        <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
          <Coins size={16} className="text-[#DC2626]" /> Enter Numeric Amount (संख्या राख्नुहोस्)
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#A1A1AA] text-base">
            रु
          </span>
          <input
            type="number"
            min={0}
            value={numAmount || ""}
            onChange={(e) => setNumAmount(Number(e.target.value))}
            placeholder="e.g. 145000"
            className="w-full pl-9 pr-4 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-extrabold text-xl focus:outline-none focus:ring-2 focus:ring-[#DC2626]/40"
          />
        </div>

        {/* Quick presets */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-xs font-bold text-[#71717A]">Quick Examples:</span>
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => setNumAmount(p)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                numAmount === p
                  ? "border-[#DC2626] bg-[#DC2626]/10 text-[#DC2626] font-bold"
                  : "border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] hover:border-[#DC2626]"
              }`}
            >
              Rs. {p.toLocaleString("en-IN")} {p === 145000 ? "(1.45L)" : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Words Output Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nepali Words */}
        <div className="p-6 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
              Nepali Devanagari Words (नेपाली अक्षरमा)
            </span>
            <button
              onClick={copyNepali}
              className="flex items-center gap-1 text-xs font-bold text-[#DC2626] hover:underline"
            >
              {copiedNp ? <Check size={14} /> : <Copy size={14} />}
              {copiedNp ? "Copied!" : "Copy"}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-lg font-bold text-[#DC2626] min-h-[90px] flex items-center leading-relaxed">
            {nepaliWords}
          </div>
        </div>

        {/* English Words (Lakh/Crore system) */}
        <div className="p-6 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
              English Words (Lakh / Crore System)
            </span>
            <button
              onClick={copyEnglish}
              className="flex items-center gap-1 text-xs font-bold text-[#DC2626] hover:underline"
            >
              {copiedEn ? <Check size={14} /> : <Copy size={14} />}
              {copiedEn ? "Copied!" : "Copy"}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-base font-bold text-[#18181B] dark:text-[#F4F4F5] min-h-[90px] flex items-center leading-relaxed">
            {englishWords}
          </div>
        </div>
      </div>

      {/* Nepali Numbering System Denominations Reference Table */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-3">
        <div className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] flex items-center justify-between">
          <span>Nepali Number Scale &amp; International Equivalents</span>
          <span className="text-[10px] uppercase tracking-wider text-[#A1A1AA]">South Asian Grouping</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
            <div className="text-[11px] font-bold text-[#DC2626]">1 Hajar (हजार)</div>
            <div className="font-mono text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5]">1,000 (१,०००)</div>
            <div className="text-[10px] text-[#71717A]">One Thousand</div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
            <div className="text-[11px] font-bold text-[#DC2626]">1 Lakh (लाख)</div>
            <div className="font-mono text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5]">1,00,000 (१,००,०००)</div>
            <div className="text-[10px] text-[#71717A]">100 Thousand</div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
            <div className="text-[11px] font-bold text-[#DC2626]">1 Crore (करोड)</div>
            <div className="font-mono text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5]">1,00,00,000 (१,००,००,०००)</div>
            <div className="text-[10px] text-[#71717A]">10 Million</div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
            <div className="text-[11px] font-bold text-[#DC2626]">1 Arab (अरब)</div>
            <div className="font-mono text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5]">1,00,00,00,000</div>
            <div className="text-[10px] text-[#71717A]">1 Billion (1,000M)</div>
          </div>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-xs text-[#71717A] flex items-start gap-2">
        <Info size={16} className="text-[#DC2626] shrink-0 mt-0.5" />
        <span>
          <strong>Cheque &amp; Invoicing Standard:</strong> Standard banking format in Nepal uses Lakh/Crore naming with <em>"Rupees ... Only"</em> and <em>"रुपैयाँ मात्र"</em> suffixes.
        </span>
      </div>
    </div>
  );
}
