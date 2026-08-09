"use client";
import { useState } from "react";
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  BarChart3,
  Clock,
} from "lucide-react";

type ShortenResult = {
  shortUrl: string;
  slug: string;
  longUrl: string;
  createdAt: string;
};

export default function UrlShortenerTool() {
  const [longUrl, setLongUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [result, setResult] = useState<ShortenResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<ShortenResult[]>([]);

  async function shortenUrl() {
    if (!longUrl.trim()) return;
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: longUrl.trim(),
          alias: alias.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to shorten URL. Please try again.");
        return;
      }

      const newResult: ShortenResult = {
        shortUrl: data.shortUrl,
        slug: data.slug,
        longUrl: data.longUrl,
        createdAt: data.createdAt,
      };

      setResult(newResult);
      setHistory((prev) => [newResult, ...prev].slice(0, 5));
      setLongUrl("");
      setAlias("");
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && longUrl.trim()) {
      shortenUrl();
    }
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-2">
            Long URL
          </label>
          <div className="relative">
            <input
              type="url"
              value={longUrl}
              onChange={(e) => {
                setLongUrl(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="https://example.com/very-long-url-path-name"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
            />
            <Link2
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#71717A] mb-1">
            Custom Alias (Optional)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#A1A1AA] font-mono">
              /s/
            </span>
            <input
              type="text"
              value={alias}
              onChange={(e) => {
                setAlias(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="my-custom-link"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40 font-mono"
            />
          </div>
          <p className="text-[10px] text-[#A1A1AA] mt-1">
            3-30 chars • lowercase letters, numbers, hyphens
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={shortenUrl}
          disabled={!longUrl.trim() || loading}
          className="w-full py-3 bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] font-semibold rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Shortening...
            </>
          ) : (
            <>
              <Sparkles size={16} /> Shorten URL
            </>
          )}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="p-5 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Link Created Successfully
            </span>
          </div>

          {/* Short URL display */}
          <div className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-[#141829] rounded-xl border border-[#E4E0D8] dark:border-[#1E2338]">
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono font-semibold text-[#F5A623] hover:underline flex items-center gap-1.5 truncate"
            >
              {result.shortUrl} <ExternalLink size={12} />
            </a>

            <button
              onClick={() => copyToClipboard(result.shortUrl)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] hover:opacity-90 transition-opacity shrink-0"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          {/* Original URL */}
          <div className="text-xs text-[#A1A1AA] flex items-center gap-2 truncate">
            <span className="shrink-0 font-semibold">Original:</span>
            <span className="truncate">{result.longUrl}</span>
          </div>
        </div>
      )}

      {/* Session History */}
      {history.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#71717A] uppercase tracking-wider">
            <Clock size={12} />
            Session History
          </div>
          <div className="space-y-2">
            {history.map((item, i) => (
              <div
                key={`${item.slug}-${i}`}
                className="flex items-center justify-between gap-3 p-3 bg-[#FAFAF8] dark:bg-[#1E2338] rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] text-sm"
              >
                <div className="flex-1 min-w-0">
                  <a
                    href={item.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs font-semibold text-[#F5A623] hover:underline flex items-center gap-1"
                  >
                    /s/{item.slug} <ExternalLink size={10} />
                  </a>
                  <p className="text-[10px] text-[#A1A1AA] truncate mt-0.5">
                    {item.longUrl}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(item.shortUrl)}
                  className="p-1.5 rounded-lg hover:bg-[#E4E0D8] dark:hover:bg-[#2A2F48] transition-colors"
                  title="Copy short URL"
                >
                  <Copy size={12} className="text-[#71717A]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 text-blue-700 dark:text-blue-300 text-xs">
        <BarChart3 size={14} className="mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold">How it works:</span> Links are stored
          in our database and redirect via <code className="font-mono text-[10px] bg-blue-100 dark:bg-blue-900/40 px-1 py-0.5 rounded">/s/your-alias</code>.
          Click tracking is automatic.
        </div>
      </div>
    </div>
  );
}
