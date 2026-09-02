"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  SlidersHorizontal,
  Copy,
  Check,
  RefreshCw,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  History,
  Download,
  Trash2,
  Clock,
  Eye,
  EyeOff,
  Dices,
  Layers,
  CheckCircle2,
  Lock,
  Hash,
  BookOpen,
  Sliders,
  Shield,
  Zap,
} from "lucide-react";
import AnimatedTrashIcon, { AnimatedTrashButton } from "@/components/shared/AnimatedTrashIcon";

const AMBIGUOUS_CHARS = /[0OlI1S5]/g;

const WORDLIST = [
  "correct", "horse", "battery", "staple", "apple", "orange", "sunset", "mountain", "river", "cloud",
  "thunder", "forest", "diamond", "silver", "golden", "rocket", "castle", "bridge", "garden", "falcon",
  "shadow", "crystal", "copper", "anchor", "harbor", "planet", "cosmos", "nebula", "summit", "valley",
  "breeze", "glacier", "canyon", "meadow", "voyage", "phoenix", "dragon", "marble", "velvet", "ember",
  "sapphire", "crimson", "emerald", "cobalt", "bronze", "indigo", "scarlet", "violet", "orchid", "tiger",
  "eagle", "wolf", "panther", "dolphin", "turtle", "panda", "koala", "otter", "raven", "jasmine",
  "cedar", "willow", "maple", "bamboo", "lotus", "ivy", "fern", "olive", "birch", "compass",
  "lantern", "beacon", "prism", "mosaic", "puzzle", "cipher", "quartz", "zenith", "aurora", "tempo",
  "rhythm", "melody", "harmony", "chorus", "sonnet", "lyric", "ballad", "anthem", "verse", "pixel",
  "binary", "matrix", "vector", "crypto", "neural", "logic", "kernel", "buffer", "socket", "quantum",
  "glade", "solstice", "horizon", "vortex", "cascade", "mirage", "timber", "saffron", "radiant", "zen",
];

// Helper to calculate password entropy in bits
function calculateEntropy(password: string, poolSize: number): number {
  if (!password || poolSize <= 0) return 0;
  return Math.round(password.length * Math.log2(poolSize) * 10) / 10;
}

// Crack time humanizer estimate (assumes 100 billion guesses/second)
function estimateCrackTime(entropy: number): string {
  if (entropy < 28) return "Instant (under a second)";
  if (entropy < 36) return "A few seconds";
  if (entropy < 45) return "Several minutes";
  if (entropy < 55) return "A few hours to days";
  if (entropy < 65) return "Several months";
  if (entropy < 75) return "Decades";
  if (entropy < 85) return "Centuries";
  if (entropy < 100) return "Millions of years";
  return "Trillions of centuries (unbreakable)";
}

export default function PasswordGeneratorTool() {
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [customSymbols, setCustomSymbols] = useState("!@#$%^&*()_+-=[]{}|;:,.<>?");
  const [useCustomSymbols, setUseCustomSymbols] = useState(false);

  // Generation Mode
  const [genMode, setGenMode] = useState<"random" | "memorable" | "pin" | "custom">("random");

  // Passphrase / Memorable settings
  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState("-");
  const [capitalizeWords, setCapitalizeWords] = useState(true);
  const [includeNumberInPassphrase, setIncludeNumberInPassphrase] = useState(true);

  // PIN settings
  const [pinLength, setPinLength] = useState(6);

  // Password outputs & animation
  const [passwords, setPasswords] = useState<string[]>([]);
  const [bulkCount, setBulkCount] = useState(1);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [showPassword, setShowPassword] = useState(true);

  // History of generated passwords
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Ref to the top result box for mobile auto-scroll
  const resultCardRef = useRef<HTMLDivElement | null>(null);

  const getRandomInt = (max: number) => {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] % max;
  };

  // Pure Random Password Generator
  const generatePureRandom = useCallback(
    (targetLength: number) => {
      let chars = "";
      const symbolPool = useCustomSymbols && customSymbols.trim() ? customSymbols : "!@#$%^&*()_+-=[]{}|;:,.<>?";

      if (useUpper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      if (useLower) chars += "abcdefghijklmnopqrstuvwxyz";
      if (useNumbers) chars += "0123456789";
      if (useSymbols) chars += symbolPool;

      if (!chars) chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

      if (excludeAmbiguous) {
        chars = chars.replace(AMBIGUOUS_CHARS, "");
      }
      if (!chars) chars = "abcdefghjkmnpqrstuvwxyz23456789";

      // Ensure at least one of each selected set is present
      const requiredChars: string[] = [];
      if (useUpper) {
        const set = excludeAmbiguous ? "ABCDEFGHJKLMNPQRSTUVWXYZ" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        requiredChars.push(set[getRandomInt(set.length)]);
      }
      if (useLower) {
        const set = excludeAmbiguous ? "abcdefghijkmnopqrstuvwxyz" : "abcdefghijklmnopqrstuvwxyz";
        requiredChars.push(set[getRandomInt(set.length)]);
      }
      if (useNumbers) {
        const set = excludeAmbiguous ? "2346789" : "0123456789";
        requiredChars.push(set[getRandomInt(set.length)]);
      }
      if (useSymbols) {
        const set = symbolPool;
        requiredChars.push(set[getRandomInt(set.length)]);
      }

      const remainingLength = Math.max(0, targetLength - requiredChars.length);
      const array = new Uint32Array(remainingLength);
      crypto.getRandomValues(array);
      const randomParts = Array.from(array).map((n) => chars[n % chars.length]);

      const combined = [...requiredChars, ...randomParts];
      // Fisher-Yates shuffle
      for (let i = combined.length - 1; i > 0; i--) {
        const j = getRandomInt(i + 1);
        [combined[i], combined[j]] = [combined[j], combined[i]];
      }

      return combined.join("");
    },
    [useUpper, useLower, useNumbers, useSymbols, excludeAmbiguous, useCustomSymbols, customSymbols]
  );

  // Passphrase Generator (Diceware Style)
  const generatePassphrase = useCallback(
    (targetWordCount = wordCount, targetSeparator = separator) => {
      const words: string[] = [];
      for (let i = 0; i < targetWordCount; i++) {
        let word = WORDLIST[getRandomInt(WORDLIST.length)];
        if (capitalizeWords) {
          word = word.charAt(0).toUpperCase() + word.slice(1);
        }
        words.push(word);
      }
      if (includeNumberInPassphrase) {
        const randomDigit = getRandomInt(100);
        const insertIdx = getRandomInt(words.length);
        words[insertIdx] = `${words[insertIdx]}${randomDigit}`;
      }
      return words.join(targetSeparator);
    },
    [wordCount, separator, capitalizeWords, includeNumberInPassphrase]
  );

  // Numeric PIN Generator
  const generatePin = useCallback(
    (targetPinLength = pinLength) => {
      const array = new Uint32Array(targetPinLength);
      crypto.getRandomValues(array);
      return Array.from(array)
        .map((n) => (n % 10).toString())
        .join("");
    },
    [pinLength]
  );

  const [scramblingText, setScramblingText] = useState<string | null>(null);
  const isInitialMount = useRef(true);

  // Master Generator Function with Option Overrides
  const generateWithOptions = useCallback(
    (overrides?: {
      mode?: "random" | "memorable" | "pin" | "custom";
      targetLength?: number;
      targetPinLength?: number;
      targetWordCount?: number;
      targetSeparator?: string;
      shouldScroll?: boolean;
    }) => {
      setIsRotating(true);
      setTimeout(() => setIsRotating(false), 450);

      const activeMode = overrides?.mode || genMode;
      const activeLength = overrides?.targetLength ?? length;
      const activePinLength = overrides?.targetPinLength ?? pinLength;
      const activeWordCount = overrides?.targetWordCount ?? wordCount;
      const activeSeparator = overrides?.targetSeparator ?? separator;

      const generated: string[] = [];
      const count = Math.max(1, Math.min(bulkCount, 50));

      for (let i = 0; i < count; i++) {
        if (activeMode === "random" || activeMode === "custom") {
          generated.push(generatePureRandom(activeLength));
        } else if (activeMode === "memorable") {
          generated.push(generatePassphrase(activeWordCount, activeSeparator));
        } else if (activeMode === "pin") {
          generated.push(generatePin(activePinLength));
        }
      }

      const primary = generated[0] || "";

      // High-tech tactile micro-scramble animation (100ms)
      const glyphs = activeMode === "pin" ? "0123456789" : "!@#$%^&*0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      let step = 0;
      const maxSteps = 3;
      const interval = setInterval(() => {
        step++;
        if (step >= maxSteps) {
          clearInterval(interval);
          setScramblingText(null);
          setPasswords(generated);

          // Save primary to history
          if (primary) {
            setHistory((prev) => {
              const next = [primary, ...prev.filter((p) => p !== primary)];
              return next.slice(0, 15);
            });
          }
        } else {
          const scrambled = primary
            .split("")
            .map(() => glyphs[Math.floor(Math.random() * glyphs.length)])
            .join("");
          setScramblingText(scrambled);
        }
      }, 25);

      // Smooth scroll on mobile if requested
      if (overrides?.shouldScroll && typeof window !== "undefined" && window.innerWidth < 768) {
        resultCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [bulkCount, genMode, length, pinLength, wordCount, separator, generatePureRandom, generatePassphrase, generatePin]
  );

  const generate = useCallback(
    (shouldScroll = false) => {
      generateWithOptions({ shouldScroll });
    },
    [generateWithOptions]
  );

  // Switch mode and immediately generate appropriate output for that mode
  const switchMode = (mode: "random" | "memorable" | "pin" | "custom") => {
    setGenMode(mode);
    generateWithOptions({ mode });
  };

  // Only auto-generate ONCE on initial page load
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      generate(false);
    }
  }, [generate]);

  // Spacebar shortcut to regenerate when not inside an input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target instanceof HTMLElement) {
        const tagName = e.target.tagName.toLowerCase();
        if (tagName !== "input" && tagName !== "textarea" && !e.target.isContentEditable) {
          e.preventDefault();
          generate(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [generate]);

  // Copy Single Password Handler
  const copyPassword = (pwd: string, idx: number) => {
    if (!pwd) return;
    navigator.clipboard.writeText(pwd);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // Copy All Bulk Passwords
  const copyAllPasswords = () => {
    if (passwords.length === 0) return;
    navigator.clipboard.writeText(passwords.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Download Passwords as .txt file
  const downloadPasswords = () => {
    if (passwords.length === 0) return;
    const blob = new Blob([passwords.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `passwords_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const primaryPassword = passwords[0] || "";

  // Password analysis calculations
  const analysis = React.useMemo(() => {
    if (!primaryPassword) {
      return {
        entropy: 0,
        crackTime: "Instant",
        upperCount: 0,
        lowerCount: 0,
        numberCount: 0,
        symbolCount: 0,
        strengthScore: 0,
      };
    }

    let pool = 0;
    if (genMode === "pin") {
      pool = 10;
    } else if (genMode === "memorable") {
      pool = WORDLIST.length;
    } else {
      if (useUpper) pool += 26;
      if (useLower) pool += 26;
      if (useNumbers) pool += 10;
      if (useSymbols) pool += (useCustomSymbols && customSymbols ? customSymbols.length : 32);
    }
    pool = Math.max(pool, 2);

    const entropy = genMode === "memorable"
      ? Math.round(wordCount * Math.log2(WORDLIST.length) * 10) / 10
      : calculateEntropy(primaryPassword, pool);

    const crackTime = estimateCrackTime(entropy);

    let upperCount = 0;
    let lowerCount = 0;
    let numberCount = 0;
    let symbolCount = 0;

    for (const char of primaryPassword) {
      if (/[A-Z]/.test(char)) upperCount++;
      else if (/[a-z]/.test(char)) lowerCount++;
      else if (/[0-9]/.test(char)) numberCount++;
      else symbolCount++;
    }

    let strengthScore = 1;
    if (entropy >= 80) strengthScore = 5;
    else if (entropy >= 60) strengthScore = 4;
    else if (entropy >= 45) strengthScore = 3;
    else if (entropy >= 30) strengthScore = 2;

    return {
      entropy,
      crackTime,
      upperCount,
      lowerCount,
      numberCount,
      symbolCount,
      strengthScore,
    };
  }, [primaryPassword, genMode, useUpper, useLower, useNumbers, useSymbols, useCustomSymbols, customSymbols, wordCount]);

  const strengthMeta = React.useMemo(() => {
    switch (analysis.strengthScore) {
      case 5:
        return { label: "Unbreakable", color: "#10B981", percent: 100, barClass: "bg-emerald-500" };
      case 4:
        return { label: "Very Strong", color: "#10B981", percent: 80, barClass: "bg-emerald-500" };
      case 3:
        return { label: "Strong", color: "#F5A623", percent: 60, barClass: "bg-amber-500" };
      case 2:
        return { label: "Moderate", color: "#F97316", percent: 40, barClass: "bg-orange-500" };
      default:
        return { label: "Weak", color: "#EF4444", percent: 20, barClass: "bg-rose-500" };
    }
  }, [analysis.strengthScore]);

  // Color-coded character rendering for syntax clarity
  const renderStyledPassword = (pwd: string) => {
    if (!showPassword) {
      return "••••••••••••••••••••••••";
    }
    return pwd.split("").map((ch, idx) => {
      let colorClass = "text-[#18181B] dark:text-[#F4F4F5]";
      if (/[0-9]/.test(ch)) {
        colorClass = "text-sky-500 dark:text-sky-400 font-bold";
      } else if (/[A-Z]/.test(ch)) {
        colorClass = "text-indigo-600 dark:text-indigo-400 font-semibold";
      } else if (/[^a-zA-Z0-9]/.test(ch)) {
        colorClass = "text-amber-500 dark:text-amber-400 font-extrabold";
      }
      return (
        <span key={idx} className={colorClass}>
          {ch}
        </span>
      );
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ── Top Grid Layout: Left Controls (7 cols) + Right Output/Hero (5 cols) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ─── LEFT COLUMN: Generator Rules & Controls ─── */}
        <div className="lg:col-span-7 space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="p-1.5 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => switchMode("random")}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                genMode === "random"
                  ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] shadow-sm"
                  : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <KeyRound size={14} className="shrink-0" />
              <span>Random</span>
            </button>

            <button
              type="button"
              onClick={() => switchMode("memorable")}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                genMode === "memorable"
                  ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] shadow-sm"
                  : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <BookOpen size={14} className="shrink-0" />
              <span>Passphrase</span>
            </button>

            <button
              type="button"
              onClick={() => switchMode("pin")}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                genMode === "pin"
                  ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] shadow-sm"
                  : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Hash size={14} className="shrink-0" />
              <span>PIN Code</span>
            </button>

            <button
              type="button"
              onClick={() => switchMode("custom")}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                genMode === "custom"
                  ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] shadow-sm"
                  : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Sliders size={14} className="shrink-0" />
              <span>Custom</span>
            </button>
          </div>

          {/* Mode-Specific Settings Card */}
          <div className="bg-white dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] p-5 sm:p-6 space-y-6 shadow-xs">
            {/* Header with Reset Button */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E0D8] dark:border-[#1E2338]">
              <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] uppercase tracking-wider">
                Generator Settings
              </span>
              <AnimatedTrashButton
                onDelete={() => {
                  setLength(16);
                  setUseUpper(true);
                  setUseLower(true);
                  setUseNumbers(true);
                  setUseSymbols(true);
                  setExcludeAmbiguous(false);
                  setGenMode("random");
                  setBulkCount(1);
                }}
                className="text-[11px] text-[#71717A] hover:text-rose-500 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                iconSize={13}
              >
                <span>Reset Rules</span>
              </AnimatedTrashButton>
            </div>

            {/* 1. RANDOM / CUSTOM MODE CONTROLS */}
            {(genMode === "random" || genMode === "custom") && (
              <>
                {/* Length Slider & Direct Number Input */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] uppercase tracking-wider block">
                        Password Length
                      </label>
                      <span className="text-[11px] text-[#71717A] dark:text-[#A1A1AA]">
                        Recommended: 16+ characters
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={4}
                        max={128}
                        value={length}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val)) setLength(Math.max(4, Math.min(128, val)));
                        }}
                        className="w-16 px-2.5 py-1 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-sm font-mono font-bold text-center text-[#18181B] dark:text-[#F4F4F5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                      />
                      <span className="text-xs font-semibold text-[#71717A]">chars</span>
                    </div>
                  </div>

                  {/* Slider Control */}
                  <input
                    type="range"
                    min={4}
                    max={64}
                    value={length}
                    onChange={(e) => setLength(parseInt(e.target.value, 10))}
                    className="w-full h-2.5 bg-[#E4E0D8] dark:bg-[#2A2F48] rounded-lg appearance-none cursor-pointer accent-[#F5A623]"
                  />

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center justify-between gap-1.5 pt-1">
                    {[12, 16, 20, 24, 32, 64].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setLength(preset);
                          generateWithOptions({ mode: genMode === "custom" ? "custom" : "random", targetLength: preset });
                        }}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all border ${
                          length === preset
                            ? "border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]"
                            : "border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A] dark:text-[#A1A1AA] hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338]"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Character Inclusions Grid */}
                <div className="space-y-3 pt-2 border-t border-[#E4E0D8] dark:border-[#1E2338]">
                  <label className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] uppercase tracking-wider block">
                    Include Character Sets
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <label
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        useUpper
                          ? "border-[#F5A623]/50 bg-[#F5A623]/5 dark:bg-[#F5A623]/10"
                          : "border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] opacity-75"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={useUpper}
                          onChange={(e) => setUseUpper(e.target.checked)}
                          className="w-4 h-4 rounded text-[#F5A623] accent-[#F5A623] cursor-pointer"
                        />
                        <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">
                          Uppercase
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-indigo-500">A-Z</span>
                    </label>

                    <label
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        useLower
                          ? "border-[#F5A623]/50 bg-[#F5A623]/5 dark:bg-[#F5A623]/10"
                          : "border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] opacity-75"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={useLower}
                          onChange={(e) => setUseLower(e.target.checked)}
                          className="w-4 h-4 rounded text-[#F5A623] accent-[#F5A623] cursor-pointer"
                        />
                        <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">
                          Lowercase
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-500">a-z</span>
                    </label>

                    <label
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        useNumbers
                          ? "border-[#F5A623]/50 bg-[#F5A623]/5 dark:bg-[#F5A623]/10"
                          : "border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] opacity-75"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={useNumbers}
                          onChange={(e) => setUseNumbers(e.target.checked)}
                          className="w-4 h-4 rounded text-[#F5A623] accent-[#F5A623] cursor-pointer"
                        />
                        <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">
                          Numbers
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-sky-500">0-9</span>
                    </label>

                    <label
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        useSymbols
                          ? "border-[#F5A623]/50 bg-[#F5A623]/5 dark:bg-[#F5A623]/10"
                          : "border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] opacity-75"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={useSymbols}
                          onChange={(e) => setUseSymbols(e.target.checked)}
                          className="w-4 h-4 rounded text-[#F5A623] accent-[#F5A623] cursor-pointer"
                        />
                        <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">
                          Symbols
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-500">!@#$%^&*</span>
                    </label>
                  </div>
                </div>

                {/* Additional Rules / Ambiguous characters */}
                <div className="space-y-3 pt-2 border-t border-[#E4E0D8] dark:border-[#1E2338]">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] cursor-pointer">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] block">
                        Avoid Ambiguous Characters
                      </span>
                      <span className="text-[11px] text-[#71717A] dark:text-[#A1A1AA]">
                        Excludes lookalike glyphs: 0, O, o, 1, l, I, S, 5
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={excludeAmbiguous}
                      onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                      className="w-4 h-4 rounded text-[#F5A623] accent-[#F5A623] cursor-pointer"
                    />
                  </label>

                  {/* Custom Symbol Field if in Custom mode */}
                  {genMode === "custom" && (
                    <div className="p-3.5 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">
                          Custom Symbol Set
                        </span>
                        <button
                          type="button"
                          onClick={() => setUseCustomSymbols(!useCustomSymbols)}
                          className={`text-[11px] font-bold ${
                            useCustomSymbols ? "text-[#F5A623]" : "text-[#71717A]"
                          }`}
                        >
                          {useCustomSymbols ? "Enabled" : "Use Default"}
                        </button>
                      </div>
                      <input
                        type="text"
                        value={customSymbols}
                        onChange={(e) => {
                          setCustomSymbols(e.target.value);
                          setUseCustomSymbols(true);
                        }}
                        placeholder="!@#$%^&*()_+-=[]{}|;:,.<>?"
                        className="w-full px-3 py-2 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-white dark:bg-[#141829] text-xs font-mono text-[#18181B] dark:text-[#F4F4F5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            {/* 2. PASSPHRASE / DICEWARE CONTROLS */}
            {genMode === "memorable" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] uppercase tracking-wider">
                      Number of Words ({wordCount})
                    </label>
                    <span className="text-xs font-semibold text-[#F5A623]">{wordCount} words</span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={8}
                    value={wordCount}
                    onChange={(e) => setWordCount(parseInt(e.target.value, 10))}
                    className="w-full h-2.5 bg-[#E4E0D8] dark:bg-[#2A2F48] rounded-lg appearance-none cursor-pointer accent-[#F5A623]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] uppercase tracking-wider block">
                    Word Separator
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Hyphen (-)", val: "-" },
                      { label: "Underscore (_)", val: "_" },
                      { label: "Dot (.)", val: "." },
                      { label: "Space ( )", val: " " },
                    ].map((sep) => (
                      <button
                        key={sep.val}
                        type="button"
                        onClick={() => {
                          setSeparator(sep.val);
                          generateWithOptions({ mode: "memorable", targetSeparator: sep.val });
                        }}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                          separator === sep.val
                            ? "border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]"
                            : "border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#71717A] dark:text-[#A1A1AA]"
                        }`}
                      >
                        {sep.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] cursor-pointer">
                    <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">
                      Capitalize Words
                    </span>
                    <input
                      type="checkbox"
                      checked={capitalizeWords}
                      onChange={(e) => {
                        setCapitalizeWords(e.target.checked);
                      }}
                      className="w-4 h-4 rounded text-[#F5A623] accent-[#F5A623] cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] cursor-pointer">
                    <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">
                      Include Random Number
                    </span>
                    <input
                      type="checkbox"
                      checked={includeNumberInPassphrase}
                      onChange={(e) => {
                        setIncludeNumberInPassphrase(e.target.checked);
                      }}
                      className="w-4 h-4 rounded text-[#F5A623] accent-[#F5A623] cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* 3. PIN CODE CONTROLS */}
            {genMode === "pin" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] uppercase tracking-wider block">
                    PIN Code Length ({pinLength} Digits)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[4, 6, 8, 12].map((digits) => (
                      <button
                        key={digits}
                        type="button"
                        onClick={() => {
                          setPinLength(digits);
                          generateWithOptions({ mode: "pin", targetPinLength: digits });
                        }}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                          pinLength === digits
                            ? "border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]"
                            : "border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#71717A] dark:text-[#A1A1AA]"
                        }`}
                      >
                        {digits} Digits
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quantity Selector (Single or Bulk) */}
            <div className="space-y-2 pt-2 border-t border-[#E4E0D8] dark:border-[#1E2338]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] uppercase tracking-wider">
                  Generate Quantity
                </label>
                <span className="text-xs font-bold text-[#F5A623]">{bulkCount} {bulkCount === 1 ? "Password" : "Passwords"}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 5, 10, 20].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setBulkCount(qty)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      bulkCount === qty
                        ? "border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]"
                        : "border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#71717A] dark:text-[#A1A1AA]"
                    }`}
                  >
                    {qty === 1 ? "1 (Single)" : `${qty} Bulk`}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Big Action Button */}
            <button
              type="button"
              onClick={() => generate(true)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#F5A623] to-[#E8930C] text-[#0C0F1E] font-bold text-sm shadow-md hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw
                size={16}
                className={isRotating ? "rotate-180 transition-transform duration-500" : ""}
              />
              <span>Generate New Secure Password</span>
            </button>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Primary Hero Output Box & Live Security Analysis ─── */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-5">
          {/* Primary Password Hero Card */}
          <div
            ref={resultCardRef}
            className="bg-white dark:bg-[#141829] rounded-2xl border-2 border-[#E4E0D8] dark:border-[#1E2338] p-5 space-y-4 shadow-sm relative overflow-hidden"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound size={14} className="text-[#F5A623]" />
                <span>Generated Password</span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338] transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    showHistory
                      ? "bg-[#F5A623]/10 text-[#F5A623]"
                      : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338]"
                  }`}
                  title="View session history"
                >
                  <History size={15} />
                  <span>({history.length})</span>
                </button>
              </div>
            </div>

            {/* Password Display Box */}
            <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#0C0F1E] border border-[#E4E0D8] dark:border-[#222842] flex items-center justify-between gap-2 overflow-x-auto min-h-[58px] shadow-inner">
              <span className="font-mono text-lg sm:text-xl font-bold tracking-wide break-all select-all">
                {renderStyledPassword(scramblingText || primaryPassword)}
              </span>
            </div>

            {/* Primary Action Buttons: Big Copy + Quick Roll */}
            <div className="grid grid-cols-12 gap-2">
              <button
                type="button"
                onClick={() => copyPassword(primaryPassword, 0)}
                className={`col-span-9 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                  copiedIdx === 0
                    ? "bg-emerald-600 text-white shadow-emerald-600/20"
                    : "bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] hover:opacity-90 active:scale-95"
                }`}
              >
                {copiedIdx === 0 ? (
                  <>
                    <Check size={16} />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>Copy Password</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => generate(false)}
                title="Roll new password (Spacebar shortcut)"
                className="col-span-3 py-3 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-[#18181B] dark:text-[#F4F4F5] hover:bg-[#E4E0D8] dark:hover:bg-[#2A2F48] transition-all flex items-center justify-center cursor-pointer group"
              >
                <RefreshCw
                  size={16}
                  className={`text-[#F5A623] transition-transform duration-500 ${
                    isRotating ? "rotate-180" : "group-hover:rotate-45"
                  }`}
                />
              </button>
            </div>

            {/* Live Security Strength Analysis */}
            <div className="space-y-2.5 pt-2 border-t border-[#E4E0D8] dark:border-[#1E2338]">
              {/* Strength Level & Entropy */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span className="font-semibold text-[#71717A]">Strength:</span>
                  <span className="font-bold" style={{ color: strengthMeta.color }}>
                    {strengthMeta.label}
                  </span>
                </div>
                <div className="text-[11px] font-mono font-bold text-[#71717A]">
                  {primaryPassword.length} chars • {analysis.entropy} bits
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#E4E0D8] dark:bg-[#2A2F48] h-2 rounded-full overflow-hidden flex gap-1 p-0.5">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={`flex-1 h-full rounded-full transition-all duration-300 ${
                      analysis.strengthScore >= step ? strengthMeta.barClass : "opacity-20 bg-neutral-400"
                    }`}
                  />
                ))}
              </div>

              {/* Crack Time Estimate */}
              <div className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] flex items-center gap-1.5">
                <Clock size={12} className="text-[#F5A623] shrink-0" />
                <span>Crack time: <strong className="text-[#18181B] dark:text-[#F4F4F5]">{analysis.crackTime}</strong></span>
              </div>

              {/* Composition Breakdown Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {analysis.upperCount > 0 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40">
                    {analysis.upperCount} Upper
                  </span>
                )}
                {analysis.lowerCount > 0 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                    {analysis.lowerCount} Lower
                  </span>
                )}
                {analysis.numberCount > 0 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-900/40">
                    {analysis.numberCount} Digits
                  </span>
                )}
                {analysis.symbolCount > 0 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40">
                    {analysis.symbolCount} Symbols
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bulk Passwords Display (Shown when quantity > 1) */}
          {bulkCount > 1 && (
            <div className="bg-white dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={14} className="text-[#F5A623]" />
                  <span>Batch Output ({passwords.length})</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyAllPasswords}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#F5A623] hover:underline cursor-pointer"
                  >
                    {copiedAll ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedAll ? "Copied All" : "Copy All"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={downloadPasswords}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] cursor-pointer"
                  >
                    <Download size={12} />
                    <span>.txt</span>
                  </button>
                </div>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {passwords.map((pwd, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-[#FAFAF8] dark:bg-[#101323] border border-[#E4E0D8] dark:border-[#222842] flex items-center justify-between gap-2"
                  >
                    <span className="font-mono text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] truncate select-all">
                      {pwd}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyPassword(pwd, idx)}
                      className="p-1 rounded text-[#71717A] hover:text-[#F5A623] shrink-0"
                    >
                      {copiedIdx === idx ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Session History Drawer */}
          {showHistory && (
            <div className="bg-white dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] uppercase tracking-wider flex items-center gap-1.5">
                  <History size={14} className="text-[#F5A623]" />
                  <span>Session History ({history.length})</span>
                </span>
                {history.length > 0 && (
                  <AnimatedTrashButton
                    onDelete={() => setHistory([])}
                    className="flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                    iconSize={13}
                  >
                    <span>Clear All</span>
                  </AnimatedTrashButton>
                )}
              </div>

              {history.length === 0 ? (
                <p className="text-xs text-[#71717A] text-center py-3">No passwords generated yet</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {history.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-[#FAFAF8] dark:bg-[#101323] border border-[#E4E0D8] dark:border-[#222842] flex items-center justify-between gap-2"
                    >
                      <span className="font-mono text-xs text-[#18181B] dark:text-[#F4F4F5] truncate select-all">
                        {item}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => copyPassword(item, idx + 100)}
                          className="p-1 rounded text-[#71717A] hover:text-[#F5A623] cursor-pointer"
                          title="Copy password"
                        >
                          {copiedIdx === idx + 100 ? (
                            <Check size={13} className="text-emerald-500" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                        <AnimatedTrashButton
                          onDelete={() => setHistory((prev) => prev.filter((_, i) => i !== idx))}
                          className="p-1 text-[#71717A] hover:text-rose-500 transition-colors cursor-pointer"
                          iconSize={13}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Privacy Guarantee Card */}
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-2.5">
            <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="text-[11px] text-emerald-800 dark:text-emerald-300">
              <strong>100% Client-Side Privacy</strong> — Passwords are cryptographically generated in your browser via WebCrypto API. Never transmitted over the internet.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
