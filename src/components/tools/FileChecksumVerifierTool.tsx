"use client";

import { useState } from "react";
import { Upload, FileCheck, Check, Copy, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";
import { md5 } from "js-md5";

export default function FileChecksumVerifierTool() {
  const [file, setFile] = useState<File | null>(null);
  const [expectedHash, setExpectedHash] = useState("");
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState("");

  async function handleFileSelect(selectedFile: File) {
    setFile(selectedFile);
    setIsProcessing(true);
    setHashes({});

    try {
      const buffer = await selectedFile.arrayBuffer();
      const res: Record<string, string> = {};

      const algos = ["SHA-256", "SHA-512", "SHA-1"];
      for (const algo of algos) {
        const digest = await crypto.subtle.digest(algo, buffer);
        const hashArray = Array.from(new Uint8Array(digest));
        res[algo] = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      }

      // MD5 via js-md5 (accepts ArrayBuffer directly)
      res["MD5"] = md5(buffer);

      setHashes(res);
    } catch (err) {
      console.error("Error hashing file:", err);
    } finally {
      setIsProcessing(false);
    }
  }

  function handleCopy(algo: string, val: string) {
    navigator.clipboard.writeText(val);
    setCopied(algo);
    setTimeout(() => setCopied(""), 1500);
  }

  // Check if expected hash matches any of computed hashes
  const cleanedExpected = expectedHash.trim().toLowerCase();
  const matchedAlgorithm = Object.keys(hashes).find(
    (algo) => hashes[algo].toLowerCase() === cleanedExpected
  );

  return (
    <div className="space-y-6">
      {/* File Dropzone */}
      <div className="border-2 border-dashed border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl p-8 text-center bg-[#F7F5F0]/50 dark:bg-[#141829]/50 hover:bg-[#F7F5F0] dark:hover:bg-[#141829] transition-colors relative cursor-pointer">
        <input
          type="file"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Upload size={36} className="mx-auto text-[#F5A623] mb-3" />
        <h3 className="text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5] font-sora">
          {file ? file.name : "Choose a local file or drag & drop"}
        </h3>
        <p className="text-xs text-[#71717A] mt-1">
          {file
            ? `${(file.size / (1024 * 1024)).toFixed(2)} MB — Hash calculation runs 100% locally in your browser`
            : "Any file type up to several GBs. Files are never uploaded to any server."}
        </p>
      </div>

      {/* Expected Checksum Verification Input */}
      <div>
        <label className="block text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-2">
          Verify Against Expected Checksum (Optional)
        </label>
        <input
          type="text"
          value={expectedHash}
          onChange={(e) => setExpectedHash(e.target.value)}
          placeholder="Paste official hash string from software vendor..."
          className="w-full px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
        />
      </div>

      {/* Match Result Banner */}
      {expectedHash.trim() && Object.keys(hashes).length > 0 && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 ${
            matchedAlgorithm
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
          }`}
        >
          {matchedAlgorithm ? (
            <>
              <Check size={20} className="shrink-0" />
              <div>
                <p className="text-xs font-bold font-sora">AUTHENTIC FILE — MATCH VERIFIED!</p>
                <p className="text-xs opacity-90 mt-0.5">
                  The expected checksum perfectly matches the computed <strong>{matchedAlgorithm}</strong> hash.
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle size={20} className="shrink-0" />
              <div>
                <p className="text-xs font-bold font-sora">CHECKSUM MISMATCH WARNING!</p>
                <p className="text-xs opacity-90 mt-0.5">
                  The provided expected checksum does not match any computed hash for this file.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Loading state */}
      {isProcessing && (
        <div className="text-center py-8 text-[#A1A1AA] flex items-center justify-center gap-2">
          <RefreshCw size={18} className="animate-spin text-[#F5A623]" />
          <span className="text-sm font-semibold">Computing hashes locally...</span>
        </div>
      )}

      {/* Hashes Output */}
      {Object.keys(hashes).length > 0 && !isProcessing && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
            Calculated File Hashes
          </h3>
          {["SHA-256", "SHA-512", "SHA-1", "MD5"].map((algo) => (
            <div
              key={algo}
              className={`p-4 rounded-xl border transition-all ${
                matchedAlgorithm === algo
                  ? "bg-emerald-500/10 border-emerald-500/40"
                  : "bg-[#F7F5F0] dark:bg-[#1E2338] border-[#E4E0D8] dark:border-[#2A2F48]"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[#1F2544] dark:text-[#F5A623] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} /> {algo}
                  {matchedAlgorithm === algo && (
                    <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-sans font-bold">
                      MATCH
                    </span>
                  )}
                </span>
                <button
                  onClick={() => handleCopy(algo, hashes[algo])}
                  className="flex items-center gap-1 text-xs font-semibold text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] transition-colors"
                >
                  {copied === algo ? (
                    <Check size={14} className="text-emerald-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                  {copied === algo ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-xs font-mono text-[#18181B] dark:text-[#E4E4E7] break-all select-all">
                {hashes[algo]}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


