"use client";

import { useState } from "react";
import { Copy, Check, Download } from "lucide-react";

type CaseMode = "upper" | "lower" | "title" | "sentence" | "camel" | "snake" | "kebab" | "pascal" | "toggle";

const MODES: { key: CaseMode; label: string }[] = [
  { key: "upper", label: "UPPER CASE" },
  { key: "lower", label: "lower case" },
  { key: "title", label: "Title Case" },
  { key: "sentence", label: "Sentence case" },
  { key: "camel", label: "camelCase" },
  { key: "pascal", label: "PascalCase" },
  { key: "snake", label: "snake_case" },
  { key: "kebab", label: "kebab-case" },
  { key: "toggle", label: "tOGGLE cASE" },
];

// Common abbreviations that should NOT trigger sentence boundaries
const ABBREVIATIONS = new Set([
  "dr", "mr", "mrs", "ms", "prof", "sr", "jr", "st", "ave", "blvd",
  "vs", "etc", "inc", "ltd", "co", "corp",
  "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "oct", "nov", "dec",
  "mon", "tue", "wed", "thu", "fri", "sat", "sun",
  "dept", "est", "approx", "govt", "assn", "bros",
  "e.g", "i.e", "u.s", "u.k", "a.m", "p.m",
]);

function isAbbreviation(word: string): boolean {
  const clean = word.replace(/\.$/, "").toLowerCase();
  return ABBREVIATIONS.has(clean) || clean.length === 1; // single letter abbreviations like "A.", "B."
}

/**
 * Split text into sentences with abbreviation awareness.
 * Returns array of sentence strings.
 */
function splitSentences(text: string): string[] {
  const sentences: string[] = [];
  let current = "";

  // Walk through the text and split on sentence-ending punctuation,
  // but skip if the preceding word is a known abbreviation
  const tokens = text.split(/(\s+)/);
  for (const token of tokens) {
    current += token;

    // Check if this token ends with sentence-ending punctuation
    if (/[.!?]$/.test(token.trim()) && token.trim().length > 0) {
      const wordBeforePunct = token.trim().replace(/[.!?]+$/, "");

      // If it's an abbreviation or a decimal number, don't split
      if (
        isAbbreviation(token.trim()) ||
        /^\d+\.\d*$/.test(token.trim()) ||
        /^\d+\.$/.test(token.trim())
      ) {
        continue;
      }

      // It's a real sentence boundary
      const trimmed = current.trim();
      if (trimmed) sentences.push(trimmed);
      current = "";
    }
  }

  // Add any remaining text
  const remaining = current.trim();
  if (remaining) sentences.push(remaining);

  return sentences;
}

function toTitleCase(s: string) {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function toSentenceCase(s: string) {
  const sentences = splitSentences(s);
  return sentences
    .map((sent) => {
      const trimmed = sent.trim();
      if (!trimmed) return trimmed;
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    })
    .join(" ");
}

function toCamelCase(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
}

function toPascalCase(s: string) {
  const camel = toCamelCase(s);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function toSnakeCase(s: string) {
  return s
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

function toKebabCase(s: string) {
  return s
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function toToggleCase(s: string) {
  return s
    .split("")
    .map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
    .join("");
}

function convert(text: string, mode: CaseMode): string {
  switch (mode) {
    case "upper": return text.toUpperCase();
    case "lower": return text.toLowerCase();
    case "title": return toTitleCase(text);
    case "sentence": return toSentenceCase(text.toLowerCase());
    case "camel": return toCamelCase(text);
    case "pascal": return toPascalCase(text);
    case "snake": return toSnakeCase(text);
    case "kebab": return toKebabCase(text);
    case "toggle": return toToggleCase(text);
    default: return text;
  }
}

export default function CaseConverterTool() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<CaseMode>("upper");
  const [copied, setCopied] = useState(false);

  const output = text ? convert(text, mode) : "";

  const outputWords = output.trim() ? output.trim().split(/\s+/).filter(Boolean).length : 0;
  const outputChars = output.length;

  const copyOutput = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadOutput = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `case-converted-${mode}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-5">
      {/* Mode pills */}
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mode === m.key
                ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E]"
                : "bg-white dark:bg-[#141829] text-[#71717A] border border-[#E4E0D8] dark:border-[#1E2338] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div>
        <label className="block text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-2">
          Input Text
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here…"
          className="w-full h-[200px] p-4 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#0C0F1E] text-sm text-[#18181B] dark:text-[#F4F4F5] placeholder-[#C4C0B8] dark:placeholder-[#374151] outline-none resize-none focus:border-[#1F2544] dark:focus:border-[#F5A623] transition-colors"
        />
      </div>

      {/* Output */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-[#71717A] uppercase tracking-wider">
              Output
            </label>
            {output && (
              <span className="text-[10px] font-bold text-[#A1A1AA] bg-[#F7F5F0] dark:bg-[#1E2338] px-2 py-0.5 rounded-md">
                {outputWords} words • {outputChars} chars
              </span>
            )}
          </div>
          {output && (
            <div className="flex items-center gap-2">
              <button
                onClick={downloadOutput}
                className="flex items-center gap-1 text-xs text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] transition-colors"
              >
                <Download size={12} /> Download
              </button>
              <button
                onClick={copyOutput}
                className="flex items-center gap-1 text-xs text-[#1F2544] dark:text-[#F5A623] font-medium hover:opacity-70 transition-opacity"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          )}
        </div>
        <textarea
          value={output}
          readOnly
          placeholder="Converted text will appear here…"
          className="w-full h-[200px] p-4 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#0A0D1A] text-sm text-[#18181B] dark:text-[#F4F4F5] placeholder-[#C4C0B8] dark:placeholder-[#374151] outline-none resize-none"
        />
      </div>
    </div>
  );
}
