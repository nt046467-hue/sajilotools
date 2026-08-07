"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Key, ShieldCheck, RefreshCw } from "lucide-react";
import { md5 } from "js-md5";

export default function HmacGeneratorTool() {
  const [message, setMessage] = useState("Hello World");
  const [secretKey, setSecretKey] = useState("secret-key");
  const [outputEncoding, setOutputEncoding] = useState<"hex" | "base64">("hex");
  const [results, setResults] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState("");

  useEffect(() => {
    computeHmacs();
  }, [message, secretKey, outputEncoding]);

  async function computeHmacs() {
    if (!message || !secretKey) {
      setResults({});
      return;
    }

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const msgData = encoder.encode(message);
    const res: Record<string, string> = {};

    // Web Crypto supported algorithms
    const cryptoAlgos = [
      { name: "HMAC-SHA-256", hash: "SHA-256" },
      { name: "HMAC-SHA-512", hash: "SHA-512" },
      { name: "HMAC-SHA-1", hash: "SHA-1" },
    ];

    for (const item of cryptoAlgos) {
      try {
        const cryptoKey = await crypto.subtle.importKey(
          "raw",
          keyData,
          { name: "HMAC", hash: item.hash },
          false,
          ["sign"]
        );
        const signature = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
        const byteArray = new Uint8Array(signature);

        if (outputEncoding === "base64") {
          let binary = "";
          byteArray.forEach((b) => (binary += String.fromCharCode(b)));
          res[item.name] = btoa(binary);
        } else {
          res[item.name] = Array.from(byteArray)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        }
      } catch (err) {
        res[item.name] = "Error computing HMAC";
      }
    }

    // HMAC-MD5 via js-md5
    res["HMAC-MD5"] =
      outputEncoding === "base64"
        ? md5.hmac.base64(secretKey, message)
        : md5.hmac.hex(secretKey, message);

    setResults(res);
  }

  function handleCopy(key: string, val: string) {
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  }

  function generateRandomKey() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const keyStr = Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    setSecretKey(keyStr);
  }

  return (
    <div className="space-y-6">
      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5]">
              Secret Key
            </label>
            <button
              onClick={generateRandomKey}
              className="text-xs text-[#F5A623] hover:underline flex items-center gap-1"
            >
              <RefreshCw size={12} /> Random Key
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Enter secret key..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
            />
            <Key size={14} className="absolute left-3 top-3 text-[#A1A1AA]" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-2">
            Output Format / Encoding
          </label>
          <div className="flex rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] p-1">
            <button
              onClick={() => setOutputEncoding("hex")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                outputEncoding === "hex"
                  ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E]"
                  : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
              }`}
            >
              Hexadecimal (Hex)
            </button>
            <button
              onClick={() => setOutputEncoding("base64")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                outputEncoding === "base64"
                  ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E]"
                  : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
              }`}
            >
              Base64
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-2">
          Plain Text Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter message to compute HMAC signature..."
          className="w-full h-28 px-4 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40 resize-none text-sm font-mono"
        />
      </div>

      {/* Generated Signatures */}
      {Object.keys(results).length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
            Computed HMAC Signatures ({outputEncoding.toUpperCase()})
          </h3>
          {["HMAC-SHA-256", "HMAC-SHA-512", "HMAC-SHA-1", "HMAC-MD5"].map((algo) => (
            <div
              key={algo}
              className="p-4 rounded-xl bg-[#F7F5F0] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[#1F2544] dark:text-[#F5A623] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} /> {algo}
                </span>
                <button
                  onClick={() => handleCopy(algo, results[algo])}
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
                {results[algo] || "..."}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


