"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Lock,
  BarChart3,
  Search,
  MessageSquare,
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  Users,
  Eye,
  Activity,
  AlertTriangle,
  Flame,
  ArchiveX,
  HelpCircle,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { AnalyticsSummary } from "@/lib/analytics-db";

type TabType = "traffic" | "tools" | "searches" | "health";
type RangeType = "24h" | "7d" | "30d" | "all";

export default function AdminAnalyticsClient() {
  const [keyInput, setKeyInput] = useState("");
  const [authenticatedKey, setAuthenticatedKey] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("traffic");
  const [timeRange, setTimeRange] = useState<RangeType>("30d");

  const fetchAnalytics = useCallback(async (keyToUse: string, range: RangeType) => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {};
      if (keyToUse) {
        headers["x-admin-key"] = keyToUse;
      }
      const res = await fetch(`/api/admin/analytics?range=${range}`, { headers });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized: Invalid secret admin key or insufficient role.");
        throw new Error("Failed to load live analytics data.");
      }
      const json = await res.json();
      setData(json);
      setAuthenticatedKey(keyToUse);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch if key was saved in session
  useEffect(() => {
    const savedKey = sessionStorage.getItem("sajilo_admin_key");
    if (savedKey) {
      fetchAnalytics(savedKey, timeRange);
    }
  }, [fetchAnalytics, timeRange]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    sessionStorage.setItem("sajilo_admin_key", keyInput.trim());
    fetchAnalytics(keyInput.trim(), timeRange);
  };

  const handleRefresh = () => {
    if (authenticatedKey) {
      fetchAnalytics(authenticatedKey, timeRange);
    }
  };

  // ── Login Screen ──────────────────────────────────────────────────────────
  if (!authenticatedKey || !data) {
    return (
      <div className="min-h-screen bg-[#0C0F1E] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#141829] border border-[#1E2338] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <Image src="/branding/logo-icon.svg" alt="SajiloTools Logo" width={40} height={40} style={{ height: "40px", width: "auto" }} className="object-contain" />
            <h1 className="text-xl font-extrabold text-[#F4F4F5]">SajiloTools Admin Portal</h1>
            <p className="text-xs text-[#A1A1AA]">
              Enter secret key or log in as an administrator to view Turso DB analytics.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Enter secret admin key..."
                className="w-full px-4 py-3 rounded-xl border border-[#2A2F48] bg-[#1E2338] text-[#F4F4F5] placeholder:text-[#71717A] text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-rose-400 font-semibold text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#DC2626] text-white font-extrabold text-sm hover:bg-[#DC2626]/90 transition-colors shadow-lg disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Unlock Dashboard"}
            </button>
          </form>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="text-xs text-[#71717A] hover:text-[#A1A1AA] flex items-center justify-center gap-1"
            >
              <ArrowLeft size={12} /> Back to SajiloTools
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Dashboard ────────────────────────────────────────────────────────
  const { traffic, tools, searches, health, feedback } = data;

  return (
    <div className="min-h-screen bg-[#0C0F1E] text-[#F4F4F5] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#141829] border border-[#1E2338] p-5 rounded-3xl">
        <div className="flex items-center gap-3">
          <Image src="/branding/logo-icon.svg" alt="SajiloTools Logo" width={40} height={40} style={{ height: "40px", width: "auto" }} className="object-contain" />
          <div>
            <h1 className="text-xl font-bold">SajiloTools Analytics</h1>
            <p className="text-xs text-[#A1A1AA] flex items-center gap-1.5 mt-0.5">
              <ShieldCheck size={14} className="text-emerald-400" /> Live Turso Database Connection
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Time Range Filter */}
          <div className="flex items-center gap-1.5 bg-[#1E2338] p-1 rounded-2xl border border-[#2A2F48]">
            {(["24h", "7d", "30d", "all"] as RangeType[]).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  timeRange === r
                    ? "bg-[#DC2626] text-white shadow-md"
                    : "text-[#A1A1AA] hover:text-[#F4F4F5]"
                }`}
              >
                {r === "24h" ? "24 Hours" : r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "All Time"}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-[#1E2338] border border-[#2A2F48] hover:bg-[#2A2F48] text-[#F4F4F5] transition-colors flex items-center gap-2 text-xs font-bold"
            title="Refresh analytics data"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-[#DC2626]" : ""} />
            <span>Refresh</span>
          </button>

          <Link
            href="/"
            className="px-4 py-2 rounded-2xl border border-[#2A2F48] bg-[#1E2338] text-xs font-bold hover:bg-[#2A2F48] transition-colors"
          >
            Home
          </Link>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#1E2338] pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("traffic")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "traffic"
              ? "bg-[#DC2626] text-white shadow-md"
              : "text-[#A1A1AA] hover:bg-[#141829] hover:text-[#F4F4F5]"
          }`}
        >
          <Eye size={14} /> Traffic &amp; Visitors
        </button>

        <button
          onClick={() => setActiveTab("tools")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "tools"
              ? "bg-[#DC2626] text-white shadow-md"
              : "text-[#A1A1AA] hover:bg-[#141829] hover:text-[#F4F4F5]"
          }`}
        >
          <Flame size={14} /> Tool Popularity
        </button>

        <button
          onClick={() => setActiveTab("searches")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "searches"
              ? "bg-[#DC2626] text-white shadow-md"
              : "text-[#A1A1AA] hover:bg-[#141829] hover:text-[#F4F4F5]"
          }`}
        >
          <Search size={14} /> Search Gaps ({searches.unmappedSearches.length})
        </button>

        <button
          onClick={() => setActiveTab("health")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "health"
              ? "bg-[#DC2626] text-white shadow-md"
              : "text-[#A1A1AA] hover:bg-[#141829] hover:text-[#F4F4F5]"
          }`}
        >
          <Activity size={14} /> Tech Health ({health.totalErrors})
        </button>
      </div>

      {/* ── TAB 1: TRAFFIC & VISITORS ─────────────────────────────────────── */}
      {activeTab === "traffic" && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-[#141829] border border-[#1E2338] space-y-2">
              <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-semibold">
                <span>Today Views</span>
                <Calendar size={16} className="text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-[#F4F4F5]">{traffic.todayViews.toLocaleString()}</p>
              <p className="text-[10px] text-[#71717A]">Today&apos;s pageviews</p>
            </div>

            <div className="p-5 rounded-3xl bg-[#141829] border border-[#1E2338] space-y-2">
              <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-semibold">
                <span>Selected Range</span>
                <Eye size={16} className="text-blue-400" />
              </div>
              <p className="text-2xl font-black text-[#F4F4F5]">{traffic.rangeViews.toLocaleString()}</p>
              <p className="text-[10px] text-[#71717A]">Pageviews in {timeRange}</p>
            </div>

            <div className="p-5 rounded-3xl bg-[#141829] border border-[#1E2338] space-y-2">
              <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-semibold">
                <span>Unique Visitors</span>
                <Users size={16} className="text-purple-400" />
              </div>
              <p className="text-2xl font-black text-[#F4F4F5]">{traffic.rangeUniqueVisitors.toLocaleString()}</p>
              <p className="text-[10px] text-[#71717A]">Session-based unique users</p>
            </div>

            <div className="p-5 rounded-3xl bg-[#141829] border border-[#1E2338] space-y-2">
              <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-semibold">
                <span>All-Time Views</span>
                <TrendingUp size={16} className="text-amber-400" />
              </div>
              <p className="text-2xl font-black text-[#F4F4F5]">{traffic.allTimeViews.toLocaleString()}</p>
              <p className="text-[10px] text-[#71717A]">Total recorded traffic</p>
            </div>
          </div>

          {/* 30-Day Daily Traffic Chart */}
          <div className="p-6 rounded-3xl bg-[#141829] border border-[#1E2338] space-y-4">
            <h3 className="text-sm font-bold text-[#F4F4F5] flex items-center gap-2">
              <BarChart3 size={16} className="text-[#DC2626]" /> 30-Day Daily Traffic Trend
            </h3>
            {traffic.dailyTraffic.length === 0 ? (
              <p className="text-xs text-[#71717A]">No traffic recorded yet.</p>
            ) : (
              <div className="h-44 flex items-end gap-1.5 pt-6 overflow-x-auto">
                {traffic.dailyTraffic.map((point) => {
                  const maxViews = Math.max(...traffic.dailyTraffic.map((d) => d.views), 1);
                  const heightPercent = Math.max(10, Math.round((point.views / maxViews) * 100));
                  return (
                    <div
                      key={point.date}
                      className="flex-1 flex flex-col items-center gap-1.5 min-w-[20px] group"
                    >
                      <div className="relative w-full flex items-end justify-center h-32">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full rounded-t-lg bg-gradient-to-t from-[#DC2626]/40 to-[#DC2626] group-hover:from-[#DC2626] group-hover:to-red-400 transition-all relative"
                        >
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#1E2338] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#2A2F48] whitespace-nowrap z-20">
                            {point.views} views ({point.visitors} users)
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] text-[#71717A] rotate-45 origin-left pt-1">
                        {point.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Visited Pages */}
          <div className="p-6 rounded-3xl bg-[#141829] border border-[#1E2338] space-y-4">
            <h3 className="text-sm font-bold text-[#F4F4F5]">Top Visited Routes</h3>
            <div className="space-y-2">
              {traffic.topPages.length === 0 ? (
                <p className="text-xs text-[#71717A]">No pageview records found.</p>
              ) : (
                traffic.topPages.map((page, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#1E2338]/50 border border-[#2A2F48] text-xs font-semibold"
                  >
                    <span className="truncate text-[#F4F4F5]">{page.path}</span>
                    <span className="px-2.5 py-1 rounded-xl bg-[#DC2626]/20 text-[#DC2626] font-bold shrink-0">
                      {page.views} views
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: TOOL POPULARITY ────────────────────────────────────────── */}
      {activeTab === "tools" && (
        <div className="space-y-6">
          {/* Top 10 Hot Tools */}
          <div className="p-6 rounded-3xl bg-[#141829] border border-[#1E2338] space-y-4">
            <h3 className="text-sm font-bold text-[#F4F4F5] flex items-center gap-2">
              <Flame size={16} className="text-amber-400" /> Hot Tools Leaderboard (Top 10)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tools.topTools.map((t, idx) => (
                <div
                  key={t.slug}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1E2338]/60 border border-[#2A2F48]"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                        idx === 0
                          ? "bg-amber-400 text-black"
                          : idx === 1
                            ? "bg-slate-300 text-black"
                            : idx === 2
                              ? "bg-amber-700 text-white"
                              : "bg-[#2A2F48] text-[#A1A1AA]"
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-xs text-[#F4F4F5]">{t.slug}</span>
                  </div>
                  <span className="text-xs font-extrabold text-[#DC2626] bg-[#DC2626]/10 px-3 py-1 rounded-xl">
                    {t.count} uses
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dead Weight Tools */}
          <div className="p-6 rounded-3xl bg-[#141829] border border-[#1E2338] space-y-4">
            <h3 className="text-sm font-bold text-[#F4F4F5] flex items-center gap-2">
              <ArchiveX size={16} className="text-rose-400" /> Low Usage Tools (&lt;3 Uses)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {tools.deadWeightTools.map((t) => (
                <div
                  key={t.slug}
                  className="p-3 rounded-2xl bg-[#1E2338]/40 border border-[#2A2F48] flex items-center justify-between text-xs"
                >
                  <span className="text-[#A1A1AA] truncate">{t.slug}</span>
                  <span className="font-bold text-slate-400">{t.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: SEARCH GAPS ────────────────────────────────────────────── */}
      {activeTab === "searches" && (
        <div className="space-y-6">
          {/* Unmapped Searches (Feature Request Detector) */}
          <div className="p-6 rounded-3xl bg-[#141829] border border-[#1E2338] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F4F4F5] flex items-center gap-2">
                <HelpCircle size={16} className="text-purple-400" /> Unmapped Search Queries (What to build next)
              </h3>
              <span className="text-xs text-[#A1A1AA]">
                Searches that don&apos;t match existing tool titles/slugs
              </span>
            </div>
            {searches.unmappedSearches.length === 0 ? (
              <p className="text-xs text-[#71717A]">No unmapped searches detected.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {searches.unmappedSearches.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#1E2338]/60 border border-[#2A2F48] flex items-center justify-between"
                  >
                    <span className="text-xs font-bold text-purple-300">&ldquo;{s.query}&rdquo;</span>
                    <span className="text-xs font-extrabold text-white bg-purple-500/20 px-2.5 py-1 rounded-xl">
                      {s.count} searches
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Search Queries */}
          <div className="p-6 rounded-3xl bg-[#141829] border border-[#1E2338] space-y-4">
            <h3 className="text-sm font-bold text-[#F4F4F5]">Top Search Terms</h3>
            <div className="space-y-2">
              {searches.topQueries.map((q, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#1E2338]/50 border border-[#2A2F48] text-xs"
                >
                  <span className="font-semibold text-[#F4F4F5]">&ldquo;{q.query}&rdquo;</span>
                  <span className="font-bold text-[#A1A1AA]">{q.count} times</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: TECH HEALTH & ERRORS ───────────────────────────────────── */}
      {activeTab === "health" && (
        <div className="space-y-6">
          {/* Error Rate Overview */}
          <div className="p-6 rounded-3xl bg-[#141829] border border-[#1E2338] space-y-4">
            <h3 className="text-sm font-bold text-[#F4F4F5] flex items-center gap-2">
              <AlertTriangle size={16} className="text-rose-500" /> Error Rate Per Tool
            </h3>
            {health.toolErrorRates.length === 0 ? (
              <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={16} /> Zero client errors logged! Everything is running smoothly.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {health.toolErrorRates.map((er) => (
                  <div
                    key={er.slug}
                    className="p-3.5 rounded-2xl bg-[#1E2338]/60 border border-rose-500/20 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-[#F4F4F5]">{er.slug}</span>
                      <span className="text-rose-400">{er.errorRate}% rate</span>
                    </div>
                    <p className="text-[10px] text-[#A1A1AA]">
                      {er.errors} errors out of {er.uses} uses
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Event Log */}
          <div className="p-6 rounded-3xl bg-[#141829] border border-[#1E2338] space-y-4">
            <h3 className="text-sm font-bold text-[#F4F4F5]">Recent Error Log</h3>
            {health.errorLogs.length === 0 ? (
              <p className="text-xs text-[#71717A]">No recent error logs recorded.</p>
            ) : (
              <div className="space-y-2">
                {health.errorLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-[#1E2338]/50 border border-rose-500/20 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-400">{log.toolSlug || "Global Client Error"}</span>
                      <span className="text-[10px] text-[#71717A]">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[#F4F4F5] font-mono text-[11px] break-all">{log.errorMsg}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Feedback Comments */}
          <div className="p-6 rounded-3xl bg-[#141829] border border-[#1E2338] space-y-4">
            <h3 className="text-sm font-bold text-[#F4F4F5] flex items-center gap-2">
              <MessageSquare size={16} className="text-blue-400" /> Recent User Feedback ({feedback.length})
            </h3>
            {feedback.length === 0 ? (
              <p className="text-xs text-[#71717A]">No feedback submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {feedback.map((fb) => (
                  <div
                    key={fb.id}
                    className="p-4 rounded-2xl bg-[#1E2338]/50 border border-[#2A2F48] text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold">
                        <span className="text-[#F4F4F5]">{fb.toolSlug}</span>
                        {fb.isHelpful ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px]">
                            <ThumbsUp size={10} /> Helpful
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full text-[10px]">
                            <ThumbsDown size={10} /> Needs Work
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#71717A]">
                        {new Date(fb.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {fb.comment && <p className="text-[#A1A1AA] leading-relaxed">&ldquo;{fb.comment}&rdquo;</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
