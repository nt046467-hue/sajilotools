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
  Mail,
  Send,
  Trash2,
  Copy,
  Check,
  Zap,
  UserPlus,
  UserCheck,
  MailCheck,
  FileText,
  AlertCircle,
  Rocket,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { AnalyticsSummary } from "@/lib/analytics-db";

type TabType = "traffic" | "tools" | "searches" | "health" | "subscribers";
type RangeType = "24h" | "7d" | "30d" | "all";

interface SubscriberItem {
  id: string;
  email: string;
  createdAt: string;
}

interface SubscriberStats {
  totalSubscribers: number;
  last7Days: number;
  last30Days: number;
  registeredUsers: number;
}

const TEMPLATES = [
  {
    id: "new-tool",
    name: "New Tool Launch",
    icon: Rocket,
    subject: "New Tool Live on SajiloTools: Try it today!",
    message:
      "Hello,\n\nWe're thrilled to announce that a brand new tool is live on SajiloTools!\n\nKey Highlights:\n• Fast, completely free, and privacy-first\n• Runs instantly in your browser with zero data tracking\n• Designed to make your daily digital tasks easier\n\nGive it a try and feel free to send us your feedback!",
    ctaText: "Try the New Tool",
    ctaUrl: "https://nabint.com.np",
  },
  {
    id: "digest",
    name: "Monthly Feature Digest",
    icon: Zap,
    subject: "What's New on SajiloTools — Updates & Enhancements",
    message:
      "Hi there,\n\nHere's a quick roundup of everything we've improved across SajiloTools recently:\n\n• Faster processing speeds for PDF & image tools\n• Improved mobile responsiveness and dark mode\n• Enhanced client-side security & privacy protections\n\nThank you for being part of our community and supporting free, open utilities!",
    ctaText: "Explore SajiloTools",
    ctaUrl: "https://nabint.com.np",
  },
  {
    id: "tips",
    name: "Tips & Highlights",
    icon: FileText,
    subject: "Handy Tips & Top Utilities on SajiloTools",
    message:
      "Hello,\n\nDid you know you can use SajiloTools offline and directly in your browser without any account required?\n\nHere are 3 popular tools you might find helpful:\n• Batch QR Code Generator with custom branding\n• Nepali Date & Unicode Converter\n• Lossless Image and PDF Compressor\n\nCheck them out whenever you need them!",
    ctaText: "View All Tools",
    ctaUrl: "https://nabint.com.np",
  },
];

export default function AdminAnalyticsClient() {
  const [keyInput, setKeyInput] = useState("");
  const [authenticatedKey, setAuthenticatedKey] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("traffic");
  const [timeRange, setTimeRange] = useState<RangeType>("30d");

  // ── Subscribers & Broadcast State ────────────────────────────────────────
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);
  const [subscriberStats, setSubscriberStats] = useState<SubscriberStats | null>(null);
  const [subscribersLoading, setSubscribersLoading] = useState(false);
  const [subscriberSearch, setSubscriberSearch] = useState("");
  const [copiedEmails, setCopiedEmails] = useState(false);
  const [copiedSingleEmail, setCopiedSingleEmail] = useState<string | null>(null);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);

  // Broadcast Form State
  const [broadcastSubject, setBroadcastSubject] = useState(TEMPLATES[0].subject);
  const [broadcastMessage, setBroadcastMessage] = useState(TEMPLATES[0].message);
  const [broadcastCtaText, setBroadcastCtaText] = useState(TEMPLATES[0].ctaText);
  const [broadcastCtaUrl, setBroadcastCtaUrl] = useState(TEMPLATES[0].ctaUrl);
  const [recipientType, setRecipientType] = useState<"subscribers" | "users" | "all">("subscribers");
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

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
        if (res.status === 401) {
          sessionStorage.removeItem("sajilo_admin_key");
          throw new Error("Invalid admin secret key. Access denied.");
        }
        throw new Error("Failed to load live analytics data.");
      }
      const json = await res.json();
      setData(json);
      setAuthenticatedKey(keyToUse);
      sessionStorage.setItem("sajilo_admin_key", keyToUse);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSubscribers = useCallback(async (keyToUse: string) => {
    setSubscribersLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (keyToUse) {
        headers["x-admin-key"] = keyToUse;
      }
      const res = await fetch(`/api/admin/subscribers`, { headers });
      if (res.ok) {
        const json = await res.json();
        setSubscribers(json.subscribers || []);
        setSubscriberStats(json.stats || null);
      }
    } catch (err) {
      console.error("Failed to fetch subscribers:", err);
    } finally {
      setSubscribersLoading(false);
    }
  }, []);

  // Auto-fetch if key was saved in session
  useEffect(() => {
    const savedKey = sessionStorage.getItem("sajilo_admin_key");
    if (savedKey) {
      fetchAnalytics(savedKey, timeRange);
      fetchSubscribers(savedKey);
    }
  }, [fetchAnalytics, fetchSubscribers, timeRange]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) {
      setError("Please enter the admin secret key.");
      return;
    }
    fetchAnalytics(keyInput.trim(), timeRange);
    fetchSubscribers(keyInput.trim());
  };

  const handleRefresh = () => {
    if (authenticatedKey) {
      fetchAnalytics(authenticatedKey, timeRange);
      fetchSubscribers(authenticatedKey);
    }
  };

  const handleCopyAllEmails = () => {
    if (subscribers.length === 0) return;
    const emailsList = subscribers.map((s) => s.email).join(", ");
    navigator.clipboard.writeText(emailsList);
    setCopiedEmails(true);
    setTimeout(() => setCopiedEmails(false), 2500);
  };

  const handleCopySingle = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedSingleEmail(email);
    setTimeout(() => setCopiedSingleEmail(null), 2000);
  };

  const handleDeleteSubscriber = async (email: string) => {
    if (!confirm(`Are you sure you want to unsubscribe and remove "${email}"?`)) return;
    setDeletingEmail(email);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (authenticatedKey) headers["x-admin-key"] = authenticatedKey;

      const res = await fetch(`/api/admin/subscribers`, {
        method: "DELETE",
        headers,
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSubscribers((prev) => prev.filter((s) => s.email !== email));
        if (subscriberStats) {
          setSubscriberStats({
            ...subscriberStats,
            totalSubscribers: Math.max(0, subscriberStats.totalSubscribers - 1),
          });
        }
      }
    } catch (err) {
      alert("Failed to delete subscriber.");
    } finally {
      setDeletingEmail(null);
    }
  };

  const handleApplyTemplate = (tmpl: (typeof TEMPLATES)[0]) => {
    setBroadcastSubject(tmpl.subject);
    setBroadcastMessage(tmpl.message);
    setBroadcastCtaText(tmpl.ctaText);
    setBroadcastCtaUrl(tmpl.ctaUrl);
    setBroadcastStatus(null);
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail.trim()) {
      setBroadcastStatus({ type: "error", message: "Please provide a valid test email address." });
      return;
    }

    setIsSendingTest(true);
    setBroadcastStatus(null);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (authenticatedKey) headers["x-admin-key"] = authenticatedKey;

      const res = await fetch(`/api/admin/subscribers/broadcast`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          subject: broadcastSubject,
          message: broadcastMessage,
          ctaText: broadcastCtaText,
          ctaUrl: broadcastCtaUrl,
          isTest: true,
          testEmail: testEmail.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to send test email.");

      setBroadcastStatus({
        type: "success",
        message: `Test email successfully sent to ${testEmail.trim()}! Check your inbox.`,
      });
    } catch (err: any) {
      setBroadcastStatus({
        type: "error",
        message: err.message || "Failed to send test email.",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSendBroadcast = async () => {
    setIsSendingBroadcast(true);
    setShowConfirmModal(false);
    setBroadcastStatus(null);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (authenticatedKey) headers["x-admin-key"] = authenticatedKey;

      const res = await fetch(`/api/admin/subscribers/broadcast`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          subject: broadcastSubject,
          message: broadcastMessage,
          ctaText: broadcastCtaText,
          ctaUrl: broadcastCtaUrl,
          isTest: false,
          recipientType,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Broadcast delivery failed.");

      setBroadcastStatus({
        type: "success",
        message: json.message,
      });
    } catch (err: any) {
      setBroadcastStatus({
        type: "error",
        message: err.message || "Failed to deliver broadcast emails.",
      });
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(subscriberSearch.toLowerCase().trim())
  );

  // ── Login Screen ──────────────────────────────────────────────────────────
  if (!authenticatedKey || !data) {
    return (
      <div className="min-h-screen bg-[#0C0F1E] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#141829] border border-[#1E2338] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <Image
              src="/branding/logo-icon.svg"
              alt="SajiloTools Logo"
              width={40}
              height={40}
              style={{ height: "40px", width: "auto" }}
              className="object-contain"
            />
            <h1 className="text-xl font-extrabold text-[#F4F4F5]">SajiloTools Admin Portal</h1>
            <p className="text-xs text-[#A1A1AA]">
              Enter secret key or log in as an administrator to access analytics &amp; subscriber broadcasts.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => {
                  setKeyInput(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter secret admin key..."
                className={`w-full px-4 py-3 rounded-xl border bg-[#1E2338] text-[#F4F4F5] placeholder:text-[#71717A] text-sm focus:outline-none focus:ring-2 transition-all ${
                  error
                    ? "border-rose-500/80 focus:ring-rose-500 text-rose-200"
                    : "border-[#2A2F48] focus:ring-[#DC2626]"
                }`}
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs animate-in fade-in duration-200">
                <AlertTriangle size={15} className="mt-0.5 shrink-0 text-rose-400" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#DC2626] text-white font-extrabold text-sm hover:bg-[#DC2626]/90 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Lock size={15} />
                  Unlock Dashboard
                </>
              )}
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
          <Image
            src="/branding/logo-icon.svg"
            alt="SajiloTools Logo"
            width={40}
            height={40}
            style={{ height: "40px", width: "auto" }}
            className="object-contain"
          />
          <div>
            <h1 className="text-xl font-bold">SajiloTools Admin Portal</h1>
            <p className="text-xs text-[#A1A1AA] flex items-center gap-1.5 mt-0.5">
              <ShieldCheck size={14} className="text-emerald-400" /> Live Database &amp; Mailer Connected
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
            disabled={loading || subscribersLoading}
            className="p-2.5 rounded-2xl bg-[#1E2338] border border-[#2A2F48] hover:bg-[#2A2F48] text-[#F4F4F5] transition-colors flex items-center gap-2 text-xs font-bold"
            title="Refresh dashboard data"
          >
            <RefreshCw
              size={14}
              className={loading || subscribersLoading ? "animate-spin text-[#DC2626]" : ""}
            />
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
          onClick={() => setActiveTab("subscribers")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "subscribers"
              ? "bg-[#DC2626] text-white shadow-md ring-2 ring-red-500/20"
              : "text-[#A1A1AA] hover:bg-[#141829] hover:text-[#F4F4F5]"
          }`}
        >
          <Mail size={14} className="text-red-400" /> Subscribers &amp; Broadcast
          {subscribers.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-white/20 text-white rounded-full font-extrabold">
              {subscribers.length}
            </span>
          )}
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

      {/* ── TAB: SUBSCRIBERS & BROADCAST ──────────────────────────────────── */}
      {activeTab === "subscribers" && (
        <div className="space-y-6">
          {/* Status Alert Banner */}
          {broadcastStatus && (
            <div
              className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-medium border animate-fadeIn ${
                broadcastStatus.type === "success"
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                  : "bg-rose-950/40 border-rose-500/40 text-rose-300"
              }`}
            >
              <div className="flex items-center gap-2">
                {broadcastStatus.type === "success" ? (
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle size={18} className="text-rose-400 shrink-0" />
                )}
                <span>{broadcastStatus.message}</span>
              </div>
              <button
                onClick={() => setBroadcastStatus(null)}
                className="text-xs opacity-70 hover:opacity-100 underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-[#141829] border border-[#1E2338] space-y-2">
              <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-semibold">
                <span>Total Subscribers</span>
                <MailCheck size={16} className="text-red-400" />
              </div>
              <p className="text-2xl font-black text-[#F4F4F5]">
                {subscriberStats?.totalSubscribers ?? subscribers.length}
              </p>
              <p className="text-[10px] text-[#71717A]">Active newsletter recipients</p>
            </div>

            <div className="p-5 rounded-3xl bg-[#141829] border border-[#1E2338] space-y-2">
              <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-semibold">
                <span>Joined This Week</span>
                <UserPlus size={16} className="text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-emerald-400">
                +{subscriberStats?.last7Days ?? 0}
              </p>
              <p className="text-[10px] text-[#71717A]">New subscribers in 7 days</p>
            </div>

            <div className="p-5 rounded-3xl bg-[#141829] border border-[#1E2338] space-y-2">
              <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-semibold">
                <span>Joined (30 Days)</span>
                <Calendar size={16} className="text-blue-400" />
              </div>
              <p className="text-2xl font-black text-[#F4F4F5]">
                +{subscriberStats?.last30Days ?? 0}
              </p>
              <p className="text-[10px] text-[#71717A]">New subscribers in 30 days</p>
            </div>

            <div className="p-5 rounded-3xl bg-[#141829] border border-[#1E2338] space-y-2">
              <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-semibold">
                <span>Total Accounts</span>
                <UserCheck size={16} className="text-purple-400" />
              </div>
              <p className="text-2xl font-black text-[#F4F4F5]">
                {subscriberStats?.registeredUsers ?? 0}
              </p>
              <p className="text-[10px] text-[#71717A]">Registered users</p>
            </div>
          </div>

          {/* Two Columns: Broadcast Studio & Subscriber List */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Broadcast Email Composer & Studio (7 Cols) */}
            <div className="lg:col-span-7 bg-[#141829] border border-[#1E2338] p-6 rounded-3xl space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-base font-bold text-[#F4F4F5] flex items-center gap-2">
                    <Send size={18} className="text-red-400" /> Broadcast Email Studio
                  </h2>
                  <p className="text-xs text-[#A1A1AA] mt-0.5">
                    Compose and send an announcement to all your subscribed members.
                  </p>
                </div>
              </div>

              {/* Quick Template Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#A1A1AA] flex items-center gap-1.5">
                  <Zap size={13} className="text-amber-400" /> Pre-built Templates:
                </label>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATES.map((tmpl) => {
                    const IconComponent = tmpl.icon;
                    return (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => handleApplyTemplate(tmpl)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1E2338] border border-[#2A2F48] hover:border-red-500/50 hover:bg-[#252B44] text-[#F4F4F5] transition-all flex items-center gap-1.5"
                      >
                        <IconComponent size={13} className="text-red-400" />
                        <span>{tmpl.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Broadcast Target Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#A1A1AA]">Audience Target:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "subscribers", label: `Subscribers (${subscribers.length})` },
                    { id: "users", label: `Users (${subscriberStats?.registeredUsers ?? 0})` },
                    { id: "all", label: "All Audience" },
                  ].map((target) => (
                    <button
                      key={target.id}
                      type="button"
                      onClick={() => setRecipientType(target.id as any)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                        recipientType === target.id
                          ? "bg-red-600/10 border-red-500 text-white shadow-sm"
                          : "bg-[#1E2338] border-[#2A2F48] text-[#A1A1AA] hover:text-[#F4F4F5]"
                      }`}
                    >
                      {target.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Line */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#A1A1AA]">Email Subject Line:</label>
                <input
                  type="text"
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  placeholder="e.g. We launched a new tool on SajiloTools!"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#2A2F48] bg-[#1E2338] text-[#F4F4F5] placeholder:text-[#71717A] text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                />
              </div>

              {/* Message Body */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#A1A1AA]">Message Content:</label>
                  <span className="text-[10px] text-[#71717A]">
                    Paragraphs &amp; bullet points (• or -) supported
                  </span>
                </div>
                <textarea
                  rows={7}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Write your email message here..."
                  className="w-full px-4 py-3 rounded-xl border border-[#2A2F48] bg-[#1E2338] text-[#F4F4F5] placeholder:text-[#71717A] text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                />
              </div>

              {/* Optional Call to Action Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#A1A1AA]">Button Text (Optional):</label>
                  <input
                    type="text"
                    value={broadcastCtaText}
                    onChange={(e) => setBroadcastCtaText(e.target.value)}
                    placeholder="e.g. Try It Now"
                    className="w-full px-3 py-2 rounded-xl border border-[#2A2F48] bg-[#1E2338] text-[#F4F4F5] text-xs focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#A1A1AA]">Button URL (Optional):</label>
                  <input
                    type="url"
                    value={broadcastCtaUrl}
                    onChange={(e) => setBroadcastCtaUrl(e.target.value)}
                    placeholder="https://nabint.com.np/tools/..."
                    className="w-full px-3 py-2 rounded-xl border border-[#2A2F48] bg-[#1E2338] text-[#F4F4F5] text-xs focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                  />
                </div>
              </div>

              {/* Actions & Sending Bar */}
              <div className="pt-4 border-t border-[#1E2338] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Send Test Email form */}
                <form onSubmit={handleSendTestEmail} className="flex items-center gap-2 flex-1">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="your-email@gmail.com"
                    className="flex-1 px-3 py-2 rounded-xl border border-[#2A2F48] bg-[#1E2338] text-[#F4F4F5] text-xs placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    type="submit"
                    disabled={isSendingTest || !testEmail.trim()}
                    className="px-3 py-2 rounded-xl bg-[#1E2338] border border-[#2A2F48] hover:bg-[#252B44] text-xs font-bold text-[#F4F4F5] transition-all disabled:opacity-40 whitespace-nowrap flex items-center gap-1.5"
                  >
                    {isSendingTest ? (
                      <RefreshCw size={12} className="animate-spin text-red-400" />
                    ) : (
                      <Send size={12} className="text-blue-400" />
                    )}
                    Send Test
                  </button>
                </form>

                {/* Send Broadcast Button */}
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  disabled={
                    isSendingBroadcast ||
                    subscribers.length === 0 ||
                    !broadcastSubject.trim() ||
                    !broadcastMessage.trim()
                  }
                  className="px-5 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-extrabold text-xs shadow-lg shadow-red-600/20 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {isSendingBroadcast ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Sending to {subscribers.length}...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Send to All ({subscribers.length})
                    </>
                  )}
                </button>
              </div>

              {/* Live Preview Box */}
              <div className="mt-4 pt-4 border-t border-[#1E2338] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#A1A1AA]">
                  <span className="flex items-center gap-1.5">
                    <Eye size={13} className="text-blue-400" /> Live Email Inbox Preview
                  </span>
                  <span className="text-[10px] text-[#71717A]">Rendered Template</span>
                </div>

                <div className="rounded-2xl border border-[#2A2F48] bg-[#0A0D18] p-4 text-xs space-y-3 shadow-inner">
                  {/* Email Header */}
                  <div className="border-b border-[#1E2338] pb-2 flex items-center justify-between">
                    <span className="font-extrabold text-[#F4F4F5] tracking-tight">
                      Sajilo<span className="text-red-500">Tools</span>{" "}
                      <span className="text-[10px] text-[#71717A] font-normal uppercase">
                        • Community
                      </span>
                    </span>
                    <span className="text-[10px] text-[#71717A]">
                      From: SajiloTools &lt;updates&gt;
                    </span>
                  </div>

                  {/* Subject Preview */}
                  <h4 className="font-extrabold text-sm text-[#F4F4F5]">
                    {broadcastSubject || "No Subject Line"}
                  </h4>

                  {/* Body Preview */}
                  <div className="text-[#A1A1AA] text-xs space-y-2 leading-relaxed whitespace-pre-line">
                    {broadcastMessage || "Enter your email message above to see preview..."}
                  </div>

                  {/* CTA Preview */}
                  {broadcastCtaText && (
                    <div className="pt-2 text-center">
                      <span className="inline-block px-4 py-1.5 rounded-lg bg-[#DC2626] text-white font-bold text-xs shadow-md">
                        {broadcastCtaText}
                      </span>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="pt-3 border-t border-[#1E2338] text-[10px] text-[#71717A] text-center">
                    Sent with ❤️ from SajiloTools • Privacy-friendly developer utilities
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Subscribers List & Search (5 Cols) */}
            <div className="lg:col-span-5 bg-[#141829] border border-[#1E2338] p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-base font-bold text-[#F4F4F5] flex items-center gap-2">
                    <Users size={18} className="text-blue-400" /> Subscribers ({subscribers.length})
                  </h2>
                  <p className="text-xs text-[#A1A1AA]">Manage active email newsletter recipients.</p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyAllEmails}
                  disabled={subscribers.length === 0}
                  className="px-3 py-1.5 rounded-xl bg-[#1E2338] border border-[#2A2F48] hover:bg-[#252B44] text-[11px] font-bold text-[#F4F4F5] transition-all flex items-center gap-1.5 disabled:opacity-40"
                  title="Copy all email addresses comma-separated"
                >
                  {copiedEmails ? (
                    <>
                      <Check size={12} className="text-emerald-400" /> Copied All!
                    </>
                  ) : (
                    <>
                      <Copy size={12} className="text-blue-400" /> Copy All
                    </>
                  )}
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-3 text-[#71717A]" />
                <input
                  type="text"
                  value={subscriberSearch}
                  onChange={(e) => setSubscriberSearch(e.target.value)}
                  placeholder="Search subscribers by email..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#2A2F48] bg-[#1E2338] text-[#F4F4F5] placeholder:text-[#71717A] text-xs focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                />
              </div>

              {/* Subscribers List Scroll Area */}
              <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
                {subscribersLoading ? (
                  <div className="p-8 text-center text-xs text-[#A1A1AA] flex items-center justify-center gap-2">
                    <RefreshCw size={14} className="animate-spin text-red-500" />
                    Loading subscriber records...
                  </div>
                ) : filteredSubscribers.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#71717A] space-y-1">
                    <ArchiveX size={24} className="mx-auto text-[#71717A] mb-2" />
                    <p className="font-bold text-[#A1A1AA]">No subscribers found</p>
                    <p className="text-[11px]">
                      {subscriberSearch
                        ? "No match for your search filter."
                        : "Subscribers will show up here when users sign up on the site."}
                    </p>
                  </div>
                ) : (
                  filteredSubscribers.map((sub, idx) => (
                    <div
                      key={sub.id || sub.email}
                      className="p-3 rounded-2xl bg-[#1E2338]/60 border border-[#2A2F48] flex items-center justify-between gap-3 text-xs hover:border-zinc-700 transition-all group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-[#71717A] font-mono w-5">#{idx + 1}</span>
                          <span className="font-semibold text-[#F4F4F5] truncate block select-all">
                            {sub.email}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#71717A] pl-6 block">
                          Joined {new Date(sub.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Copy Single Email */}
                        <button
                          type="button"
                          onClick={() => handleCopySingle(sub.email)}
                          className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#252B44] transition-colors"
                          title="Copy email"
                        >
                          {copiedSingleEmail === sub.email ? (
                            <Check size={12} className="text-emerald-400" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>

                        {/* Delete/Unsubscribe */}
                        <button
                          type="button"
                          onClick={() => handleDeleteSubscriber(sub.email)}
                          disabled={deletingEmail === sub.email}
                          className="p-1.5 rounded-lg text-rose-400/70 hover:text-rose-300 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                          title="Remove subscriber"
                        >
                          {deletingEmail === sub.email ? (
                            <RefreshCw size={12} className="animate-spin text-rose-400" />
                          ) : (
                            <Trash2 size={12} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Broadcast Confirmation Modal */}
          {showConfirmModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-[#141829] border border-[#2A2F48] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                <div className="flex items-center gap-3 text-amber-400">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                    <Send size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#F4F4F5]">Confirm Broadcast Send</h3>
                    <p className="text-xs text-[#A1A1AA]">Please verify details before blasting.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#1E2338] border border-[#2A2F48] space-y-2 text-xs">
                  <p>
                    <strong className="text-[#F4F4F5]">Subject:</strong>{" "}
                    <span className="text-[#A1A1AA]">{broadcastSubject}</span>
                  </p>
                  <p>
                    <strong className="text-[#F4F4F5]">Recipients:</strong>{" "}
                    <span className="text-red-400 font-bold">
                      {subscribers.length} Subscribed Member{subscribers.length === 1 ? "" : "s"}
                    </span>
                  </p>
                  <p className="text-[11px] text-[#71717A] pt-1">
                    Emails will be delivered in batches using your verified mail configuration.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#A1A1AA] hover:bg-[#1E2338] hover:text-[#F4F4F5] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendBroadcast}
                    className="px-5 py-2 rounded-xl bg-[#DC2626] hover:bg-red-700 text-white text-xs font-extrabold shadow-lg transition-all flex items-center gap-1.5"
                  >
                    <Send size={12} /> Yes, Send Broadcast Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
              <p className="text-2xl font-black text-[#F4F4F5]">
                {traffic.rangeUniqueVisitors.toLocaleString()}
              </p>
              <p className="text-[10px] text-[#71717A]">Estimated distinct users</p>
            </div>

            <div className="p-5 rounded-3xl bg-[#141829] border border-[#1E2338] space-y-2">
              <div className="flex items-center justify-between text-[#A1A1AA] text-xs font-semibold">
                <span>All-Time Views</span>
                <TrendingUp size={16} className="text-amber-400" />
              </div>
              <p className="text-2xl font-black text-[#F4F4F5]">{traffic.allTimeViews.toLocaleString()}</p>
              <p className="text-[10px] text-[#71717A]">Cumulative historical total</p>
            </div>
          </div>

          {/* Interactive 30-Day Visual Activity Bar Chart */}
          <div className="p-6 rounded-3xl bg-[#141829] border border-[#1E2338] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#F4F4F5] flex items-center gap-2">
                  <Activity size={16} className="text-[#DC2626]" /> Daily Activity Trend (Last 30 Days)
                </h3>
                <p className="text-xs text-[#A1A1AA] mt-0.5">Real-time daily traffic and distinct visitor volume over time.</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {traffic.dailyTraffic.reduce((acc, d) => acc + d.views, 0)} Total 30D Views
              </span>
            </div>

            {/* Visual Bar Chart */}
            {traffic.dailyTraffic.length > 0 && (
              <div className="pt-4 pb-2">
                <div className="flex items-end gap-1.5 h-36 w-full border-b border-[#2A2F48] pb-1 px-1">
                  {(() => {
                    const maxViews = Math.max(1, ...traffic.dailyTraffic.map((d) => d.views));
                    return traffic.dailyTraffic.map((day) => {
                      const heightPct = Math.max(8, Math.round((day.views / maxViews) * 100));
                      const isToday = day.date === new Date().toISOString().split("T")[0];
                      return (
                        <div
                          key={day.date}
                          className="flex-1 flex flex-col items-center justify-end h-full group relative"
                        >
                          {/* Tooltip */}
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center bg-[#1E2338] text-white text-[10px] py-1 px-2 rounded-lg border border-[#2A2F48] whitespace-nowrap shadow-xl z-20 pointer-events-none">
                            <span className="font-bold text-[#F4F4F5]">{day.date}</span>
                            <span className="text-emerald-400">{day.views} views • {day.visitors} visitors</span>
                          </div>

                          <div
                            style={{ height: `${heightPct}%` }}
                            className={`w-full max-w-[14px] rounded-t-sm transition-all duration-300 ${
                              isToday
                                ? "bg-gradient-to-t from-[#DC2626] to-red-400 shadow-md shadow-red-500/30 ring-1 ring-red-400"
                                : day.views > 0
                                ? "bg-gradient-to-t from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300"
                                : "bg-[#1E2338] hover:bg-[#2A2F48]"
                            }`}
                          />
                        </div>
                      );
                    });
                  })()}
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#71717A] mt-2 px-1">
                  <span>{traffic.dailyTraffic[0]?.date || "30 days ago"}</span>
                  <span className="text-red-400 font-bold">Today</span>
                </div>
              </div>
            )}
          </div>

          {/* Traffic Breakdown List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Visited Pages */}
            <div className="p-6 rounded-3xl bg-[#141829] border border-[#1E2338] space-y-4">
              <h3 className="text-sm font-bold text-[#F4F4F5] flex items-center gap-2">
                <BarChart3 size={16} className="text-emerald-400" /> Top Visited Pages ({timeRange})
              </h3>
              {traffic.topPages.length === 0 ? (
                <p className="text-xs text-[#71717A]">No pageview events logged yet.</p>
              ) : (
                <div className="space-y-3">
                  {traffic.topPages.map((page, idx) => {
                    const pct = Math.max(
                      8,
                      Math.round((page.views / (traffic.rangeViews || 1)) * 100)
                    );
                    const isHome = page.path === "/" || !page.path;
                    const displayLabel = isHome
                      ? "Home Page ( / )"
                      : page.path === "/tools"
                      ? "All Tools Catalog ( /tools )"
                      : page.path === "/blog"
                      ? "Blog ( /blog )"
                      : page.path;

                    return (
                      <div key={page.path} className="p-3 rounded-2xl bg-[#1E2338]/40 border border-[#2A2F48] space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <span className="w-5 h-5 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                              #{idx + 1}
                            </span>
                            <span className="text-[#F4F4F5] font-semibold text-xs truncate">
                              {displayLabel}
                            </span>
                          </div>
                          <span className="text-emerald-400 font-black text-xs shrink-0">
                            {page.views.toLocaleString()} {page.views === 1 ? "view" : "views"}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-[#1E2338] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Daily Traffic Log (Sorted Recent First) */}
            <div className="p-6 rounded-3xl bg-[#141829] border border-[#1E2338] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#F4F4F5] flex items-center gap-2">
                  <Calendar size={16} className="text-blue-400" /> Daily Breakdown Log
                </h3>
                <span className="text-[10px] text-[#71717A]">Most recent dates first</span>
              </div>

              {traffic.dailyTraffic.length === 0 ? (
                <p className="text-xs text-[#71717A]">No daily records available for this period.</p>
              ) : (
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {[...traffic.dailyTraffic].reverse().map((day) => {
                    const isToday = day.date === new Date().toISOString().split("T")[0];
                    return (
                      <div
                        key={day.date}
                        className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                          isToday
                            ? "bg-red-950/20 border-red-500/30 ring-1 ring-red-500/20"
                            : "bg-[#1E2338]/50 border-[#2A2F48]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#F4F4F5]">{day.date}</span>
                          {isToday && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#DC2626] text-white">
                              Today
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs font-semibold">
                          <span className={day.views > 0 ? "text-emerald-400 font-bold" : "text-[#71717A]"}>
                            {day.views} views
                          </span>
                          <span className="text-[#2A2F48]">•</span>
                          <span className={day.visitors > 0 ? "text-purple-400 font-bold" : "text-[#71717A]"}>
                            {day.visitors} visitors
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: TOOL POPULARITY ────────────────────────────────────────── */}
      {activeTab === "tools" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Used Tools */}
          <div className="p-6 rounded-3xl bg-[#141829] border border-[#1E2338] space-y-4">
            <h3 className="text-sm font-bold text-[#F4F4F5] flex items-center gap-2">
              <Flame size={16} className="text-amber-400" /> Most Used Tools ({timeRange})
            </h3>
            {tools.topTools.length === 0 ? (
              <p className="text-xs text-[#71717A]">No tool usage tracked yet.</p>
            ) : (
              <div className="space-y-3">
                {tools.topTools.map((t, idx) => (
                  <div
                    key={t.slug}
                    className="p-3.5 rounded-2xl bg-[#1E2338]/50 border border-[#2A2F48] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-xl bg-[#DC2626]/20 text-[#DC2626] flex items-center justify-center text-xs font-black">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-[#F4F4F5]">{t.slug}</span>
                    </div>
                    <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                      {t.count.toLocaleString()} runs
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Underperforming / Dead-weight Tools */}
          <div className="p-6 rounded-3xl bg-[#141829] border border-[#1E2338] space-y-4">
            <h3 className="text-sm font-bold text-[#F4F4F5] flex items-center gap-2">
              <ArchiveX size={16} className="text-rose-400" /> Least Used / Candidate Tools
            </h3>
            {tools.deadWeightTools.length === 0 ? (
              <p className="text-xs text-[#71717A]">All tools are receiving active usage.</p>
            ) : (
              <div className="space-y-3">
                {tools.deadWeightTools.map((t) => (
                  <div
                    key={t.slug}
                    className="p-3.5 rounded-2xl bg-[#1E2338]/50 border border-[#2A2F48] flex items-center justify-between"
                  >
                    <span className="text-xs font-semibold text-[#A1A1AA]">{t.slug}</span>
                    <span className="text-xs font-bold text-[#71717A] bg-[#1E2338] px-2.5 py-1 rounded-full border border-[#2A2F48]">
                      {t.count} runs
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: SEARCH GAPS ────────────────────────────────────── */}
      {activeTab === "searches" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Search Queries */}
          <div className="p-6 rounded-3xl bg-[#141829] border border-[#1E2338] space-y-4">
            <h3 className="text-sm font-bold text-[#F4F4F5] flex items-center gap-2">
              <Search size={16} className="text-blue-400" /> Most Frequent Search Queries
            </h3>
            {searches.topQueries.length === 0 ? (
              <p className="text-xs text-[#71717A]">No searches logged in this period.</p>
            ) : (
              <div className="space-y-2">
                {searches.topQueries.map((q) => (
                  <div
                    key={q.query}
                    className="p-3 rounded-2xl bg-[#1E2338]/50 border border-[#2A2F48] flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-[#F4F4F5]">&ldquo;{q.query}&rdquo;</span>
                    <span className="text-[#A1A1AA] font-bold">{q.count} times</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Unmapped Searches (Missing Tools) */}
          <div className="p-6 rounded-3xl bg-[#141829] border border-[#1E2338] space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#F4F4F5] flex items-center gap-2">
                <HelpCircle size={16} className="text-amber-400" /> Missing Tool Ideas (0 Matches)
              </h3>
              <p className="text-xs text-[#A1A1AA] mt-1">
                Searches where users found 0 results. Build these tools to capture organic search demand.
              </p>
            </div>
            {searches.unmappedSearches.length === 0 ? (
              <p className="text-xs text-[#71717A]">No unmet search queries logged.</p>
            ) : (
              <div className="space-y-2">
                {searches.unmappedSearches.map((q) => (
                  <div
                    key={q.query}
                    className="p-3 rounded-2xl bg-[#1E2338]/50 border border-[#2A2F48] flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-amber-300">&ldquo;{q.query}&rdquo;</span>
                    <span className="text-amber-400/80 font-bold">{q.count} searches</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 4: TECH HEALTH ────────────────────────────────────────────── */}
      {activeTab === "health" && (
        <div className="space-y-6">
          {/* Error Rate Breakdown */}
          <div className="p-6 rounded-3xl bg-[#141829] border border-[#1E2338] space-y-4">
            <h3 className="text-sm font-bold text-[#F4F4F5] flex items-center gap-2">
              <AlertTriangle size={16} className="text-rose-400" /> Tool Error Rates &amp; Failures
            </h3>
            {health.toolErrorRates.length === 0 ? (
              <p className="text-xs text-emerald-400 flex items-center gap-1.5 font-semibold">
                <CheckCircle2 size={14} /> Zero client crashes or errors detected in this period!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {health.toolErrorRates.map((t) => (
                  <div
                    key={t.slug}
                    className="p-4 rounded-2xl bg-[#1E2338]/50 border border-[#2A2F48] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#F4F4F5]">{t.slug}</span>
                      <span className="text-xs font-black text-rose-400">{t.errorRate}% Fail</span>
                    </div>
                    <p className="text-[11px] text-[#71717A]">
                      {t.errors} error(s) out of {t.uses} usage runs
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Client Error Logs */}
          <div className="p-6 rounded-3xl bg-[#141829] border border-[#1E2338] space-y-4">
            <h3 className="text-sm font-bold text-[#F4F4F5] flex items-center gap-2">
              <Activity size={16} className="text-rose-400" /> Recent Error Messages ({health.errorLogs.length})
            </h3>
            {health.errorLogs.length === 0 ? (
              <p className="text-xs text-[#71717A]">No error logs recorded.</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {health.errorLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-rose-950/20 border border-rose-900/30 text-xs space-y-1"
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
