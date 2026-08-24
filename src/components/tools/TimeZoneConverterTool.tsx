"use client";

import { useState, useEffect, useMemo } from "react";
import { ArrowLeftRight, Clock, Plus, Globe, Calendar } from "lucide-react";
import AnimatedTrashIcon, { AnimatedTrashButton } from "@/components/shared/AnimatedTrashIcon";

// List of major world IANA timezones grouped by region
const TIMEZONES = [
  { label: "Kathmandu, Nepal (NPT)", value: "Asia/Kathmandu", offset: "UTC+5:45" },
  { label: "New York, USA (EST/EDT)", value: "America/New_York", offset: "UTC-5 / UTC-4" },
  { label: "Los Angeles, USA (PST/PDT)", value: "America/Los_Angeles", offset: "UTC-8 / UTC-7" },
  { label: "Chicago, USA (CST/CDT)", value: "America/Chicago", offset: "UTC-6 / UTC-5" },
  { label: "London, UK (GMT/BST)", value: "Europe/London", offset: "UTC+0 / UTC+1" },
  { label: "Dubai, UAE (GST)", value: "Asia/Dubai", offset: "UTC+4" },
  { label: "Sydney, Australia (AEST/AEDT)", value: "Australia/Sydney", offset: "UTC+10 / UTC+11" },
  { label: "Tokyo, Japan (JST)", value: "Asia/Tokyo", offset: "UTC+9" },
  { label: "New Delhi, India (IST)", value: "Asia/Kolkata", offset: "UTC+5:30" },
  { label: "Singapore (SGT)", value: "Asia/Singapore", offset: "UTC+8" },
  { label: "Doha, Qatar (AST)", value: "Asia/Qatar", offset: "UTC+3" },
  { label: "Riyadh, Saudi Arabia (AST)", value: "Asia/Riyadh", offset: "UTC+3" },
  { label: "Kuala Lumpur, Malaysia (MYT)", value: "Asia/Kuala_Lumpur", offset: "UTC+8" },
  { label: "Toronto, Canada (EST/EDT)", value: "America/Toronto", offset: "UTC-5 / UTC-4" },
  { label: "Vancouver, Canada (PST/PDT)", value: "America/Vancouver", offset: "UTC-8 / UTC-7" },
  { label: "Berlin, Germany (CET/CEST)", value: "Europe/Berlin", offset: "UTC+1 / UTC+2" },
  { label: "Paris, France (CET/CEST)", value: "Europe/Paris", offset: "UTC+1 / UTC+2" },
  { label: "Seoul, South Korea (KST)", value: "Asia/Seoul", offset: "UTC+9" },
  { label: "Bangkok, Thailand (ICT)", value: "Asia/Bangkok", offset: "UTC+7" },
  { label: "Auckland, New Zealand (NZST)", value: "Pacific/Auckland", offset: "UTC+12 / UTC+13" },
  { label: "UTC / GMT", value: "UTC", offset: "UTC+0" },
];

const POPULAR_ROUTES = [
  { name: "Kathmandu ↔ New York", from: "Asia/Kathmandu", to: "America/New_York" },
  { name: "Kathmandu ↔ London", from: "Asia/Kathmandu", to: "Europe/London" },
  { name: "Kathmandu ↔ Dubai", from: "Asia/Kathmandu", to: "Asia/Dubai" },
  { name: "Kathmandu ↔ Sydney", from: "Asia/Kathmandu", to: "Australia/Sydney" },
  { name: "Kathmandu ↔ Tokyo", from: "Asia/Kathmandu", to: "Asia/Tokyo" },
];

export default function TimeZoneConverterTool() {
  const [mounted, setMounted] = useState(false);
  const [fromTz, setFromTz] = useState("Asia/Kathmandu");
  const [toTz, setToTz] = useState("America/New_York");
  const [selectedDateTime, setSelectedDateTime] = useState("2026-07-22T12:00");
  const [extraZones, setExtraZones] = useState<string[]>([]);
  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");

  // Set mounted and detect user local timezone on client side only
  useEffect(() => {
    setMounted(true);
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    setSelectedDateTime(
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
    );

    try {
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (userTz && TIMEZONES.some((t) => t.value === userTz)) {
        setFromTz(userTz);
      }
    } catch {
      // Fallback to Kathmandu
    }
  }, []);

  // Compute UTC Date object from "From" wall-clock time
  const utcDate = useMemo(() => {
    if (!selectedDateTime) return new Date();
    const [datePart, timePart] = selectedDateTime.split("T");
    if (!datePart || !timePart) return new Date();

    const [year, month, day] = datePart.split("-").map(Number);
    const [hours, minutes] = timePart.split(":").map(Number);

    // Calculate offset of the fromTz for the approximate time
    const dummyDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    const formattedInFrom = new Intl.DateTimeFormat("en-US", {
      timeZone: fromTz,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hour12: false,
    }).format(dummyDate);

    // Reconstruct wall-clock difference to get true UTC Date
    const m = formattedInFrom.match(/(\d+)\/(\d+)\/(\d+),\s*(\d+):(\d+):(\d+)/);
    if (!m) return dummyDate;

    const fMonth = Number(m[1]) - 1;
    const fDay = Number(m[2]);
    const fYear = Number(m[3]);
    const fHours = Number(m[4]);
    const fMinutes = Number(m[5]);

    const targetLocalTimestamp = Date.UTC(year, month - 1, day, hours, minutes);
    const actualFromTimestamp = Date.UTC(fYear, fMonth, fDay, fHours, fMinutes);
    const diffMs = targetLocalTimestamp - actualFromTimestamp;

    return new Date(dummyDate.getTime() + diffMs);
  }, [selectedDateTime, fromTz]);

  if (!mounted) {
    return (
      <div className="p-8 text-center text-sm text-[#71717A] dark:text-[#A1A1AA] animate-pulse">
        Loading Time Zone Converter...
      </div>
    );
  }

  // Format date in a given target timezone
  const formatInTz = (tz: string) => {
    try {
      const timeFmt = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      const dateFmt = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const offsetFmt = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        timeZoneName: "shortOffset",
      });

      const parts = offsetFmt.formatToParts(utcDate);
      const tzName = parts.find((p) => p.type === "timeZoneName")?.value || "";

      // Day comparison relative to From zone
      const fromDayStr = new Intl.DateTimeFormat("en-US", { timeZone: fromTz, day: "numeric" }).format(utcDate);
      const targetDayStr = new Intl.DateTimeFormat("en-US", { timeZone: tz, day: "numeric" }).format(utcDate);

      let dayDiff = "";
      if (fromDayStr !== targetDayStr) {
        const fromTimestamp = new Date(new Intl.DateTimeFormat("en-US", { timeZone: fromTz }).format(utcDate)).getTime();
        const targetTimestamp = new Date(new Intl.DateTimeFormat("en-US", { timeZone: tz }).format(utcDate)).getTime();
        dayDiff = targetTimestamp > fromTimestamp ? "+1 day" : "-1 day";
      }

      return {
        time: timeFmt.format(utcDate),
        date: dateFmt.format(utcDate),
        offset: tzName,
        dayDiff,
      };
    } catch {
      return { time: "Invalid", date: "", offset: "", dayDiff: "" };
    }
  };

  const toResult = formatInTz(toTz);

  const swapZones = () => {
    const temp = fromTz;
    setFromTz(toTz);
    setToTz(temp);
  };

  const addExtraZone = (tz: string) => {
    if (!extraZones.includes(tz) && tz !== fromTz && tz !== toTz) {
      setExtraZones([...extraZones, tz]);
    }
  };

  const removeExtraZone = (tz: string) => {
    setExtraZones(extraZones.filter((z) => z !== tz));
  };

  const filteredFromTz = TIMEZONES.filter((t) =>
    t.label.toLowerCase().includes(fromSearch.toLowerCase()) || t.value.toLowerCase().includes(fromSearch.toLowerCase())
  );

  const filteredToTz = TIMEZONES.filter((t) =>
    t.label.toLowerCase().includes(toSearch.toLowerCase()) || t.value.toLowerCase().includes(toSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Quick Shortcuts */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] flex items-center gap-1">
          <Globe size={14} className="text-[#F5A623]" /> Popular Nepal Routes:
        </span>
        {POPULAR_ROUTES.map((route) => (
          <button
            key={route.name}
            onClick={() => {
              setFromTz(route.from);
              setToTz(route.to);
            }}
            className={`px-2.5 py-1 text-xs rounded-lg border transition-colors font-medium ${
              fromTz === route.from && toTz === route.to
                ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] border-transparent"
                : "bg-white dark:bg-[#1E2338] text-[#71717A] dark:text-[#A1A1AA] border-[#E4E0D8] dark:border-[#2A2F4A] hover:border-[#F5A623]"
            }`}
          >
            {route.name}
          </button>
        ))}
      </div>

      {/* Main Converter Card */}
      <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-3xl space-y-6 shadow-sm">
        {/* Date / Time Input Picker */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F4A]">
          <div className="flex items-center gap-2 text-sm font-bold text-[#18181B] dark:text-[#F4F4F5]">
            <Calendar size={18} className="text-[#F5A623]" /> Select Base Date & Time
          </div>
          <input
            type="datetime-local"
            value={selectedDateTime}
            onChange={(e) => setSelectedDateTime(e.target.value)}
            className="px-4 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F4A] bg-white dark:bg-[#0C0F1E] text-sm text-[#18181B] dark:text-[#F4F4F5] outline-none focus:ring-2 focus:ring-[#F5A623]/40"
          />
        </div>

        {/* Two-Column Converter */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* FROM Column */}
          <div className="p-5 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F4A] space-y-3">
            <div className="text-xs font-semibold text-[#71717A] uppercase tracking-wider">
              From Timezone
            </div>

            <input
              type="text"
              placeholder="Search timezone..."
              value={fromSearch}
              onChange={(e) => setFromSearch(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E4E0D8] dark:border-[#2A2F4A] bg-white dark:bg-[#0C0F1E] text-[#18181B] dark:text-[#F4F4F5] outline-none"
            />

            <select
              value={fromTz}
              onChange={(e) => setFromTz(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#E4E0D8] dark:border-[#2A2F4A] bg-white dark:bg-[#0C0F1E] text-[#18181B] dark:text-[#F4F4F5] outline-none"
            >
              {filteredFromTz.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>

            <div className="pt-2 border-t border-[#E4E0D8] dark:border-[#2A2F4A]">
              <div className="text-2xl font-bold font-sora text-[#1F2544] dark:text-[#F5A623]">
                {formatInTz(fromTz).time}
              </div>
              <div className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-1 flex items-center justify-between">
                <span>{formatInTz(fromTz).date}</span>
                <span className="font-mono bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded">
                  {formatInTz(fromTz).offset}
                </span>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={swapZones}
              className="p-3 rounded-full bg-white dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F4A] text-[#1F2544] dark:text-[#F5A623] hover:bg-[#F5A623] hover:text-white transition-all shadow-sm"
              title="Swap Timezones"
            >
              <ArrowLeftRight size={20} />
            </button>
          </div>

          {/* TO Column */}
          <div className="p-5 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F4A] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#71717A] uppercase tracking-wider">
                To Timezone
              </span>
              {toResult.dayDiff && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                  {toResult.dayDiff}
                </span>
              )}
            </div>

            <input
              type="text"
              placeholder="Search timezone..."
              value={toSearch}
              onChange={(e) => setToSearch(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E4E0D8] dark:border-[#2A2F4A] bg-white dark:bg-[#0C0F1E] text-[#18181B] dark:text-[#F4F4F5] outline-none"
            />

            <select
              value={toTz}
              onChange={(e) => setToTz(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#E4E0D8] dark:border-[#2A2F4A] bg-white dark:bg-[#0C0F1E] text-[#18181B] dark:text-[#F4F4F5] outline-none"
            >
              {filteredToTz.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>

            <div className="pt-2 border-t border-[#E4E0D8] dark:border-[#2A2F4A]">
              <div className="text-2xl font-bold font-sora text-[#15803D] dark:text-[#86EFAC]">
                {toResult.time}
              </div>
              <div className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-1 flex items-center justify-between">
                <span>{toResult.date}</span>
                <span className="font-mono bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                  {toResult.offset}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Zone Comparison Section */}
      <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-3xl space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <Globe size={18} className="text-[#F5A623]" /> Multi-Zone Comparison
            </h3>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
              Compare meeting times across multiple countries simultaneously
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addExtraZone(e.target.value);
                  e.target.value = "";
                }
              }}
              className="text-xs rounded-xl border border-[#E4E0D8] dark:border-[#2A2F4A] bg-white dark:bg-[#0C0F1E] text-[#18181B] dark:text-[#F4F4F5] px-3 py-2 outline-none"
            >
              <option value="">+ Add timezone to compare...</option>
              {TIMEZONES.filter((t) => t.value !== fromTz && t.value !== toTz && !extraZones.includes(t.value)).map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {extraZones.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {extraZones.map((tz) => {
              const res = formatInTz(tz);
              const label = TIMEZONES.find((t) => t.value === tz)?.label || tz;
              return (
                <div
                  key={tz}
                  className="p-4 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F4A] space-y-2 relative group"
                >
                  <AnimatedTrashButton
                    onDelete={() => removeExtraZone(tz)}
                    className="absolute top-3 right-3 text-[#71717A] hover:text-red-500 transition-colors opacity-70 group-hover:opacity-100"
                    title="Remove timezone"
                    iconSize={14}
                  />

                  <div className="text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] pr-6 truncate">
                    {label}
                  </div>
                  <div className="text-xl font-bold font-sora text-[#18181B] dark:text-[#F4F4F5]">
                    {res.time}
                  </div>
                  <div className="text-xs text-[#71717A] dark:text-[#A1A1AA] flex items-center justify-between pt-1 border-t border-[#E4E0D8]/60 dark:border-[#2A2F4A]">
                    <span>{res.date}</span>
                    <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1 py-0.5 rounded">
                      {res.offset}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-[#E4E0D8] dark:border-[#2A2F4A] rounded-2xl text-xs text-[#71717A] dark:text-[#A1A1AA]">
            Click <strong>&quot;+ Add timezone to compare&quot;</strong> above to track multiple countries at once.
          </div>
        )}
      </div>

      {/* SEO Explanatory Paragraph */}
      <div className="p-6 bg-[#FAFAF8] dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-3xl space-y-2 text-xs text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
        <p className="font-bold text-sm text-[#18181B] dark:text-[#F4F4F5]">
          🇳🇵 Nepal Time Zone (NPT, UTC+5:45) Conversion Guide
        </p>
        <p>
          Nepal Standard Time (NPT) operates on a unique 45-minute offset (UTC+5:45). This tool automatically handles DST (Daylight Saving Time) shifts in target countries like the USA, UK, Canada, and Australia, ensuring accurate scheduling for remote work, international flights, and family calls.
        </p>
      </div>
    </div>
  );
}
