"use client";

import { useState, useEffect } from "react";
import { Keyboard, Copy, Check, Download, Info, ArrowRightLeft, FileText } from "lucide-react";
import AnimatedTrashIcon, { AnimatedTrashButton } from "@/components/shared/AnimatedTrashIcon";

// ── ROMANIZED PHONETIC TRANSLITERATION ENGINE ──────────────────────────────────

const ROMAN_DICTIONARY: Record<string, string> = {
  k: "के",
  ke: "के",
  ko: "को",
  ka: "का",
  ki: "की",
  le: "ले",
  lai: "लाई",
  ma: "म",
  ra: "र",
  ho: "हो",
  xa: "छ",
  chha: "छ",
  cha: "छ",
  xeu: "छौ",
  xau: "छौ",
  chhau: "छौ",
  xai: "छै",
  chhai: "छै",
  xaw: "छौँ",
  xain: "छैन",
  chhain: "छैन",
  gardai: "गर्दै",
  garya: "गरेको",
  gareko: "गरेको",
  karuna: "करुणा",
  sanchai: "सन्चै",
  sanchhai: "सन्चै",
  humm: "हुम्म",
  hum: "हुम",
  namaste: "नमस्ते",
  nepal: "नेपाल",
  nepali: "नेपाली",
  dhanyabad: "धन्यवाद",
  dhanyavaad: "धन्यवाद",
  sajilo: "सजिलो",
  ramro: "राम्रो",
  mero: "मेरो",
  naam: "नाम",
  nam: "नाम",
  timro: "तिम्रो",
  kasto: "कस्तो",
  kasta: "कस्ता",
  kasti: "कस्ती",
  hijo: "हिजो",
  aaja: "आज",
  bholi: "भोलि",
  tapai: "तपाईं",
  tapaiko: "तपाईंको",
  tapain: "तपाईं",
  hajur: "हजुर",
  bhai: "भाइ",
  didi: "दिदी",
  daju: "दाजु",
  buba: "बुबा",
  ama: "आमा",
  sathi: "साथी",
  bhayo: "भयो",
  vayo: "भयो",
  chaahin: "चाहिँ",
  bhaneko: "भनेको",
  pani: "पनि",
  paisa: "पैसा",
  desh: "देश",
  ghar: "घर",
  kura: "कुरा",
  bata: "बाट",
  bhitra: "भित्र",
  baahira: "बाहिर",
  solti: "सोल्टी",
};

// Consonants (mapped to halant Devanagari form)
const CONSONANT_MAP: [string, string][] = [
  ["ksha", "क्ष्"], ["ksh", "क्ष्"], ["chha", "छ्"], ["chh", "छ्"],
  ["gya", "ज्ञ्"], ["tra", "त्र्"], ["kh", "ख्"], ["gh", "घ्"],
  ["ng", "ङ्"], ["ch", "च्"], ["jh", "झ्"], ["th", "थ्"],
  ["dh", "ध्"], ["ph", "फ्"], ["bh", "भ्"], ["sh", "श्"],
  ["shh", "ष्"], ["Th", "ठ्"], ["Dh", "ढ्"], ["tt", "त्"],
  ["dd", "द्"], ["nh", "न्ह्"], ["mh", "म्ह्"], ["rh", "र्ह्"],
  ["lh", "ल्ह्"], ["k", "क्"], ["g", "ग्"], ["c", "च्"],
  ["j", "ज्"], ["t", "त्"], ["d", "द्"], ["n", "न्"],
  ["p", "प्"], ["f", "फ्"], ["b", "ब्"], ["m", "म्"],
  ["y", "य्"], ["r", "र्"], ["l", "ल्"], ["w", "व्"],
  ["v", "व्"], ["s", "स्"], ["h", "ह्"], ["x", "छ्"],
  ["T", "ट्"], ["D", "ड्"], ["N", "ण्"],
];

// Vowel Matras (applied to consonants)
const VOWEL_MATRA_MAP: [string, string][] = [
  ["aau", "ाऊ"], ["aai", "ाई"], ["aaw", "ाउँ"], ["aae", "ाए"],
  ["aa", "ा"], ["ai", "ै"], ["au", "ौ"], ["eu", "ौ"], ["ew", "ौँ"],
  ["ee", "ी"], ["oo", "ू"], ["ou", "ौ"], ["ri", "ृ"],
  ["a", ""], ["i", "ि"], ["u", "ु"], ["e", "े"], ["o", "ो"],
];

// Independent Vowels (start of word / after another vowel)
const INDEPENDENT_VOWEL_MAP: [string, string][] = [
  ["aau", "आऊ"], ["aai", "आई"], ["aaw", "आउँ"], ["aae", "आए"],
  ["aa", "आ"], ["ai", "ऐ"], ["au", "औ"], ["eu", "औ"],
  ["ee", "ई"], ["oo", "ऊ"], ["ri", "ऋ"],
  ["a", "अ"], ["i", "इ"], ["u", "उ"], ["e", "ए"], ["o", "ओ"],
];

const DIGITS_MAP: Record<string, string> = {
  "0": "०", "1": "१", "2": "२", "3": "३", "4": "४",
  "5": "५", "6": "६", "7": "७", "8": "८", "9": "९",
};

function transliterateWord(word: string): string {
  const lower = word.toLowerCase();
  if (ROMAN_DICTIONARY[lower]) {
    return ROMAN_DICTIONARY[lower];
  }

  let i = 0;
  let result = "";

  while (i < word.length) {
    const char = word[i];

    // Numbers & punctuation
    if (DIGITS_MAP[char]) {
      result += DIGITS_MAP[char];
      i++;
      continue;
    }

    if (/[^a-zA-Z]/.test(char)) {
      result += char;
      i++;
      continue;
    }

    // Try matching consonant
    let matchedConsonant: string | null = null;
    let consLen = 0;

    for (const [pattern, dev] of CONSONANT_MAP) {
      if (word.substring(i).toLowerCase().startsWith(pattern)) {
        matchedConsonant = dev;
        consLen = pattern.length;
        break;
      }
    }

    if (matchedConsonant) {
      // Check if followed by vowel
      const remainingAfterCons = word.substring(i + consLen).toLowerCase();
      let matchedMatra: string | null = null;
      let matraLen = 0;

      for (const [vPattern, matra] of VOWEL_MATRA_MAP) {
        if (remainingAfterCons.startsWith(vPattern)) {
          matchedMatra = matra;
          matraLen = vPattern.length;
          break;
        }
      }

      if (matchedMatra !== null) {
        // Strip halant '्' from consonant and attach matra
        const base = matchedConsonant.slice(0, -1);
        result += base + matchedMatra;
        i += consLen + matraLen;
      } else {
        // No vowel matra following.
        // If at end of word and single consonant, in Nepali typing we implicitly drop halant
        const isEnd = i + consLen >= word.length;
        const nextIsSpaceOrPunct = isEnd || /[^a-zA-Z]/.test(word[i + consLen]);

        if (nextIsSpaceOrPunct && consLen === 1 && word[i].toLowerCase() !== "q") {
          result += matchedConsonant.slice(0, -1);
        } else {
          result += matchedConsonant;
        }
        i += consLen;
      }
      continue;
    }

    // Try matching independent vowel
    let matchedVowel: string | null = null;
    let vowelLen = 0;

    for (const [vPattern, dev] of INDEPENDENT_VOWEL_MAP) {
      if (word.substring(i).toLowerCase().startsWith(vPattern)) {
        matchedVowel = dev;
        vowelLen = vPattern.length;
        break;
      }
    }

    if (matchedVowel) {
      result += matchedVowel;
      i += vowelLen;
      continue;
    }

    // Fallback single character
    result += char;
    i++;
  }

  return result;
}

export function romanToNepaliPhonetic(text: string): string {
  if (!text) return "";
  // Split keeping spaces, line breaks, and punctuation intact
  const tokens = text.split(/(\s+|[^\w\s])/g);
  return tokens.map((token) => {
    if (!token || /^\s+$/.test(token) || /^[^\w\s]+$/.test(token)) {
      return token;
    }
    return transliterateWord(token);
  }).join("");
}

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { preetiToUnicode, unicodeToPreeti } from "@/lib/converters/preeti-converter";

export { preetiToUnicode, unicodeToPreeti };

// ── COMPONENT IMPLEMENTATION ───────────────────────────────────────────────

export default function NepaliUnicodeTool() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const modeParam = searchParams.get("mode");
  const initialMode: "roman" | "preetiToUni" | "uniToPreeti" =
    modeParam === "preetiToUni" || modeParam === "uniToPreeti" ? modeParam : "roman";

  const [mode, setMode] = useState<"roman" | "preetiToUni" | "uniToPreeti">(initialMode);
  const [inputText, setInputText] = useState<string>(() => {
    if (initialMode === "preetiToUni") return "sD: g]kfn k|Llt";
    if (initialMode === "uniToPreeti") return "नेपाल प्रीति युनिकोड";
    return "namaste! sajilotools nepal ko unicode converter ma swagatam chha. yaha romanized nepali ma type garnuhos (eg: mero nepal ramro chha).";
  });
  const [copied, setCopied] = useState<boolean>(false);

  // Sync mode state if URL mode searchParam changes
  useEffect(() => {
    const currentParam = searchParams.get("mode");
    if (currentParam === "preetiToUni" && mode !== "preetiToUni") {
      setMode("preetiToUni");
      setInputText("sD: g]kfn k|Llt");
    } else if (currentParam === "uniToPreeti" && mode !== "uniToPreeti") {
      setMode("uniToPreeti");
      setInputText("नेपाल प्रीति युनिकोड");
    } else if ((!currentParam || currentParam === "roman") && mode !== "roman" && currentParam !== null) {
      setMode("roman");
    }
  }, [searchParams]);

  // Compute output based on selected conversion mode
  let unicodeOutput = "";
  if (mode === "roman") {
    unicodeOutput = romanToNepaliPhonetic(inputText);
  } else if (mode === "preetiToUni") {
    unicodeOutput = preetiToUnicode(inputText);
  } else {
    unicodeOutput = unicodeToPreeti(inputText);
  }

  const wordCount = unicodeOutput.trim() ? unicodeOutput.trim().split(/\s+/).length : 0;
  const charCount = unicodeOutput.length;

  const copyUnicode = () => {
    if (!unicodeOutput) return;
    navigator.clipboard.writeText(unicodeOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadTxt = () => {
    if (!unicodeOutput) return;
    const blob = new Blob([unicodeOutput], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nepali_${mode}_text.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const romanPhrases = [
    { label: "k gardai xeu", text: "sajilo tools nepal ma swagat chha" },
    { label: "namaste nepal", text: "namaste mero nepal ramro chha" },
    { label: "kasto chha", text: "kasto chha sanchai ho" },
    { label: "dhanyabad", text: "dherai dherai dhanyabad tapailai" },
    { label: "sajilo tools", text: "sajilotools nepal ko ramro platform ho" },
  ];

  const preetiPhrases = [
    { label: "नेपाल", text: "g]kfn" },
    { label: "प्रीति", text: "k|Llt" },
    { label: "नमस्ते", text: "gd:t]" },
    { label: "काठमाडौं", text: "sf7df8f}+" },
    { label: "शुभकामना", text: "z'esfdgf" },
    { label: "विद्यार्थी", text: "ljBfyL{" },
  ];

  const unicodePhrases = [
    { label: "नेपाल", text: "नेपाल" },
    { label: "प्रीति", text: "प्रीति" },
    { label: "नमस्ते", text: "नमस्ते" },
    { label: "काठमाडौं", text: "काठमाडौं" },
    { label: "शुभकामना", text: "शुभकामना" },
    { label: "विद्यार्थी", text: "विद्यार्थी" },
  ];

  const currentPhrases =
    mode === "roman"
      ? romanPhrases
      : mode === "preetiToUni"
        ? preetiPhrases
        : unicodePhrases;

  const virtualKeys = ["अ", "आ", "इ", "ई", "उ", "ऊ", "ऋ", "ए", "ऐ", "ओ", "औ", "क", "ख", "ग", "घ", "ङ", "च", "छ", "ज", "झ", "ञ", "ट", "ठ", "ड", "ढ", "ण", "त", "थ", "द", "ध", "न", "प", "फ", "ब", "भ", "म", "य", "र", "ल", "व", "श", "ष", "स", "ह", "क्ष", "त्र", "ज्ञ", "ा", "ि", "ी", "ु", "ू", "े", "ै", "ो", "ौ", "ं", "ँ", "ः", "्", "।"];

  const switchMode = (newMode: "roman" | "preetiToUni" | "uniToPreeti", sampleText: string) => {
    setMode(newMode);
    setInputText(sampleText);
    try {
      const url = newMode === "roman" ? pathname : `${pathname}?mode=${newMode}`;
      router.replace(url, { scroll: false });
    } catch { }
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-[#FAFAF8] dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338]">
        <button
          onClick={() => switchMode("roman", "sajilo tools nepal ma swagat chha")}
          className={`py-2 px-2 sm:py-2.5 sm:px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-center ${mode === "roman"
            ? "bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] shadow-sm"
            : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-black/5 dark:hover:bg-white/5"
            }`}
        >
          <Keyboard size={14} className="shrink-0 hidden xs:inline" />
          <span className="truncate">Romanized</span>
          <span className="hidden lg:inline font-normal opacity-80">(रोमन)</span>
        </button>

        <button
          onClick={() => switchMode("preetiToUni", "sD: g]kfn k|Llt")}
          className={`py-2 px-2 sm:py-2.5 sm:px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-center ${mode === "preetiToUni"
            ? "bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] shadow-sm"
            : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-black/5 dark:hover:bg-white/5"
            }`}
        >
          <ArrowRightLeft size={14} className="shrink-0 hidden xs:inline" />
          <span className="truncate">Preeti ➔ Uni</span>
          <span className="hidden lg:inline font-normal opacity-80">(प्रिती)</span>
        </button>

        <button
          onClick={() => switchMode("uniToPreeti", "नेपाल प्रीति युनिकोड")}
          className={`py-2 px-2 sm:py-2.5 sm:px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-center ${mode === "uniToPreeti"
            ? "bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] shadow-sm"
            : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-black/5 dark:hover:bg-white/5"
            }`}
        >
          <FileText size={14} className="shrink-0 hidden xs:inline" />
          <span className="truncate">Uni ➔ Preeti</span>
          <span className="hidden lg:inline font-normal opacity-80">(युनिकोड)</span>
        </button>
      </div>

      {/* Input / Output Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
              <Keyboard size={14} className="text-[#F5A623]" />
              {mode === "roman"
                ? "Romanized English Input"
                : mode === "preetiToUni"
                  ? "Preeti Font Text Input"
                  : "Devanagari Unicode Input"}
            </label>
            <span className="text-[10px] text-[#A1A1AA]">
              {mode === "roman"
                ? "e.g. sajilo tools nepal ma swagat chha"
                : mode === "preetiToUni"
                  ? "e.g. sD: g]kfn k|Llt"
                  : "e.g. नेपाल"}
            </span>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              mode === "roman"
                ? "Type in Romanized Nepali (e.g., sajilo tools nepal ma swagat chha)..."
                : mode === "preetiToUni"
                  ? "Paste traditional Preeti font text here..."
                  : "Type Devanagari Unicode text here..."
            }
            className="w-full h-44 sm:h-64 p-4 rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40 resize-none font-sans text-sm leading-relaxed shadow-xs"
          />
        </div>

        {/* Output Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={14} className="text-emerald-500" />
              {mode === "uniToPreeti" ? "Preeti Font Output" : "Nepali Devanagari Unicode Output"}
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={downloadTxt}
                disabled={!unicodeOutput}
                className="flex items-center gap-1 text-xs font-semibold text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] disabled:opacity-40"
              >
                <Download size={12} /> .txt
              </button>
              <button
                onClick={copyUnicode}
                disabled={!unicodeOutput}
                className="flex items-center gap-1 text-xs font-bold text-[#F5A623] hover:underline disabled:opacity-40"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          <textarea
            value={unicodeOutput}
            readOnly
            placeholder="नेपाली नतिजा यहाँ देखा पर्नेछ..."
            className="w-full h-44 sm:h-64 p-4 rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] placeholder:text-[#A1A1AA] resize-none font-devanagari text-base leading-relaxed shadow-xs"
          />
        </div>
      </div>

      {/* Stats & Quick Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338]">
        <div className="flex items-center gap-4 text-xs font-semibold text-[#71717A]">
          <span>Words: <strong className="text-[#18181B] dark:text-[#F4F4F5]">{wordCount}</strong></span>
          <span>Characters: <strong className="text-[#18181B] dark:text-[#F4F4F5]">{charCount}</strong></span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-[#71717A]">Try Phrases:</span>
          {currentPhrases.map((q) => (
            <button
              key={q.label}
              onClick={() => setInputText(q.text)}
              className="px-2.5 py-1 rounded-lg border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] hover:border-[#F5A623] transition-colors"
            >
              {q.label}
            </button>
          ))}
          <AnimatedTrashButton
            onDelete={() => setInputText("")}
            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Clear Input"
            iconSize={14}
          />
        </div>
      </div>

      {/* Virtual Quick Keyboard helper */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-3">
        <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider block">Quick Devanagari Character Inserter</span>
        <div className="flex flex-wrap gap-1">
          {virtualKeys.map((vk) => (
            <button
              key={vk}
              onClick={() => setInputText((prev) => prev + vk)}
              className="w-8 h-8 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] hover:bg-[#F5A623] hover:text-[#0C0F1E] transition-colors shadow-xs"
            >
              {vk}
            </button>
          ))}
        </div>
      </div>

      {/* Help Banner */}
      <div className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-xs text-[#71717A] flex items-start gap-2">
        <Info size={16} className="text-[#F5A623] shrink-0 mt-0.5" />
        <span>
          <strong>How it works:</strong> Type in Romanized Nepali letters (e.g. <code>sajilo tools nepal ma swagat chha</code>) and get instant Nepali Devanagari Unicode output (<code>सजिलो तूल्स नेपाल म स्वगत छ</code>) ready to copy and use in Word, Facebook, or Nepalese government forms. Supports Preeti font ↔ Unicode conversions seamlessly!
        </span>
      </div>
    </div>
  );
}
