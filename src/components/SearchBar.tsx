"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
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

const ICON_MAP: Record<string, React.ElementType> = {
  Braces,
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

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    <div className="relative w-full">
      {/* ── Search Input Box ── */}
      <div
        className={[
          "flex items-center gap-2.5 rounded-xl transition-all duration-200",
          "bg-white dark:bg-[#141829]",
          isOpen
            ? "border-2 border-[#1F2544] dark:border-[#F5A623] shadow-[0_0_0_4px_rgba(245,166,35,0.18)]"
            : "border border-[#E4E0D8] dark:border-[#1E2338] shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:border-[#C4C0B8] dark:hover:border-[#2A2F48]",
          large ? "px-4 sm:px-5 py-3.5 sm:py-4 text-base" : "px-3.5 py-2 text-sm",
        ].join(" ")}
      >
        <Search
          size={large ? 20 : 16}
          strokeWidth={2.2}
          className="text-[#F5A623] shrink-0"
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
            "flex-1 min-w-0 w-full bg-transparent outline-none text-[#18181B] dark:text-[#F4F4F5] placeholder-[#A1A1AA] dark:placeholder-[#6B7280] font-medium truncate",
            large ? "text-sm sm:text-base" : "text-sm",
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
            <X size={15} strokeWidth={2.5} />
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-0.5 bg-[#F0EDE8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-md px-1.5 py-0.5 shrink-0 select-none font-mono text-[10px] text-[#71717A] dark:text-[#A1A1AA]">
            <span>{isMac ? "⌘" : "Ctrl"}</span>
            <span className="font-bold">K</span>
          </div>
        )}
      </div>

      {/* ── Search Dropdown / Command Palette ── */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={[
            "absolute top-full mt-2 bg-white/95 dark:bg-[#141829]/95 backdrop-blur-2xl border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.2)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.6)] z-50 overflow-hidden transition-all animate-in fade-in slide-in-from-top-2 duration-150",
            large || dropdownAlign === "full"
              ? "left-0 right-0 w-full"
              : dropdownAlign === "left"
              ? "left-0 right-auto w-[360px] sm:w-[480px] max-w-[calc(100vw-2rem)]"
              : "right-0 left-auto w-[360px] sm:w-[480px] max-w-[calc(100vw-2rem)]",
          ].join(" ")}
        >
          {/* Header Label Bar */}
          <div className="px-4 py-2.5 bg-[#FAFAF8] dark:bg-[#1E2338]/60 border-b border-[#E4E0D8] dark:border-[#2A2F48] flex items-center justify-between text-[11px] font-semibold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Search size={12} className="text-[#F5A623]" />
              <span>{query.trim() ? `Search Results (${searchResults.length})` : "Quick Suggestions"}</span>
            </span>
            <span className="text-[10px] lowercase font-normal opacity-75 hidden sm:inline">
              use ↑ ↓ arrows &amp; ↵ to select
            </span>
          </div>

          {/* ── RESULTS LIST CONTAINER ── */}
          <div ref={listContainerRef} className="max-h-[380px] overflow-y-auto p-1.5 space-y-1 relative">
            {/* When Query Exists */}
            {query.trim() ? (
              searchResults.length > 0 ? (
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
                      className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-left transition-all ${
                        isSelected
                          ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] shadow-sm"
                          : "hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5]"
                      }`}
                    >
                      {/* Tool Icon Box */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-white/20 dark:bg-black/20"
                            : "bg-[#F0EDE8] dark:bg-[#1E2338] tool-accent-text"
                        }`}
                        style={isSelected ? { color: "currentColor" } : getToolAccentStyle(tool.color, tool.darkColor)}
                      >
                        <IconComponent size={18} strokeWidth={2} />
                      </div>

                      {/* Tool Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm truncate">
                            {highlightMatch(tool.name, query)}
                          </span>
                          {tool.badge && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide shrink-0 ${
                                isSelected
                                  ? "bg-white/20 text-white dark:bg-black/20 dark:text-[#0C0F1E]"
                                  : "bg-[#F0EDE8] dark:bg-[#2A2F48] text-[#71717A] dark:text-[#A1A1AA]"
                              }`}
                            >
                              {tool.badge}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs truncate mt-0.5 ${
                            isSelected
                              ? "text-white/80 dark:text-[#0C0F1E]/80"
                              : "text-[#71717A] dark:text-[#A1A1AA]"
                          }`}
                        >
                          {highlightMatch(tool.desc, query)}
                        </p>
                      </div>

                      {/* Category & Arrow / Enter key */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[11px] font-medium hidden xs:inline ${
                            isSelected
                              ? "text-white/70 dark:text-[#0C0F1E]/70"
                              : "text-[#A1A1AA]"
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
                /* ── NO RESULTS STATE ── */
                <div className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#F5A623]/10 text-[#F5A623] flex items-center justify-center mx-auto">
                    <Search size={22} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#18181B] dark:text-[#F4F4F5]">
                      No tools found for &ldquo;{query}&rdquo;
                    </p>
                    <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-1 max-w-sm mx-auto leading-relaxed">
                      Try searching with broader terms like <span className="font-semibold text-[#F5A623]">PDF, Image, Nepali Date, Tax, QR Code</span>
                    </p>
                  </div>

                  {/* Suggest a Tool CTA */}
                  <div className="pt-2 border-t border-[#E4E0D8] dark:border-[#2A2F48]">
                    <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mb-2">
                      Need this tool built on SajiloTools?
                    </p>
                    <Link
                      href={`/contact?subject=Tool%20Suggestion%3A%20${encodeURIComponent(query)}&message=I%20would%20like%20to%20request%20the%20following%20tool%3A%20${encodeURIComponent(query)}`}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      <MessageSquarePlus size={13} />
                      Suggest &ldquo;{query}&rdquo;
                    </Link>
                  </div>
                </div>
              )
            ) : (
              /* ── EMPTY STATE QUICK SUGGESTIONS ── */
              popularTools.map((tool, idx) => {
                const IconComponent = ICON_MAP[tool.icon] || Braces;
                const isSelected = idx === selectedIndex;

                return (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.categorySlug}/${tool.slug}`}
                    onClick={() => handleSelectTool(tool)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-left transition-all ${
                      isSelected
                        ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] shadow-sm"
                        : "hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5]"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-white/20 dark:bg-black/20"
                          : "bg-[#F0EDE8] dark:bg-[#1E2338] tool-accent-text"
                      }`}
                      style={isSelected ? { color: "currentColor" } : getToolAccentStyle(tool.color, tool.darkColor)}
                    >
                      <IconComponent size={18} strokeWidth={2} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">{tool.name}</span>
                        {tool.badge && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide shrink-0 ${
                              isSelected
                                ? "bg-white/20 text-white dark:bg-black/20 dark:text-[#0C0F1E]"
                                : "bg-[#F0EDE8] dark:bg-[#2A2F48] text-[#71717A] dark:text-[#A1A1AA]"
                            }`}
                          >
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs truncate mt-0.5 ${
                          isSelected ? "text-white/80 dark:text-[#0C0F1E]/80" : "text-[#71717A] dark:text-[#A1A1AA]"
                        }`}
                      >
                        {tool.desc}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[11px] font-medium hidden xs:inline ${
                          isSelected ? "text-white/70 dark:text-[#0C0F1E]/70" : "text-[#A1A1AA]"
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
            )}
          </div>

          {/* ── Footer Info Bar ── */}
          <div className="px-4 py-2.5 bg-[#FAFAF8] dark:bg-[#1E2338]/60 border-t border-[#E4E0D8] dark:border-[#2A2F48] flex items-center justify-between text-[11px] text-[#71717A] dark:text-[#A1A1AA]">
            <span className="flex items-center gap-1.5 truncate">
              <Boxes size={12} className="text-[#F5A623] shrink-0" />
              <span>{ALL_TOOLS.length} Browser Tools</span>
            </span>
            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                href="/tools"
                onClick={() => setIsOpen(false)}
                className="hover:text-[#F5A623] transition-colors font-medium text-xs sm:text-[11px]"
              >
                Browse all &rarr;
              </Link>
              <span className="opacity-40 hidden sm:inline">|</span>
              <span className="font-mono text-[10px] hidden sm:inline">ESC to close</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="sm:hidden px-2.5 py-1 rounded-md bg-[#F0EDE8] dark:bg-[#2A2F48] text-[#18181B] dark:text-[#F4F4F5] font-semibold text-[11px] hover:bg-[#E4E0D8] dark:hover:bg-[#323854] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
