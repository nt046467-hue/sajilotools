"use client";
import { useState } from "react";
import { Copy, Check, Type, Download, ArrowLeftRight, Search, Replace } from "lucide-react";

const OPERATIONS = [
  { id: "reverse", label: "Reverse", fn: (s: string) => s.split("").reverse().join("") },
  { id: "trim", label: "Trim Whitespace", fn: (s: string) => s.trim() },
  { id: "trim-lines", label: "Trim Each Line", fn: (s: string) => s.split("\n").map(l => l.trim()).join("\n") },
  { id: "collapse-spaces", label: "Collapse Spaces", fn: (s: string) => s.replace(/ {2,}/g, " ") },
  { id: "remove-spaces", label: "Remove All Spaces", fn: (s: string) => s.replace(/\s+/g, "") },
  { id: "remove-blank", label: "Remove Blank Lines", fn: (s: string) => s.split("\n").filter(l => l.trim()).join("\n") },
  { id: "remove-dupes", label: "Remove Duplicate Lines", fn: (s: string) => Array.from(new Set(s.split("\n"))).join("\n") },
  { id: "sort-asc", label: "Sort Lines (A→Z)", fn: (s: string) => s.split("\n").filter(l => l.trim()).sort((a, b) => a.localeCompare(b)).join("\n") },
  { id: "sort-desc", label: "Sort Lines (Z→A)", fn: (s: string) => s.split("\n").filter(l => l.trim()).sort((a, b) => b.localeCompare(a)).join("\n") },
  {
    id: "slugify", label: "Slugify",
    fn: (s: string) =>
      s.toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, ""),
  },
  { id: "extract-numbers", label: "Extract Numbers", fn: (s: string) => (s.match(/-?\d[\d,]*\.?\d*/g) || []).join(", ") },
  { id: "extract-emails", label: "Extract Emails", fn: (s: string) => (s.match(/[\w.-]+@[\w.-]+\.\w+/g) || []).join("\n") },
  {
    id: "extract-urls", label: "Extract URLs",
    fn: (s: string) =>
      (s.match(/https?:\/\/[^\s]+/g) || [])
        .map(u => u.replace(/[.,!?;:)"'\]]+$/, ""))
        .join("\n"),
  },
  { id: "extract-hashtags", label: "Extract Hashtags", fn: (s: string) => (s.match(/#[\w]+/g) || []).join("\n") },
  { id: "count-chars", label: "Character Count", fn: (s: string) => `Total: ${s.length} | No spaces: ${s.replace(/\s/g, "").length} | Words: ${s.trim().split(/\s+/).filter(Boolean).length}` },
  { id: "add-line-numbers", label: "Add Line Numbers", fn: (s: string) => s.split("\n").map((l, i) => `${i + 1}. ${l}`).join("\n") },
  { id: "wrap-quotes", label: "Wrap in Quotes", fn: (s: string) => `"${s}"` },
];

export default function StringUtilitiesTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [activeOp, setActiveOp] = useState("");
  const [copied, setCopied] = useState(false);
  const [repeatCount, setRepeatCount] = useState(3);

  // Find & Replace state
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [showFindReplace, setShowFindReplace] = useState(false);

  function applyOperation(op: typeof OPERATIONS[0]) {
    setActiveOp(op.id);
    setOutput(op.fn(input));
  }

  function applyRepeat() {
    setActiveOp("repeat");
    setOutput(Array(repeatCount).fill(input).join("\n"));
  }

  function applyFindReplace() {
    if (!findText) return;
    setActiveOp("find-replace");
    setOutput(input.split(findText).join(replaceText));
  }

  function useOutputAsInput() {
    if (!output) return;
    setInput(output);
    setOutput("");
    setActiveOp("");
  }

  function copyOutput() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function downloadOutput() {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "string-utilities-output.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <label className="block text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-2">
          Input Text
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter or paste your text here..."
          className="w-full h-32 px-4 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40 resize-none text-sm font-mono"
        />
      </div>

      {/* Operations */}
      <div>
        <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider mb-3">
          Operations
        </label>
        <div className="flex flex-wrap gap-2">
          {OPERATIONS.map((op) => (
            <button
              key={op.id}
              onClick={() => applyOperation(op)}
              disabled={!input}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                activeOp === op.id
                  ? "bg-[#1F2544] text-white border-[#1F2544] dark:bg-[#F5A623] dark:text-[#0C0F1E] dark:border-[#F5A623]"
                  : "border-[#E4E0D8] dark:border-[#1E2338] text-[#71717A] hover:border-[#1F2544] dark:hover:border-[#F5A623] disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
            >
              {op.label}
            </button>
          ))}

          {/* Repeat with configurable count */}
          <div className="flex items-center gap-1">
            <button
              onClick={applyRepeat}
              disabled={!input}
              className={`px-3 py-1.5 rounded-l-lg text-xs font-medium border transition-all ${
                activeOp === "repeat"
                  ? "bg-[#1F2544] text-white border-[#1F2544] dark:bg-[#F5A623] dark:text-[#0C0F1E] dark:border-[#F5A623]"
                  : "border-[#E4E0D8] dark:border-[#1E2338] text-[#71717A] hover:border-[#1F2544] dark:hover:border-[#F5A623] disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
            >
              Repeat
            </button>
            <input
              type="number"
              min="1"
              max="100"
              value={repeatCount}
              onChange={(e) => setRepeatCount(Math.max(1, Math.min(100, Number(e.target.value))))}
              className="w-12 px-1.5 py-1.5 rounded-r-lg border border-l-0 border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] text-xs font-semibold text-center focus:outline-none"
            />
            <span className="text-xs font-bold text-[#71717A]">×</span>
          </div>

          {/* Find & Replace toggle */}
          <button
            onClick={() => setShowFindReplace(!showFindReplace)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1 ${
              showFindReplace
                ? "bg-[#1F2544] text-white border-[#1F2544] dark:bg-[#F5A623] dark:text-[#0C0F1E] dark:border-[#F5A623]"
                : "border-[#E4E0D8] dark:border-[#1E2338] text-[#71717A] hover:border-[#1F2544] dark:hover:border-[#F5A623]"
            }`}
          >
            <Search size={12} /> Find & Replace
          </button>
        </div>
      </div>

      {/* Find & Replace Panel */}
      {showFindReplace && (
        <div className="p-4 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#F7F5F0] dark:bg-[#0C0F1E] space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#71717A] mb-1">Find</label>
              <input
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                placeholder="Text to find..."
                className="w-full px-3 py-2 rounded-lg border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#71717A] mb-1">Replace with</label>
              <input
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Replacement text..."
                className="w-full px-3 py-2 rounded-lg border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
              />
            </div>
          </div>
          <button
            onClick={applyFindReplace}
            disabled={!input || !findText}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] disabled:opacity-40 transition-opacity"
          >
            Replace All
          </button>
        </div>
      )}

      {/* Output */}
      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5]">
              Result
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={useOutputAsInput}
                className="flex items-center gap-1 text-xs font-semibold text-[#D97706] hover:text-[#B45309] transition-colors"
                title="Use output as new input for chaining operations"
              >
                <ArrowLeftRight size={12} /> Use as Input
              </button>
              <button
                onClick={downloadOutput}
                className="flex items-center gap-1 text-xs text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] transition-colors"
              >
                <Download size={12} /> Download
              </button>
              <button
                onClick={copyOutput}
                className="flex items-center gap-1.5 text-xs text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] transition-colors"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            className="w-full h-32 px-4 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#F7F5F0] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] text-sm font-mono resize-none"
          />
        </div>
      )}

      {!input && (
        <div className="text-center py-12 text-[#A1A1AA]">
          <Type size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Enter text, then click an operation</p>
        </div>
      )}
    </div>
  );
}
