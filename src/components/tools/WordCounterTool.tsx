"use client";

import { useState, useMemo } from "react";
import { Download, Copy, Check } from "lucide-react";
import AnimatedTrashIcon, { AnimatedTrashButton } from "@/components/shared/AnimatedTrashIcon";

// Common abbreviations that should NOT trigger sentence boundaries
const ABBREVIATIONS = new Set([
  "dr", "mr", "mrs", "ms", "prof", "sr", "jr", "st", "ave", "blvd",
  "vs", "etc", "inc", "ltd", "co", "corp",
  "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "oct", "nov", "dec",
  "dept", "est", "approx", "govt", "assn", "bros",
]);

function isAbbreviationOrInitial(token: string): boolean {
  const clean = token.replace(/\.$/, "").toLowerCase();
  return ABBREVIATIONS.has(clean) || clean.length === 1;
}

function countSentences(text: string): number {
  if (!text.trim()) return 0;

  let count = 0;
  const tokens = text.split(/(\s+)/);

  for (const token of tokens) {
    const trimmed = token.trim();
    if (!trimmed) continue;

    if (/[.!?]$/.test(trimmed)) {
      if (
        isAbbreviationOrInitial(trimmed) ||
        /^\d+\.\d*$/.test(trimmed) ||
        /^\d+\.$/.test(trimmed)
      ) {
        continue;
      }
      count++;
    }
  }

  if (count === 0 && text.trim().length > 0) count = 1;
  return count;
}

export default function WordCounterTool() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) {
      return {
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        sentences: 0,
        paragraphs: 0,
        lines: 0,
        uniqueWords: 0,
        readingTime: "0 min",
      };
    }

    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const wordsArr = trimmed.split(/\s+/).filter(Boolean);
    const words = wordsArr.length;
    const sentences = countSentences(trimmed);
    const paragraphs = trimmed.split(/\n\s*\n/).filter((p) => p.trim()).length;
    const lines = text.split("\n").length;
    const uniqueWords = new Set(wordsArr.map((w) => w.toLowerCase().replace(/[^a-zA-Z0-9]/g, "")).filter(Boolean)).size;
    const minutes = Math.ceil(words / 200);
    const readingTime = minutes <= 1 ? "< 1 min" : `${minutes} min`;

    return {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      lines,
      uniqueWords,
      readingTime,
    };
  }, [text]);

  const keywordDensity = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return [];

    const wordsArr = trimmed
      .toLowerCase()
      .split(/\s+/)
      .map((w) => w.replace(/[^a-zA-Z0-9']/g, ""))
      .filter((w) => w.length > 2);

    if (wordsArr.length === 0) return [];

    const freq: Record<string, number> = {};
    for (const w of wordsArr) {
      freq[w] = (freq[w] || 0) + 1;
    }

    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => ({
        word,
        count,
        density: ((count / wordsArr.length) * 100).toFixed(1),
      }));
  }, [text]);

  const statCards = [
    { label: "Words", value: stats.words, color: "#1F2544" },
    { label: "Characters", value: stats.characters, color: "#7C3AED" },
    { label: "No Spaces", value: stats.charactersNoSpaces, color: "#D97706" },
    { label: "Sentences", value: stats.sentences, color: "#22C55E" },
    { label: "Paragraphs", value: stats.paragraphs, color: "#EF4444" },
    { label: "Lines", value: stats.lines, color: "#0EA5E9" },
    { label: "Unique Words", value: stats.uniqueWords, color: "#8B5CF6" },
  ];

  const downloadText = () => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "text-content.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const copyText = () => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="space-y-5">
      {/* Responsive Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-[#141829] rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] p-3 sm:p-4 text-center shadow-xs"
          >
            <div
              className="text-xl sm:text-2xl font-bold mb-0.5"
              style={{ color: stat.color }}
            >
              {stat.value.toLocaleString()}
            </div>
            <div className="text-[10px] sm:text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider truncate">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Reading time bar */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-xs text-[#71717A] dark:text-[#A1A1AA]">
        <span>
          📖 Estimated Reading Time: <strong className="text-[#18181B] dark:text-[#F4F4F5]">{stats.readingTime}</strong>
        </span>
      </div>

      {/* Keyword Density */}
      {keywordDensity.length > 0 && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338]">
          <h4 className="text-[11px] font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider mb-2.5">
            Top Keyword Density
          </h4>
          <div className="flex flex-wrap gap-2">
            {keywordDensity.map((kw) => (
              <div
                key={kw.word}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]"
              >
                <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">
                  {kw.word}
                </span>
                <span className="text-[10px] font-semibold text-[#71717A] dark:text-[#A1A1AA]">
                  {kw.count}× ({kw.density}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Text area */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start typing or paste your text content here…"
        className="w-full h-[220px] sm:h-[350px] p-4 sm:p-5 rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-xs sm:text-sm text-[#18181B] dark:text-[#F4F4F5] placeholder-[#A1A1AA] dark:placeholder-[#4B5563] outline-none resize-none focus:ring-2 focus:ring-[#F5A623]/40 transition-all leading-relaxed"
      />

      {/* Actions Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <AnimatedTrashButton
          onDelete={() => setText("")}
          disabled={!text}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-[#1E2338] text-[#71717A] text-xs font-semibold border border-[#E4E0D8] dark:border-[#2A2F48] hover:bg-[#F0EDE8] dark:hover:bg-[#252A42] transition-colors disabled:opacity-40"
          iconSize={14}
        >
          Clear
        </AnimatedTrashButton>

        <button
          onClick={copyText}
          disabled={!text}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 shadow-sm"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied!" : "Copy Text"}
        </button>

        <button
          onClick={downloadText}
          disabled={!text}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] text-xs font-semibold border border-[#E4E0D8] dark:border-[#2A2F48] hover:bg-[#F0EDE8] dark:hover:bg-[#252A42] transition-colors disabled:opacity-40"
        >
          <Download size={14} /> Download .txt
        </button>
      </div>
    </div>
  );
}
