"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ArrowRight, Check, ShieldCheck, Zap, MapPin } from "lucide-react";
import { getToolAccentStyle } from "@/lib/theme-utils";
import { BADGE_CONFIG, ICON_MAP } from "@/components/home/home-constants";
import type { ToolDef } from "@/lib/tools-registry";

function Badge({ label }: { label: string }) {
  const cfg = BADGE_CONFIG[label] ?? {
    bg: "#F3F4F6",
    text: "#374151",
    darkBg: "#1F2937",
    darkText: "#D1D5DB",
  };
  return (
    <span
      className="inline-block text-[10px] font-semibold px-2 py-[3px] rounded-full tracking-wide leading-none st-badge"
      style={
        {
          "--badge-bg": cfg.bg,
          "--badge-text": cfg.text,
          "--badge-dark-bg": cfg.darkBg,
          "--badge-dark-text": cfg.darkText,
        } as React.CSSProperties
      }
    >
      {label}
    </span>
  );
}

import ToolCard from "@/components/tools/shared/ToolCard";

export function ToolCardClient({ tool }: { tool: ToolDef }) {
  return <ToolCard tool={tool} />;
}

export function NewsletterClient() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false);
  const [subscribeHoneypot, setSubscribeHoneypot] = useState("");
  const [submittingSubscribe, setSubmittingSubscribe] = useState(false);
  const [subscribeError, setSubscribeError] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submittingSubscribe) return;

    setSubmittingSubscribe(true);
    setSubscribeError("");
    setIsAlreadySubscribed(false);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, honeypot: subscribeHoneypot }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to subscribe.");

      if (data.alreadySubscribed) setIsAlreadySubscribed(true);
      setSubscribed(true);
    } catch (err: any) {
      setSubscribeError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmittingSubscribe(false);
    }
  };

  if (subscribed) {
    return (
      <div
        className={`inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border font-medium text-sm ${
          isAlreadySubscribed
            ? "bg-[#FEF3C7] dark:bg-[#78350F]/40 border-[#FDE68A] dark:border-[#92400E] text-[#B45309] dark:text-[#FDE68A]"
            : "bg-[#DCFCE7] dark:bg-[#052E16]/60 border-[#BBF7D0] dark:border-[#14532D] text-[#15803D] dark:text-[#86EFAC]"
        }`}
      >
        <Check size={16} strokeWidth={2} />
        {isAlreadySubscribed
          ? "You're already subscribed to our newsletter!"
          : "You are subscribed — thanks!"}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubscribe} className="max-w-md mx-auto space-y-3">
      <div className="hidden" aria-hidden="true">
        <input
          type="text"
          name="b_website"
          tabIndex={-1}
          autoComplete="off"
          value={subscribeHoneypot}
          onChange={(e) => setSubscribeHoneypot(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="flex-1 min-w-0 h-11 px-3 sm:px-4 rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground/60 text-sm outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary transition-all shadow-sm"
        />
        <button
          type="submit"
          disabled={submittingSubscribe}
          className="h-11 px-4 sm:px-6 rounded-xl font-semibold text-sm bg-primary text-primary-foreground flex-shrink-0 hover:brightness-110 active:scale-[0.97] transition-all disabled:opacity-50 shadow-sm whitespace-nowrap"
        >
          {submittingSubscribe ? "Subscribing..." : "Subscribe"}
        </button>
      </div>

      {subscribeError && (
        <p className="text-xs text-red-500 dark:text-red-400 font-medium text-center">
          {subscribeError}
        </p>
      )}
    </form>
  );
}
