"use client";

import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";

export default function JsonFormatterTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indentSize, setIndentSize] = useState(2);
  const [mode, setMode] = useState<"format" | "minify" | "validate">("format");
  const [copied, setCopied] = useState(false);

  const processJson = (rawInput: string, currentMode: "format" | "minify" | "validate", indent: number) => {
    setError("");
    if (!rawInput.trim()) {
      setOutput("");
      return;
    }

    try {
      const parsed = JSON.parse(rawInput);
      if (currentMode === "minify") {
        setOutput(JSON.stringify(parsed));
      } else if (currentMode === "validate") {
        setOutput("✅ Valid JSON");
      } else {
        setOutput(JSON.stringify(parsed, null, indent));
      }
    } catch (e: any) {
      setError(e.message);
      setOutput("");
    }
  };

  const handleFormat = () => {
    setMode("format");
    processJson(input, "format", indentSize);
  };

  const handleMinify = () => {
    setMode("minify");
    processJson(input, "minify", indentSize);
  };

  const handleValidate = () => {
    setMode("validate");
    processJson(input, "validate", indentSize);
  };

  const loadSample = () => {
    const sample = JSON.stringify(
      {
        name: "SajiloTools",
        version: "1.0.0",
        tools: ["JSON Formatter", "Base64 Encoder", "Word Counter"],
        features: {
          free: true,
          privacy: "Files processed locally",
          signUp: false,
        },
      },
      null,
      indentSize
    );
    setInput(sample);
    setMode("format");
    setError("");
    setOutput(sample);
  };

  const copyOutput = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleFormat}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            mode === "format"
              ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E]"
              : "bg-white dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] border border-[#E4E0D8] dark:border-[#2A2F4A] hover:bg-[#F0EDE8] dark:hover:bg-[#252A42]"
          }`}
        >
          Format
        </button>
        <button
          onClick={handleMinify}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            mode === "minify"
              ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E]"
              : "bg-white dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] border border-[#E4E0D8] dark:border-[#2A2F4A] hover:bg-[#F0EDE8] dark:hover:bg-[#252A42]"
          }`}
        >
          Minify
        </button>
        <button
          onClick={handleValidate}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            mode === "validate"
              ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E]"
              : "bg-white dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] border border-[#E4E0D8] dark:border-[#2A2F4A] hover:bg-[#F0EDE8] dark:hover:bg-[#252A42]"
          }`}
        >
          Validate
        </button>
        <button
          onClick={loadSample}
          className="px-4 py-2 rounded-xl bg-white dark:bg-[#1E2338] text-[#71717A] dark:text-[#A1A1AA] text-sm font-medium border border-[#E4E0D8] dark:border-[#2A2F4A] hover:bg-[#F0EDE8] dark:hover:bg-[#252A42] transition-colors"
        >
          Load Sample
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <label className="text-xs text-[#71717A] dark:text-[#A1A1AA]">Indent:</label>
          <select
            value={indentSize}
            onChange={(e) => {
              const newIndent = Number(e.target.value);
              setIndentSize(newIndent);
              if (input) processJson(input, mode, newIndent);
            }}
            className="text-xs rounded-lg border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] px-2 py-1 outline-none"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={1}>Tab</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-mono">
          ❌ {error}
        </div>
      )}

      {/* Editor panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider mb-2">
            Input
          </label>
          <textarea
            value={input}
            onChange={(e) => {
              const newInput = e.target.value;
              setInput(newInput);
              processJson(newInput, mode, indentSize);
            }}
            placeholder='Paste your JSON here...\n\n{ "example": true }'
            className="w-full h-[400px] p-4 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#0C0F1E] text-sm font-mono text-[#18181B] dark:text-[#F4F4F5] placeholder-[#C4C0B8] dark:placeholder-[#374151] outline-none resize-none focus:border-[#1F2544] dark:focus:border-[#F5A623] transition-colors"
            spellCheck={false}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider">
              Output
            </label>
            {output && (
              <button
                onClick={copyOutput}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-[#1F2544] dark:text-[#F5A623] bg-[#1F2544]/10 dark:bg-[#F5A623]/10 hover:bg-[#1F2544]/20 dark:hover:bg-[#F5A623]/20 transition-all"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Output</span>
                  </>
                )}
              </button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Formatted output will appear here…"
            className="w-full h-[400px] p-4 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#0A0D1A] text-sm font-mono text-[#18181B] dark:text-[#F4F4F5] placeholder-[#C4C0B8] dark:placeholder-[#374151] outline-none resize-none"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
