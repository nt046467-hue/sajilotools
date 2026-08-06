"use client";

import { useState, useEffect, useMemo } from "react";
import { Clock4, Calendar, Copy, Check, RefreshCw, ArrowRightLeft, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import CalculatorCrossLink from "./shared/CalculatorCrossLink";

type UnitMode = "seconds" | "milliseconds";

const TIMEZONES = [
  { label: "Local Browser Timezone", value: "local" },
  { label: "UTC (Coordinated Universal Time)", value: "UTC" },
  { label: "Nepal Time (NPT / UTC+5:45)", value: "Asia/Kathmandu" },
  { label: "India Standard Time (IST / UTC+5:30)", value: "Asia/Kolkata" },
  { label: "US Eastern (EST / UTC-5)", value: "America/New_York" },
  { label: "US Pacific (PST / UTC-8)", value: "America/Los_Angeles" },
  { label: "Central European (CET / UTC+1)", value: "Europe/Paris" },
  { label: "Japan Standard (JST / UTC+9)", value: "Asia/Tokyo" },
];

export default function UnixTimestampConverterTool() {
  // Live ticking clock
  const [nowSec, setNowSec] = useState<number>(Math.floor(Date.now() / 1000));
  const [nowMs, setNowMs] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      const ms = Date.now();
      setNowMs(ms);
      setNowSec(Math.floor(ms / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Converter state
  const [timestampInput, setTimestampInput] = useState<string>(String(Math.floor(Date.now() / 1000)));
  const [unitMode, setUnitMode] = useState<UnitMode>("seconds");
  const [selectedTz, setSelectedTz] = useState<string>("local");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Auto-detect unit when user types timestamp
  useEffect(() => {
    const digits = timestampInput.trim().replace(/^-/, "");
    if (digits.length >= 12) {
      setUnitMode("milliseconds");
    } else if (digits.length > 0 && digits.length <= 11) {
      setUnitMode("seconds");
    }
  }, [timestampInput]);

  // Derived Date object
  const dateObj = useMemo(() => {
    const num = Number(timestampInput);
    if (isNaN(num) || timestampInput.trim() === "") return null;
    const ms = unitMode === "seconds" ? num * 1000 : num;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }, [timestampInput, unitMode]);

  // Format date according to selected timezone
  const formattedDates = useMemo(() => {
    if (!dateObj) return null;

    try {
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      };

      if (selectedTz !== "local") {
        options.timeZone = selectedTz;
      }

      const formattedLocalStr = new Intl.DateTimeFormat("en-US", options).format(dateObj);
      const isoStr = dateObj.toISOString();
      const rfcStr = dateObj.toUTCString();
      const relativeStr = formatDistanceToNow(dateObj, { addSuffix: true });

      const secVal = unitMode === "seconds" ? Number(timestampInput) : Math.floor(Number(timestampInput) / 1000);
      const msVal = unitMode === "milliseconds" ? Number(timestampInput) : Number(timestampInput) * 1000;

      return {
        formattedLocalStr,
        isoStr,
        rfcStr,
        relativeStr,
        secVal,
        msVal,
      };
    } catch {
      return null;
    }
  }, [dateObj, selectedTz, timestampInput, unitMode]);

  // Set timestamp from human date input (datetime-local)
  const handleDateInputChange = (dateStr: string) => {
    if (!dateStr) return;
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const val = unitMode === "seconds" ? Math.floor(d.getTime() / 1000) : d.getTime();
      setTimestampInput(String(val));
    }
  };

  const useCurrentTimestamp = () => {
    const val = unitMode === "seconds" ? nowSec : nowMs;
    setTimestampInput(String(val));
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Pre-fill datetime-local format (YYYY-MM-THH:mm)
  const datetimeLocalValue = useMemo(() => {
    if (!dateObj) return "";
    const pad = (n: number) => n.toString().padStart(2, "0");
    const yyyy = dateObj.getFullYear();
    const mm = pad(dateObj.getMonth() + 1);
    const dd = pad(dateObj.getDate());
    const hh = pad(dateObj.getHours());
    const min = pad(dateObj.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  }, [dateObj]);

  return (
    <div className="space-y-6">
      {/* Live Ticking Clock Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <Clock4 size={20} className="text-blue-500 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2">
              Current Unix Timestamp
            </h3>
            <p className="text-xs text-[#71717A] font-mono">
              Sec: <strong>{nowSec}</strong> | Ms: <strong>{nowMs}</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={useCurrentTimestamp}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1F2544] dark:bg-[#22C55E] text-white dark:text-[#0C0F1E] font-bold text-xs hover:opacity-90 transition-all shadow-sm w-full sm:w-auto justify-center"
        >
          <RefreshCw size={14} /> Use Current Time
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Column (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-5">
            <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
              <ArrowRightLeft size={14} className="text-[#22C55E]" /> Timestamp / Date Input
            </h4>

            {/* Unit Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
                Timestamp Mode
              </label>
              <div className="flex p-1 bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-xl">
                <button
                  type="button"
                  onClick={() => setUnitMode("seconds")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    unitMode === "seconds" ? "bg-[#22C55E] text-white" : "text-[#71717A]"
                  }`}
                >
                  Seconds (10 digits)
                </button>
                <button
                  type="button"
                  onClick={() => setUnitMode("milliseconds")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    unitMode === "milliseconds" ? "bg-[#22C55E] text-white" : "text-[#71717A]"
                  }`}
                >
                  Ms (13 digits)
                </button>
              </div>
            </div>

            {/* Timestamp input */}
            <div>
              <label className="block text-xs font-bold text-[#71717A] mb-1">
                Unix Timestamp ({unitMode})
              </label>
              <input
                type="text"
                value={timestampInput}
                onChange={(e) => setTimestampInput(e.target.value)}
                placeholder="e.g. 1716239022"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-[#22C55E]/40"
              />
            </div>

            {/* Human Date picker input */}
            <div>
              <label className="block text-xs font-bold text-[#71717A] mb-1 flex items-center gap-1">
                <Calendar size={14} /> Human-Readable Date & Time Picker
              </label>
              <input
                type="datetime-local"
                value={datetimeLocalValue}
                onChange={(e) => handleDateInputChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]/40"
              />
            </div>

            {/* Timezone selector */}
            <div>
              <label className="block text-xs font-bold text-[#71717A] uppercase tracking-wider mb-1">
                Output Timezone Display
              </label>
              <select
                value={selectedTz}
                onChange={(e) => setSelectedTz(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] font-bold text-xs"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cross-Link to Timezone Converter */}
          <CalculatorCrossLink
            icon={Clock}
            title="Time Zone Converter"
            desc="Need to convert dates between multiple timezones with live world clock comparison?"
            href="/tools/developer/timezone-converter"
          />
        </div>

        {/* Output Column (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {formattedDates ? (
            <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={14} className="text-[#22C55E]" /> Formatted Dates & Timestamps
              </h4>

              {/* Main Formatted String */}
              <div className="p-4 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] space-y-1">
                <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block">
                  Date String ({selectedTz === "local" ? "Browser Local" : selectedTz})
                </span>
                <div className="text-base sm:text-lg font-bold text-[#18181B] dark:text-[#22C55E]">
                  {formattedDates.formattedLocalStr}
                </div>
              </div>

              {/* Quick Formats Grid */}
              <div className="space-y-2">
                {/* ISO 8601 */}
                <div className="p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] flex items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-[#A1A1AA] uppercase font-bold block">ISO 8601</span>
                    <span className="font-mono font-semibold text-[#18181B] dark:text-[#F4F4F5] break-all">
                      {formattedDates.isoStr}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(formattedDates.isoStr, "iso")}
                    className="p-1.5 rounded-lg text-xs text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                  >
                    {copiedKey === "iso" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>

                {/* RFC 2822 */}
                <div className="p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] flex items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-[#A1A1AA] uppercase font-bold block">RFC 2822 (UTC)</span>
                    <span className="font-mono font-semibold text-[#18181B] dark:text-[#F4F4F5] break-all">
                      {formattedDates.rfcStr}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(formattedDates.rfcStr, "rfc")}
                    className="p-1.5 rounded-lg text-xs text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                  >
                    {copiedKey === "rfc" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>

                {/* Relative Time */}
                <div className="p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] flex items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-[#A1A1AA] uppercase font-bold block">Relative Time</span>
                    <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5]">
                      {formattedDates.relativeStr}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(formattedDates.relativeStr, "relative")}
                    className="p-1.5 rounded-lg text-xs text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5]"
                  >
                    {copiedKey === "relative" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>

                {/* Seconds vs Milliseconds equivalence */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] text-xs">
                    <span className="text-[10px] text-[#A1A1AA] uppercase font-bold block">Seconds</span>
                    <span className="font-mono font-bold text-[#18181B] dark:text-[#F4F4F5]">
                      {formattedDates.secVal}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] text-xs">
                    <span className="text-[10px] text-[#A1A1AA] uppercase font-bold block">Milliseconds</span>
                    <span className="font-mono font-bold text-[#18181B] dark:text-[#F4F4F5]">
                      {formattedDates.msVal}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl text-center text-[#71717A]">
              Invalid numeric timestamp entered. Please enter a valid number.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
