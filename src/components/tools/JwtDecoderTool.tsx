"use client";

import { useState, useMemo, useEffect } from "react";
import { KeySquare, ShieldCheck, ShieldAlert, Clock, ChevronDown, ChevronUp, Copy, Check, Info } from "lucide-react";
import { decodeJwt, verifyJwtHmacSignature, JwtDecoded } from "@/lib/encoding-utils";

const SAMPLE_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik5hYmluIFRoYXBhIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjIsImFkbWluIjp0cnVlfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export default function JwtDecoderTool() {
  const [tokenInput, setTokenInput] = useState<string>(SAMPLE_JWT);
  const [secret, setSecret] = useState<string>("");
  const [showVerify, setShowVerify] = useState<boolean>(false);
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Decode result
  const decodedResult = useMemo(() => {
    if (!tokenInput.trim()) return null;
    try {
      const decoded = decodeJwt(tokenInput);
      return { success: true, data: decoded, error: null };
    } catch (err: any) {
      return { success: false, data: null, error: err.message || "Failed to decode JWT" };
    }
  }, [tokenInput]);

  // Handle secret verification
  useEffect(() => {
    async function runVerification() {
      if (!secret.trim() || !decodedResult?.data) {
        setVerifyResult(null);
        return;
      }
      try {
        setVerifying(true);
        const valid = await verifyJwtHmacSignature(tokenInput, secret);
        setVerifyResult(valid);
      } catch (e) {
        setVerifyResult(false);
      } finally {
        setVerifying(false);
      }
    }
    runVerification();
  }, [secret, tokenInput, decodedResult]);

  // Compute time-validity status badge
  const timeValidityStatus = useMemo(() => {
    if (!decodedResult?.data?.payload) return null;
    const payload = decodedResult.data.payload;
    const nowSec = Math.floor(Date.now() / 1000);

    if (payload.exp && typeof payload.exp === "number") {
      if (nowSec > payload.exp) {
        return { status: "expired", label: "Token Expired", color: "rose", desc: `Expired on ${new Date(payload.exp * 1000).toLocaleString()}` };
      }
    }
    if (payload.nbf && typeof payload.nbf === "number") {
      if (nowSec < payload.nbf) {
        return { status: "not_active", label: "Not Active Yet", color: "amber", desc: `Active from ${new Date(payload.nbf * 1000).toLocaleString()}` };
      }
    }
    if (payload.exp) {
      return { status: "valid", label: "Time-Valid", color: "emerald", desc: `Expires on ${new Date(payload.exp * 1000).toLocaleString()}` };
    }
    return { status: "no_exp", label: "No Expiration Set", color: "blue", desc: "Token does not contain an 'exp' claim" };
  }, [decodedResult]);

  // Prettify claims for special timestamp keys (exp, iat, nbf)
  const formattedPayloadClaims = useMemo(() => {
    if (!decodedResult?.data?.payload) return [];
    const payload = decodedResult.data.payload;
    return Object.entries(payload).map(([key, val]) => {
      let isTimestamp = false;
      let dateStr = "";

      if ((key === "exp" || key === "iat" || key === "nbf") && typeof val === "number") {
        isTimestamp = true;
        dateStr = new Date(val * 1000).toLocaleString();
      }

      return { key, val, isTimestamp, dateStr };
    });
  }, [decodedResult]);

  const copyToClipboard = (text: string, sectionName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionName);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
            <KeySquare size={16} className="text-[#22C55E]" /> Paste Encoded JWT Token
          </label>
          <button
            type="button"
            onClick={() => setTokenInput("")}
            className="text-xs font-bold text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] transition-colors"
          >
            Clear Input
          </button>
        </div>

        <textarea
          rows={4}
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          placeholder="Paste JWT token (e.g. eyJhbGciOiJIUzI1Ni...)"
          className="w-full p-4 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#22C55E]/40 break-all resize-none"
        />

        {/* Decode Error Message */}
        {decodedResult && !decodedResult.success && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
            <ShieldAlert size={16} className="shrink-0" />
            <span>{decodedResult.error}</span>
          </div>
        )}

        {/* Time Validity Status Banner */}
        {timeValidityStatus && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-3 ${
              timeValidityStatus.color === "emerald"
                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                : timeValidityStatus.color === "rose"
                ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400"
                : timeValidityStatus.color === "amber"
                ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-300"
                : "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-blue-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock size={16} className="shrink-0" />
              <span>
                <strong>{timeValidityStatus.label}:</strong> {timeValidityStatus.desc}
              </span>
            </div>

            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-white/60 dark:bg-black/20 shrink-0">
              Client Time Check
            </span>
          </div>
        )}
      </div>

      {/* 3-Panel Output (Header, Payload, Signature) */}
      {decodedResult?.success && decodedResult.data && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Header & Signature Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header Box */}
            <div className="p-5 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Header (Algorithm & Token Type)
                </h4>
                <button
                  type="button"
                  onClick={() => copyToClipboard(JSON.stringify(decodedResult.data.header, null, 2), "header")}
                  className="p-1 rounded-lg text-xs text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] transition-colors"
                >
                  {copiedSection === "header" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>

              <pre className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] font-mono text-xs text-[#18181B] dark:text-[#F4F4F5] overflow-x-auto">
                {JSON.stringify(decodedResult.data.header, null, 2)}
              </pre>
            </div>

            {/* Signature & Verification Box */}
            <div className="p-5 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" /> Signature
                </h4>
                <button
                  type="button"
                  onClick={() => copyToClipboard(decodedResult.data.signature, "signature")}
                  className="p-1 rounded-lg text-xs text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] transition-colors"
                >
                  {copiedSection === "signature" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] font-mono text-xs text-[#71717A] dark:text-[#A1A1AA] break-all">
                {decodedResult.data.signature}
              </div>

              {/* Optional Secret Verification Toggle */}
              <div className="pt-2 border-t border-[#E4E0D8] dark:border-[#1E2338]">
                <button
                  type="button"
                  onClick={() => setShowVerify(!showVerify)}
                  className="w-full flex items-center justify-between text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#22C55E]" /> Verify HMAC Signature (HS256/384/512)
                  </span>
                  {showVerify ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showVerify && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="block text-[11px] text-[#71717A] font-semibold mb-1">
                        Enter Shared Secret Key (Client-side verify only)
                      </label>
                      <input
                        type="text"
                        value={secret}
                        onChange={(e) => setSecret(e.target.value)}
                        placeholder="your-256-bit-secret"
                        className="w-full px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-mono text-xs"
                      />
                    </div>

                    {secret.trim() && (
                      <div
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                          verifying
                            ? "bg-gray-100 text-gray-700"
                            : verifyResult
                            ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {verifyResult ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                        <span>
                          {verifying
                            ? "Verifying HMAC signature..."
                            : verifyResult
                            ? "Signature Verified Successfully!"
                            : "Invalid Signature or Secret Mismatch"}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payload Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-5 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> Payload Claims
                </h4>
                <button
                  type="button"
                  onClick={() => copyToClipboard(JSON.stringify(decodedResult.data.payload, null, 2), "payload")}
                  className="p-1 rounded-lg text-xs text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] transition-colors"
                >
                  {copiedSection === "payload" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>

              {/* Parsed JSON Code View */}
              <pre className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] font-mono text-xs text-[#18181B] dark:text-[#F4F4F5] overflow-x-auto max-h-72">
                {JSON.stringify(decodedResult.data.payload, null, 2)}
              </pre>

              {/* Formatted Claims Table with Human-Readable Timestamps */}
              <div className="pt-2 border-t border-[#E4E0D8] dark:border-[#1E2338] space-y-2">
                <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider block">
                  Claims Breakdown:
                </span>

                <div className="space-y-1.5">
                  {formattedPayloadClaims.map(({ key, val, isTimestamp, dateStr }, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                    >
                      <span className="font-mono font-bold text-[#1F2544] dark:text-[#22C55E]">
                        {key}
                      </span>

                      <div className="text-right">
                        <span className="font-mono font-semibold text-[#18181B] dark:text-[#F4F4F5] block sm:inline">
                          {typeof val === "object" ? JSON.stringify(val) : String(val)}
                        </span>
                        {isTimestamp && (
                          <span className="text-[10px] text-[#A1A1AA] block sm:ml-2 font-sans">
                            ({dateStr})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Privacy note */}
            <div className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-xs text-[#71717A] flex items-center gap-2">
              <Info size={14} className="text-[#22C55E] shrink-0" />
              <span>
                <strong>100% Client-Side:</strong> Your token and secret key are decoded and processed entirely in your browser. No data is sent to external servers.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
