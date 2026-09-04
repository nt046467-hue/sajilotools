"use client";

import React, { useState, useEffect } from "react";
import {
  Crown,
  Check,
  Zap,
  Shield,
  Loader2,
  Lock,
  X,
} from "lucide-react";

interface UpgradeProModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userEmail?: string;
}

export default function UpgradeProModal({
  isOpen,
  onClose,
  onSuccess,
  userEmail = "",
}: UpgradeProModalProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [paymentProvider, setPaymentProvider] = useState<"esewa" | "khalti" | "card">("esewa");
  const [emailInput, setEmailInput] = useState(userEmail);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const scrollY = window.scrollY;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;
    const originalOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      document.body.style.overflow = originalOverflow;
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes("@")) {
      setErrorMsg("Please provide a valid email address.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: billingCycle === "yearly" ? "pro_yearly" : "pro_monthly",
          provider: paymentProvider,
          email: emailInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Subscription checkout failed.");
      }

      setSuccessMsg("🎉 Pro Subscription Activated! Enjoy unlimited AI power.");
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const PRO_BENEFITS = [
    "Unlimited AI-Native Translations (Gemini 1.5 Flash)",
    "Formal, Casual & Romanized (Nepglish) Tone Controls",
    "Priority Ultra-Fast Neural Processing",
    "Bulk Text & Long Document Translation (>5,000 chars)",
    "100% Ad-Free Experience Across All SajiloTools",
    "Priority Support & Pro Tools Access",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-[500px] overflow-hidden bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] shadow-2xl rounded-3xl animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
          title="Close modal"
        >
          <X size={16} />
        </button>

        {/* Header Hero Banner */}
        <div className="bg-gradient-to-br from-[#1F2544] via-[#141829] to-[#0C0F1E] p-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#F5A623]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5A623]/20 border border-[#F5A623]/40 text-[#F5A623] text-xs font-bold uppercase tracking-wider mb-2">
            <Crown size={13} />
            <span>SajiloTools Pro Pass</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1">
            Unlock Unlimited AI Power
          </h2>
          <p className="text-xs text-zinc-300 max-w-sm mx-auto">
            Supercharge your workflow with flagship AI models, zero usage limits, and premium tools.
          </p>

          {/* Monthly vs Yearly Selector */}
          <div className="inline-flex items-center p-1 rounded-xl bg-white/10 backdrop-blur-md mt-4 border border-white/15">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-[#F5A623] text-[#0C0F1E] shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Monthly (Rs. 199/mo)
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                billingCycle === "yearly"
                  ? "bg-[#F5A623] text-[#0C0F1E] shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <span>Yearly (Rs. 1,499/yr)</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500 text-white font-extrabold">
                SAVE 37%
              </span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Pro Benefits Checklist */}
          <div className="space-y-2 bg-[#FAFAF8] dark:bg-[#101323] p-4 rounded-2xl border border-[#E4E0D8] dark:border-[#222842]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#71717A] dark:text-[#A1A1AA] block mb-2">
              Everything Included in Pro:
            </span>
            <div className="grid grid-cols-1 gap-2">
              {PRO_BENEFITS.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs font-medium text-[#18181B] dark:text-[#F4F4F5]">
                  <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleCheckout} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">
                Account / Receipt Email
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-sm text-[#18181B] dark:text-[#F4F4F5] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentProvider("esewa")}
                  className={`py-2.5 px-3 rounded-xl border-2 text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    paymentProvider === "esewa"
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                      : "border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A] hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338]"
                  }`}
                >
                  <span className="text-sm font-black">eSewa</span>
                  <span className="text-[10px] opacity-75">Nepal Wallet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentProvider("khalti")}
                  className={`py-2.5 px-3 rounded-xl border-2 text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    paymentProvider === "khalti"
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400"
                      : "border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A] hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338]"
                  }`}
                >
                  <span className="text-sm font-black">Khalti</span>
                  <span className="text-[10px] opacity-75">Digital Wallet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentProvider("card")}
                  className={`py-2.5 px-3 rounded-xl border-2 text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    paymentProvider === "card"
                      ? "border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]"
                      : "border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A] hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338]"
                  }`}
                >
                  <span className="text-sm font-black">Cards</span>
                  <span className="text-[10px] opacity-75">Visa / Master</span>
                </button>
              </div>
            </div>

            {/* Error / Success Feedback */}
            {errorMsg && (
              <p className="text-xs text-rose-500 font-medium bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/40">
                {errorMsg}
              </p>
            )}

            {successMsg && (
              <p className="text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900/40 text-center animate-pulse">
                {successMsg}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#F5A623] to-[#E8930C] text-[#0C0F1E] font-bold text-sm shadow-md hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Activating Pro Pass...</span>
                </>
              ) : (
                <>
                  <Zap size={16} className="fill-current" />
                  <span>
                    Activate Pro — Rs. {billingCycle === "yearly" ? "1,499/yr" : "199/mo"}
                  </span>
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-center gap-2 text-[11px] text-[#71717A]">
            <Lock size={12} />
            <span>Secure 256-bit encryption. Instant activation.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
