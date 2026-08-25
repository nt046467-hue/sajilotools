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
import { CategoryAnimatedIcon, CategoryAnimatedIconHandle } from "@/components/layout/CategoryAnimatedIcon";
import { useRef } from "react";
import type { CategoryDef } from "@/lib/tools-registry";

export function ToolCardClient({ tool }: { tool: ToolDef }) {
  return <ToolCard tool={tool} />;
}

export function HomeCategoryCard({
  cat,
  toolCount,
}: {
  cat: CategoryDef;
  toolCount: number;
}) {
  const iconRef = useRef<CategoryAnimatedIconHandle>(null);

  return (
    <Link
      href={`/tools/${cat.slug}`}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") {
          iconRef.current?.trigger();
        }
      }}
      onTouchStart={() => {
        iconRef.current?.trigger();
      }}
      className="group flex flex-col items-center gap-3 p-5 bg-white dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] shadow-[0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-none st-card-hover hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)] text-center block transition-all"
    >
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.08] ${cat.bgClass}`}
      >
        <div
          className="tool-accent-text flex items-center justify-center"
          style={getToolAccentStyle(cat.color, cat.darkColor)}
        >
          <CategoryAnimatedIcon ref={iconRef} categoryName={cat.name} size={24} />
        </div>
      </div>
      <div>
        <div
          className="font-semibold text-[#18181B] dark:text-[#F4F4F5] text-sm mb-0.5 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          {cat.name}
        </div>
        <div className="text-[11px] text-[#A1A1AA]">{toolCount} tools</div>
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
