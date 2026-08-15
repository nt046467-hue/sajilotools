"use client";

import { useState } from "react";
import { Keyboard, Copy, Check, Download, Trash2, Info, ArrowRightLeft, FileText } from "lucide-react";

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

// ── PREETI TO UNICODE MAP ──────────────────────────────────────────────────

const PREETI_MAP: Record<string, string> = {
  "~": "ञ्", "`": "ञ", "!": "ज्ञ", "@": "द्द", "#": "घ्", "$": "द्ध", "%": "छ्",
  "^": "ट्ठ", "&": "न्न्", "*": "क्र", "(": "द्द", ")": "ह्न", "-": "ः", "_": "ट्ठ",
  "=": "्र", "+": "ं", "q": "त्र", "w": "ध", "e": "भ", "r": "च", "t": "त", "y": "थ",
  "u": "ग", "i": "ष", "o": "द", "p": "ह", "[": "८", "]": "९", "\\": "्", "Q": "त्त",
  "W": "ध", "E": "भ", "R": "च्", "T": "त्", "Y": "ठ", "U": "ऊ", "I": "क्ष", "O": "इ",
  "P": "ए", "{": "ट", "}": "ठ", "|": "्र", "a": "म", "s": "क", "d": "म", "f": "ा",
  "g": "न", "h": "ज", "j": "व", "k": "प", "l": "ि", ";": "स", "'": "ु", "A": "ा",
  "S": "क", "D": "अ", "F": "ँ", "G": "ग", "H": "झ", "J": "व", "K": "फ", "L": "ी",
  ":": "स्", '"': "ू", "z": "श", "x": "ह", "c": "अ", "v": "ख", "b": "न", "n": "द",
  "m": "प", ",": "उ", ".": "।", "/": "र", "Z": "ञ", "X": "ह", "C": "ऋ", "V": "ॐ",
  "B": "भ", "N": "ण", "M": "म्", "<": "न्", ">": "श्र", "?": "रु",
  "0": "०", "1": "१", "2": "२", "3": "३", "4": "४", "5": "५", "6": "६", "7": "७", "8": "८", "9": "९",
};

export function preetiToUnicode(text: string): string {
  if (!text) return "";

  let res = text;
  let out = "";

  // Preeti e-kar 'l' comes before consonant, e.g., 'lg' -> 'नि'. Swap 'l' + char
  for (let i = 0; i < res.length; i++) {
    const ch = res[i];
    if (ch === "l" && i + 1 < res.length) {
      const nextCh = PREETI_MAP[res[i + 1]] || res[i + 1];
      out += nextCh + "ि";
      i++;
    } else {
      out += PREETI_MAP[ch] !== undefined ? PREETI_MAP[ch] : ch;
    }
  }

  return out;
}

// Reverse mapping for Unicode to Preeti
const UNICODE_TO_PREETI_MAP: Record<string, string> = Object.entries(PREETI_MAP).reduce(
  (acc, [preeti, uni]) => {
    if (!acc[uni]) acc[uni] = preeti;
    return acc;
  },
  {} as Record<string, string>
);

export function unicodeToPreeti(text: string): string {
  if (!text) return "";
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    // Check if character is e-kar 'ि' which moves before consonant in Preeti
    if (ch === "ि" && out.length > 0) {
      const lastUni = text[i - 1];
      const lastPreeti = UNICODE_TO_PREETI_MAP[lastUni] || lastUni;
      // remove last added character and prepend 'l'
      out = out.slice(0, -lastPreeti.length) + "l" + lastPreeti;
    } else {
      out += UNICODE_TO_PREETI_MAP[ch] !== undefined ? UNICODE_TO_PREETI_MAP[ch] : ch;
    }
  }
  return out;
}

// ── COMPONENT IMPLEMENTATION ───────────────────────────────────────────────

export default function NepaliUnicodeTool() {
  const [mode, setMode] = useState<"roman" | "preetiToUni" | "uniToPreeti">("roman");
  const [inputText, setInputText] = useState<string>(
    "namaste! sajilotools nepal ko unicode converter ma swagatam chha. yaha romanized nepali ma type garnuhos (eg: mero nepal ramro chha)."
  );
  const [copied, setCopied] = useState<boolean>(false);

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

  const quickPhrases = [
    { label: "k gardai xeu", text: "k gardai xeu karuna sanchai xeu humm" },
    { label: "namaste nepal", text: "namaste mero nepal ramro chha" },
    { label: "kasto chha", text: "kasto chha sanchai ho" },
    { label: "dhanyabad", text: "dherai dherai dhanyabad tapailai" },
    { label: "sajilo tools", text: "sajilotools nepal ko ramro platform ho" },
  ];

  const virtualKeys = ["अ", "आ", "इ", "ई", "उ", "ऊ", "ऋ", "ए", "ऐ", "ओ", "औ", "क", "ख", "ग", "घ", "ङ", "च", "छ", "ज", "झ", "ञ", "ट", "ठ", "ड", "ढ", "ण", "त", "थ", "द", "ध", "न", "प", "फ", "ब", "भ", "म", "य", "र", "ल", "व", "श", "ष", "स", "ह", "क्ष", "त्र", "ज्ञ", "ा", "ि", "ी", "ु", "ू", "े", "ै", "ो", "ौ", "ं", "ँ", "ः", "्", "।"];

  return (
    <div className="space-y-6">
      {/* Mode Selector Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] shadow-xs">
        <button
          onClick={() => {
            setMode("roman");
            setInputText("k gardai xeu karuna sanchai xeu humm");
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            mode === "roman"
              ? "bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] shadow-sm"
              : "text-[#71717A] hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338]"
          }`}
        >
          <Keyboard size={15} /> Romanized Phonetic (रोमन युनिकोड)
        </button>

        <button
          onClick={() => {
            setMode("preetiToUni");
            setInputText("sD: g]kfn k|Llt");
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            mode === "preetiToUni"
              ? "bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] shadow-sm"
              : "text-[#71717A] hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338]"
          }`}
        >
          <ArrowRightLeft size={15} /> Preeti ➔ Unicode (प्रिती देखि युनिकोड)
        </button>

        <button
          onClick={() => {
            setMode("uniToPreeti");
            setInputText("नेपाल प्रीति युनिकोड");
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            mode === "uniToPreeti"
              ? "bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] shadow-sm"
              : "text-[#71717A] hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338]"
          }`}
        >
          <FileText size={15} /> Unicode ➔ Preeti (युनिकोड देखि प्रिती)
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
                ? "e.g. k gardai xeu karuna sanchai"
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
                ? "Type in Romanized Nepali (e.g., k gardai xeu karuna sanchai xeu humm)..."
                : mode === "preetiToUni"
                ? "Paste traditional Preeti font text here..."
                : "Type Devanagari Unicode text here..."
            }
            className="w-full h-64 p-4 rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40 resize-none font-sans text-sm leading-relaxed shadow-xs"
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
            className="w-full h-64 p-4 rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] placeholder:text-[#A1A1AA] resize-none font-devanagari text-base leading-relaxed shadow-xs"
          />
        </div>
      </div>

      {/* Stats & Quick Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338]">
        <div className="flex items-center gap-4 text-xs font-semibold text-[#71717A]">
          <span>Words: <strong className="text-[#18181B] dark:text-[#F4F4F5]">{wordCount}</strong></span>
          <span>Characters: <strong className="text-[#18181B] dark:text-[#F4F4F5]">{charCount}</strong></span>
        </div>

        {mode === "roman" && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-[#71717A]">Try Phrases:</span>
            {quickPhrases.map((q) => (
              <button
                key={q.label}
                onClick={() => setInputText(q.text)}
                className="px-2.5 py-1 rounded-lg border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] hover:border-[#F5A623] transition-colors"
              >
                {q.label}
              </button>
            ))}
            <button
              onClick={() => setInputText("")}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Clear Input"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
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
          <strong>How it works:</strong> Type in Romanized Nepali letters (e.g. <code>k gardai xeu karuna sanchai xeu humm</code>) and get instant Nepali Devanagari Unicode output (<code>के गर्दै छौ करुणा सन्चै छौ हुम्म</code>) ready to copy and use in Word, Facebook, or Nepalese government forms. Supports Preeti font ↔ Unicode conversions seamlessly!
        </span>
      </div>
    </div>
  );
}
