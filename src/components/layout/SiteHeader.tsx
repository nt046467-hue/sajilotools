"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Logo from "@/components/shared/Logo";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import {
  Sun,
  Moon,
  Menu,
  X,
  History,
  Settings2,
  ChevronDown,
  ArrowRight,
  Search,
  Command,
  ShieldCheck,
  Home,
  BookOpen,
  FileText,
  Calculator,
  MapPin,
  AlignLeft,
  Braces,
  Boxes,
  Image as ImageIcon,
} from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { TOOLS as REGISTERED_TOOLS } from "@/lib/tools-registry";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Tools", href: "/tools" },
  { name: "Guides", href: "/blog" },
  { name: "PDF", href: "/tools/pdf" },
  { name: "Image", href: "/tools/image" },
  { name: "Finance", href: "/tools/finance" },
  { name: "Developer", href: "/tools/developer" },
  { name: "Nepal", href: "/tools/nepal" },
];

export default function SiteHeader() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pwaActive, setPwaActive] = useState(true);
  const [recentTools, setRecentTools] = useState<
    { name: string; slug: string; categorySlug: string }[]
  >([]);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close mobile menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setMobileSearchOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  // Check initial PWA service worker status
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.getRegistrations().then((regs) => {
      setPwaActive(regs.length > 0);
    });
  }, []);

  const togglePwa = async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (pwaActive) {
      // Turn OFF: unregister service workers & clear caches
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const reg of regs) {
        await reg.unregister();
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      }
      setPwaActive(false);
    } else {
      // Turn ON: register service worker
      try {
        await navigator.serviceWorker.register("/sw.js");
        setPwaActive(true);
      } catch {
        // Fallback
      }
    }
  };

  // Close "More" dropdown on click outside or Escape key
  useEffect(() => {
    if (!moreOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMoreOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [moreOpen]);

  // Handle mobile drawer / search Escape key and body scroll lock
  useEffect(() => {
    if (!mobileOpen && !mobileSearchOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setMobileSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    if (mobileOpen) {
      const scrollY = window.scrollY;
      const body = document.body;

      // position:fixed is the only reliable way to block scroll on iOS/Android
      // The drawer is its own fixed element so it scrolls independently
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.overflow = "hidden";

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        body.style.position = "";
        body.style.top = "";
        body.style.left = "";
        body.style.right = "";
        body.style.overflow = "";
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen, mobileSearchOpen]);

  useEffect(() => {
    if (!historyOpen) return;
    try {
      const raw = localStorage.getItem("sajilo_history");
      if (!raw) {
        setRecentTools([]);
        return;
      }
      const saved = JSON.parse(raw) as {
        name: string;
        slug: string;
        categorySlug: string;
      }[];
      if (!Array.isArray(saved)) return;
      const valid = saved.slice(0, 10).flatMap((item) => {
        const tool = REGISTERED_TOOLS.find(
          (t) => t.slug === item?.slug && t.categorySlug === item?.categorySlug
        );
        return tool
          ? [{ name: tool.name, slug: tool.slug, categorySlug: tool.categorySlug }]
          : [];
      });
      setRecentTools(valid);
    } catch {
      setRecentTools([]);
    }
  }, [historyOpen]);

  function clearHistory() {
    try {
      localStorage.removeItem("sajilo_history");
    } catch {
      /* storage unavailable — non-critical, fail silently */
    }
    setRecentTools([]);
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0C0F1E]/80 backdrop-blur-xl border-b border-[#E4E0D8]/80 dark:border-[#1E2338]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <Logo size={28} priority />
            </Link>

            {/* Nav links */}
            <nav className="hidden lg:flex items-center gap-0.5 flex-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.name}
                  href={l.href}
                  className="px-2 xl:px-3 py-1.5 rounded-lg text-sm text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-[#F0EDE8] dark:hover:bg-[#141829] transition-colors font-medium"
                >
                  {l.name}
                </Link>
              ))}
              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setMoreOpen(!moreOpen)}
                  className="flex items-center gap-1 px-2 xl:px-3 py-1.5 rounded-lg text-sm text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-[#F0EDE8] dark:hover:bg-[#141829] transition-colors font-medium"
                >
                  More{" "}
                  <ChevronDown
                    size={13}
                    strokeWidth={2}
                    className={`transition-transform ${moreOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {moreOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-xl shadow-lg p-2 z-50">
                    <Link
                      href="/tools/everyday"
                      onClick={() => setMoreOpen(false)}
                      className="block px-3 py-2 text-sm font-semibold text-[#0D9488] dark:text-[#F5A623] hover:bg-[#F7F5F0] dark:hover:bg-[#1E2338] rounded-lg transition-colors"
                    >
                      Everyday &amp; Unit Tools
                    </Link>
                    <Link
                      href="/tools/text"
                      onClick={() => setMoreOpen(false)}
                      className="block px-3 py-2 text-sm text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-[#F7F5F0] dark:hover:bg-[#1E2338] rounded-lg transition-colors"
                    >
                      Text Tools
                    </Link>
                    <Link
                      href="/tools/developer/password-generator"
                      onClick={() => setMoreOpen(false)}
                      className="block px-3 py-2 text-sm text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-[#F7F5F0] dark:hover:bg-[#1E2338] rounded-lg transition-colors"
                    >
                      Password Generator
                    </Link>
                    <Link
                      href="/tools/developer/json-formatter"
                      onClick={() => setMoreOpen(false)}
                      className="block px-3 py-2 text-sm text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-[#F7F5F0] dark:hover:bg-[#1E2338] rounded-lg transition-colors"
                    >
                      JSON Formatter
                    </Link>
                    <Link
                      href="/tools/finance/nrs-converter"
                      onClick={() => setMoreOpen(false)}
                      className="block px-3 py-2 text-sm text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-[#F7F5F0] dark:hover:bg-[#1E2338] rounded-lg transition-colors"
                    >
                      NRs Currency Converter
                    </Link>
                  </div>
                )}
              </div>
            </nav>

            {/* Header Search */}
            <div className="hidden lg:block w-48 xl:w-64 ml-auto mr-1.5">
              <SearchBar placeholder="Search tools..." />
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-1.5 lg:ml-0 ml-auto">
              <button
                onClick={() => setHistoryOpen(true)}
                className="hidden sm:flex p-2 rounded-lg text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-[#F0EDE8] dark:hover:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] transition-colors"
                title="History"
              >
                <History size={16} strokeWidth={2} />
              </button>
              <button
                onClick={() => setSettingsOpen(true)}
                className="hidden sm:flex p-2 rounded-lg text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-[#F0EDE8] dark:hover:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] transition-colors"
                title="Settings"
              >
                <Settings2 size={16} strokeWidth={2} />
              </button>

              <button
                onClick={() => {
                  setMobileSearchOpen((o) => !o);
                  if (mobileOpen) setMobileOpen(false);
                }}
                className={`lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border transition-colors ${mobileSearchOpen
                    ? "text-[#18181B] dark:text-[#F4F4F5] bg-[#F0EDE8] dark:bg-[#141829] border-[#1F2544] dark:border-[#F5A623]"
                    : "text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-[#F0EDE8] dark:hover:bg-[#141829] border-[#E4E0D8] dark:border-[#1E2338]"
                  }`}
                aria-label="Search tools"
                title="Search"
              >
                <Search size={16} strokeWidth={2} />
              </button>

              <button
                onClick={() => {
                  const isCurrentlyDark = document.documentElement.classList.contains("dark");
                  setTheme(isCurrentlyDark ? "light" : "dark");
                }}
                className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center sm:inline-flex p-2.5 sm:p-2 rounded-lg text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-[#F0EDE8] dark:hover:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] transition-colors"
                aria-label="Toggle dark mode"
              >
                <Sun size={16} strokeWidth={2} className="hidden dark:block" />
                <Moon size={16} strokeWidth={2} className="block dark:hidden" />
              </button>
              <button
                onClick={() => {
                  setMobileOpen((o) => !o);
                  if (mobileSearchOpen) setMobileSearchOpen(false);
                }}
                className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center -mr-1 rounded-lg text-[#71717A] hover:bg-[#F0EDE8] dark:hover:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={16} strokeWidth={2} /> : <Menu size={16} strokeWidth={2} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── MOBILE SEARCH SLIDE-DOWN BAR ── */}
        {mobileSearchOpen && (
          <div className="lg:hidden border-t border-[#E4E0D8] dark:border-[#1E2338] bg-white/95 dark:bg-[#0C0F1E]/95 backdrop-blur-xl px-4 py-3 shadow-md animate-in slide-in-from-top-2 duration-150">
            <SearchBar
              autoFocus
              placeholder="Search 70+ tools (e.g. Base64, QR, PDF)..."
              dropdownAlign="full"
              onSelect={() => setMobileSearchOpen(false)}
            />
          </div>
        )}
      </header>

      {/* ── MOBILE DRAWER (always in DOM, transitioned via CSS) ── */}
      {/* Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-all duration-250 ${mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden={!mobileOpen}
      />
      {/* Drawer Panel */}
      <div
        className={`lg:hidden fixed top-0 right-0 z-50 h-dvh w-[85vw] max-w-sm bg-white dark:bg-[#0C0F1E] border-l border-[#E4E0D8] dark:border-[#1E2338] shadow-2xl flex flex-col overflow-hidden transition-transform duration-250 ease-out will-change-transform ${mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        aria-hidden={!mobileOpen}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E0D8] dark:border-[#1E2338] shrink-0 bg-[#FAFAF8] dark:bg-[#141829]/60">
          <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3">
            <Logo size={26} />
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="p-2 rounded-lg text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-[#E4E0D8]/50 dark:hover:bg-[#1E2338] transition-colors"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Drawer Body - Scrollable */}
        <div data-drawer-scroll className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* SEARCH IN DRAWER */}
          <div>
            <SearchBar
              placeholder="Search 70+ tools..."
              dropdownAlign="full"
              onSelect={() => setMobileOpen(false)}
            />
          </div>

          {/* MAIN SECTION */}
          <div>
            <div className="text-[10px] font-bold text-[#71717A] dark:text-[#6B7280] uppercase tracking-wider px-3 mb-2">
              MAIN
            </div>
            <div className="space-y-1">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#18181B] dark:text-[#F4F4F5] hover:bg-[#F0EDE8] dark:hover:bg-[#141829] transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Home size={17} className="text-[#1F2544] dark:text-[#F5A623]" />
                  Home
                </span>
                <ArrowRight size={14} className="opacity-40" />
              </Link>
              <Link
                href="/blog"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#18181B] dark:text-[#F4F4F5] hover:bg-[#F0EDE8] dark:hover:bg-[#141829] transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <BookOpen size={17} className="text-[#1F2544] dark:text-[#F5A623]" />
                  Guides
                </span>
                <ArrowRight size={14} className="opacity-40" />
              </Link>
            </div>
          </div>

          <hr className="border-[#E4E0D8] dark:border-[#1E2338]" />

          {/* TOOL CATEGORIES SECTION */}
          <div>
            <div className="text-[10px] font-bold text-[#71717A] dark:text-[#6B7280] uppercase tracking-wider px-3 mb-2">
              TOOL CATEGORIES
            </div>
            <div className="space-y-1">
              {[
                { name: "Text", href: "/tools/text", icon: AlignLeft, color: "text-amber-500" },
                { name: "PDF", href: "/tools/pdf", icon: FileText, color: "text-red-500" },
                { name: "Image", href: "/tools/image", icon: ImageIcon, color: "text-purple-500" },
                { name: "Finance", href: "/tools/finance", icon: Calculator, color: "text-emerald-500" },
                { name: "Developer", href: "/tools/developer", icon: Braces, color: "text-indigo-500 dark:text-indigo-400" },
                { name: "Nepal", href: "/tools/nepal", icon: MapPin, color: "text-rose-500" },
                { name: "Everyday", href: "/tools/everyday", icon: Boxes, color: "text-teal-500" },
              ].map((cat) => {
                const CatIcon = cat.icon;
                return (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#18181B] dark:text-[#F4F4F5] hover:bg-[#F0EDE8] dark:hover:bg-[#141829] transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <CatIcon size={17} className={cat.color} />
                      {cat.name}
                    </span>
                    <ArrowRight size={14} className="opacity-40" />
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* ── HISTORY MODAL ── */}
      {historyOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setHistoryOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History size={18} className="text-[#1F2544] dark:text-[#F5A623]" />
                <h3 className="font-semibold text-lg text-[#18181B] dark:text-[#F4F4F5]">
                  Recently Used Tools
                </h3>
              </div>
              <button
                onClick={() => setHistoryOpen(false)}
                className="text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 py-2 max-h-60 overflow-y-auto">
              {recentTools.length > 0 ? (
                recentTools.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/tools/${item.categorySlug}/${item.slug}`}
                    onClick={() => setHistoryOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F7F5F0] dark:bg-[#1E2338] hover:bg-[#F0EDE8] dark:hover:bg-[#252A42] transition-colors"
                  >
                    <span className="text-sm font-medium text-[#18181B] dark:text-[#F4F4F5]">
                      {item.name}
                    </span>
                    <ArrowRight size={14} className="text-[#A1A1AA]" />
                  </Link>
                ))
              ) : (
                <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] text-center py-4">
                  No tools used recently. Open any tool to build your history!
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E4E0D8] dark:border-[#2A2F48]">
              {recentTools.length > 0 ? (
                <button
                  onClick={clearHistory}
                  className="px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                >
                  Clear History
                </button>
              ) : (
                <span />
              )}
              <button
                onClick={() => setHistoryOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] hover:bg-[#F0EDE8] dark:hover:bg-[#1E2338] rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SETTINGS MODAL ── */}
      {settingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E4E0D8] dark:border-[#2A2F48] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#DC2626]/10 text-[#DC2626]">
                  <Settings2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#18181B] dark:text-[#F4F4F5]">
                    Preferences &amp; Settings
                  </h3>
                  <p className="text-xs text-[#71717A]">Customize your SajiloTools experience</p>
                </div>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* 1. Theme Mode */}
              <div>
                <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider mb-2">
                  Appearance / Theme
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTheme("light")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${theme === "light"
                      ? "bg-[#DC2626] text-white border-[#DC2626] shadow-sm"
                      : "border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A] hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338]"
                      }`}
                  >
                    <Sun size={14} /> Light
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${theme === "dark"
                      ? "bg-[#DC2626] text-white border-[#DC2626] shadow-sm"
                      : "border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A] hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338]"
                      }`}
                  >
                    <Moon size={14} /> Dark
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${theme === "system"
                      ? "bg-[#DC2626] text-white border-[#DC2626] shadow-sm"
                      : "border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A] hover:bg-[#FAFAF8] dark:hover:bg-[#1E2338]"
                      }`}
                  >
                    💻 System
                  </button>
                </div>
              </div>

              {/* 2. Privacy & Telemetry */}
              <div className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5]">
                      Privacy-First Telemetry
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    Zero Cookies
                  </span>
                </div>
                <p className="text-[11px] text-[#71717A]">
                  Anonymous tool usage counts help prioritize future tool updates. No PII or cookies stored.
                </p>
              </div>

              {/* 3. Offline PWA Status & Toggle */}
              <div className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] block">
                    Offline PWA Mode
                  </span>
                  <span className="text-[11px] text-[#71717A] block">
                    {pwaActive ? "App shell cached offline" : "Offline caching disabled"}
                  </span>
                </div>
                <button
                  onClick={togglePwa}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${pwaActive
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-[#71717A]/15 text-[#71717A] dark:text-[#A1A1AA] border border-[#71717A]/30"
                    }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${pwaActive ? "bg-emerald-500 animate-pulse" : "bg-[#71717A]"
                      }`}
                  />
                  {pwaActive ? "Active" : "Off"}
                </button>
              </div>

              {/* 4. Data Management */}
              <div>
                <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider mb-2">
                  Storage &amp; Data Management
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      clearHistory();
                      alert("Recent tools history cleared!");
                    }}
                    className="px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-white dark:bg-[#141829] text-[#71717A] hover:text-rose-600 hover:border-rose-500/30 text-xs font-bold transition-colors"
                  >
                    Clear History
                  </button>
                  <button
                    onClick={() => {
                      try {
                        localStorage.removeItem("sajilo_favorites");
                        alert("Saved favorites cleared!");
                      } catch { }
                    }}
                    className="px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-white dark:bg-[#141829] text-[#71717A] hover:text-rose-600 hover:border-rose-500/30 text-xs font-bold transition-colors"
                  >
                    Clear Favorites
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E4E0D8] dark:border-[#2A2F48]">
              <button
                onClick={() => setSettingsOpen(false)}
                className="px-5 py-2 bg-[#DC2626] text-white font-bold text-xs rounded-xl hover:bg-[#DC2626]/90 transition-colors shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
