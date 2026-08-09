"use client";
import { useState, useMemo } from "react";
import { ArrowLeftRight, Copy, Check, Download, Eye, EyeOff } from "lucide-react";
import * as Diff from "diff";

type DiffMode = "chars" | "words" | "lines";
type ViewMode = "inline" | "side-by-side";

export default function TextDiffTool() {
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");
  const [mode, setMode] = useState<DiffMode>("lines");
  const [viewMode, setViewMode] = useState<ViewMode>("inline");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [copied, setCopied] = useState(false);

  const processedOriginal = useMemo(() => {
    let text = original;
    if (ignoreCase) text = text.toLowerCase();
    if (ignoreWhitespace) text = text.replace(/[ \t]+/g, " ").replace(/^ +| +$/gm, "");
    return text;
  }, [original, ignoreCase, ignoreWhitespace]);

  const processedModified = useMemo(() => {
    let text = modified;
    if (ignoreCase) text = text.toLowerCase();
    if (ignoreWhitespace) text = text.replace(/[ \t]+/g, " ").replace(/^ +| +$/gm, "");
    return text;
  }, [modified, ignoreCase, ignoreWhitespace]);

  const diffResult = useMemo(() => {
    if (!processedOriginal && !processedModified) return [];
    switch (mode) {
      case "chars": return Diff.diffChars(processedOriginal, processedModified);
      case "words": return Diff.diffWords(processedOriginal, processedModified);
      case "lines": return Diff.diffLines(processedOriginal, processedModified);
    }
  }, [processedOriginal, processedModified, mode]);

  const stats = useMemo(() => {
    let added = 0, removed = 0, unchanged = 0;
    for (const part of diffResult) {
      const count = part.count || part.value.length;
      if (part.added) added += count;
      else if (part.removed) removed += count;
      else unchanged += count;
    }
    return { added, removed, unchanged };
  }, [diffResult]);

  // Build side-by-side line pairs
  const sideBySideLines = useMemo(() => {
    if (viewMode !== "side-by-side" || mode !== "lines") return [];

    const left: { text: string; type: "unchanged" | "removed" | "empty" }[] = [];
    const right: { text: string; type: "unchanged" | "added" | "empty" }[] = [];

    for (const part of diffResult) {
      const lines = part.value.replace(/\n$/, "").split("\n");

      if (part.added) {
        for (const line of lines) {
          left.push({ text: "", type: "empty" });
          right.push({ text: line, type: "added" });
        }
      } else if (part.removed) {
        for (const line of lines) {
          left.push({ text: line, type: "removed" });
          right.push({ text: "", type: "empty" });
        }
      } else {
        for (const line of lines) {
          left.push({ text: line, type: "unchanged" });
          right.push({ text: line, type: "unchanged" });
        }
      }
    }

    return left.map((l, i) => ({ left: l, right: right[i] }));
  }, [diffResult, viewMode, mode]);

  function swap() {
    const tmp = original;
    setOriginal(modified);
    setModified(tmp);
  }

  function getDiffText(): string {
    return diffResult
      .map((part) => {
        if (part.added) return part.value.split("\n").map((l) => `+ ${l}`).join("\n");
        if (part.removed) return part.value.split("\n").map((l) => `- ${l}`).join("\n");
        return part.value.split("\n").map((l) => `  ${l}`).join("\n");
      })
      .join("\n");
  }

  function copyDiff() {
    navigator.clipboard.writeText(getDiffText());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function downloadDiff() {
    const blob = new Blob([getDiffText()], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "text-diff.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  const lineClass = (type: string) => {
    if (type === "added") return "bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300";
    if (type === "removed") return "bg-rose-100/70 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300";
    if (type === "empty") return "bg-[#F7F5F0] dark:bg-[#0C0F1E] text-[#C4C0B8]";
    return "text-[#18181B] dark:text-[#E4E4E7]";
  };

  return (
    <div className="space-y-6">
      {/* Controls Row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Diff mode */}
        <div className="flex gap-1 p-1 rounded-xl bg-[#F7F5F0] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
          {(["chars", "words", "lines"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                mode === m
                  ? "bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] shadow-sm"
                  : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
              }`}
            >
              By {m}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View mode toggle */}
          <div className="flex gap-1 p-1 rounded-xl bg-[#F7F5F0] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
            <button
              onClick={() => setViewMode("inline")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === "inline"
                  ? "bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] shadow-sm"
                  : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
              }`}
            >
              Inline
            </button>
            <button
              onClick={() => { setViewMode("side-by-side"); setMode("lines"); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === "side-by-side"
                  ? "bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] shadow-sm"
                  : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
              }`}
            >
              Side-by-Side
            </button>
          </div>

          {/* Toggles */}
          <button
            onClick={() => setIgnoreWhitespace(!ignoreWhitespace)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              ignoreWhitespace
                ? "bg-[#D97706]/10 border-[#D97706]/30 text-[#D97706]"
                : "border-[#E4E0D8] dark:border-[#1E2338] text-[#71717A]"
            }`}
          >
            {ignoreWhitespace ? <Eye size={12} className="inline mr-1" /> : <EyeOff size={12} className="inline mr-1" />}
            Ignore Spaces
          </button>
          <button
            onClick={() => setIgnoreCase(!ignoreCase)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              ignoreCase
                ? "bg-[#D97706]/10 border-[#D97706]/30 text-[#D97706]"
                : "border-[#E4E0D8] dark:border-[#1E2338] text-[#71717A]"
            }`}
          >
            Aa Ignore Case
          </button>

          <button
            onClick={swap}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-[#F7F5F0] dark:hover:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#1E2338] transition-colors"
          >
            <ArrowLeftRight size={12} /> Swap
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-2">
            Original Text
          </label>
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder="Paste original text..."
            className="w-full h-48 px-4 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40 resize-none text-sm font-mono"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-2">
            Modified Text
          </label>
          <textarea
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            placeholder="Paste modified text..."
            className="w-full h-48 px-4 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40 resize-none text-sm font-mono"
          />
        </div>
      </div>

      {/* Stats */}
      {(original || modified) && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-3 flex-wrap">
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-lg">
              + {stats.added} added
            </span>
            <span className="text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1 rounded-lg">
              − {stats.removed} removed
            </span>
            <span className="text-xs font-medium text-[#71717A] bg-[#F7F5F0] dark:bg-[#1E2338] px-2.5 py-1 rounded-lg">
              {stats.unchanged} unchanged
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadDiff}
              className="flex items-center gap-1 text-xs text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] transition-colors"
            >
              <Download size={12} /> Download Diff
            </button>
            <button
              onClick={copyDiff}
              className="flex items-center gap-1 text-xs text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] transition-colors"
            >
              {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              {copied ? "Copied!" : "Copy Diff"}
            </button>
          </div>
        </div>
      )}

      {/* Diff Output */}
      {diffResult.length > 0 && viewMode === "inline" && (
        <div className="p-4 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] overflow-x-auto">
          <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed">
            {diffResult.map((part, i) => (
              <span
                key={i}
                className={
                  part.added
                    ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 underline decoration-emerald-400 decoration-1 underline-offset-2"
                    : part.removed
                    ? "bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 line-through"
                    : "text-[#18181B] dark:text-[#E4E4E7]"
                }
              >
                {part.added ? "+" : part.removed ? "-" : ""}{part.value}
              </span>
            ))}
          </pre>
        </div>
      )}

      {/* Side-by-Side Diff Output */}
      {diffResult.length > 0 && viewMode === "side-by-side" && (
        <div className="rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] overflow-hidden">
          {/* Headers */}
          <div className="grid grid-cols-2 border-b border-[#E4E0D8] dark:border-[#1E2338]">
            <div className="px-4 py-2 text-xs font-bold text-[#71717A] uppercase tracking-wider bg-rose-50/50 dark:bg-rose-950/20">
              Original
            </div>
            <div className="px-4 py-2 text-xs font-bold text-[#71717A] uppercase tracking-wider bg-emerald-50/50 dark:bg-emerald-950/20 border-l border-[#E4E0D8] dark:border-[#1E2338]">
              Modified
            </div>
          </div>

          {/* Lines */}
          <div className="max-h-[500px] overflow-y-auto">
            {sideBySideLines.map((row, i) => (
              <div key={i} className="grid grid-cols-2 border-b border-[#E4E0D8]/50 dark:border-[#1E2338]/50 last:border-b-0">
                <div className={`px-4 py-1.5 text-xs font-mono whitespace-pre-wrap break-all min-h-[28px] ${lineClass(row.left.type)}`}>
                  {row.left.type === "removed" && <span className="font-bold mr-1 text-rose-500">−</span>}
                  {row.left.text}
                </div>
                <div className={`px-4 py-1.5 text-xs font-mono whitespace-pre-wrap break-all min-h-[28px] border-l border-[#E4E0D8] dark:border-[#1E2338] ${lineClass(row.right.type)}`}>
                  {row.right.type === "added" && <span className="font-bold mr-1 text-emerald-500">+</span>}
                  {row.right.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!original && !modified && (
        <div className="text-center py-12 text-[#A1A1AA]">
          <ArrowLeftRight size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Paste text in both fields to see the diff</p>
        </div>
      )}
    </div>
  );
}
