"use client";

import { useState, useEffect, useCallback } from "react";
import { Fingerprint, Copy, Check, Download, RefreshCw, Layers, ListFilter } from "lucide-react";

export function generateUuids(count: number, uppercase: boolean, hyphens: boolean): string[] {
  const safeCount = Math.min(Math.max(1, count), 1000);
  return Array.from({ length: safeCount }, () => {
    let id = crypto.randomUUID();
    if (!hyphens) id = id.replace(/-/g, "");
    return uppercase ? id.toUpperCase() : id;
  });
}

export default function UuidGeneratorTool() {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [hyphens, setHyphens] = useState<boolean>(true);
  const [count, setCount] = useState<number>(10);

  // Output states
  const [singleUuid, setSingleUuid] = useState<string>("");
  const [bulkUuids, setBulkUuids] = useState<string[]>([]);

  // Action feedback states
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedSingle, setCopiedSingle] = useState<boolean>(false);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  // Initial generation on load & toggle change
  const regenerateSingle = useCallback(() => {
    const ids = generateUuids(1, uppercase, hyphens);
    setSingleUuid(ids[0]);
  }, [uppercase, hyphens]);

  const regenerateBulk = useCallback(() => {
    const ids = generateUuids(count, uppercase, hyphens);
    setBulkUuids(ids);
  }, [count, uppercase, hyphens]);

  useEffect(() => {
    regenerateSingle();
  }, [regenerateSingle]);

  useEffect(() => {
    if (mode === "bulk") {
      regenerateBulk();
    }
  }, [mode, regenerateBulk]);

  const copySingle = () => {
    if (!singleUuid) return;
    navigator.clipboard.writeText(singleUuid);
    setCopiedSingle(true);
    setTimeout(() => setCopiedSingle(false), 2000);
  };

  const copyRow = (uuid: string, idx: number) => {
    navigator.clipboard.writeText(uuid);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const copyAllBulk = () => {
    if (bulkUuids.length === 0) return;
    navigator.clipboard.writeText(bulkUuids.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const downloadTxt = () => {
    const content = bulkUuids.join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uuids-${bulkUuids.length}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadCsv = () => {
    const content = "UUID\n" + bulkUuids.join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uuids-${bulkUuids.length}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Mode & Options Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Mode Toggle */}
        <div className="flex p-1 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setMode("single")}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              mode === "single"
                ? "bg-[#1F2544] text-white dark:bg-[#22C55E] dark:text-[#0C0F1E]"
                : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
            }`}
          >
            Single UUID
          </button>
          <button
            type="button"
            onClick={() => setMode("bulk")}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              mode === "bulk"
                ? "bg-[#1F2544] text-white dark:bg-[#22C55E] dark:text-[#0C0F1E]"
                : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
            }`}
          >
            Bulk Generator
          </button>
        </div>

        {/* Format Options */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5]">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="w-4 h-4 accent-[#22C55E] cursor-pointer"
            />
            Uppercase (ABC)
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hyphens}
              onChange={(e) => setHyphens(e.target.checked)}
              className="w-4 h-4 accent-[#22C55E] cursor-pointer"
            />
            Include Hyphens (-)
          </label>
        </div>
      </div>

      {/* Single Mode Display */}
      {mode === "single" ? (
        <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-6 text-center">
          <div className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center justify-center gap-1.5">
            <Fingerprint size={16} className="text-[#22C55E]" /> Generated RFC 4122 v4 UUID
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] font-mono font-extrabold text-lg sm:text-2xl text-[#18181B] dark:text-[#22C55E] break-all tracking-wider">
            {singleUuid}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={regenerateSingle}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-white dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-xs hover:bg-[#F0EDE8] dark:hover:bg-[#252A42] transition-all"
            >
              <RefreshCw size={14} /> Generate New
            </button>

            <button
              type="button"
              onClick={copySingle}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                copiedSingle
                  ? "bg-emerald-600 text-white"
                  : "bg-[#1F2544] dark:bg-[#22C55E] text-white dark:text-[#0C0F1E] hover:opacity-90"
              }`}
            >
              {copiedSingle ? <Check size={14} /> : <Copy size={14} />}
              {copiedSingle ? "Copied to Clipboard!" : "Copy UUID"}
            </button>
          </div>
        </div>
      ) : (
        /* Bulk Mode Display */
        <div className="space-y-5">
          {/* Controls */}
          <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={14} className="text-[#22C55E]" /> Quantity (1 - 1000)
              </label>
              <span className="text-sm font-bold text-[#1F2544] dark:text-[#22C55E]">
                {count} UUIDs
              </span>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={1000}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full accent-[#22C55E]"
              />
              <input
                type="number"
                min={1}
                max={1000}
                value={count}
                onChange={(e) => setCount(Math.min(1000, Math.max(1, Number(e.target.value))))}
                className="w-24 px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-xs text-center"
              />
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E4E0D8] dark:border-[#1E2338]">
              <button
                type="button"
                onClick={regenerateBulk}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1F2544] dark:bg-[#22C55E] text-white dark:text-[#0C0F1E] font-bold text-xs hover:opacity-90 transition-all shadow-sm"
              >
                <RefreshCw size={14} /> Generate {count} UUIDs
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={copyAllBulk}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                    copiedAll
                      ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-300"
                      : "bg-white dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] border-[#E4E0D8] dark:border-[#2A2F48] hover:bg-[#F0EDE8] dark:hover:bg-[#252A42]"
                  }`}
                >
                  {copiedAll ? <Check size={14} /> : <Copy size={14} />}
                  {copiedAll ? "All Copied!" : "Copy All"}
                </button>

                <button
                  type="button"
                  onClick={downloadTxt}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] border border-[#E4E0D8] dark:border-[#2A2F48] hover:bg-[#F0EDE8] dark:hover:bg-[#252A42] transition-all"
                >
                  <Download size={14} /> .TXT
                </button>

                <button
                  type="button"
                  onClick={downloadCsv}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] border border-[#E4E0D8] dark:border-[#2A2F48] hover:bg-[#F0EDE8] dark:hover:bg-[#252A42] transition-all"
                >
                  <Download size={14} /> .CSV
                </button>
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="p-4 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-2">
            <div className="text-xs font-bold text-[#71717A] uppercase tracking-wider px-2 flex items-center gap-1.5 mb-2">
              <ListFilter size={14} /> Generated Batch Output ({bulkUuids.length})
            </div>

            <div className="max-h-96 overflow-y-auto space-y-1.5 pr-1">
              {bulkUuids.map((id, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] hover:bg-[#F0EDE8] dark:hover:bg-[#252A42] transition-colors group"
                >
                  <span className="font-mono text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] truncate select-all">
                    <span className="text-[#A1A1AA] mr-3 select-none text-[10px] w-6 inline-block">
                      {(index + 1).toString().padStart(3, "0")}
                    </span>
                    {id}
                  </span>

                  <button
                    type="button"
                    onClick={() => copyRow(id, index)}
                    className={`p-1.5 rounded-lg text-xs transition-all ${
                      copiedIndex === index
                        ? "bg-emerald-500 text-white"
                        : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] opacity-70 group-hover:opacity-100"
                    }`}
                    title="Copy UUID"
                  >
                    {copiedIndex === index ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
