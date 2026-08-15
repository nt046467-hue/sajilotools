"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Languages,
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
  Trash2,
  Clock,
  ArrowRight,
} from "lucide-react";

type HistoryEntry = {
  sourceText: string;
  translatedText: string;
  mode: "en-to-np" | "np-to-en";
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
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [suggestionMsg, setSuggestionMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // History state
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(true);

  // TTS state
  const [speaking, setSpeaking] = useState(false);
  const [nepaliTtsAvailable, setNepaliTtsAvailable] = useState(true);

  // Load history & setup TTS voices check on mount
  useEffect(() => {
    setHistory(loadHistory());

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

  // Helper to split text into chunks under 350 characters at sentence boundaries
  const chunkText = (text: string, maxLen = 1000): string[] => {
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
    if (speaking) stopSpeech();

    const sourceLang = mode === "en-to-np" ? "en" : "ne";
    const targetLang = mode === "en-to-np" ? "ne" : "en";

    try {
      const chunks = chunkText(trimmed, 1000);
      const translatedChunks: string[] = [];

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
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data?.error || "Translation service failed. Please try again."
          );
        }

        if (data.translatedText) {
          translatedChunks.push(data.translatedText);
        }
      }

      const finalResult = translatedChunks.join("");
      setTranslatedText(finalResult);

      // Save to History (max 5)
      const newEntry: HistoryEntry = {
        sourceText: trimmed,
        translatedText: finalResult,
        mode,
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

      if ((isNoOp || containsRomanNepali) && mode === "en-to-np") {
        setSuggestionMsg(
          "This input looks like Romanized Nepali (e.g. 'mah maya garxu'). Meaning translation needs English text. For converting Romanized Nepali letters into Devanagari script, use our Nepali Unicode Typing Tool."
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
    if (speaking) stopSpeech();
  }

  function copyTranslation() {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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

    window.speechSynthesis.cancel(); // Stop any active audio
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
    setErrorMsg("");
    setSuggestionMsg(null);
    if (speaking) stopSpeech();
  }

  function clearHistory() {
    setHistory([]);
    saveHistory([]);
  }

  return (
    <div className="space-y-6">
      {/* Language Switcher Bar */}
      <div className="flex items-center justify-between p-2 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
        <div className="flex items-center gap-2 px-4 py-2 font-bold text-sm text-[#18181B] dark:text-[#F4F4F5]">
          <Languages size={18} className="text-[#DC2626]" />
          <span>{mode === "en-to-np" ? "English" : "नेपाली (Nepali)"}</span>
        </div>

        <button
          onClick={swapLanguages}
          className="p-2.5 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-[#DC2626] hover:scale-105 transition-transform shadow-xs"
          title="Swap Languages"
        >
          <ArrowLeftRight size={16} />
        </button>

        <div className="flex items-center gap-2 px-4 py-2 font-bold text-sm text-[#18181B] dark:text-[#F4F4F5]">
          <span>{mode === "en-to-np" ? "नेपाली (Nepali)" : "English"}</span>
        </div>
      </div>

      {/* Input / Output Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider">
              Input Text ({mode === "en-to-np" ? "English" : "Nepali"})
            </label>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-[#A1A1AA]">
                {sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0} words • {sourceText.length} chars
              </span>
              {sourceText && (
                <button
                  onClick={() => {
                    setSourceText("");
                    setTranslatedText("");
                    setErrorMsg("");
                    setSuggestionMsg(null);
                  }}
                  className="text-xs text-[#DC2626] font-semibold hover:underline flex items-center gap-1"
                >
                  <Trash2 size={12} /> Clear
                </button>
              )}
            </div>
          </div>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder={
              mode === "en-to-np"
                ? "Type or paste English text here... (e.g. 'I love Nepal very much')"
                : "यहाँ नेपालीमा टाइप वा पेस्ट गर्नुहोस्..."
            }
            className="w-full h-48 px-4 py-3 rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/40 resize-none text-base leading-relaxed"
          />

          {/* Quick Example Phrases */}
          <div className="pt-1">
            <span className="text-[11px] font-semibold text-[#71717A] mr-2">Try examples:</span>
            <div className="inline-flex flex-wrap gap-1.5 mt-1">
              {(mode === "en-to-np"
                ? [
                    "Hello, how are you?",
                    "Thank you very much",
                    "Welcome to Nepal",
                    "What is your name?",
                    "Have a nice day!",
                  ]
                : [
                    "नमस्ते, तपाइँलाई कस्तो छ?",
                    "धेरै धेरै धन्यवाद",
                    "नेपालमा स्वागत छ",
                    "तपाइँको नाम के हो?",
                    "शुभ दिन!",
                  ]
              ).map((phrase, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => setSourceText(phrase)}
                  className="text-[11px] px-2.5 py-1 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#52525B] dark:text-[#A1A1AA] hover:text-[#DC2626] dark:hover:text-[#F87171] hover:border-[#DC2626]/40 transition-colors"
                >
                  "{phrase}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Translation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider">
              Translation Result ({mode === "en-to-np" ? "Nepali" : "English"})
            </label>
            {translatedText && (
              <div className="flex items-center gap-3">
                {/* Speaker TTS Button */}
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
                  className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg border transition-colors ${
                    speaking
                      ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400"
                      : ttsDisabled
                      ? "opacity-50 cursor-not-allowed border-transparent text-[#A1A1AA]"
                      : "border-[#E4E0D8] dark:border-[#2A2F48] text-[#18181B] dark:text-[#F4F4F5] hover:bg-[#F7F5F0] dark:hover:bg-[#1E2338]"
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
                      <span>Listen</span>
                    </>
                  )}
                </button>

                {/* Copy Button */}
                <button
                  onClick={copyTranslation}
                  className="flex items-center gap-1 text-xs font-semibold text-[#DC2626] hover:underline"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            )}
          </div>
          <textarea
            value={translatedText}
            readOnly
            placeholder="अनुवाद यहाँ देखा पर्नेछ..."
            className="w-full h-48 px-4 py-3 rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] placeholder:text-[#A1A1AA] resize-none text-base leading-relaxed"
          />
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

      {/* Error Feedback */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={translate}
        disabled={!sourceText.trim() || loading}
        className="w-full py-3.5 bg-[#1F2544] dark:bg-[#DC2626] text-white font-bold rounded-2xl text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
      >
        {loading ? (
          "Translating..."
        ) : (
          <>
            <Languages size={16} /> Translate Now (अनुवाद गर्नुहोस्)
          </>
        )}
      </button>

      {/* ── Feature 1: Translation History (Collapsible Panel) ── */}
      {history.length > 0 && (
        <div className="rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] overflow-hidden transition-all shadow-xs">
          <div className="flex items-center justify-between p-3.5 px-4 bg-[#FAFAF8] dark:bg-[#1E2338]/60 border-b border-[#E4E0D8] dark:border-[#1E2338]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">
              <History size={15} className="text-[#DC2626]" />
              <span>Recent Translations (Last 5)</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={clearHistory}
                className="text-[11px] font-semibold text-rose-500 hover:underline flex items-center gap-1"
              >
                <Trash2 size={12} /> Clear history
              </button>
            </div>
          </div>

          <div className="divide-y divide-[#E4E0D8]/60 dark:divide-[#1E2338]/60">
            {history.map((entry, idx) => (
              <button
                key={idx}
                onClick={() => restoreHistoryEntry(entry)}
                className="w-full text-left p-3 px-4 hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338]/40 transition-colors flex items-center justify-between gap-4 group"
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
        <Info size={16} className="text-[#DC2626] shrink-0 mt-0.5" />
        <span>
          <strong>Note:</strong> Machine translation requests are sent through our secure server proxy. Translated results may be temporarily cached in memory for fast performance. Your text is never permanently stored or shared.
        </span>
      </div>
    </div>
  );
}
