"use client";

import { useState, useMemo } from "react";
import NepaliDate from "nepali-date-converter";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  PartyPopper,
  Clock,
  Printer,
  ShieldCheck,
  Calendar as CalendarIcon,
  Flag,
  Sparkles,
  Moon,
  Sun,
} from "lucide-react";
import { getPanchangForDate, PanchangData } from "@/lib/panchang-engine";

export interface HolidayEntry {
  name: string;
  bsDate: string; // YYYY-MM-DD
  adDate: string; // YYYY-MM-DD
  type: "National" | "Festival";
  description?: string;
}

/** Lunar festival detected dynamically from Panchang engine */
export interface LunarFestival {
  name: string;
  nameNp: string;
  emoji: string;
  colorClass: string;
}

const NEPALI_MONTHS_EN = [
  "Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra",
];

const NEPALI_MONTHS_NP = [
  "वैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज",
  "कात्तिक", "मंसिर", "पुस", "माघ", "फागुन", "चैत",
];

const DAYS_HEADER_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_HEADER_NP = ["आइत", "सोम", "मंगल", "बुध", "बिही", "शुक्र", "शनि"];

// ── Only Fixed National / Civil Holidays ──────────────────────────────────────
// Lunar festivals (Dashain, Tihar, Teej, Janai Purnima, Shivaratri, Holi, etc.)
// are computed DYNAMICALLY from the Panchang engine — not hand-typed here.
const FIXED_HOLIDAYS_DATA: HolidayEntry[] = [
  // BS 2081
  { name: "New Year (नयाँ वर्ष)", bsDate: "2081-01-01", adDate: "2024-04-13", type: "National" },
  { name: "Labor Day (मजदुर दिवस)", bsDate: "2081-01-19", adDate: "2024-05-01", type: "National" },
  { name: "Republic Day (गणतन्त्र दिवस)", bsDate: "2081-02-15", adDate: "2024-05-28", type: "National" },
  { name: "Constitution Day (संविधान दिवस)", bsDate: "2081-06-03", adDate: "2024-09-19", type: "National" },
  { name: "Prithvi Jayanti (पृथ्वी जयन्ती)", bsDate: "2081-10-27", adDate: "2025-02-09", type: "National" },
  { name: "Martyrs' Day (शहीद दिवस)", bsDate: "2081-10-16", adDate: "2025-01-30", type: "National" },
  { name: "Democracy Day (प्रजातन्त्र दिवस)", bsDate: "2081-11-06", adDate: "2025-02-19", type: "National" },

  // BS 2082
  { name: "New Year (नयाँ वर्ष)", bsDate: "2082-01-01", adDate: "2025-04-14", type: "National" },
  { name: "Labor Day (मजदुर दिवस)", bsDate: "2082-01-18", adDate: "2025-05-01", type: "National" },
  { name: "Republic Day (गणतन्त्र दिवस)", bsDate: "2082-02-15", adDate: "2025-05-28", type: "National" },
  { name: "Constitution Day (संविधान दिवस)", bsDate: "2082-06-03", adDate: "2025-09-19", type: "National" },

  // BS 2083
  { name: "New Year (नयाँ वर्ष)", bsDate: "2083-01-01", adDate: "2026-04-14", type: "National" },
  { name: "Labor Day (मजदुर दिवस)", bsDate: "2083-01-18", adDate: "2026-05-01", type: "National" },
  { name: "Republic Day (गणतन्त्र दिवस)", bsDate: "2083-02-14", adDate: "2026-05-28", type: "National" },
  { name: "Constitution Day (संविधान दिवस)", bsDate: "2083-06-03", adDate: "2026-09-19", type: "National" },
  { name: "Prithvi Jayanti (पृथ्वी जयन्ती)", bsDate: "2083-10-27", adDate: "2027-02-09", type: "National" },

  // BS 2084
  { name: "New Year (नयाँ वर्ष)", bsDate: "2084-01-01", adDate: "2027-04-14", type: "National" },
  { name: "Labor Day (मजदुर दिवस)", bsDate: "2084-01-18", adDate: "2027-05-01", type: "National" },
  { name: "Republic Day (गणतन्त्र दिवस)", bsDate: "2084-02-15", adDate: "2027-05-28", type: "National" },
  { name: "Constitution Day (संविधान दिवस)", bsDate: "2084-06-03", adDate: "2027-09-19", type: "National" },
];

// ── Dynamic Lunar Festival Detector ───────────────────────────────────────────
// Uses Panchang tithi + BS month to identify real festivals.
// This makes festivals accurate for ANY year automatically.
//
// Key: Dashain falls in Ashwin (5), Tihar in Kartik (6), Teej in Bhadra (4),
//      Janai Purnima in Shrawan (3), Shivaratri in Falgun/Magh, Holi in Falgun/Chaitra.
//
// tithiNumber: 1-15 = Shukla Paksha, 16-30 = Krishna Paksha
//   1=Pratipada, 2=Dwitiya, ... 10=Dashami, 11=Ekadashi, ... 15=Purnima
//   16=Pratipada(K), ... 23=Ashtami(K), ... 29=Chaturdashi(K), 30=Aunsi

function detectLunarFestival(
  bsMonth: number, // 0-indexed: 0=Baisakh .. 11=Chaitra
  panchang: PanchangData,
  dayInMonth: number,
  totalDays: number
): LunarFestival | null {
  const t = panchang.tithiNumber;

  switch (bsMonth) {
    // ── Baisakh (0) ──────────────────────────────────
    case 0:
      if (t === 9 && dayInMonth > 2) return { name: "Ram Nawami", nameNp: "रामनवमी", emoji: "🏹", colorClass: "bg-orange-500/15 text-orange-700 dark:text-orange-300" };
      if (t === 15) return { name: "Buddha Jayanti", nameNp: "बुद्ध जयन्ती", emoji: "🪷", colorClass: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300" };
      break;

    // ── Jestha (1) ──────────────────────────────────
    case 1:
      // Buddha Jayanti can sometimes fall in Jestha instead of Baisakh
      if (t === 15 && dayInMonth <= 5) return { name: "Buddha Jayanti", nameNp: "बुद्ध जयन्ती", emoji: "🪷", colorClass: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300" };
      break;

    // ── Ashadh (2) ──────────────────────────────────
    case 2:
      // Rath Yatra — Ashadh Shukla Dwitiya
      if (t === 2 && dayInMonth <= 10) return { name: "Rath Yatra", nameNp: "रथ यात्रा", emoji: "🛕", colorClass: "bg-orange-500/15 text-orange-700 dark:text-orange-300" };
      // Guru Purnima — Ashadh Purnima (when it falls in BS Ashadh)
      if (t === 15) return { name: "Guru Purnima", nameNp: "गुरु पूर्णिमा", emoji: "🙏", colorClass: "bg-violet-500/15 text-violet-700 dark:text-violet-300" };
      break;

    // ── Shrawan (3) ─────────────────────────────────
    case 3:
      // Guru Purnima — when Ashadh Purnima spills into early Shrawan (day ≤ 16)
      if (t === 15 && dayInMonth <= 16) return { name: "Guru Purnima", nameNp: "गुरु पूर्णिमा", emoji: "🙏", colorClass: "bg-violet-500/15 text-violet-700 dark:text-violet-300" };
      // Janai Purnima — the real Shrawan Purnima (later in the month)
      if (t === 15 && dayInMonth > 16) return { name: "Janai Purnima", nameNp: "जनै पूर्णिमा", emoji: "🧵", colorClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300" };
      break;

    // ── Bhadra (4) ──────────────────────────────────
    case 4:
      // Gai Jatra — day after Shrawan Purnima, typically Bhadra Pratipada
      // or early Bhadra. We detect Shukla Pratipada (t=1) at very start of Bhadra.
      if (t === 16 && dayInMonth <= 3) return { name: "Gai Jatra", nameNp: "गाइजात्रा", emoji: "🐄", colorClass: "bg-teal-500/15 text-teal-700 dark:text-teal-300" };
      // Krishna Janmashtami — Bhadra Krishna Ashtami (t=23)
      if (t === 23) return { name: "Krishna Janmashtami", nameNp: "कृष्ण जन्माष्टमी", emoji: "🦚", colorClass: "bg-blue-500/15 text-blue-700 dark:text-blue-300" };
      // Teej — Bhadra Shukla Tritiya (t=3)
      if (t === 3 && dayInMonth > 5) return { name: "Haritalika Teej", nameNp: "तीज", emoji: "🔴", colorClass: "bg-red-500/15 text-red-700 dark:text-red-300" };
      // Rishi Panchami — Bhadra Shukla Panchami (t=5)
      if (t === 5 && dayInMonth > 5) return { name: "Rishi Panchami", nameNp: "ऋषि पञ्चमी", emoji: "🙏", colorClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" };
      // Indra Jatra — Bhadra Shukla Dwadashi (t=12) area
      if (t === 12 && dayInMonth > 15) return { name: "Indra Jatra", nameNp: "इन्द्रजात्रा", emoji: "🎭", colorClass: "bg-violet-500/15 text-violet-700 dark:text-violet-300" };
      break;

    // ── Ashwin (5) — DASHAIN ────────────────────────
    case 5:
      // Dashain is Ashwin Shukla Paksha. We look for tithis in the 2nd half of the month
      // to avoid matching the initial Shukla tithis if the month starts mid-Shukla.
      if (t === 1 && dayInMonth > 8) return { name: "Ghatasthapana", nameNp: "घटस्थापना", emoji: "🏺", colorClass: "bg-green-500/15 text-green-700 dark:text-green-300" };
      if (t === 7 && dayInMonth > 10) return { name: "Fulpati", nameNp: "फुलपाती", emoji: "💐", colorClass: "bg-pink-500/15 text-pink-700 dark:text-pink-300" };
      if (t === 8 && dayInMonth > 10) return { name: "Maha Ashtami", nameNp: "महाअष्टमी", emoji: "⚔️", colorClass: "bg-red-600/15 text-red-700 dark:text-red-300" };
      if (t === 9 && dayInMonth > 10) return { name: "Maha Nawami", nameNp: "महानवमी", emoji: "🗡️", colorClass: "bg-red-600/15 text-red-700 dark:text-red-300" };
      if (t === 10 && dayInMonth > 10) return { name: "Vijaya Dashami", nameNp: "विजया दशमी", emoji: "🎯", colorClass: "bg-rose-500/15 text-rose-700 dark:text-rose-300" };
      break;

    // ── Kartik (6) — TIHAR ─────────────────────────
    case 6:
      // Tihar cluster: Kaag Tihar → Kukur Tihar → Laxmi Puja (Aunsi) → Govardhan → Bhai Tika
      if (t === 28) return { name: "Kaag Tihar", nameNp: "काग तिहार", emoji: "🐦‍⬛", colorClass: "bg-gray-500/15 text-gray-700 dark:text-gray-300" };
      if (t === 29) return { name: "Kukur Tihar", nameNp: "कुकुर तिहार", emoji: "🐕", colorClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300" };
      if (t === 30) return { name: "Laxmi Puja / Deepawali", nameNp: "लक्ष्मी पूजा / दीपावली", emoji: "🪔", colorClass: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300" };
      // After Aunsi: Shukla Pratipada = Govardhan, Dwitiya = Bhai Tika
      // These are tithis 1 and 2 that occur AFTER the Aunsi in the same month (second half)
      if (t === 1 && dayInMonth > 12) return { name: "Govardhan Puja", nameNp: "गोवर्धन पूजा", emoji: "🐄", colorClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" };
      if (t === 2 && dayInMonth > 12) return { name: "Bhai Tika", nameNp: "भाइ टीका", emoji: "🎨", colorClass: "bg-pink-500/15 text-pink-700 dark:text-pink-300" };
      // Chhath — Kartik Shukla Shashti (t=6) after Tihar
      if (t === 6 && dayInMonth > 15) return { name: "Chhath Parva", nameNp: "छठ पर्व", emoji: "🌅", colorClass: "bg-orange-500/15 text-orange-700 dark:text-orange-300" };
      break;

    // ── Magh (9) ────────────────────────────────────
    case 9:
      // Maghe Sankranti — Magh 1 is the real Sankranti (Sun enters Makara Rashi)
      if (dayInMonth === 1) return { name: "Maghe Sankranti", nameNp: "माघे संक्रान्ति", emoji: "🌅", colorClass: "bg-orange-500/15 text-orange-700 dark:text-orange-300" };
      // Maha Shivaratri — Krishna Chaturdashi (t=29) in Magh or Falgun
      if (t === 29 && dayInMonth > 15) return { name: "Maha Shivaratri", nameNp: "महाशिवरात्रि", emoji: "🔱", colorClass: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300" };
      break;

    // ── Falgun (10) ─────────────────────────────────
    case 10:
      // Maha Shivaratri can also fall in early Falgun
      if (t === 29 && dayInMonth <= 10) return { name: "Maha Shivaratri", nameNp: "महाशिवरात्रि", emoji: "🔱", colorClass: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300" };
      // Fagu Purnima / Holi — Falgun Purnima
      if (t === 15) return { name: "Fagu Purnima / Holi", nameNp: "फागु पूर्णिमा / होली", emoji: "🎨", colorClass: "bg-pink-500/15 text-pink-700 dark:text-pink-300" };
      break;

    // ── Chaitra (11) ────────────────────────────────
    case 11:
      // Holi can sometimes spill into Chaitra
      if (t === 15 && dayInMonth <= 3) return { name: "Fagu Purnima / Holi", nameNp: "फागु पूर्णिमा / होली", emoji: "🎨", colorClass: "bg-pink-500/15 text-pink-700 dark:text-pink-300" };
      // Ram Nawami — Chaitra Shukla Navami
      if (t === 9 && dayInMonth > 5) return { name: "Ram Nawami", nameNp: "रामनवमी", emoji: "🏹", colorClass: "bg-orange-500/15 text-orange-700 dark:text-orange-300" };
      // Ghode Jatra — Chaitra Krishna Aunsi area (no exact tithi, cultural event)
      // Chaitra Dashain — Chaitra Shukla Dashami
      if (t === 10 && dayInMonth > 5) return { name: "Chaite Dashain", nameNp: "चैते दशैं", emoji: "🎋", colorClass: "bg-green-500/15 text-green-700 dark:text-green-300" };
      break;
  }

  return null;
}

function getDaysInBsMonth(year: number, monthIndex: number): number {
  for (let day = 32; day >= 29; day--) {
    try {
      const d = new NepaliDate(year, monthIndex, day);
      if (d.getMonth() === monthIndex && d.getDate() === day) {
        return day;
      }
    } catch {
      // Ignore invalid day error
    }
  }
  return 30;
}

export default function NepaliCalendarTool() {
  // Current real date in BS
  const todayND = useMemo(() => new NepaliDate(), []);
  const todayYear = todayND.getYear();
  const todayMonth = todayND.getMonth();
  const todayDate = todayND.getDate();

  // Selected year and month state
  const [selectedYear, setSelectedYear] = useState<number>(todayYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(todayMonth);
  const [activeDay, setActiveDay] = useState<number | null>(todayDate);

  // Calculate days & starting weekday of the month
  const monthDaysCount = useMemo(
    () => getDaysInBsMonth(selectedYear, selectedMonth),
    [selectedYear, selectedMonth]
  );

  const startDayOfWeek = useMemo(() => {
    try {
      const firstDay = new NepaliDate(selectedYear, selectedMonth, 1);
      return firstDay.getDay(); // 0 = Sunday, ..., 6 = Saturday
    } catch {
      return 0;
    }
  }, [selectedYear, selectedMonth]);

  // Precompute Panchang for all days in selected month
  const monthPanchangMap = useMemo(() => {
    const map = new Map<number, PanchangData>();
    for (let d = 1; d <= monthDaysCount; d++) {
      try {
        const npDate = new NepaliDate(selectedYear, selectedMonth, d);
        const jsDate = npDate.toJsDate();
        map.set(d, getPanchangForDate(jsDate));
      } catch {
        // Fallback if date conversion fails
      }
    }
    return map;
  }, [selectedYear, selectedMonth, monthDaysCount]);

  // Precompute dynamic lunar festivals for the month
  const lunarFestivalsMap = useMemo(() => {
    const map = new Map<number, LunarFestival>();
    for (let d = 1; d <= monthDaysCount; d++) {
      const panchang = monthPanchangMap.get(d);
      if (panchang) {
        const festival = detectLunarFestival(selectedMonth, panchang, d, monthDaysCount);
        if (festival) {
          map.set(d, festival);
        }
      }
    }
    return map;
  }, [selectedMonth, monthDaysCount, monthPanchangMap]);

  // Navigate months
  const handlePrevMonth = () => {
    if (selectedMonth > 0) {
      setSelectedMonth((prev) => prev - 1);
    } else if (selectedYear > 2070) {
      setSelectedYear((prev) => prev - 1);
      setSelectedMonth(11);
    }
    setActiveDay(null);
  };

  const handleNextMonth = () => {
    if (selectedMonth < 11) {
      setSelectedMonth((prev) => prev + 1);
    } else if (selectedYear < 2090) {
      setSelectedYear((prev) => prev + 1);
      setSelectedMonth(0);
    }
    setActiveDay(null);
  };

  const handleJumpToToday = () => {
    setSelectedYear(todayYear);
    setSelectedMonth(todayMonth);
    setActiveDay(todayDate);
  };

  // Build Map of fixed holidays for quick lookup
  const monthHolidaysMap = useMemo(() => {
    const map = new Map<number, HolidayEntry>();
    const monthStr = String(selectedMonth + 1).padStart(2, "0");
    const prefix = `${selectedYear}-${monthStr}-`;

    FIXED_HOLIDAYS_DATA.forEach((h) => {
      if (h.bsDate.startsWith(prefix)) {
        const dayNum = parseInt(h.bsDate.split("-")[2], 10);
        map.set(dayNum, h);
      }
    });

    return map;
  }, [selectedYear, selectedMonth]);

  // Combined list of all events (fixed holidays + dynamic lunar festivals) for sidebar
  const monthEventsList = useMemo(() => {
    const events: { day: number; name: string; emoji: string; type: "National" | "Festival" | "Lunar" }[] = [];

    // Add fixed holidays
    monthHolidaysMap.forEach((holiday, day) => {
      events.push({ day, name: holiday.name, emoji: holiday.type === "National" ? "🏛️" : "🎉", type: holiday.type });
    });

    // Add dynamic lunar festivals
    lunarFestivalsMap.forEach((festival, day) => {
      // Don't duplicate if a fixed holiday already exists on this day
      if (!monthHolidaysMap.has(day)) {
        events.push({ day, name: `${festival.emoji} ${festival.name} (${festival.nameNp})`, emoji: festival.emoji, type: "Lunar" });
      }
    });

    // Add Ekadashi, Purnima, Aunsi from Panchang
    monthPanchangMap.forEach((panchang, day) => {
      if (!monthHolidaysMap.has(day) && !lunarFestivalsMap.has(day)) {
        if (panchang.isEkadashi) {
          events.push({ day, name: `🌿 एकादशी (Ekadashi) — ${panchang.pakshaEn}`, emoji: "🌿", type: "Lunar" });
        } else if (panchang.isPurnima) {
          events.push({ day, name: `🌕 पूर्णिमा (Purnima)`, emoji: "🌕", type: "Lunar" });
        } else if (panchang.isAunsi) {
          events.push({ day, name: `🌑 औंसी (Aunsi / New Moon)`, emoji: "🌑", type: "Lunar" });
        }
      }
    });

    return events.sort((a, b) => a.day - b.day);
  }, [monthHolidaysMap, lunarFestivalsMap, monthPanchangMap]);

  // Selected Day Details
  const activeDayDetails = useMemo(() => {
    if (!activeDay) return null;
    try {
      const npDate = new NepaliDate(selectedYear, selectedMonth, activeDay);
      const jsDate = npDate.toJsDate();
      const holiday = monthHolidaysMap.get(activeDay);
      const panchang = monthPanchangMap.get(activeDay);
      const lunarFestival = lunarFestivalsMap.get(activeDay);
      const dayOfWeek = npDate.getDay();

      return {
        bsFormatted: `${activeDay} ${NEPALI_MONTHS_EN[selectedMonth]} ${selectedYear}`,
        bsFormattedNp: `${activeDay} ${NEPALI_MONTHS_NP[selectedMonth]} ${selectedYear}`,
        adFormatted: jsDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        dayNameEn: DAYS_HEADER_EN[dayOfWeek],
        dayNameNp: DAYS_HEADER_NP[dayOfWeek],
        isSaturday: dayOfWeek === 6,
        isToday:
          selectedYear === todayYear &&
          selectedMonth === todayMonth &&
          activeDay === todayDate,
        holiday,
        panchang,
        lunarFestival,
      };
    } catch {
      return null;
    }
  }, [selectedYear, selectedMonth, activeDay, monthHolidaysMap, monthPanchangMap, lunarFestivalsMap, todayYear, todayMonth, todayDate]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Privacy & Info Banner */}
      <div className="p-3 sm:p-4 rounded-2xl bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#18181B] dark:text-[#F4F4F5] flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 sm:gap-2.5 font-medium text-xs sm:text-sm">
          <ShieldCheck className="text-[#DC2626] shrink-0" size={18} />
          <span>
            🇳🇵 <strong>Real Panchang Engine (पात्रो):</strong>{" "}
            <span className="hidden sm:inline">Daily Tithi, Ekadashi, Purnima, Dashain, Tihar — computed astronomically.</span>
            <span className="sm:hidden">Tithi, Ekadashi, Dashain, Tihar — real data.</span>
          </span>
        </div>
        <button
          onClick={() => window.print()}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#2A2F48] text-xs font-bold hover:bg-[#FAFAF8] transition-colors"
        >
          <Printer size={14} /> Print
        </button>
      </div>

      {/* Main Calendar Container */}
      <div className="p-3 sm:p-6 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] shadow-sm space-y-4 sm:space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 border-b border-[#E4E0D8] dark:border-[#2A2F48] pb-4 sm:pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#DC2626]/10 text-[#DC2626] flex items-center justify-center shrink-0">
              <CalendarDays size={22} />
            </div>
            <div>
              <h2 className="font-extrabold text-lg sm:text-2xl text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2">
                {NEPALI_MONTHS_EN[selectedMonth]} {selectedYear}{" "}
                <span className="text-sm sm:text-base text-[#71717A] font-normal">
                  ({NEPALI_MONTHS_NP[selectedMonth]})
                </span>
              </h2>
              <p className="text-[10px] sm:text-xs text-[#71717A] font-medium mt-0.5">
                Bikram Sambat (वि.सं.) • Panchang
              </p>
            </div>
          </div>

          {/* Month / Year Selectors & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={handleJumpToToday}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-[#DC2626]/15 text-[#DC2626] font-bold text-[10px] sm:text-xs hover:bg-[#DC2626]/20 transition-all flex items-center gap-1 shrink-0"
            >
              <Sparkles size={12} /> Today
            </button>

            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(Number(e.target.value));
                setActiveDay(null);
              }}
              className="px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] text-[10px] sm:text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#DC2626]/40 flex-1 sm:flex-initial min-w-0"
            >
              {NEPALI_MONTHS_EN.map((m, idx) => (
                <option key={m} value={idx}>
                  {m} ({NEPALI_MONTHS_NP[idx]})
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
                setActiveDay(null);
              }}
              className="px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] text-[10px] sm:text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#DC2626]/40 shrink-0"
            >
              {[2078, 2079, 2080, 2081, 2082, 2083, 2084, 2085, 2086].map((y) => (
                <option key={y} value={y}>
                  {y} BS
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 sm:p-2 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-[#18181B] dark:text-[#F4F4F5] hover:bg-[#DC2626]/10 hover:text-[#DC2626] transition-colors"
                title="Previous Month"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 sm:p-2 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-[#18181B] dark:text-[#F4F4F5] hover:bg-[#DC2626]/10 hover:text-[#DC2626] transition-colors"
                title="Next Month"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-1 sm:space-y-1.5">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1.5 text-center">
            {DAYS_HEADER_EN.map((dayName, idx) => {
              const isSat = idx === 6;
              return (
                <div
                  key={dayName}
                  className={`py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-extrabold ${isSat
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      : "bg-[#FAFAF8] dark:bg-[#1E2338] text-[#71717A]"
                    }`}
                >
                  <div>{dayName}</div>
                  <div className="text-[8px] sm:text-[10px] opacity-75 font-normal">
                    {DAYS_HEADER_NP[idx]}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1.5">
            {/* Empty padding cells for start of month */}
            {Array.from({ length: startDayOfWeek }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="min-h-[52px] sm:min-h-[90px] rounded-lg sm:rounded-xl bg-[#FAFAF8]/40 dark:bg-[#1E2338]/20 border border-transparent"
              />
            ))}

            {/* Month Day Cells */}
            {Array.from({ length: monthDaysCount }).map((_, idx) => {
              const dayNum = idx + 1;
              const dayOfWeekIndex = (startDayOfWeek + idx) % 7;
              const isSaturday = dayOfWeekIndex === 6;
              const isToday =
                selectedYear === todayYear &&
                selectedMonth === todayMonth &&
                dayNum === todayDate;
              const isSelected = activeDay === dayNum;
              const holiday = monthHolidaysMap.get(dayNum);
              const panchang = monthPanchangMap.get(dayNum);
              const lunarFestival = lunarFestivalsMap.get(dayNum);
              const hasEvent = holiday || lunarFestival;

              return (
                <button
                  key={dayNum}
                  onClick={() => setActiveDay(dayNum)}
                  className={`relative min-h-[52px] sm:min-h-[90px] p-1 sm:p-2 rounded-lg sm:rounded-xl text-left border transition-all flex flex-col group ${isSelected
                      ? "border-[#DC2626] ring-2 ring-[#DC2626]/40 bg-[#DC2626]/5 shadow-md"
                      : isToday
                        ? "border-emerald-500 bg-emerald-500/10 text-[#18181B] dark:text-[#F4F4F5]"
                        : hasEvent
                          ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50"
                          : isSaturday
                            ? "border-rose-500/20 bg-rose-500/5 hover:border-rose-500/40"
                            : "border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] hover:border-[#DC2626]/50"
                    }`}
                >
                  {/* Top: Day Number + Status */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-[11px] sm:text-base font-extrabold ${isToday
                          ? "text-emerald-600 dark:text-emerald-400"
                          : isSaturday
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-[#18181B] dark:text-[#F4F4F5]"
                        }`}
                    >
                      {dayNum}
                    </span>

                    {/* Badges */}
                    <div className="flex items-center gap-0.5">
                      {isToday && (
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" title="Today" />
                      )}
                      {isSaturday && (
                        <span className="px-0.5 sm:px-1 rounded text-[7px] sm:text-[9px] font-extrabold bg-rose-500/15 text-rose-600 dark:text-rose-400">
                          OFF
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle: Tithi name (small text in each cell) */}
                  {panchang && (
                    <span className="text-[7px] sm:text-[9px] text-[#71717A] dark:text-[#A1A1AA] font-medium truncate block mt-0.5 leading-tight">
                      {panchang.tithiNameNp}
                    </span>
                  )}

                  {/* Bottom: Festival / Holiday / Lunar badge */}
                  <div className="mt-auto">
                    {/* Lunar festival (dynamic) */}
                    {lunarFestival ? (
                      <>
                        <span className="block sm:hidden text-[8px] font-bold truncate" title={lunarFestival.name}>
                          {lunarFestival.emoji}
                        </span>
                        <span
                          className={`hidden sm:block text-[9px] sm:text-[10px] font-bold line-clamp-2 leading-tight px-1 py-0.5 rounded ${lunarFestival.colorClass}`}
                          title={`${lunarFestival.name} (${lunarFestival.nameNp})`}
                        >
                          {lunarFestival.emoji} {lunarFestival.nameNp}
                        </span>
                      </>
                    ) : holiday ? (
                      <>
                        <span className="block sm:hidden text-[8px] font-bold truncate text-blue-600 dark:text-blue-400" title={holiday.name}>
                          🏛️
                        </span>
                        <span
                          className="hidden sm:block text-[9px] sm:text-[10px] font-bold line-clamp-2 leading-tight px-1 py-0.5 rounded bg-blue-500/15 text-blue-700 dark:text-blue-300"
                          title={holiday.name}
                        >
                          🏛️ {holiday.name.split("(")[0].trim()}
                        </span>
                      </>
                    ) : panchang?.lunarBadge ? (
                      <>
                        <span className="block sm:hidden text-[8px]" title={panchang.lunarBadge.labelNp}>
                          {panchang.isEkadashi ? "🌿" : panchang.isPurnima ? "🌕" : "🌑"}
                        </span>
                        <span
                          className={`hidden sm:block text-[8px] sm:text-[9px] font-bold leading-tight px-1 py-0.5 rounded border ${panchang.lunarBadge.colorClass}`}
                        >
                          {panchang.isEkadashi ? "🌿" : panchang.isPurnima ? "🌕" : "🌑"} {panchang.lunarBadge.labelNp}
                        </span>
                      </>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 border-t border-[#E4E0D8] dark:border-[#2A2F48] text-[9px] sm:text-[10px] text-[#71717A]">
          <span className="font-bold text-[#18181B] dark:text-[#F4F4F5]">Legend:</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Today</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Saturday</span>
          <span className="flex items-center gap-1">🌿 Ekadashi</span>
          <span className="flex items-center gap-1">🌕 Purnima</span>
          <span className="flex items-center gap-1">🌑 Aunsi</span>
          <span className="flex items-center gap-1">🎯 Dashain</span>
          <span className="flex items-center gap-1">🪔 Tihar</span>
          <span className="flex items-center gap-1">🏛️ National</span>
        </div>
      </div>

      {/* Selected Day Details & Month Events List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left: Active Day Details Card */}
        <div className="lg:col-span-6 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm sm:text-base text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2">
            <Clock size={18} className="text-[#DC2626]" />
            Selected Date Details
          </h3>

          {activeDayDetails ? (
            <div className="space-y-3 p-3 sm:p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
              <div className="flex items-center justify-between border-b border-[#E4E0D8] dark:border-[#2A2F48] pb-3">
                <div>
                  <span className="text-[10px] sm:text-xs text-[#71717A] font-semibold">Bikram Sambat (BS):</span>
                  <p className="text-base sm:text-lg font-extrabold text-[#DC2626]">
                    {activeDayDetails.bsFormatted}
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-[#71717A]">
                    {activeDayDetails.bsFormattedNp}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] sm:text-xs text-[#71717A] font-semibold">Day:</span>
                  <p className="text-xs sm:text-sm font-bold text-[#18181B] dark:text-[#F4F4F5]">
                    {activeDayDetails.dayNameEn}
                  </p>
                  <p className="text-[10px] sm:text-xs text-[#71717A] font-medium">
                    {activeDayDetails.dayNameNp}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] sm:text-xs pt-1">
                <span className="text-[#71717A] font-semibold">Gregorian (AD):</span>
                <span className="font-extrabold text-[#18181B] dark:text-[#F4F4F5]">
                  {activeDayDetails.adFormatted}
                </span>
              </div>

              {/* Panchang Details */}
              {activeDayDetails.panchang && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#E4E0D8] dark:border-[#2A2F48]">
                  <div className="p-2 rounded-lg bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#2A2F48]">
                    <div className="text-[9px] sm:text-[10px] text-[#71717A] font-semibold flex items-center gap-1">
                      <Moon size={10} /> Tithi (तिथि)
                    </div>
                    <p className="text-[11px] sm:text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] mt-0.5">
                      {activeDayDetails.panchang.tithiNameNp}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-[#71717A]">
                      {activeDayDetails.panchang.tithiNameEn}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#2A2F48]">
                    <div className="text-[9px] sm:text-[10px] text-[#71717A] font-semibold flex items-center gap-1">
                      <Sun size={10} /> Paksha (पक्ष)
                    </div>
                    <p className="text-[11px] sm:text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] mt-0.5">
                      {activeDayDetails.panchang.pakshaNp}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-[#71717A]">
                      {activeDayDetails.panchang.pakshaEn}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#2A2F48]">
                    <div className="text-[9px] sm:text-[10px] text-[#71717A] font-semibold flex items-center gap-1">
                      ✨ Nakshatra (नक्षत्र)
                    </div>
                    <p className="text-[11px] sm:text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] mt-0.5">
                      {activeDayDetails.panchang.nakshatraNp}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-[#71717A]">
                      {activeDayDetails.panchang.nakshatraEn}
                    </p>
                  </div>
                </div>
              )}

              {/* Lunar Festival Info */}
              {activeDayDetails.lunarFestival && (
                <div className={`p-3 rounded-xl border text-xs space-y-1 ${activeDayDetails.lunarFestival.colorClass}`}>
                  <div className="flex items-center gap-1.5 font-bold text-sm">
                    {activeDayDetails.lunarFestival.emoji} {activeDayDetails.lunarFestival.nameNp} ({activeDayDetails.lunarFestival.name})
                  </div>
                  <p className="text-[11px] opacity-80">
                    Computed from Panchang — Tithi {activeDayDetails.panchang?.tithiNameEn} in {NEPALI_MONTHS_EN[selectedMonth]}
                  </p>
                </div>
              )}

              {/* Fixed Holiday Info */}
              {activeDayDetails.holiday && (
                <div className="p-3 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[#DC2626] font-bold">
                    <PartyPopper size={15} /> {activeDayDetails.holiday.name}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#71717A]">
                    <span>Type: <strong>{activeDayDetails.holiday.type} Holiday</strong></span>
                    {activeDayDetails.holiday.adDate && <span>AD: {activeDayDetails.holiday.adDate}</span>}
                  </div>
                </div>
              )}

              {/* Saturday Notice */}
              {activeDayDetails.isSaturday && !activeDayDetails.holiday && !activeDayDetails.lunarFestival && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5">
                  <Flag size={14} /> Saturday (Weekly Off Day in Nepal)
                </div>
              )}

              {/* Ekadashi / Purnima / Aunsi badge */}
              {activeDayDetails.panchang?.lunarBadge && !activeDayDetails.lunarFestival && (
                <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${activeDayDetails.panchang.lunarBadge.colorClass}`}>
                  {activeDayDetails.panchang.isEkadashi ? "🌿" : activeDayDetails.panchang.isPurnima ? "🌕" : "🌑"}
                  {activeDayDetails.panchang.lunarBadge.labelNp} ({activeDayDetails.panchang.lunarBadge.label})
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-[#71717A] text-center py-6">
              Click any date in the calendar grid to view detailed Panchang &amp; festival information.
            </div>
          )}
        </div>

        {/* Right: Events List for Current Month */}
        <div className="lg:col-span-6 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm sm:text-base text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2">
            <PartyPopper size={18} className="text-[#DC2626]" />
            Events in {NEPALI_MONTHS_EN[selectedMonth]} {selectedYear}
          </h3>

          {monthEventsList.length > 0 ? (
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
              {monthEventsList.map(({ day, name, type }, i) => (
                <div
                  key={`${day}-${i}`}
                  onClick={() => setActiveDay(day)}
                  className={`p-2.5 sm:p-3 rounded-xl border cursor-pointer transition-colors flex items-center justify-between gap-2 text-[10px] sm:text-xs ${
                    type === "National"
                      ? "bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40"
                      : type === "Festival"
                        ? "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40"
                        : "bg-[#FAFAF8] dark:bg-[#1E2338] border-[#E4E0D8] dark:border-[#2A2F48] hover:border-[#DC2626]/40"
                  }`}
                >
                  <p className="font-bold text-[#18181B] dark:text-[#F4F4F5] truncate min-w-0">
                    {name}
                  </p>
                  <span className="px-2 py-0.5 rounded-lg bg-[#DC2626]/10 text-[#DC2626] font-extrabold text-[10px] sm:text-xs shrink-0">
                    {day} {NEPALI_MONTHS_EN[selectedMonth].slice(0, 3)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-[#71717A] text-center py-6 bg-[#FAFAF8] dark:bg-[#1E2338] rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48]">
              No major events in {NEPALI_MONTHS_EN[selectedMonth]} {selectedYear}. Saturdays remain weekly off-days.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
