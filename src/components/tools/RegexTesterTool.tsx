"use client";
import { useState, useMemo } from "react";
import { Copy, Check, AlertCircle } from "lucide-react";

export default function RegexTesterTool() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("");
  const [copied, setCopied] = useState(false);

  const FLAG_OPTIONS = [
    { flag: "g", label: "Global", desc: "Find all matches" },
    { flag: "i", label: "Case Insensitive", desc: "Ignore case" },
    { flag: "m", label: "Multiline", desc: "^ and $ match line boundaries" },
    { flag: "s", label: "Dotall", desc: ". matches newlines" },
  ];

  const result = useMemo(() => {
    if (!pattern || !testString) return null;
    try {
      const regex = new RegExp(pattern, flags);
      const matches: { match: string; index: number; groups?: Record<string, string> }[] = [];
      let m;

      if (flags.includes("g")) {
        while ((m = regex.exec(testString)) !== null) {
          matches.push({ match: m[0], index: m.index, groups: m.groups });
          if (!m[0]) regex.lastIndex++;
        }
      } else {
        m = regex.exec(testString);
        if (m) matches.push({ match: m[0], index: m.index, groups: m.groups });
      }

      // Build highlighted string
      let highlighted = "";
      let lastIndex = 0;
      for (const match of matches) {
        highlighted += escapeHtml(testString.slice(lastIndex, match.index));
        highlighted += `<mark class="bg-[#F5A623]/30 text-[#18181B] dark:text-[#F4F4F5] rounded px-0.5">${escapeHtml(match.match)}</mark>`;
        lastIndex = match.index + match.match.length;
      }
      highlighted += escapeHtml(testString.slice(lastIndex));

      return { matches, highlighted, error: null };
    } catch (e: any) {
      return { matches: [], highlighted: "", error: e.message };
    }
  }, [pattern, flags, testString]);

  function toggleFlag(f: string) {
    setFlags((prev) => prev.includes(f) ? prev.replace(f, "") : prev + f);
  }

  function copyPattern() {
    navigator.clipboard.writeText(`/${pattern}/${flags}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-6">
      {/* Pattern Input */}
      <div>
        <label className="block text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-2">
          Regular Expression
        </label>
        <div className="flex items-center gap-2">
          <span className="text-lg text-[#A1A1AA] font-mono">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="your pattern here"
            className="flex-1 px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
          />
          <span className="text-lg text-[#A1A1AA] font-mono">/</span>
          <span className="text-sm font-mono text-[#F5A623] min-w-[2ch]">{flags}</span>
          <button onClick={copyPattern} className="p-2 rounded-lg text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-[#F0EDE8] dark:hover:bg-[#1E2338] transition-colors">
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Flags */}
      <div className="flex flex-wrap gap-2">
        {FLAG_OPTIONS.map((f) => (
          <button
            key={f.flag}
            onClick={() => toggleFlag(f.flag)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              flags.includes(f.flag)
                ? "bg-[#1F2544] text-white border-[#1F2544] dark:bg-[#F5A623] dark:text-[#0C0F1E] dark:border-[#F5A623]"
                : "border-[#E4E0D8] dark:border-[#1E2338] text-[#71717A] hover:border-[#1F2544] dark:hover:border-[#F5A623]"
            }`}
            title={f.desc}
          >
            {f.flag} — {f.label}
          </button>
        ))}
      </div>

      {/* Test String */}
      <div>
        <label className="block text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-2">
          Test String
        </label>
        <textarea
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="Enter text to test your regex against..."
          className="w-full h-32 px-4 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-[#18181B] dark:text-[#F4F4F5] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40 resize-none text-sm font-mono"
        />
      </div>

      {/* Error */}
      {result?.error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm">
          <AlertCircle size={14} />
          {result.error}
        </div>
      )}

      {/* Results */}
      {result && !result.error && result.matches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1F2544] dark:text-[#F5A623] uppercase tracking-wider">
              {result.matches.length} match{result.matches.length !== 1 ? "es" : ""} found
            </span>
          </div>

          <div
            className="p-4 rounded-xl bg-[#F7F5F0] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] font-mono text-sm leading-relaxed whitespace-pre-wrap break-all text-[#18181B] dark:text-[#E4E4E7]"
            dangerouslySetInnerHTML={{ __html: result.highlighted }}
          />

          <div className="space-y-2">
            {result.matches.map((m, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-xs">
                <span className="font-mono text-[#18181B] dark:text-[#F4F4F5]">
                  Match {i + 1}: <span className="text-[#F5A623]">&quot;{m.match}&quot;</span>
                </span>
                <span className="text-[#A1A1AA]">Index: {m.index}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && !result.error && result.matches.length === 0 && pattern && testString && (
        <div className="text-center py-8 text-[#A1A1AA] text-sm">No matches found</div>
      )}
    </div>
  );
}

function escapeHtml(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
