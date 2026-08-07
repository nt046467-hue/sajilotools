"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Download, RefreshCw, KeySquare } from "lucide-react";

export default function RandomTokenGeneratorTool() {
  const [tokenType, setTokenType] = useState<"hex" | "base64" | "alphanumeric" | "numeric" | "custom">("hex");
  const [length, setLength] = useState(32);
  const [quantity, setQuantity] = useState(5);
  const [customChars, setCustomChars] = useState("ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*");
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeDigits, setIncludeDigits] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [tokens, setTokens] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | "all">(-1);

  useEffect(() => {
    generateTokens();
  }, [tokenType, length, quantity, customChars, includeUppercase, includeLowercase, includeDigits, includeSymbols]);

  function generateTokens() {
    const list: string[] = [];
    const count = Math.min(Math.max(1, quantity), 100);

    for (let i = 0; i < count; i++) {
      list.push(generateSingleToken());
    }
    setTokens(list);
  }

  function generateSingleToken(): string {
    const len = Math.min(Math.max(4, length), 256);

    if (tokenType === "hex") {
      const bytes = new Uint8Array(Math.ceil(len / 2));
      crypto.getRandomValues(bytes);
      return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, len);
    }

    if (tokenType === "base64") {
      const bytes = new Uint8Array(Math.ceil((len * 3) / 4));
      crypto.getRandomValues(bytes);
      let bin = "";
      bytes.forEach((b) => (bin += String.fromCharCode(b)));
      return btoa(bin)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "")
        .slice(0, len);
    }

    let charset = "";
    if (tokenType === "numeric") {
      charset = "0123456789";
    } else if (tokenType === "custom") {
      charset = customChars || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    } else {
      if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
      if (includeDigits) charset += "0123456789";
      if (includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";
      if (!charset) charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    }

    const randomBytes = new Uint32Array(len);
    crypto.getRandomValues(randomBytes);
    let result = "";
    for (let i = 0; i < len; i++) {
      result += charset[randomBytes[i] % charset.length];
    }
    return result;
  }

  function copySingle(idx: number, val: string) {
    navigator.clipboard.writeText(val);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(-1), 1500);
  }

  function copyAll() {
    navigator.clipboard.writeText(tokens.join("\n"));
    setCopiedIndex("all");
    setTimeout(() => setCopiedIndex(-1), 1500);
  }

  function downloadTxt() {
    const blob = new Blob([tokens.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sajilotools-tokens-${tokenType}-${length}chars.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Token Format Selector */}
        <div>
          <label className="block text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-2">
            Token Format
          </label>
          <select
            value={tokenType}
            onChange={(e: any) => setTokenType(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
          >
            <option value="hex">Hexadecimal (API Key / Secret)</option>
            <option value="base64">Base64 URL-Safe</option>
            <option value="alphanumeric">Alphanumeric String</option>
            <option value="numeric">Pure Numeric (PIN / OTP)</option>
            <option value="custom">Custom Character Set</option>
          </select>
        </div>

        {/* Token Length */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5]">
              Token Length: <span className="text-[#F5A623]">{length}</span> chars
            </label>
          </div>
          <input
            type="range"
            min={8}
            max={128}
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full h-2 bg-[#E4E0D8] dark:bg-[#1E2338] rounded-lg appearance-none cursor-pointer accent-[#F5A623] mt-2"
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-2">
            Quantity (Bulk Count)
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
          />
        </div>
      </div>

      {/* Alphanumeric Options */}
      {tokenType === "alphanumeric" && (
        <div className="flex flex-wrap gap-4 p-3 rounded-xl bg-[#F7F5F0] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
          <label className="flex items-center gap-2 text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] cursor-pointer">
            <input
              type="checkbox"
              checked={includeUppercase}
              onChange={(e) => setIncludeUppercase(e.target.checked)}
              className="rounded text-[#F5A623] focus:ring-0"
            />
            Uppercase (A-Z)
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] cursor-pointer">
            <input
              type="checkbox"
              checked={includeLowercase}
              onChange={(e) => setIncludeLowercase(e.target.checked)}
              className="rounded text-[#F5A623] focus:ring-0"
            />
            Lowercase (a-z)
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] cursor-pointer">
            <input
              type="checkbox"
              checked={includeDigits}
              onChange={(e) => setIncludeDigits(e.target.checked)}
              className="rounded text-[#F5A623] focus:ring-0"
            />
            Digits (0-9)
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] cursor-pointer">
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={(e) => setIncludeSymbols(e.target.checked)}
              className="rounded text-[#F5A623] focus:ring-0"
            />
            Special Symbols (!@#$)
          </label>
        </div>
      )}

      {/* Custom Charset Input */}
      {tokenType === "custom" && (
        <div>
          <label className="block text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-2">
            Custom Characters Pool
          </label>
          <input
            type="text"
            value={customChars}
            onChange={(e) => setCustomChars(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
          />
        </div>
      )}

      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={generateTokens}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw size={14} /> Regenerate Tokens
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyAll}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-[#F0EDE8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] hover:bg-[#E4E0D8] dark:hover:bg-[#2A2F48] transition-colors flex items-center gap-1.5"
          >
            {copiedIndex === "all" ? (
              <Check size={14} className="text-emerald-500" />
            ) : (
              <Copy size={14} />
            )}
            {copiedIndex === "all" ? "All Copied!" : "Copy All"}
          </button>
          <button
            onClick={downloadTxt}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-[#F0EDE8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] hover:bg-[#E4E0D8] dark:hover:bg-[#2A2F48] transition-colors flex items-center gap-1.5"
          >
            <Download size={14} /> Export .TXT
          </button>
        </div>
      </div>

      {/* Generated Token List */}
      <div className="space-y-2">
        {tokens.map((token, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-[#F7F5F0] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] flex items-center justify-between gap-3"
          >
            <span className="text-xs font-mono text-[#18181B] dark:text-[#E4E4E7] break-all select-all flex-1">
              {token}
            </span>
            <button
              onClick={() => copySingle(idx, token)}
              className="p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0"
              aria-label="Copy token"
            >
              {copiedIndex === idx ? (
                <Check size={14} className="text-emerald-500" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
