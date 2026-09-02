"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  SearchX,
  X,
  ArrowRight,
  Boxes,
  Wrench,
  CornerDownLeft,
  FileText,
  Image as ImageIcon,
  Calculator,
  Braces,
  Ruler,
  AlignLeft,
  QrCode,
  Palette,
  ShieldCheck,
  Code2,
  Link2,
  Hash,
  Languages,
  Clock,
  Wand2,
  Maximize2,
  Crop,
  RefreshCw,
  Vault,
  Receipt,
  Keyboard,
  Calendar,
  MapPin,
  Stamp,
  FileImage,
  Minimize2,
  Percent,
  Landmark,
  Gem,
  Fingerprint,
  KeySquare,
  Clock4,
  FileArchive,
  Squircle,
  FlipHorizontal,
  CalendarDays,
  Scale,
  Car,
  Building2,
  ArrowLeftRight,
  GraduationCap,
  Activity,
  Tag,
  Flame,
  HeartPulse,
  Cake,
  MessageSquarePlus,
} from "lucide-react";
import { searchTools, getPopularSuggestions } from "@/lib/search-engine";
import { TOOLS as ALL_TOOLS, ToolDef } from "@/lib/tools-registry";
import { getToolAccentStyle } from "@/lib/theme-utils";
import { trackSearch } from "@/lib/analytics";
import DeveloperSuiteIcon from "@/components/shared/DeveloperSuiteIcon";

const ICON_MAP: Record<string, React.ElementType> = {
  Braces: DeveloperSuiteIcon,
  Developer: DeveloperSuiteIcon,
  AlignLeft,
  FileText,
  Image: ImageIcon,
  Calculator,
  Ruler,
  Code2,
  Link2,
  Hash,
  Search,
  Palette,
  ShieldCheck,
  QrCode,
  Clock,
  Languages,
  Maximize2,
  Crop,
  RefreshCw,
  Wand2,
  Keyboard,
  Calendar,
  Vault,
  Receipt,
  Boxes,
  Wrench,
  MapPin,
  Stamp,
  FileImage,
  Minimize2,
  Percent,
  Landmark,
  Gem,
  Fingerprint,
  KeySquare,
  Clock4,
  FileArchive,
  Squircle,
  FlipHorizontal,
  CalendarDays,
  Scale,
  Car,
  Building2,
  ArrowLeftRight,
  GraduationCap,
  Activity,
  Tag,
  Flame,
  HeartPulse,
  Cake,
};

interface SearchBarProps {
  large?: boolean;
  autoFocus?: boolean;
  onSelect?: () => void;
  placeholder?: string;
  dropdownAlign?: "left" | "right" | "full";
}

export default function SearchBar({
  large = false,
  autoFocus = false,
  onSelect,
  placeholder,
  dropdownAlign,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMac, setIsMac] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Detect OS for shortcut badge (⌘ vs Ctrl)
  useEffect(() => {
    if (typeof window !== "undefined" && window.navigator) {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent || navigator.platform));
    }
  }, []);

  // Compute Search Results using the unified search engine
  const searchResults = useMemo(() => {
    return searchTools(query, 8);
  }, [query]);

  // Fallback / discovery items for empty state
  const popularTools = useMemo(() => {
    return getPopularSuggestions(6);
  }, []);

  // Debounced analytics tracking when user types a query
  useEffect(() => {
    if (!query.trim()) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      trackSearch(query.trim());
    }, 600);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query]);

  // Reset selected index on query change
  useEffect(() => {
    setSelectedIndex(0);
    if (listContainerRef.current) {
      listContainerRef.current.scrollTop = 0;
    }
  }, [searchResults]);

  // Auto-scroll the active keyboard result into view
  useEffect(() => {
    if (!isOpen || !listContainerRef.current) return;
    const container = listContainerRef.current;
    const selectedEl = container.children[selectedIndex] as HTMLElement;

    if (selectedEl) {
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;
      const elTop = selectedEl.offsetTop - container.offsetTop;
      const elBottom = elTop + selectedEl.offsetHeight;

      if (elTop < containerTop) {
        container.scrollTop = elTop;
      } else if (elBottom > containerBottom) {
        container.scrollTop = elBottom - container.clientHeight;
      }
    }
  }, [selectedIndex, isOpen]);

  const handleSelectTool = useCallback(
    (tool: ToolDef) => {
      setIsOpen(false);
      router.push(`/tools/${tool.categorySlug}/${tool.slug}`);
      if (onSelect) onSelect();
    },
    [router, onSelect]
  );

  // Global Keyboard Navigation (Cmd+K / Ctrl+K / '/' / Arrow keys / Enter / Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }

      if (!isOpen) return;

      const activeListLength = query.trim() ? searchResults.length : popularTools.length;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (activeListLength > 0) {
          setSelectedIndex((prev) => (prev + 1) % activeListLength);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (activeListLength > 0) {
          setSelectedIndex((prev) => (prev - 1 + activeListLength) % activeListLength);
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (query.trim() && searchResults.length > 0) {
          const selected = searchResults[selectedIndex];
          if (selected) handleSelectTool(selected.tool);
        } else if (!query.trim() && popularTools.length > 0) {
          const selected = popularTools[selectedIndex];
          if (selected) handleSelectTool(selected);
        }
      } else if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, searchResults, popularTools, selectedIndex, query, handleSelectTool]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Robust click outside listener (mouse and touch)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Highlight matched substrings in text
  const highlightMatch = (text: string, q: string) => {
    if (!q.trim()) return text;
    const words = q.trim().split(" ").filter(Boolean);
    const regexStr = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    if (!regexStr) return text;

    const parts = text.split(new RegExp(`(${regexStr})`, "gi"));
    return (
      <>
        {parts.map((part, idx) =>
          words.some((w) => w.toLowerCase() === part.toLowerCase()) ? (
            <mark
              key={idx}
              className="bg-[#F5A623]/30 text-[#18181B] dark:text-[#F4F4F5] font-bold rounded-xs px-0.5"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const defaultHeroPlaceholder = "What do you want to do? e.g. compress PDF, calculate VAT, convert image...";
  const defaultHeaderPlaceholder = "Search tools...";

  return (
    <div ref={containerRef} className="relative w-full">
      {/* ── Search Input Box ── */}
      <div
        className={[
          "flex items-center gap-2.5 rounded-xl transition-all duration-200",
          "bg-white dark:bg-[#141829]",
          isOpen
            ? "border border-teal-600 dark:border-teal-500 shadow-[0_0_0_3px_rgba(13,148,136,0.15)]"
            : "border border-[#E4E0D8] dark:border-[#1E2338] shadow-xs hover:border-[#C4C0B8] dark:hover:border-[#2A2F48]",
          large ? "px-4 sm:px-5 py-3 sm:py-3.5 text-base" : "px-3.5 py-2 text-sm",
        ].join(" ")}
      >
        <Search
          size={large ? 18 : 16}
          strokeWidth={2}
          className="text-[#71717A] dark:text-[#A1A1AA] shrink-0"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder || (large ? defaultHeroPlaceholder : defaultHeaderPlaceholder)}
          className={[
            "flex-1 min-w-0 w-full bg-transparent outline-none text-[#18181B] dark:text-[#F4F4F5] placeholder-[#A1A1AA] dark:placeholder-[#71717A] font-medium truncate text-sm",
          ].join(" ")}
        />

        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setIsOpen(true);
              inputRef.current?.focus();
            }}
            className="p-1 rounded-full text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
            title="Clear search"
          >
            <X size={14} strokeWidth={2} />
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-0.5 bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] rounded-md px-1.5 py-0.5 shrink-0 select-none font-mono text-[10px] text-[#71717A] dark:text-[#A1A1AA]">
            <span>{isMac ? "⌘" : "Ctrl"}</span>
            <span className="font-bold">K</span>
          </div>
        )}
      </div>

      {/* ── Search Dropdown / Results List (Only shows when user types) ── */}
      {isOpen && query.trim().length > 0 && (
        <div
          ref={dropdownRef}
          className={[
            "absolute top-full mt-2 bg-white/98 dark:bg-[#0E1322]/98 backdrop-blur-2xl border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl shadow-2xl z-50 overflow-hidden transition-all animate-in fade-in slide-in-from-top-2 duration-150",
            large || dropdownAlign === "full"
              ? "left-0 right-0 w-full"
              : dropdownAlign === "left"
                ? "left-0 right-auto w-[360px] sm:w-[480px] max-w-[calc(100vw-2rem)]"
                : "right-0 left-auto w-[360px] sm:w-[480px] max-w-[calc(100vw-2rem)]",
          ].join(" ")}
        >
          {/* Header Label Bar */}
          <div className="px-3.5 sm:px-4 py-2 bg-[#FAFAF8] dark:bg-[#141829] border-b border-[#E4E0D8] dark:border-[#1E2338] flex items-center justify-between text-[11px] font-semibold text-[#71717A] dark:text-[#A1A1AA]">
            <span className="flex items-center gap-1.5">
              <Search size={13} className="text-teal-600 dark:text-teal-400" />
              <span>Results ({searchResults.length})</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] lowercase font-normal opacity-75 hidden sm:inline">
                ↑ ↓ navigate &bull; ↵ select
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(false);
                  inputRef.current?.blur();
                }}
                className="p-1 rounded-md text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
                title="Close"
              >
                <X size={13} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* ── RESULTS LIST CONTAINER ── */}
          <div ref={listContainerRef} className="max-h-[50vh] sm:max-h-[380px] overflow-y-auto p-1.5 space-y-1 relative">
            {searchResults.length > 0 ? (
              searchResults.map((res, idx) => {
                const tool = res.tool;
                const IconComponent = ICON_MAP[tool.icon] || Braces;
                const isSelected = idx === selectedIndex;

                return (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.categorySlug}/${tool.slug}`}
                    onClick={() => handleSelectTool(tool)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${isSelected
                      ? "bg-teal-600 text-white dark:bg-teal-500 dark:text-[#0C0F1E] shadow-xs"
                      : "hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-[#18181B] dark:text-[#F4F4F5]"
                      }`}
                  >
                    {/* Tool Icon Box */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isSelected
                        ? "bg-white/20 dark:bg-black/20"
                        : "bg-black/[0.04] dark:bg-white/[0.06] text-[#71717A] dark:text-[#A1A1AA]"
                        }`}
                    >
                      <IconComponent size={16} strokeWidth={2} />
                    </div>

                    {/* Tool Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs sm:text-sm truncate">
                          {highlightMatch(tool.name, query)}
                        </span>
                        {tool.badge && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${isSelected
                              ? "bg-white/20 text-white dark:bg-black/20 dark:text-[#0C0F1E]"
                              : "bg-black/[0.05] dark:bg-white/[0.08] text-[#71717A] dark:text-[#A1A1AA]"
                              }`}
                          >
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-[11px] truncate mt-0.5 ${isSelected
                          ? "text-white/80 dark:text-[#0C0F1E]/80"
                          : "text-[#71717A] dark:text-[#A1A1AA]"
                          }`}
                      >
                        {highlightMatch(tool.desc, query)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[11px] font-medium hidden sm:inline ${isSelected ? "text-white/70 dark:text-[#0C0F1E]/70" : "text-[#A1A1AA]"
                          }`}
                      >
                        {tool.category}
                      </span>
                      {isSelected ? (
                        <CornerDownLeft size={14} className="opacity-90 shrink-0" />
                      ) : (
                        <ArrowRight size={14} className="text-[#A1A1AA] shrink-0" />
                      )}
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="py-7 px-4 text-center space-y-2.5">
                <div className="w-10 h-10 mx-auto rounded-xl bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-[#71717A] dark:text-[#A1A1AA]">
                  <SearchX size={20} strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                    No tools found for &quot;{query}&quot;
                  </h4>
                  <p className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] max-w-[260px] mx-auto mt-0.5">
                    Didn&apos;t find what you were looking for? Request it now!
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <Link
                    href={`/contact?subject=${encodeURIComponent(`Tool Suggestion: ${query}`)}&message=${encodeURIComponent(`I would like to request the following tool: ${query}`)}`}
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-xs"
                  >
                    <MessageSquarePlus size={13} />
                    <span>Request tool</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      inputRef.current?.focus();
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#71717A] dark:text-[#A1A1AA] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Footer Info Bar ── */}
          <div className="px-3.5 sm:px-4 py-2.5 bg-[#FAFAF8] dark:bg-[#1E2338]/60 border-t border-[#E4E0D8] dark:border-[#2A2F48] flex items-center justify-between gap-2 text-[11px] text-[#71717A] dark:text-[#A1A1AA]">
            <span className="flex items-center gap-1.5 font-medium shrink-0">
              <Boxes size={13} className="text-[#F5A623] shrink-0" />
              <span>{ALL_TOOLS.length} Free Tools</span>
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/tools"
                onClick={() => setIsOpen(false)}
                className="font-semibold text-[#1F2544] dark:text-[#F5A623] hover:underline transition-colors text-xs sm:text-[11px] flex items-center gap-1"
              >
                Browse all &rarr;
              </Link>


            </div>
          </div>
        </div>
      )}
    </div>
  );
}
