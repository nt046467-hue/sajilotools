"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Clock,
  BarChart3,
  AlertTriangle,
  Search,
  Calendar,
  X,
  Download,
  CheckCircle2,
  ShieldCheck,
  Globe,
  RefreshCw,
} from "lucide-react";
import AnimatedTrashIcon, { AnimatedTrashButton } from "@/components/shared/AnimatedTrashIcon";

export type ShortLinkItem = {
  slug: string;
  shortUrl: string;
  longUrl: string;
  clicks?: number;
  isActive?: boolean;
  expiresAt?: string | null;
  deleteToken?: string;
  createdAt: string;
};

const LOCAL_STORAGE_KEY = "sajilo_shortlinks";
const MAX_LOCAL_HISTORY = 50;

export default function UrlShortenerTool() {
  const searchParams = useSearchParams();

  // Tab
  const [activeTab, setActiveTab] = useState<"create" | "history">("create");

  // Form
  const [longUrl, setLongUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expiresIn, setExpiresIn] = useState<"never" | "24h" | "7d" | "30d">("never");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdResult, setCreatedResult] = useState<ShortLinkItem | null>(null);

  // History
  const [history, setHistory] = useState<ShortLinkItem[]>([]);
  const [historySearch, setHistorySearch] = useState("");
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);

  // Copy feedback
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [isCopiedMain, setIsCopiedMain] = useState(false);

  // QR modal
  const [qrModalItem, setQrModalItem] = useState<ShortLinkItem | null>(null);
  const qrRef = useRef<SVGSVGElement | null>(null);

  // Status banner
  const [bannerAlert, setBannerAlert] = useState<{
    type: "error" | "warning";
    title: string;
    message: string;
  } | null>(null);

  // ── Sync Live Click Counts & Status from Database ──
  async function syncLiveStats(itemsToSync?: ShortLinkItem[]) {
    const list = itemsToSync || history;
    if (!list || list.length === 0) return;
    const slugs = list.map((i) => i.slug).filter(Boolean);
    if (slugs.length === 0) return;

    setIsRefreshingStats(true);
    try {
      const res = await fetch(`/api/shorten?slugs=${encodeURIComponent(slugs.join(","))}`);
      if (res.ok) {
        const data = await res.json();
        if (data.stats && Array.isArray(data.stats)) {
          const statsMap = new Map<string, { clicks: number; isActive: boolean; expiresAt: string | null }>();
          data.stats.forEach((s: any) => statsMap.set(s.slug, s));

          setHistory((prev) => {
            const updated = prev.map((item) => {
              const live = statsMap.get(item.slug);
              if (live) {
                return {
                  ...item,
                  clicks: live.clicks ?? item.clicks ?? 0,
                  isActive: live.isActive ?? item.isActive ?? true,
                  expiresAt: live.expiresAt ?? item.expiresAt ?? null,
                };
              }
              return item;
            });
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
            } catch {}
            return updated;
          });
        }
      }
    } catch (err) {
      console.warn("Failed to sync live shortlink stats:", err);
    } finally {
      setIsRefreshingStats(false);
    }
  }

  // ── Check URL params for redirect errors ──
  useEffect(() => {
    const errorParam = searchParams.get("error");
    const slugParam = searchParams.get("slug");
    if (errorParam === "disabled") {
      setBannerAlert({
        type: "warning",
        title: "Link Disabled",
        message: slugParam
          ? `The short link "/s/${slugParam}" has been deactivated.`
          : "This short link has been deactivated.",
      });
    } else if (errorParam === "expired") {
      setBannerAlert({
        type: "warning",
        title: "Link Expired",
        message: slugParam
          ? `The short link "/s/${slugParam}" has expired.`
          : "This short link has expired.",
      });
    } else if (errorParam === "not-found") {
      setBannerAlert({
        type: "error",
        title: "Link Not Found",
        message: slugParam
          ? `No destination found for "/s/${slugParam}".`
          : "The requested short link could not be found.",
      });
    }
  }, [searchParams]);

  // ── Hydrate localStorage on mount and sync live click counts ──
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const list = parsed.slice(0, MAX_LOCAL_HISTORY);
          setHistory(list);
          syncLiveStats(list);
        }
      }
    } catch {}
  }, []);

  // ── Persist to localStorage ──
  function saveHistory(items: ShortLinkItem[]) {
    const trimmed = items.slice(0, MAX_LOCAL_HISTORY);
    setHistory(trimmed);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trimmed));
    } catch {}
  }

  // ── Create Short Link ──
  async function handleShortenUrl(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!longUrl.trim() || loading) return;
    setError("");
    setCreatedResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: longUrl.trim(),
          alias: alias.trim() || undefined,
          expiresIn: expiresIn === "never" ? undefined : expiresIn,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to shorten URL.");
        return;
      }

      const newItem: ShortLinkItem = {
        shortUrl: data.shortUrl,
        slug: data.slug,
        longUrl: data.longUrl,
        clicks: data.clicks ?? 0,
        isActive: data.isActive ?? true,
        expiresAt: data.expiresAt ?? null,
        deleteToken: data.deleteToken,
        createdAt: data.createdAt || new Date().toISOString(),
      };

      setCreatedResult(newItem);
      saveHistory([newItem, ...history.filter((x) => x.slug !== newItem.slug)]);
      setLongUrl("");
      setAlias("");
      setExpiresIn("never");
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Permanently delete short link from DB and local history ──
  async function handleDeleteLink(slug: string, deleteToken?: string) {
    saveHistory(history.filter((l) => l.slug !== slug));
    if (createdResult?.slug === slug) setCreatedResult(null);

    try {
      const res = await fetch(`/api/shorten/${encodeURIComponent(slug)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteToken }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok && res.status !== 404) {
        console.warn("Delete shortlink failed on server:", data.error);
        setBannerAlert({
          type: "warning",
          title: "Delete Warning",
          message: data.error || `Could not remove /s/${slug} from the server.`,
        });
      }
    } catch (err) {
      console.warn("Network error during link deletion:", err);
    }
  }

  // ── Copy ──
  function handleCopy(text: string, slug?: string) {
    navigator.clipboard.writeText(text);
    if (slug) {
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 1800);
    } else {
      setIsCopiedMain(true);
      setTimeout(() => setIsCopiedMain(false), 1800);
    }
  }

  // ── Download QR PNG ──
  function handleDownloadQr(slug: string) {
    if (!qrRef.current) return;
    const svgData = new XMLSerializer().serializeToString(qrRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = 600;
      canvas.height = 600;
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 600, 600);
        ctx.drawImage(img, 0, 0, 600, 600);
        const a = document.createElement("a");
        a.download = `qr-${slug}.png`;
        a.href = canvas.toDataURL("image/png");
        a.click();
      }
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  }

  // ── Filtered list ──
  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return history;
    const q = historySearch.toLowerCase();
    return history.filter(
      (item) => item.slug.toLowerCase().includes(q) || item.longUrl.toLowerCase().includes(q)
    );
  }, [history, historySearch]);

  return (
    <div className="space-y-6">
      {/* ── Banner Alert ── */}
      {bannerAlert && (
        <div
          className={`flex items-start justify-between gap-3 p-4 rounded-2xl border animate-in fade-in duration-300 ${
            bannerAlert.type === "error"
              ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300"
              : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300"
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold">{bannerAlert.title}</h4>
              <p className="text-xs mt-0.5 opacity-90">{bannerAlert.message}</p>
            </div>
          </div>
          <button onClick={() => setBannerAlert(null)} className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#F4F4F5] dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338]">
        <button
          onClick={() => setActiveTab("create")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === "create"
              ? "bg-white dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] shadow-sm"
              : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white"
          }`}
        >
          <Link2 size={14} /> Shorten Link
        </button>
        <button
          onClick={() => {
            setActiveTab("history");
            syncLiveStats();
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === "history"
              ? "bg-white dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] shadow-sm"
              : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white"
          }`}
        >
          <Clock size={14} /> My Links
          {history.length > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-[#F5A623]/20 text-[#D97706] dark:text-[#F5A623] font-bold">
              {history.length}
            </span>
          )}
        </button>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* TAB 1: CREATE */}
      {/* ═══════════════════════════════════════════ */}
      {activeTab === "create" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <form onSubmit={handleShortenUrl} className="space-y-4">
            {/* URL */}
            <div>
              <label className="block text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-2">
                Long URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  required
                  value={longUrl}
                  onChange={(e) => { setLongUrl(e.target.value); setError(""); }}
                  placeholder="https://example.com/very-long-url-path-name"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
                />
                <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
              </div>
            </div>

            {/* Alias + Expiration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] mb-1">
                  Custom Alias (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#A1A1AA] font-mono">/s/</span>
                  <input
                    type="text"
                    value={alias}
                    onChange={(e) => { setAlias(e.target.value); setError(""); }}
                    placeholder="my-custom-link"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40 font-mono text-[#18181B] dark:text-[#F4F4F5]"
                  />
                </div>
                <p className="text-[10px] text-[#A1A1AA] mt-1">3-30 chars · lowercase letters, numbers, hyphens</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] mb-1 flex items-center gap-1">
                  <Calendar size={12} /> Expiration
                </label>
                <select
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40 text-[#18181B] dark:text-[#F4F4F5]"
                >
                  <option value="never">Never (Permanent)</option>
                  <option value="24h">24 Hours</option>
                  <option value="7d">7 Days</option>
                  <option value="30d">30 Days</option>
                </select>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!longUrl.trim() || loading}
              className="w-full py-3 bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] font-semibold rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black rounded-full animate-spin" />
                  Shortening...
                </>
              ) : (
                <><Link2 size={16} /> Shorten URL</>
              )}
            </button>
          </form>

          {/* ── Success Card ── */}
          {createdResult && (
            <div className="p-5 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Link Created
                  </span>
                </div>
                {createdResult.expiresAt && (
                  <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                    <Clock size={10} /> Expires {new Date(createdResult.expiresAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white dark:bg-[#141829] rounded-xl border border-[#E4E0D8] dark:border-[#1E2338]">
                <a
                  href={createdResult.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono font-semibold text-[#F5A623] hover:underline flex items-center gap-1.5 truncate"
                >
                  {createdResult.shortUrl} <ExternalLink size={12} className="shrink-0" />
                </a>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopy(createdResult.shortUrl)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] hover:opacity-90"
                  >
                    {isCopiedMain ? <Check size={12} /> : <Copy size={12} />}
                    {isCopiedMain ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={() => setQrModalItem(createdResult)}
                    className="p-2 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-white dark:bg-[#1E2338] text-[#71717A] dark:text-[#F4F4F5] hover:bg-[#F4F4F5] dark:hover:bg-[#252C46] transition-colors"
                    title="QR Code"
                  >
                    <QrCode size={14} />
                  </button>
                  <AnimatedTrashButton
                    onDelete={() => handleDeleteLink(createdResult.slug, createdResult.deleteToken)}
                    className="p-2 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-white dark:bg-[#1E2338] text-[#71717A] dark:text-[#A1A1AA] hover:text-red-600 hover:border-red-300 dark:hover:border-red-900 transition-colors"
                    title="Delete short link"
                    iconSize={14}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
                <div className="flex items-center gap-1.5 truncate pr-2">
                  <span className="font-semibold shrink-0">Original:</span>
                  <span className="truncate">{createdResult.longUrl}</span>
                </div>
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 shrink-0">
                  <ShieldCheck size={12} /> Safe
                </span>
              </div>
            </div>
          )}

          {/* ── Info ── */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 text-blue-700 dark:text-blue-300 text-xs">
            <BarChart3 size={14} className="mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold">How it works:</span> Links are stored
              in our database and redirect via <code className="font-mono text-[10px] bg-blue-100 dark:bg-blue-900/40 px-1 py-0.5 rounded">/s/your-alias</code>.
              Click tracking is automatic. Your history is saved locally in this browser.
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* TAB 2: MY LINKS (local history) */}
      {/* ═══════════════════════════════════════════ */}
      {activeTab === "history" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Search & Refresh Controls */}
          {history.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search by alias or URL..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-xs text-[#18181B] dark:text-[#F4F4F5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
                />
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
                {historySearch && (
                  <button onClick={() => setHistorySearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#18181B]">
                    <X size={12} />
                  </button>
                )}
              </div>
              <button
                onClick={() => syncLiveStats()}
                disabled={isRefreshingStats}
                className="px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5] transition-colors flex items-center gap-1.5 shrink-0"
                title="Refresh Click Counts"
              >
                <RefreshCw size={13} className={isRefreshingStats ? "animate-spin text-[#F5A623]" : ""} />
                <span className="hidden sm:inline">{isRefreshingStats ? "Refreshing..." : "Refresh Stats"}</span>
              </button>
            </div>
          )}

          {/* List */}
          {filteredHistory.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-2xl bg-[#FAFAF8] dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-2">
              <Link2 size={32} className="mx-auto text-[#A1A1AA] opacity-50" />
              <h3 className="text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                {historySearch ? "No matching links" : "No shortened links yet"}
              </h3>
              <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] max-w-xs mx-auto">
                {historySearch
                  ? "Try a different search term."
                  : "Links you create will appear here with click counts and QR codes."}
              </p>
              {!historySearch && (
                <button onClick={() => setActiveTab("create")} className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] hover:opacity-90">
                  Create Your First Link
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredHistory.map((item) => {
                const isExpired = item.expiresAt && new Date(item.expiresAt) < new Date();

                return (
                  <div
                    key={item.slug}
                    className={`p-3.5 rounded-2xl bg-white dark:bg-[#141829] border ${
                      isExpired
                        ? "border-amber-200 dark:border-amber-950/60 opacity-75"
                        : "border-[#E4E0D8] dark:border-[#1E2338]"
                    } flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 transition-all hover:border-[#F5A623]/40`}
                  >
                    {/* Link details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={item.shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`font-mono text-xs font-bold flex items-center gap-1 truncate ${
                            isExpired ? "line-through text-[#A1A1AA]" : "text-[#F5A623] hover:underline"
                          }`}
                        >
                          /s/{item.slug} <ExternalLink size={10} className="shrink-0" />
                        </a>
                        {isExpired ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">Expired</span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">Active</span>
                        )}
                        {item.clicks !== undefined && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#FAFAF8] dark:bg-[#1E2338] text-[#71717A] dark:text-[#A1A1AA] border border-[#E4E0D8] dark:border-[#2A2F48] flex items-center gap-1">
                            <BarChart3 size={10} /> {item.clicks} {item.clicks === 1 ? "click" : "clicks"}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] truncate">{item.longUrl}</p>
                      <div className="flex items-center gap-3 text-[10px] text-[#A1A1AA]">
                        <span>Created {new Date(item.createdAt).toLocaleDateString()}</span>
                        {item.expiresAt && <span>· Expires {new Date(item.expiresAt).toLocaleDateString()}</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleCopy(item.shortUrl, item.slug)}
                        className="p-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white transition-colors"
                        title="Copy"
                      >
                        {copiedSlug === item.slug ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                      <button
                        onClick={() => setQrModalItem(item)}
                        className="p-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white transition-colors"
                        title="QR Code"
                      >
                        <QrCode size={14} />
                      </button>
                      <AnimatedTrashButton
                        onDelete={() => handleDeleteLink(item.slug, item.deleteToken)}
                        className="p-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#71717A] dark:text-[#A1A1AA] hover:text-red-600 hover:border-red-300 dark:hover:border-red-900 transition-colors"
                        title="Delete short link"
                        iconSize={14}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* QR CODE MODAL */}
      {/* ═══════════════════════════════════════════ */}
      {qrModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode size={18} className="text-[#F5A623]" />
                <h3 className="text-sm font-bold text-[#18181B] dark:text-[#F4F4F5]">
                  QR Code — /s/{qrModalItem.slug}
                </h3>
              </div>
              <button onClick={() => setQrModalItem(null)} className="p-1.5 rounded-xl hover:bg-[#F4F4F5] dark:hover:bg-[#1E2338] text-[#71717A]">
                <X size={16} />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl flex items-center justify-center border border-[#E4E0D8] dark:border-[#1E2338]">
              <QRCodeSVG ref={qrRef} value={qrModalItem.shortUrl} size={200} level="H" includeMargin />
            </div>

            <p className="text-[11px] text-center text-[#71717A] dark:text-[#A1A1AA] truncate font-mono">
              {qrModalItem.shortUrl}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => handleDownloadQr(qrModalItem.slug)}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] hover:opacity-90 flex items-center justify-center gap-1.5"
              >
                <Download size={13} /> Download PNG
              </button>
              <button
                onClick={() => handleCopy(qrModalItem.shortUrl)}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] hover:bg-[#F4F4F5] dark:hover:bg-[#252C46] flex items-center justify-center gap-1.5"
              >
                <Copy size={13} /> Copy Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
