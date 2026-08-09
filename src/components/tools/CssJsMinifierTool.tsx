"use client";

import { useState, useCallback } from "react";
import { FileArchive, Copy, Check, Download, AlertTriangle, Sparkles, Loader2 } from "lucide-react";
import { formatBytes } from "@/lib/pdf-utils";

type Mode = "js" | "css";

const SAMPLE_JS = `// Calculate total order price with tax
function calculateTotal(price, taxRate = 0.13) {
  const tax = price * taxRate;
  const total = price + tax;
  console.log("Calculated total:", total);
  return total;
}

const itemPrice = 100;
const finalAmount = calculateTotal(itemPrice);
`;

const SAMPLE_CSS = `/* Navigation Bar Styling */
.header-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background-color: #ffffff;
  border-bottom: 1px solid #e4e0d8;
}

.header-nav .nav-link {
  font-size: 14px;
  color: #71717a;
  text-decoration: none;
}
`;

export default function CssJsMinifierTool() {
  const [mode, setMode] = useState<Mode>("js");
  const [inputCode, setInputCode] = useState<string>(SAMPLE_JS);
  const [minifiedOutput, setMinifiedOutput] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Options
  const [removeComments, setRemoveComments] = useState<boolean>(true);
  const [mangleVars, setMangleVars] = useState<boolean>(true);
  const [dropConsole, setDropConsole] = useState<boolean>(false);
  const [actionType, setActionType] = useState<"minify" | "beautify">("minify");

  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleMinify = useCallback(async () => {
    if (!inputCode.trim()) {
      setMinifiedOutput("");
      setErrorMsg(null);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      // Defer to macro-task queue so UI spinner renders immediately
      await new Promise((r) => setTimeout(r, 20));

      if (mode === "js") {
        const terser = await import("terser");
        if (actionType === "beautify") {
          const result = await terser.minify(inputCode, {
            compress: false,
            mangle: false,
            format: {
              beautify: true,
              comments: true,
            },
          });
          setMinifiedOutput(result.code || "");
        } else {
          const result = await terser.minify(inputCode, {
            ecma: 2020,
            mangle: mangleVars,
            compress: {
              drop_console: dropConsole,
              drop_debugger: true,
              passes: 2,
            },
            format: {
              comments: removeComments ? false : "some",
              beautify: false,
            },
          });
          setMinifiedOutput(result.code || "");
        }
      } else {
        const csso = await import("csso");
        if (actionType === "beautify") {
          // Simple CSS Beautifier
          const formatted = inputCode
            .replace(/\s*\{\s*/g, " {\n  ")
            .replace(/\s*;\s*/g, ";\n  ")
            .replace(/\s*\}\s*/g, "\n}\n")
            .replace(/\n\s*\n/g, "\n");
          setMinifiedOutput(formatted.trim());
        } else {
          const result = csso.minify(inputCode, {
            comments: removeComments ? false : "first",
            restructure: true,
          });
          setMinifiedOutput(result.css || "");
        }
      }
    } catch (err: any) {
      console.error("Minification error:", err);
      const msg = err?.message || err?.line ? `Syntax Error on line ${err.line}:${err.col} — ${err.message}` : String(err);
      setErrorMsg(msg);
      setMinifiedOutput("");
    } finally {
      setLoading(false);
    }
  }, [inputCode, mode, removeComments, mangleVars, dropConsole, actionType]);

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setInputCode(newMode === "js" ? SAMPLE_JS : SAMPLE_CSS);
    setMinifiedOutput("");
    setErrorMsg(null);
  };

  const copyMinified = () => {
    if (!minifiedOutput) return;
    navigator.clipboard.writeText(minifiedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMinified = () => {
    if (!minifiedOutput) return;
    const ext = mode === "js" ? "min.js" : "min.css";
    const mime = mode === "js" ? "text/javascript" : "text/css";
    const blob = new Blob([minifiedOutput], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Stats calculation
  const originalBytes = new Blob([inputCode]).size;
  const minifiedBytes = new Blob([minifiedOutput]).size;
  const savingsPercent = originalBytes > 0 && minifiedBytes > 0
    ? Math.max(0, Math.round(((originalBytes - minifiedBytes) / originalBytes) * 100))
    : 0;

  return (
    <div className="space-y-6">
      {/* Mode Switcher & Options Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Mode Toggle */}
          <div className="flex p-1 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-xl">
            <button
              type="button"
              onClick={() => handleModeChange("js")}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                mode === "js"
                  ? "bg-[#1F2544] text-white dark:bg-[#22C55E] dark:text-[#0C0F1E]"
                  : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
              }`}
            >
              JavaScript (.js)
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("css")}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                mode === "css"
                  ? "bg-[#1F2544] text-white dark:bg-[#22C55E] dark:text-[#0C0F1E]"
                  : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
              }`}
            >
              CSS (.css)
            </button>
          </div>

          {/* Action Type Toggle */}
          <div className="flex p-1 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-xl">
            <button
              type="button"
              onClick={() => setActionType("minify")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                actionType === "minify"
                  ? "bg-[#22C55E] text-[#0C0F1E]"
                  : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
              }`}
            >
              Minify
            </button>
            <button
              type="button"
              onClick={() => setActionType("beautify")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                actionType === "beautify"
                  ? "bg-[#22C55E] text-[#0C0F1E]"
                  : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
              }`}
            >
              Beautify / Unminify
            </button>
          </div>
        </div>

        {/* Options */}
        {actionType === "minify" && (
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5]">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={removeComments}
                onChange={(e) => setRemoveComments(e.target.checked)}
                className="w-4 h-4 accent-[#22C55E] cursor-pointer"
              />
              Remove Comments
            </label>

            {mode === "js" && (
              <>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={mangleVars}
                    onChange={(e) => setMangleVars(e.target.checked)}
                    className="w-4 h-4 accent-[#22C55E] cursor-pointer"
                  />
                  Mangle Variables
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={dropConsole}
                    onChange={(e) => setDropConsole(e.target.checked)}
                    className="w-4 h-4 accent-[#22C55E] cursor-pointer"
                  />
                  Strip Console.log
                </label>
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Textarea Column (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                <FileArchive size={14} className="text-[#22C55E]" /> Source {mode.toUpperCase()} Code
              </label>
              <span className="text-xs font-semibold text-[#A1A1AA]">
                {formatBytes(originalBytes)}
              </span>
            </div>

            <textarea
              rows={12}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder={`Paste unminified ${mode.toUpperCase()} code here...`}
              className="w-full p-4 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#22C55E]/40 resize-none"
            />

            <button
              type="button"
              onClick={handleMinify}
              disabled={loading || !inputCode.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1F2544] dark:bg-[#22C55E] text-white dark:text-[#0C0F1E] font-bold text-xs hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading ? "Minifying Code..." : `Minify ${mode.toUpperCase()} Code`}
            </button>
          </div>
        </div>

        {/* Output Textarea Column (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#22C55E]" /> Minified Output
              </label>

              {minifiedOutput && (
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {savingsPercent}% smaller
                  </span>
                  <span className="text-[#A1A1AA]">
                    ({formatBytes(originalBytes)} → {formatBytes(minifiedBytes)})
                  </span>
                </div>
              )}
            </div>

            {errorMsg ? (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-xs font-medium space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle size={16} /> Minification Syntax Error:
                </div>
                <div className="font-mono break-all">{errorMsg}</div>
              </div>
            ) : (
              <textarea
                rows={12}
                readOnly
                value={minifiedOutput}
                placeholder="Minified output will appear here after clicking Minify..."
                className="w-full p-4 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-mono text-xs focus:outline-none resize-none"
              />
            )}

            {/* Action Buttons */}
            {minifiedOutput && !errorMsg && (
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={copyMinified}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    copied
                      ? "bg-emerald-600 text-white"
                      : "bg-[#1F2544] dark:bg-[#22C55E] text-white dark:text-[#0C0F1E] hover:opacity-90"
                  }`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy Minified Code"}
                </button>

                <button
                  type="button"
                  onClick={downloadMinified}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] border border-[#E4E0D8] dark:border-[#2A2F48] hover:bg-[#F0EDE8] dark:hover:bg-[#252A42] transition-all"
                >
                  <Download size={14} /> Download File
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
