"use client";

import { useState } from "react";
import { Copy, Check, RefreshCw, Trash2, ArrowUpDown } from "lucide-react";

export default function Base64Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const convert = () => {
    setError("");
    if (!input.trim()) {
      setOutput("");
      return;
    }
    try {
      if (mode === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input.trim()))));
      }
    } catch (e: any) {
      setError("Invalid input for " + mode + " operation. Please check your data.");
      setOutput("");
    }
  };

  const swap = () => {
    setMode(mode === "encode" ? "decode" : "encode");
    setInput(output);
    setOutput("");
    setError("");
  };

  const copyOutput = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clear = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <div className="space-y-4">
      {/* Mobile-Friendly Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338]">
        {/* Mode Toggle Pills */}
        <div className="flex rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] p-1 bg-[#FAFAF8] dark:bg-[#1E2338]">
          <button
            onClick={() => {
              setMode("encode");
              setOutput("");
              setError("");
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === "encode"
                ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] shadow-sm"
                : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
            }`}
          >
            Encode
          </button>
          <button
            onClick={() => {
              setMode("decode");
              setOutput("");
              setError("");
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === "decode"
                ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] shadow-sm"
                : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
            }`}
          >
            Decode
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={convert}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#1F2544] text-white text-xs font-semibold hover:opacity-90 transition-opacity dark:bg-[#F5A623] dark:text-[#0C0F1E] shadow-sm"
          >
            <RefreshCw size={14} /> Process
          </button>

          <button
            onClick={swap}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] text-xs font-semibold border border-[#E4E0D8] dark:border-[#2A2F48] hover:bg-[#F0EDE8] dark:hover:bg-[#252A42] transition-colors"
            title="Swap Input & Output"
          >
            <ArrowUpDown size={14} /> Swap
          </button>

          <button
            onClick={clear}
            className="p-2 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] text-[#71717A] hover:text-red-500 text-xs font-semibold border border-[#E4E0D8] dark:border-[#2A2F48] transition-colors"
            title="Clear all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Responsive Input / Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Card */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider">
              {mode === "encode" ? "Plain Text Input" : "Base64 Encoded Input"}
            </label>
            <span className="text-[10px] text-[#A1A1AA] font-mono">
              {input.length} chars
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "encode"
                ? "Enter text to convert to Base64…"
                : "Paste Base64 encoded string here…"
            }
            className="w-full h-[220px] sm:h-[300px] p-3.5 sm:p-4 rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-xs sm:text-sm font-mono text-[#18181B] dark:text-[#F4F4F5] placeholder-[#A1A1AA] dark:placeholder-[#4B5563] outline-none resize-none focus:ring-2 focus:ring-[#F5A623]/40 transition-all break-all"
            spellCheck={false}
          />
        </div>

        {/* Output Card */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider">
              {mode === "encode" ? "Base64 Output" : "Decoded Text Output"}
            </label>
            {output && (
              <button
                onClick={copyOutput}
                className="flex items-center gap-1 text-xs text-[#1F2544] dark:text-[#F5A623] font-bold hover:opacity-80 transition-opacity"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                {copied ? "Copied!" : "Copy Result"}
              </button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Processed output will appear here…"
            className="w-full h-[220px] sm:h-[300px] p-3.5 sm:p-4 rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#0C0F1E] text-xs sm:text-sm font-mono text-[#18181B] dark:text-[#F4F4F5] placeholder-[#A1A1AA] dark:placeholder-[#4B5563] outline-none resize-none break-all"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
