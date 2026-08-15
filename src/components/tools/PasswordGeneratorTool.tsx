"use client";

import { useState, useCallback } from "react";
import { SlidersHorizontal, ShieldAlert, Copy, Check, RefreshCw, Ban, ListOrdered, KeyRound } from "lucide-react";

const AMBIGUOUS_CHARS = /[0OlI1S5]/g;

const WORDLIST = [
  "correct","horse","battery","staple","apple","orange","sunset","mountain","river","cloud",
  "thunder","forest","diamond","silver","golden","rocket","castle","bridge","garden","falcon",
  "shadow","crystal","copper","anchor","harbor","planet","cosmos","nebula","summit","valley",
  "breeze","glacier","canyon","meadow","voyage","phoenix","dragon","falcon","marble","velvet",
  "ember","sapphire","crimson","emerald","cobalt","bronze","indigo","scarlet","violet","orchid",
  "tiger","eagle","wolf","panther","dolphin","turtle","panda","koala","otter","raven",
  "jasmine","cedar","willow","maple","bamboo","lotus","ivy","fern","olive","birch",
  "compass","lantern","beacon","prism","mosaic","puzzle","cipher","quartz","zenith","aurora",
  "tempo","rhythm","melody","harmony","chorus","sonnet","lyric","ballad","anthem","verse",
  "pixel","binary","matrix","vector","crypto","neural","logic","kernel","buffer","socket",
];

export default function PasswordGeneratorTool() {
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);

  // Mode
  const [genMode, setGenMode] = useState<"random" | "personalized" | "passphrase">("random");

  // Personalize
  const [seedWord, setSeedWord] = useState("");

  // Bulk
  const [bulkCount, setBulkCount] = useState(1);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Passphrase
  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState("-");

  const getRandomInt = (max: number) => {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] % max;
  };

  const generatePureRandom = useCallback((targetLength: number) => {
    let chars = "";
    if (useUpper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (useLower) chars += "abcdefghijklmnopqrstuvwxyz";
    if (useNumbers) chars += "0123456789";
    if (useSymbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (!chars) return "";

    if (excludeAmbiguous) {
      chars = chars.replace(AMBIGUOUS_CHARS, "");
    }

    if (!chars) return "";

    const array = new Uint32Array(targetLength);
    crypto.getRandomValues(array);
    return Array.from(array)
      .map((n) => chars[n % chars.length])
      .join("");
  }, [useUpper, useLower, useNumbers, useSymbols, excludeAmbiguous]);

  const generatePersonalized = useCallback((seed: string, targetLength: number) => {
    const clean = seed.replace(/[^a-zA-Z0-9]/g, "");
    if (!clean) return generatePureRandom(targetLength);

    const charsArr = clean.split("");

    const leetMap: Record<string, string> = {
      a: "4", A: "4", e: "3", E: "3", i: "1", I: "1", o: "0", O: "0", s: "5", S: "5",
    };
    const leetIndices = charsArr
      .map((ch, idx) => (leetMap[ch] ? idx : -1))
      .filter((idx) => idx !== -1);

    if (leetIndices.length > 0) {
      const count = Math.min(leetIndices.length, getRandomInt(2) + 1);
      const shuffled = [...leetIndices].sort(() => 0.5 - Math.random());
      for (let i = 0; i < count; i++) {
        const idx = shuffled[i];
        charsArr[idx] = leetMap[charsArr[idx]];
      }
    }

    const letterIndices = charsArr
      .map((ch, idx) => (/[a-zA-Z]/.test(ch) ? idx : -1))
      .filter((idx) => idx !== -1);

    if (letterIndices.length > 0) {
      const count = Math.min(letterIndices.length, getRandomInt(2) + 1);
      const shuffled = [...letterIndices].sort(() => 0.5 - Math.random());
      for (let i = 0; i < count; i++) {
        const idx = shuffled[i];
        const ch = charsArr[idx];
        charsArr[idx] = getRandomInt(2) === 0 ? ch.toUpperCase() : ch.toLowerCase();
      }
    }

    const transformedSeed = charsArr.join("");
    const paddingNeeded = Math.max(0, targetLength - transformedSeed.length);

    if (paddingNeeded === 0) {
      return transformedSeed.slice(0, targetLength);
    }

    const prefixLen = paddingNeeded > 1 ? getRandomInt(paddingNeeded - 1) + 1 : getRandomInt(paddingNeeded + 1);
    const suffixLen = paddingNeeded - prefixLen;

    const prefix = generatePureRandom(prefixLen);
    const suffix = generatePureRandom(suffixLen);

    return `${prefix}${transformedSeed}${suffix}`;
  }, [generatePureRandom]);

  const generatePassphrase = useCallback(() => {
    const words: string[] = [];
    const usedIdxs = new Set<number>();
    for (let i = 0; i < wordCount; i++) {
      let idx: number;
      do {
        idx = getRandomInt(WORDLIST.length);
      } while (usedIdxs.has(idx) && usedIdxs.size < WORDLIST.length);
      usedIdxs.add(idx);

      let word = WORDLIST[idx];
      // Randomly capitalize first letter
      if (getRandomInt(3) === 0) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
      words.push(word);
    }
    // Append random digit for extra entropy
    const digit = getRandomInt(100);
    return words.join(separator) + separator + digit;
  }, [wordCount, separator]);

  const generate = () => {
    const results: string[] = [];
    for (let i = 0; i < bulkCount; i++) {
      if (genMode === "passphrase") {
        results.push(generatePassphrase());
      } else if (genMode === "personalized" && seedWord.trim()) {
        results.push(generatePersonalized(seedWord.trim(), length));
      } else {
        results.push(generatePureRandom(length));
      }
    }
    setPasswords(results);
    setCopiedIdx(null);
  };

  const copyPassword = (idx: number) => {
    if (passwords[idx]) {
      navigator.clipboard.writeText(passwords[idx]);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    }
  };

  const getStrength = (pw: string) => {
    if (!pw) return { label: "—", color: "#A1A1AA", width: "0%" };

    if (genMode === "passphrase") {
      const parts = pw.split(separator).filter(Boolean);
      if (parts.length >= 5) return { label: "Strong", color: "#059669", width: "100%" };
      if (parts.length >= 4) return { label: "Good", color: "#22C55E", width: "75%" };
      if (parts.length >= 3) return { label: "Fair", color: "#D97706", width: "50%" };
      return { label: "Weak", color: "#EF4444", width: "25%" };
    }

    let score = 0;
    if (pw.length >= 12) score++;
    if (pw.length >= 16) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 2) return { label: "Weak", color: "#EF4444", width: "25%" };
    if (score <= 3) return { label: "Fair", color: "#D97706", width: "50%" };
    if (score <= 4) return { label: "Good", color: "#22C55E", width: "75%" };
    return { label: "Strong", color: "#059669", width: "100%" };
  };

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Generated password display */}
      {passwords.length > 0 && (
        <div className="bg-white dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] p-4 sm:p-6 space-y-3 shadow-sm">
          {passwords.map((pw, idx) => {
            const strength = getStrength(pw);
            return (
              <div key={idx} className="space-y-2">
                {passwords.length > 1 && (
                  <span className="text-[10px] font-bold text-[#71717A] uppercase">Password #{idx + 1}</span>
                )}
                <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5">
                  <input
                    value={pw}
                    readOnly
                    className="flex-1 bg-[#FAFAF8] dark:bg-[#1E2338] px-3.5 py-2.5 rounded-xl text-sm sm:text-base font-mono text-[#18181B] dark:text-[#F4F4F5] outline-none tracking-wide break-all"
                  />
                  <button
                    onClick={() => copyPassword(idx)}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                      copiedIdx === idx
                        ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                        : "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] hover:opacity-90"
                    }`}
                  >
                    {copiedIdx === idx ? <Check size={14} /> : <Copy size={14} />}
                    {copiedIdx === idx ? "Copied" : "Copy"}
                  </button>
                </div>

                {/* Strength bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-[#F0EDE8] dark:bg-[#1E2338] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: strength.width, backgroundColor: strength.color }}
                    />
                  </div>
                  <span className="text-xs font-bold" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Controls */}
      <div className="bg-white dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] p-4 sm:p-6 space-y-5 shadow-sm">
        {/* Mode Selector */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider">Generation Mode</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "random" as const, label: "Random", icon: RefreshCw },
              { id: "personalized" as const, label: "Personalize", icon: SlidersHorizontal },
              { id: "passphrase" as const, label: "Passphrase", icon: KeyRound },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setGenMode(m.id)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  genMode === m.id
                    ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] shadow-sm"
                    : "bg-[#FAFAF8] dark:bg-[#1E2338] text-[#71717A] border border-[#E4E0D8] dark:border-[#2A2F48] hover:bg-[#F0EDE8] dark:hover:bg-[#252A42]"
                }`}
              >
                <m.icon size={14} /> {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Personalize Seed Input */}
        {genMode === "personalized" && (
          <div className="space-y-1.5 animate-in fade-in duration-200">
            <label className="block text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA]">
              Word or name to base it on
            </label>
            <input
              type="text"
              value={seedWord}
              onChange={(e) => setSeedWord(e.target.value)}
              placeholder="e.g. Annapurna or Everest"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-xs sm:text-sm text-[#18181B] dark:text-[#F4F4F5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
            />
          </div>
        )}

        {/* Passphrase Config */}
        {genMode === "passphrase" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#71717A] mb-1">Word Count</label>
                <select
                  value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-semibold text-xs"
                >
                  {[3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n} Words</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#71717A] mb-1">Separator</label>
                <select
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-semibold text-xs"
                >
                  {["-", "_", ".", " ", "+"].map((s) => (
                    <option key={s} value={s}>{s === " " ? "Space" : s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Length slider (for random & personalized modes) */}
        {genMode !== "passphrase" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs sm:text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                Character Length
              </label>
              <span className="text-xs sm:text-sm font-bold text-[#1F2544] dark:text-[#F5A623] font-mono">
                {length}
              </span>
            </div>
            <input
              type="range"
              min={4}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full cursor-pointer accent-[#F5A623]"
            />
            <div className="flex justify-between text-[10px] text-[#A1A1AA] mt-1 font-mono">
              <span>4</span>
              <span>64</span>
            </div>
          </div>
        )}

        {/* Character Type Checkboxes (for random & personalized modes) */}
        {genMode !== "passphrase" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { label: "Uppercase (A-Z)", value: useUpper, set: setUseUpper },
              { label: "Lowercase (a-z)", value: useLower, set: setUseLower },
              { label: "Numbers (0-9)", value: useNumbers, set: setUseNumbers },
              { label: "Symbols (!@#$…)", value: useSymbols, set: setUseSymbols },
            ].map((opt) => (
              <label
                key={opt.label}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338] transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={opt.value}
                  onChange={() => opt.set(!opt.value)}
                  className="w-4 h-4 rounded border-[#E4E0D8] dark:border-[#2A2F48] text-[#F5A623] focus:ring-[#F5A623]/40 cursor-pointer shrink-0"
                />
                <span className="text-xs font-medium text-[#18181B] dark:text-[#F4F4F5]">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        )}

        {/* Exclude Ambiguous Characters (for random & personalized) */}
        {genMode !== "passphrase" && (
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] cursor-pointer">
            <input
              type="checkbox"
              checked={excludeAmbiguous}
              onChange={(e) => setExcludeAmbiguous(e.target.checked)}
              className="w-4 h-4 rounded border-[#E4E0D8] dark:border-[#2A2F48] text-[#F5A623] focus:ring-[#F5A623]/40 cursor-pointer shrink-0"
            />
            <div>
              <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-1.5">
                <Ban size={13} className="text-[#F5A623]" /> Exclude Ambiguous Characters
              </span>
              <span className="text-[11px] text-[#71717A] block mt-0.5">
                Removes visually similar: 0/O, l/1/I, S/5 — easier to type manually
              </span>
            </div>
          </label>
        )}

        {/* Bulk Count Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-[#71717A] flex items-center gap-1.5 whitespace-nowrap">
            <ListOrdered size={14} /> Generate
          </label>
          <div className="flex gap-1.5">
            {[1, 5, 10].map((n) => (
              <button
                key={n}
                onClick={() => setBulkCount(n)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  bulkCount === n
                    ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E]"
                    : "bg-[#FAFAF8] dark:bg-[#1E2338] text-[#71717A] border border-[#E4E0D8] dark:border-[#2A2F48]"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <span className="text-xs text-[#71717A]">password{bulkCount > 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={generate}
        className="w-full py-3 rounded-xl bg-[#1F2544] text-white text-xs sm:text-sm font-bold hover:opacity-90 transition-opacity dark:bg-[#F5A623] dark:text-[#0C0F1E] shadow-sm flex items-center justify-center gap-2"
      >
        <RefreshCw size={16} /> Generate {bulkCount > 1 ? `${bulkCount} Passwords` : "Secure Password"}
      </button>
    </div>
  );
}
