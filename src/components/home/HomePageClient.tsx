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

export function ToolCardClient({ tool }: { tool: ToolDef }) {
  const [favorited, setFavorited] = useState(false);
  const Icon = ICON_MAP[tool.icon] || ShieldCheck;

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sajilo_favorites");
      if (stored) {
        const set = new Set(JSON.parse(stored));
        setFavorited(set.has(tool.name));
      }
    } catch {}
  }, [tool.name]);

  const toggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const stored = localStorage.getItem("sajilo_favorites");
      const list: string[] = stored ? JSON.parse(stored) : [];
      let updated: string[];
      if (list.includes(tool.name)) {
        updated = list.filter((n) => n !== tool.name);
        setFavorited(false);
      } else {
        updated = [...list, tool.name];
        setFavorited(true);
      }
      localStorage.setItem("sajilo_favorites", JSON.stringify(updated));
    } catch {}
  };

  return (
    <Link
      href={`/tools/${tool.categorySlug}/${tool.slug}`}
      className="group relative block bg-white dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.05)] dark:shadow-none st-card-hover hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
    >
      <div className="flex items-start justify-between mb-5">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 tool-accent-bg tool-accent-text"
          style={getToolAccentStyle(tool.color, tool.darkColor)}
        >
          <Icon size={20} strokeWidth={2} />
        </div>
        <button
          onClick={toggleFav}
          className={`p-1.5 rounded-lg transition-all duration-150 ${
            favorited
              ? "text-rose-500 bg-rose-50 dark:bg-rose-950/50"
              : "text-[#D4D4D8] dark:text-[#374151] hover:text-[#A1A1AA] dark:hover:text-[#6B7280] hover:bg-[#F7F5F0] dark:hover:bg-[#1E2338]"
          }`}
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart size={15} strokeWidth={2} fill={favorited ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <h3
          className="font-semibold text-[#18181B] dark:text-[#F4F4F5] text-sm leading-snug"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          {tool.name}
        </h3>
        <Badge label={tool.badge} />
      </div>
      <p className="text-[#71717A] dark:text-[#A1A1AA] text-xs leading-relaxed mb-5">
        {tool.desc}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-[#C4C0B8] dark:text-[#374151] uppercase tracking-wider">
          {tool.category}
        </span>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <span className="flex items-center gap-1 text-xs font-semibold text-[#1F2544] dark:text-[#F5A623]">
            Open <ArrowRight size={11} strokeWidth={2} />
          </span>
        </div>
      </div>
    </Link>
  );
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
