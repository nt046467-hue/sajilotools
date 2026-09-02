"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Languages,
  Loader2,
  Copy,
  Check,
  ArrowLeftRight,
  AlertCircle,
  Info,
  ExternalLink,
  Lightbulb,
  Volume2,
  VolumeX,
  History,
  Clock,
  ArrowRight,
  Download,
  BookOpen,
  // Crown,  // PRO_PASS_HIDDEN
  Zap,
  Bot,
  Sliders,
  ShieldCheck,
} from "lucide-react";
import AnimatedTrashIcon, { AnimatedTrashButton } from "@/components/shared/AnimatedTrashIcon";
// import UpgradeProModal from "@/components/shared/UpgradeProModal"; // PRO_PASS_HIDDEN

type TranslationTone = "standard" | "formal" | "casual" | "romanized";

type HistoryEntry = {
  sourceText: string;
  translatedText: string;
  mode: "en-to-np" | "np-to-en";
  tone: TranslationTone;
  engine?: string;
  timestamp: number;
};

const HISTORY_KEY = "sajilotools_translator_history";
const ROMAN_NEPALI_TOKENS = [
  "maya",
  "garxu",
  "garne",
  "cha",
  "chhu",
  "lai",
  "ho",
  "haru",
  "ma",
  "mero",
  "timi",
  "tapai",
  "hijo",
  "aaja",
  "xa",
  "ramro",
];

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {
    /* ignore storage errors */
  }
}

export default function NepaliTranslatorTool() {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [mode, setMode] = useState<"en-to-np" | "np-to-en">("en-to-np");
  const [tone, setTone] = useState<TranslationTone>("standard");
  const [engineUsed, setEngineUsed] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [suggestionMsg, setSuggestionMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  /* PRO_PASS_HIDDEN_START
  const [isPro, setIsPro] = useState(false);
  const [remainingCredits, setRemainingCredits] = useState<number>(25);
  const [maxCredits, setMaxCredits] = useState<number>(25);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  PRO_PASS_HIDDEN_END */

  // History state
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(true);

  // TTS state
  const [speaking, setSpeaking] = useState(false);
  const [nepaliTtsAvailable, setNepaliTtsAvailable] = useState(true);

  /* PRO_PASS_HIDDEN: fetchSubscriptionStatus removed — translator is 100% free/unlimited
  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/subscription/status?tool=nepali-translator");
      if (res.ok) {
        const data = await res.json();
        setIsPro(data.isPro || false);
        setRemainingCredits(data.remainingCredits ?? 25);
        setMaxCredits(data.maxCredits ?? 25);
      }
    } catch {}
  }, []);
  */

  // Load history & setup TTS voices check on mount
  useEffect(() => {
    setHistory(loadHistory());
    // PRO_PASS_HIDDEN: fetchSubscriptionStatus() removed

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const checkVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        const hasNepali = voices.some(
          (v) => v.lang.startsWith("ne") || v.lang.includes("ne-NP")
        );
        setNepaliTtsAvailable(hasNepali);
      };

      checkVoices();
      window.speechSynthesis.onvoiceschanged = checkVoices;
    }
  }, []);

  // Chunk text into sentence-aware blocks
  const chunkText = (text: string, maxLen = 1200): string[] => {
    if (text.length <= maxLen) return [text];

    const paragraphs = text.split(/(\n+)/);
    const chunks: string[] = [];
    let currentChunk = "";

    for (const para of paragraphs) {
      if ((currentChunk + para).length > maxLen) {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = para;
      } else {
        currentChunk += para;
      }
    }
    if (currentChunk) chunks.push(currentChunk);

    return chunks.length > 0 ? chunks : [text];
  };

  async function translate() {
    const trimmed = sourceText.trim();
    if (!trimmed) return;

    setLoading(true);
    setErrorMsg("");
    setSuggestionMsg(null);
    setTranslatedText("");
    setEngineUsed("");
    if (speaking) stopSpeech();

    const sourceLang = mode === "en-to-np" ? "en" : "ne";
    const targetLang = mode === "en-to-np" ? "ne" : "en";

    try {
      const chunks = chunkText(trimmed, 1200);
      const translatedChunks: string[] = [];
      let detectedEngine = "Gemini 1.5 Flash (AI Native)";

      for (const chunk of chunks) {
        if (!chunk.trim()) {
          translatedChunks.push(chunk);
          continue;
        }

        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: chunk,
            sourceLang,
            targetLang,
            tone,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          if (res.status === 429 && data.limitReached) {
            // PRO_PASS_HIDDEN: setIsUpgradeModalOpen removed — 429 should not fire when flag is off
            throw new Error(
              data?.error || "Translation service temporarily unavailable. Please try again."
            );
          }
          throw new Error(
            data?.error || "Translation service failed. Please try again."
          );
        }

        if (data.translatedText) {
          translatedChunks.push(data.translatedText);
        }
        if (data.engine) {
          detectedEngine = data.engine;
        }
        // PRO_PASS_HIDDEN: setRemainingCredits and setIsPro removed
      }

      const finalResult = translatedChunks.join("");
      setTranslatedText(finalResult);
      setEngineUsed(detectedEngine);

      // Save to History (max 5)
      const newEntry: HistoryEntry = {
        sourceText: trimmed,
        translatedText: finalResult,
        mode,
        tone,
        engine: detectedEngine,
        timestamp: Date.now(),
      };
      setHistory((prev) => {
        const updated = [
          newEntry,
          ...prev.filter(
            (item) => item.sourceText.toLowerCase() !== trimmed.toLowerCase()
          ),
        ].slice(0, 5);
        saveHistory(updated);
        return updated;
      });

      // ── Smart Detection for Romanized Nepali & No-Op Cases ──
      const normalizedSource = trimmed.toLowerCase().replace(/\s+/g, " ");
      const normalizedOutput = finalResult.toLowerCase().replace(/\s+/g, " ");

      const isNoOp = normalizedSource === normalizedOutput;
      const containsRomanNepali = ROMAN_NEPALI_TOKENS.some((tok) =>
        normalizedSource.split(/\s+/).includes(tok)
      );

      if ((isNoOp || containsRomanNepali) && mode === "en-to-np" && tone !== "romanized") {
        setSuggestionMsg(
          "This input looks like Romanized Nepali (e.g. 'mah maya garxu'). For converting Romanized phonetic letters directly into Devanagari script, try our Nepali Unicode Typing Tool."
        );
      }
    } catch (err: any) {
      console.error("Translation error:", err);
      setErrorMsg(
        err?.message ||
          "Translation service is temporarily unavailable. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function swapLanguages() {
    setMode((prev) => (prev === "en-to-np" ? "np-to-en" : "en-to-np"));
    const tmp = sourceText;
    setSourceText(translatedText);
    setTranslatedText(tmp);
    setSuggestionMsg(null);
    setEngineUsed("");
    if (speaking) stopSpeech();
  }

  function copyTranslation() {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function downloadTranslation() {
    if (!translatedText) return;
    const blob = new Blob([translatedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sajilotools-translation-${mode}-${tone}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // ── Text To Speech (TTS) ──
  const targetIsNepali = mode === "en-to-np";
  const ttsDisabled = targetIsNepali && !nepaliTtsAvailable;

  function toggleSpeech() {
    if (speaking) {
      stopSpeech();
      return;
    }

    if (!translatedText || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    const langCode = targetIsNepali ? "ne-NP" : "en-US";
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = langCode;

    const voices = window.speechSynthesis.getVoices();
    const match = voices.find(
      (v) => v.lang === langCode || v.lang.startsWith(targetIsNepali ? "ne" : "en")
    );
    if (match) utterance.voice = match;

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeech() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }

  function restoreHistoryEntry(entry: HistoryEntry) {
    setSourceText(entry.sourceText);
    setTranslatedText(entry.translatedText);
    setMode(entry.mode);
    if (entry.tone) setTone(entry.tone);
    if (entry.engine) setEngineUsed(entry.engine);
    setErrorMsg("");
    setSuggestionMsg(null);
    if (speaking) stopSpeech();
  }

  function clearHistory() {
    setHistory([]);
    saveHistory([]);
  }

  const TONES: { id: TranslationTone; label: string; desc: string; icon: string }[] = [
    { id: "standard", label: "Standard (प्राकृतिक)", desc: "Natural balanced translation", icon: "🌐" },
    { id: "formal", label: "Formal (आदरार्थी / शिष्ट)", desc: "Respectful honorific Nepali", icon: "🎩" },
    { id: "casual", label: "Casual (बोलिचाली)", desc: "Friendly everyday colloquial", icon: "💬" },
    { id: "romanized", label: "Nepglish (Romanized)", desc: "Phonetic English alphabet", icon: "🔤" },
  ];

  return (
    <div className="space-y-6">
      {/* ── Language Switcher Bar ── */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-[#F4F4F5] dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#2A2F48]">

        {/* Source tab */}
        <button
          type="button"
          onClick={() => mode !== "en-to-np" && swapLanguages()}
          className={`flex-1 text-center py-2 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
            mode === "en-to-np"
              ? "bg-white dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] shadow-sm border border-[#E4E0D8] dark:border-[#2A2F48]"
              : "text-[#71717A] dark:text-[#71717A] hover:text-[#18181B] dark:hover:text-[#D4D4D8]"
          }`}
        >
          English
        </button>

        {/* Swap button */}
        <button
          onClick={swapLanguages}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-[#DC2626] hover:bg-[#DC2626] hover:text-white hover:border-[#DC2626] shadow-sm transition-all duration-200 group shrink-0"
          title="Swap Languages"
        >
          <ArrowLeftRight size={13} className="group-hover:rotate-180 transition-transform duration-300" />
        </button>

        {/* Target tab */}
        <button
          type="button"
          onClick={() => mode !== "np-to-en" && swapLanguages()}
          className={`flex-1 text-center py-2 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
            mode === "en-to-np"
              ? "text-[#71717A] dark:text-[#71717A] hover:text-[#18181B] dark:hover:text-[#D4D4D8]"
              : "bg-white dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] shadow-sm border border-[#E4E0D8] dark:border-[#2A2F48]"
          }`}
        >
          नेपाली
        </button>

        {/* AI badge */}
        <div className="hidden sm:flex items-center gap-1.5 ml-1 px-2.5 py-1.5 rounded-lg bg-[#DC2626]/8 border border-[#DC2626]/15 shrink-0">
          <Bot size={12} className="text-[#DC2626]" />
          <span className="text-[10px] font-bold text-[#DC2626] tracking-wide">AI</span>
        </div>

        {/* PRO_PASS_HIDDEN */}
      </div>


      {/* ── AI Stylistic Tone / Nuance Switcher (Original 4-card grid) ── */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider">
          AI Translation Nuance & Tone
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TONES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTone(t.id)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                tone === t.id
                  ? "border-[#DC2626] bg-[#DC2626]/5 dark:bg-[#DC2626]/10 text-[#18181B] dark:text-[#F4F4F5] shadow-xs ring-1 ring-[#DC2626]"
                  : "border-[#E4E0D8] dark:border-[#2A2F48] bg-white dark:bg-[#141829] text-[#71717A] dark:text-[#A1A1AA] hover:border-[#DC2626]/40"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{t.icon}</span>
                <span className="text-xs font-bold truncate">{t.label}</span>
              </div>
              <span className="text-[10px] text-[#A1A1AA] line-clamp-1">{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Unified Translation Workstation Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Input Box */}
        <div className="flex flex-col rounded-2xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-white dark:bg-[#141829] shadow-xs overflow-hidden focus-within:ring-2 focus-within:ring-[#DC2626]/30 transition-all">
          {/* Header of Input */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#E4E0D8]/60 dark:border-[#2A2F48]/60 bg-[#FAFAF8] dark:bg-[#1E2338]/40">
            <span className="text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider">
              {mode === "en-to-np" ? "English" : "Nepali"}
            </span>
            {sourceText && (
              <AnimatedTrashButton
                onDelete={() => {
                  setSourceText("");
                  setTranslatedText("");
                  setErrorMsg("");
                  setSuggestionMsg(null);
                  setEngineUsed("");
                }}
                className="text-xs text-[#DC2626] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                iconSize={12}
              >
                Clear
              </AnimatedTrashButton>
            )}
          </div>

          {/* Textarea */}
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                if (sourceText.trim() && !loading) {
                  translate();
                }
              }
            }}
            placeholder={
              mode === "en-to-np"
                ? "Type or paste English text here... (Ctrl+Enter to translate)"
                : "यहाँ नेपालीमा टाइप वा पेस्ट गर्नुहोस्... (अनुवाद गर्न Ctrl+Enter थिच्नुहोस्)"
            }
            className="w-full flex-1 min-h-[200px] p-4 bg-transparent text-[#18181B] dark:text-[#F4F4F5] placeholder:text-[#A1A1AA] focus:outline-none resize-none text-base leading-relaxed"
          />

          {/* Input Footer: Word/Char count + In-Place Translate Button */}
          <div className="flex items-center justify-between gap-3 p-3 px-4 border-t border-[#E4E0D8]/60 dark:border-[#2A2F48]/60 bg-[#FAFAF8] dark:bg-[#1E2338]/30">
            <span className="text-[11px] text-[#A1A1AA] font-medium">
              {sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0} words • {sourceText.length} chars
            </span>

            <button
              onClick={translate}
              disabled={!sourceText.trim() || loading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#DC2626] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#991B1B] text-white text-xs font-bold shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Translating...</span>
                </>
              ) : (
                <>
                  <Bot size={14} />
                  <span>Translate</span>
                  <span className="hidden sm:inline-block text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono font-normal">
                    Ctrl↵
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Output Box */}
        <div className="flex flex-col rounded-2xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#181C2E] shadow-xs overflow-hidden transition-all">
          {/* Header of Output */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#E4E0D8]/60 dark:border-[#2A2F48]/60 bg-white/60 dark:bg-[#1E2338]/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider">
                {mode === "en-to-np" ? "Nepali" : "English"}
              </span>
              {engineUsed && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                  {engineUsed}
                </span>
              )}
            </div>

            {translatedText && (
              <div className="flex items-center gap-1.5">
                {/* Speaker TTS */}
                <button
                  onClick={toggleSpeech}
                  disabled={ttsDisabled}
                  title={
                    ttsDisabled
                      ? "Nepali voice not available on this device"
                      : speaking
                      ? "Stop Audio Playback"
                      : "Listen to Audio"
                  }
                  className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                    speaking
                      ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400"
                      : ttsDisabled
                      ? "opacity-50 cursor-not-allowed border-transparent text-[#A1A1AA]"
                      : "border-[#E4E0D8] dark:border-[#2A2F48] text-[#18181B] dark:text-[#F4F4F5] hover:bg-white dark:hover:bg-[#1E2338]"
                  }`}
                >
                  {speaking ? (
                    <>
                      <VolumeX size={13} className="animate-pulse text-rose-500" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 size={13} className="text-[#DC2626]" />
                      <span className="hidden sm:inline">Listen</span>
                    </>
                  )}
                </button>

                {/* Download Text */}
                <button
                  onClick={downloadTranslation}
                  title="Download (.txt)"
                  className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] text-[#18181B] dark:text-[#F4F4F5] hover:bg-white dark:hover:bg-[#1E2338] transition-colors cursor-pointer"
                >
                  <Download size={13} className="text-[#DC2626]" />
                  <span className="hidden sm:inline">.txt</span>
                </button>

                {/* Copy */}
                <button
                  onClick={copyTranslation}
                  className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg bg-[#DC2626] text-white hover:bg-[#B91C1C] transition-colors shadow-xs cursor-pointer"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            )}
          </div>

          {/* Text Area / Content */}
          <div className="relative flex-1 min-h-[200px] p-4">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-[#71717A] dark:text-[#A1A1AA] bg-[#FAFAF8]/80 dark:bg-[#181C2E]/80 backdrop-blur-xs z-10">
                <Loader2 size={24} className="animate-spin text-[#DC2626]" />
                <span className="text-xs font-medium animate-pulse">Translating with Neural AI Engine...</span>
              </div>
            ) : null}
            <textarea
              value={translatedText}
              readOnly
              placeholder="अनुवाद यहाँ देखा पर्नेछ... (Translation appears here)"
              className="w-full h-full min-h-[170px] bg-transparent text-[#18181B] dark:text-[#F4F4F5] placeholder:text-[#A1A1AA] focus:outline-none resize-none text-base leading-relaxed font-normal"
            />
          </div>

          {/* Output Footer */}
          <div className="flex items-center justify-between p-3 px-4 border-t border-[#E4E0D8]/60 dark:border-[#2A2F48]/60 bg-white/40 dark:bg-[#1E2338]/20">
            <span className="text-[11px] text-[#A1A1AA]">
              {translatedText.trim() ? `${translatedText.length} characters translated` : "Ready to translate"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Quick Example Phrases (Mobile-friendly, no sparkles) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1 text-xs">
        <span className="text-[11px] font-bold text-[#71717A] dark:text-[#A1A1AA] shrink-0">
          Examples:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 sm:pb-0 scrollbar-none -mx-1 px-1 sm:mx-0 sm:px-0 sm:flex-wrap">
          {(mode === "en-to-np"
            ? [
                "Hello, how are you?",
                "Thank you very much",
                "Welcome to Nepal",
                "Where is the bus station?",
                "Please sign this document",
              ]
            : [
                "नमस्ते, तपाईंलाई कस्तो छ?",
                "धेरै धेरै धन्यवाद",
                "नेपालमा स्वागत छ",
                "बस स्टेशन कहाँ छ?",
                "कृपया यो कागजात हेरिदिनुहोस्",
              ]
          ).map((phrase, pIdx) => (
            <button
              key={pIdx}
              type="button"
              onClick={() => setSourceText(phrase)}
              className="shrink-0 text-[11px] font-medium px-3 py-1.5 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-white dark:bg-[#141829] text-[#52525B] dark:text-[#A1A1AA] hover:text-[#DC2626] dark:hover:text-[#F87171] hover:border-[#DC2626]/40 hover:bg-[#DC2626]/5 transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              {`"${phrase}"`}
            </button>
          ))}
        </div>
      </div>

      {/* Suggestion Banner for Romanized Nepali */}
      {suggestionMsg && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Lightbulb size={18} className="shrink-0 text-amber-500 mt-0.5" />
            <span className="leading-relaxed">{suggestionMsg}</span>
          </div>
          <Link
            href="/tools/nepal/nepali-unicode"
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shrink-0 transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            Try Nepali Unicode <ExternalLink size={12} />
          </Link>
        </div>
      )}

      {/* Error / Quota Feedback */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
          {/* PRO_PASS_HIDDEN: Upgrade to Pro button hidden for AdSense resubmission */}
        </div>
      )}


      {/* ── Feature: Translation History (Collapsible Panel) ── */}
      {history.length > 0 && (
        <div className="rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] overflow-hidden transition-all shadow-xs">
          <div className="flex items-center justify-between p-3.5 px-4 bg-[#FAFAF8] dark:bg-[#1E2338]/60 border-b border-[#E4E0D8] dark:border-[#1E2338]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">
              <History size={15} className="text-[#DC2626]" />
              <span>Recent AI Translations (Last 5)</span>
            </div>
            <div className="flex items-center gap-3">
              <AnimatedTrashButton
                onDelete={clearHistory}
                className="text-[11px] font-semibold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                iconSize={12}
              >
                Clear history
              </AnimatedTrashButton>
            </div>
          </div>

          <div className="divide-y divide-[#E4E0D8]/60 dark:divide-[#1E2338]/60">
            {history.map((entry, idx) => (
              <button
                key={idx}
                onClick={() => restoreHistoryEntry(entry)}
                className="w-full text-left p-3 px-4 hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338]/40 transition-colors flex items-center justify-between gap-4 group cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-0.5 truncate">
                    <span className="truncate max-w-[200px] sm:max-w-[320px]">
                      {entry.sourceText}
                    </span>
                    <ArrowRight size={12} className="shrink-0 text-[#A1A1AA]" />
                    <span className="truncate text-emerald-600 dark:text-emerald-400 max-w-[200px] sm:max-w-[320px]">
                      {entry.translatedText}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[#A1A1AA]">
                    <span className="uppercase font-bold tracking-wider">
                      {entry.mode === "en-to-np" ? "EN → NP" : "NP → EN"}
                    </span>
                    <span>•</span>
                    <span className="capitalize font-semibold text-[#F5A623]">
                      {entry.tone || "standard"}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(entry.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-semibold text-[#DC2626] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  Restore →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quality Notice & Privacy */}
      <div className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-xs text-[#71717A] flex items-start gap-2">
        <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <span>
          <strong>AI Privacy & Accuracy:</strong> Powered by multi-tier neural models (Gemini 1.5 Flash AI, Groq LLaMA, Neural Cache). Translations are processed securely and never sold to third parties. See our{" "}
          <a href="/privacy-policy" className="underline font-medium text-[#1F2544] dark:text-[#F5A623]">Privacy Policy</a> for full details.
        </span>
      </div>

      {/* PRO_PASS_HIDDEN: UpgradeProModal hidden for AdSense resubmission
      <UpgradeProModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onSuccess={() => fetchSubscriptionStatus()}
      />
      */}
    </div>
  );
}
