"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { getToolAccentStyle } from "@/lib/theme-utils";
import { ICON_MAP, BADGE_CONFIG, getToolIcon } from "@/components/home/home-constants";
import type { ToolDef } from "@/lib/tools-registry";

interface ToolCardProps {
  tool: ToolDef;
  showCategory?: boolean;
  className?: string;
}

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

// Global active navigation target across all tool cards
let activeNavigatingSlug: string | null = null;

export default function ToolCard({
  tool,
  showCategory = true,
  className = "",
}: ToolCardProps) {
  const pathname = usePathname();
  const [favorited, setFavorited] = useState(false);
  const [isNavigatingThis, setIsNavigatingThis] = useState(false);

  const Icon = getToolIcon(tool.icon);

  // Reset when route changes or user navigates back/forward
  useEffect(() => {
    activeNavigatingSlug = null;
    setIsNavigatingThis(false);
  }, [pathname]);

  useEffect(() => {
    const handleReset = () => {
      activeNavigatingSlug = null;
      setIsNavigatingThis(false);
    };

    const handleGlobalNavChange = (e: Event) => {
      const customEvent = e as CustomEvent<string | null>;
      setIsNavigatingThis(customEvent.detail === tool.slug);
    };

    window.addEventListener("pageshow", handleReset);
    window.addEventListener("popstate", handleReset);
    window.addEventListener("sajilo_tool_navigating", handleGlobalNavChange);

    return () => {
      window.removeEventListener("pageshow", handleReset);
      window.removeEventListener("popstate", handleReset);
      window.removeEventListener("sajilo_tool_navigating", handleGlobalNavChange);
    };
  }, [tool.slug]);

  // Safety timeout: Auto-reset loading state if navigation is cancelled or delayed
  useEffect(() => {
    if (!isNavigatingThis) return;
    const timer = setTimeout(() => {
      setIsNavigatingThis(false);
      activeNavigatingSlug = null;
    }, 4000);
    return () => clearTimeout(timer);
  }, [isNavigatingThis]);

  useEffect(() => {
    const syncFav = () => {
      try {
        const stored = localStorage.getItem("sajilo_favorites");
        if (stored) {
          const set = new Set(JSON.parse(stored));
          setFavorited(set.has(tool.name));
        } else {
          setFavorited(false);
        }
      } catch {}
    };

    syncFav();
    window.addEventListener("sajilo_favorites_updated", syncFav);
    return () => window.removeEventListener("sajilo_favorites_updated", syncFav);
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
      window.dispatchEvent(new Event("sajilo_favorites_updated"));
    } catch {}
  };

  const handleCardClick = () => {
    activeNavigatingSlug = tool.slug;
    setIsNavigatingThis(true);
    window.dispatchEvent(
      new CustomEvent("sajilo_tool_navigating", { detail: tool.slug })
    );
  };

  return (
    <div
      className={`group relative block bg-white dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] p-5 sm:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.05)] dark:shadow-none transition-all duration-200 ${
        isNavigatingThis
          ? "opacity-90 pointer-events-none cursor-wait ring-1 ring-[#F5A623]/30"
          : "hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 active:scale-[0.98]"
      } ${className}`}
    >
      {/* Primary Stretched Navigation Link covering the whole card */}
      <Link
        href={`/tools/${tool.categorySlug}/${tool.slug}`}
        onClick={handleCardClick}
        className="absolute inset-0 z-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
        aria-label={tool.name}
      />

      {/* Header Row: Icon + Favorite Button */}
      <div className="relative z-10 flex items-start justify-between mb-4 sm:mb-5 pointer-events-none">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 tool-accent-bg tool-accent-text transition-transform duration-200 group-hover:scale-105 pointer-events-auto"
          style={getToolAccentStyle(tool.color, tool.darkColor)}
        >
          <Icon size={20} strokeWidth={2} />
        </div>

        <button
          type="button"
          onClick={toggleFav}
          data-no-progress="true"
          className={`p-2 rounded-xl transition-all duration-150 pointer-events-auto cursor-pointer border ${
            favorited
              ? "text-rose-500 bg-rose-500/15 border-rose-500/30"
              : "text-[#A1A1AA] hover:text-rose-500 bg-[#FAFAF8] dark:bg-[#1E2338] border-[#E4E0D8] dark:border-[#2A2F48]"
          }`}
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart size={16} strokeWidth={2} className={favorited ? "fill-rose-500 text-rose-500" : ""} />
        </button>
      </div>

      {/* Tool Title & Badge */}
      <div className="relative z-0 flex items-center gap-2 mb-1.5 flex-wrap pointer-events-none">
        <h3
          className="font-semibold text-[#18181B] dark:text-[#F4F4F5] text-sm leading-snug group-hover:text-[#F5A623] transition-colors"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          {tool.name}
        </h3>
        {tool.badge && <Badge label={tool.badge} />}
      </div>

      {/* Tool Description */}
      <p className="relative z-0 text-[#71717A] dark:text-[#A1A1AA] text-xs leading-relaxed mb-4 line-clamp-2 min-h-[32px] pointer-events-none">
        {tool.desc}
      </p>

      {/* Footer Row: Category + Open Link / Single Micro-Spinner */}
      <div className="relative z-0 flex items-center justify-between pt-2 border-t border-[#E4E0D8]/50 dark:border-[#1E2338]/50 pointer-events-none">
        {showCategory ? (
          <span className="text-[10px] font-semibold text-[#A1A1AA] dark:text-[#52525B] uppercase tracking-wider">
            {tool.category}
          </span>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-1 text-xs font-semibold">
          {isNavigatingThis ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#F5A623]">
              <Loader2 size={13} className="animate-spin" />
              <span>Opening...</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[#1F2544] dark:text-[#F5A623] opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
              Open <ArrowRight size={11} strokeWidth={2} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
