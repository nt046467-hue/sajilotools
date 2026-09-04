"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import NepaliDate from "nepali-date-converter";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Printer,
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
const DAYS_HEADER_NP = ["आइ", "सो", "मं", "बु", "बि", "शु", "शन"];

// ── Only Fixed National / Civil Holidays ──────────────────────────────────────
// Lunar festivals (Dashain, Tihar, Teej, Janai Purnima, Shivaratri, Holi, etc.)
// are computed DYNAMICALLY from the Panchang engine — not hand-typed here.
// ── Fixed National / Civil Holidays Across Supported Years ───────────────────
const FIXED_HOLIDAYS_DATA: HolidayEntry[] = [
  // ── BS 2081 ──
  { name: "New Year (नयाँ वर्ष)", bsDate: "2081-01-01", adDate: "2024-04-13", type: "National" },
  { name: "Labor Day (मजदुर दिवस)", bsDate: "2081-01-19", adDate: "2024-05-01", type: "National" },
  { name: "Republic Day (गणतन्त्र दिवस)", bsDate: "2081-02-15", adDate: "2024-05-28", type: "National" },
  { name: "Bhanu Jayanti (भानु जयन्ती)", bsDate: "2081-03-29", adDate: "2024-07-13", type: "National" },
  { name: "Civil Service Day (निजामती सेवा दिवस)", bsDate: "2081-05-22", adDate: "2024-09-07", type: "National" },
  { name: "National Children's Day (राष्ट्रिय बाल दिवस)", bsDate: "2081-05-29", adDate: "2024-09-14", type: "National" },
  { name: "Constitution Day (संविधान दिवस)", bsDate: "2081-06-03", adDate: "2024-09-19", type: "National" },
  { name: "Martyrs' Day (शहीद दिवस)", bsDate: "2081-10-16", adDate: "2025-01-29", type: "National" },
  { name: "Prithvi Jayanti (पृथ्वी जयन्ती / राष्ट्रिय एकता दिवस)", bsDate: "2081-10-27", adDate: "2025-02-09", type: "National" },
  { name: "Democracy Day (प्रजातन्त्र दिवस)", bsDate: "2081-11-07", adDate: "2025-02-19", type: "National" },
  { name: "International Women's Day (महिला दिवस)", bsDate: "2081-11-24", adDate: "2025-03-08", type: "National" },

  // ── BS 2082 ──
  { name: "New Year (नयाँ वर्ष)", bsDate: "2082-01-01", adDate: "2025-04-14", type: "National" },
  { name: "Labor Day (मजदुर दिवस)", bsDate: "2082-01-18", adDate: "2025-05-01", type: "National" },
  { name: "Republic Day (गणतन्त्र दिवस)", bsDate: "2082-02-15", adDate: "2025-05-28", type: "National" },
  { name: "Bhanu Jayanti (भानु जयन्ती)", bsDate: "2082-03-29", adDate: "2025-07-13", type: "National" },
  { name: "Civil Service Day (निजामती सेवा दिवस)", bsDate: "2082-05-22", adDate: "2025-09-07", type: "National" },
  { name: "National Children's Day (राष्ट्रिय बाल दिवस)", bsDate: "2082-05-29", adDate: "2025-09-14", type: "National" },
  { name: "Constitution Day (संविधान दिवस)", bsDate: "2082-06-03", adDate: "2025-09-19", type: "National" },
  { name: "Martyrs' Day (शहीद दिवस)", bsDate: "2082-10-16", adDate: "2026-01-30", type: "National" },
  { name: "Prithvi Jayanti (पृथ्वी जयन्ती)", bsDate: "2082-10-27", adDate: "2026-02-10", type: "National" },
  { name: "Democracy Day (प्रजातन्त्र दिवस)", bsDate: "2082-11-07", adDate: "2026-02-19", type: "National" },
  { name: "International Women's Day (महिला दिवस)", bsDate: "2082-11-24", adDate: "2026-03-08", type: "National" },

  // ── BS 2083 ──
  { name: "New Year (नयाँ वर्ष)", bsDate: "2083-01-01", adDate: "2026-04-14", type: "National" },
  { name: "Labor Day (मजदुर दिवस)", bsDate: "2083-01-18", adDate: "2026-05-01", type: "National" },
  { name: "Republic Day (गणतन्त्र दिवस)", bsDate: "2083-02-15", adDate: "2026-05-28", type: "National" },
  { name: "Bhanu Jayanti (भानु जयन्ती)", bsDate: "2083-03-29", adDate: "2026-07-13", type: "National" },
  { name: "Civil Service Day (निजामती सेवा दिवस)", bsDate: "2083-05-22", adDate: "2026-09-07", type: "National" },
  { name: "National Children's Day (राष्ट्रिय बाल दिवस)", bsDate: "2083-05-29", adDate: "2026-09-14", type: "National" },
  { name: "Constitution Day (संविधान दिवस)", bsDate: "2083-06-03", adDate: "2026-09-19", type: "National" },
  { name: "Martyrs' Day (शहीद दिवस)", bsDate: "2083-10-16", adDate: "2027-01-30", type: "National" },
  { name: "Prithvi Jayanti (पृथ्वी जयन्ती)", bsDate: "2083-10-27", adDate: "2027-02-10", type: "National" },
  { name: "Democracy Day (प्रजातन्त्र दिवस)", bsDate: "2083-11-07", adDate: "2027-02-19", type: "National" },
  { name: "International Women's Day (महिला दिवस)", bsDate: "2083-11-24", adDate: "2027-03-08", type: "National" },

  // ── BS 2084 ──
  { name: "New Year (नयाँ वर्ष)", bsDate: "2084-01-01", adDate: "2027-04-14", type: "National" },
  { name: "Labor Day (मजदुर दिवस)", bsDate: "2084-01-18", adDate: "2027-05-01", type: "National" },
  { name: "Republic Day (गणतन्त्र दिवस)", bsDate: "2084-02-15", adDate: "2027-05-28", type: "National" },
  { name: "Civil Service Day (निजामती सेवा दिवस)", bsDate: "2084-05-22", adDate: "2027-09-07", type: "National" },
  { name: "National Children's Day (राष्ट्रिय बाल दिवस)", bsDate: "2084-05-29", adDate: "2027-09-14", type: "National" },
  { name: "Constitution Day (संविधान दिवस)", bsDate: "2084-06-03", adDate: "2027-09-19", type: "National" },
  { name: "Prithvi Jayanti (पृथ्वी जयन्ती)", bsDate: "2084-10-27", adDate: "2028-02-10", type: "National" },
  { name: "Democracy Day (प्रजातन्त्र दिवस)", bsDate: "2084-11-07", adDate: "2028-02-19", type: "National" },
  { name: "International Women's Day (महिला दिवस)", bsDate: "2084-11-24", adDate: "2028-03-08", type: "National" },
];

// ── Verified Lunar Festival Dates (Nepal Panchang Nirnayak Samiti Patro) ─────
const VERIFIED_FESTIVALS: Record<string, LunarFestival> = {
  // BS 2081
  "2081-05-03": { name: "Janai Purnima", nameNp: "जनै पूर्णिमा / रक्षाबन्धन", emoji: "🧵", colorClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  "2081-05-04": { name: "Gai Jatra", nameNp: "गाइजात्रा", emoji: "🐄", colorClass: "bg-teal-500/15 text-teal-700 dark:text-teal-300" },
  "2081-05-10": { name: "Krishna Janmashtami", nameNp: "कृष्ण जन्माष्टमी", emoji: "🦚", colorClass: "bg-blue-500/15 text-blue-700 dark:text-blue-300" },
  "2081-05-21": { name: "Haritalika Teej", nameNp: "हरितालिका तीज", emoji: "🔴", colorClass: "bg-red-500/15 text-red-700 dark:text-red-300" },
  "2081-05-23": { name: "Rishi Panchami", nameNp: "ऋषि पञ्चमी", emoji: "🙏", colorClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  "2081-05-31": { name: "Indra Jatra", nameNp: "इन्द्रजात्रा", emoji: "🎭", colorClass: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
  "2081-06-17": { name: "Ghatasthapana", nameNp: "घटस्थापना", emoji: "🏺", colorClass: "bg-green-500/15 text-green-700 dark:text-green-300" },
  "2081-06-24": { name: "Fulpati", nameNp: "फुलपाती", emoji: "💐", colorClass: "bg-pink-500/15 text-pink-700 dark:text-pink-300" },
  "2081-06-25": { name: "Maha Ashtami / Nawami", nameNp: "महाअष्टमी / महानवमी", emoji: "⚔️", colorClass: "bg-red-600/15 text-red-700 dark:text-red-300" },
  "2081-06-26": { name: "Vijaya Dashami", nameNp: "विजया दशमी (दशैं टीका)", emoji: "🎯", colorClass: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
  "2081-07-13": { name: "Kaag Tihar", nameNp: "काग तिहार", emoji: "🐦‍⬛", colorClass: "bg-gray-500/15 text-gray-700 dark:text-gray-300" },
  "2081-07-14": { name: "Kukur Tihar", nameNp: "कुकुर तिहार", emoji: "🐕", colorClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  "2081-07-15": { name: "Laxmi Puja / Deepawali", nameNp: "लक्ष्मी पूजा / दीपावली", emoji: "🪔", colorClass: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300" },
  "2081-07-17": { name: "Govardhan Puja", nameNp: "गोवर्धन पूजा", emoji: "🐄", colorClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  "2081-07-18": { name: "Bhai Tika", nameNp: "भाइ टीका", emoji: "🎨", colorClass: "bg-pink-500/15 text-pink-700 dark:text-pink-300" },
  "2081-07-22": { name: "Chhath Parva", nameNp: "छठ पर्व", emoji: "🌅", colorClass: "bg-orange-500/15 text-orange-700 dark:text-orange-300" },
  "2081-10-01": { name: "Maghe Sankranti", nameNp: "माघे संक्रान्ति", emoji: "🌅", colorClass: "bg-orange-500/15 text-orange-700 dark:text-orange-300" },
  "2081-11-14": { name: "Maha Shivaratri", nameNp: "महाशिवरात्रि", emoji: "🔱", colorClass: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300" },
  "2081-11-29": { name: "Fagu Purnima / Holi", nameNp: "फागु पूर्णिमा / होली", emoji: "🎨", colorClass: "bg-pink-500/15 text-pink-700 dark:text-pink-300" },
  "2081-12-24": { name: "Chaite Dashain", nameNp: "चैते दशैं", emoji: "🎋", colorClass: "bg-green-500/15 text-green-700 dark:text-green-300" },
  "2081-12-25": { name: "Ram Nawami", nameNp: "रामनवमी", emoji: "🏹", colorClass: "bg-orange-500/15 text-orange-700 dark:text-orange-300" },

  // BS 2082
  "2082-01-29": { name: "Buddha Jayanti", nameNp: "बुद्ध जयन्ती / उभौली", emoji: "🪷", colorClass: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300" },
  "2082-04-24": { name: "Janai Purnima", nameNp: "जनै पूर्णिमा / रक्षाबन्धन", emoji: "🧵", colorClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  "2082-04-25": { name: "Gai Jatra", nameNp: "गाइजात्रा", emoji: "🐄", colorClass: "bg-teal-500/15 text-teal-700 dark:text-teal-300" },
  "2082-05-02": { name: "Krishna Janmashtami", nameNp: "कृष्ण जन्माष्टमी", emoji: "🦚", colorClass: "bg-blue-500/15 text-blue-700 dark:text-blue-300" },
  "2082-05-10": { name: "Haritalika Teej", nameNp: "तीज", emoji: "🔴", colorClass: "bg-red-500/15 text-red-700 dark:text-red-300" },
  "2082-05-12": { name: "Rishi Panchami", nameNp: "ऋषि पञ्चमी", emoji: "🙏", colorClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  "2082-05-20": { name: "Indra Jatra", nameNp: "इन्द्रजात्रा", emoji: "🎭", colorClass: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
  "2082-06-06": { name: "Ghatasthapana", nameNp: "घटस्थापना", emoji: "🏺", colorClass: "bg-green-500/15 text-green-700 dark:text-green-300" },
  "2082-06-12": { name: "Fulpati", nameNp: "फुलपाती", emoji: "💐", colorClass: "bg-pink-500/15 text-pink-700 dark:text-pink-300" },
  "2082-06-13": { name: "Maha Ashtami", nameNp: "महाअष्टमी", emoji: "⚔️", colorClass: "bg-red-600/15 text-red-700 dark:text-red-300" },
  "2082-06-14": { name: "Maha Nawami", nameNp: "महानवमी", emoji: "🗡️", colorClass: "bg-red-600/15 text-red-700 dark:text-red-300" },
  "2082-06-15": { name: "Vijaya Dashami", nameNp: "विजया दशमी (दशैं)", emoji: "🎯", colorClass: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
  "2082-07-02": { name: "Kaag Tihar", nameNp: "काग तिहार", emoji: "🐦‍⬛", colorClass: "bg-gray-500/15 text-gray-700 dark:text-gray-300" },
  "2082-07-03": { name: "Kukur Tihar", nameNp: "कुकुर तिहार", emoji: "🐕", colorClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  "2082-07-04": { name: "Laxmi Puja / Deepawali", nameNp: "लक्ष्मी पूजा", emoji: "🪔", colorClass: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300" },
  "2082-07-05": { name: "Govardhan Puja", nameNp: "गोवर्धन पूजा", emoji: "🐄", colorClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  "2082-07-06": { name: "Bhai Tika", nameNp: "भाइ टीका", emoji: "🎨", colorClass: "bg-pink-500/15 text-pink-700 dark:text-pink-300" },
  "2082-07-11": { name: "Chhath Parva", nameNp: "छठ पर्व", emoji: "🌅", colorClass: "bg-orange-500/15 text-orange-700 dark:text-orange-300" },
  "2082-10-01": { name: "Maghe Sankranti", nameNp: "माघे संक्रान्ति", emoji: "🌅", colorClass: "bg-orange-500/15 text-orange-700 dark:text-orange-300" },
  "2082-11-04": { name: "Maha Shivaratri", nameNp: "महाशिवरात्रि", emoji: "🔱", colorClass: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300" },
  "2082-11-19": { name: "Fagu Purnima / Holi", nameNp: "फागु पूर्णिमा / होली", emoji: "🎨", colorClass: "bg-pink-500/15 text-pink-700 dark:text-pink-300" },

  // BS 2083 - Exact official Nepal Patro verified dates
  "2083-01-18": { name: "Buddha Jayanti", nameNp: "बुद्ध जयन्ती", emoji: "🪷", colorClass: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300" },
  "2083-05-12": { name: "Janai Purnima", nameNp: "जनै पूर्णिमा / रक्षाबन्धन", emoji: "🧵", colorClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  "2083-05-13": { name: "Gai Jatra", nameNp: "गाइजात्रा", emoji: "🐄", colorClass: "bg-teal-500/15 text-teal-700 dark:text-teal-300" },
  "2083-05-19": { name: "Krishna Janmashtami", nameNp: "कृष्ण जन्माष्टमी", emoji: "🦚", colorClass: "bg-blue-500/15 text-blue-700 dark:text-blue-300" },
  "2083-05-26": { name: "Kushe Aunsi", nameNp: "कुशे औंसी (बाबुको मुख हेर्ने)", emoji: "🌑", colorClass: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300" },
  "2083-05-28": { name: "Dar Khane Din", nameNp: "दर खाने दिन", emoji: "🍲", colorClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  "2083-05-29": { name: "Haritalika Teej", nameNp: "हरितालिका तीज", emoji: "🔴", colorClass: "bg-red-500/15 text-red-700 dark:text-red-300" },
  "2083-05-30": { name: "Rishi Panchami", nameNp: "ऋषि पञ्चमी", emoji: "🙏", colorClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  "2083-06-09": { name: "Indra Jatra", nameNp: "इन्द्रजात्रा", emoji: "🎭", colorClass: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
  "2083-06-11": { name: "Ghatasthapana", nameNp: "घटस्थापना (दशैं आरम्भ)", emoji: "🏺", colorClass: "bg-green-500/15 text-green-700 dark:text-green-300" },
  "2083-06-31": { name: "Fulpati", nameNp: "फूलपाती", emoji: "💐", colorClass: "bg-pink-500/15 text-pink-700 dark:text-pink-300" },
  "2083-07-01": { name: "Maha Ashtami", nameNp: "महाअष्टमी", emoji: "⚔️", colorClass: "bg-red-600/15 text-red-700 dark:text-red-300" },
  "2083-07-02": { name: "Maha Nawami", nameNp: "महानवमी", emoji: "🗡️", colorClass: "bg-red-600/15 text-red-700 dark:text-red-300" },
  "2083-07-03": { name: "Vijaya Dashami", nameNp: "विजया दशमी (दशैं टीका)", emoji: "🎯", colorClass: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
  "2083-07-07": { name: "Kaag Tihar", nameNp: "काग तिहार", emoji: "🐦‍⬛", colorClass: "bg-gray-500/15 text-gray-700 dark:text-gray-300" },
  "2083-07-08": { name: "Laxmi Puja / Deepawali", nameNp: "लक्ष्मी पूजा / कुकुर तिहार", emoji: "🪔", colorClass: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300" },
  "2083-07-09": { name: "Gai Puja", nameNp: "गाई पूजा", emoji: "🐄", colorClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  "2083-07-10": { name: "Govardhan Puja", nameNp: "गोवर्धन पूजा / म्ह: पूजा", emoji: "🌾", colorClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  "2083-07-11": { name: "Bhai Tika", nameNp: "भाइ टीका", emoji: "🎨", colorClass: "bg-pink-500/15 text-pink-700 dark:text-pink-300" },
  "2083-07-15": { name: "Chhath Parva", nameNp: "छठ पर्व", emoji: "🌅", colorClass: "bg-orange-500/15 text-orange-700 dark:text-orange-300" },
  "2083-10-01": { name: "Maghe Sankranti", nameNp: "माघे संक्रान्ति", emoji: "🌅", colorClass: "bg-orange-500/15 text-orange-700 dark:text-orange-300" },
  "2083-11-23": { name: "Maha Shivaratri", nameNp: "महाशिवरात्रि", emoji: "🔱", colorClass: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300" },
};

function detectLunarFestival(
  year: number,
  bsMonth: number, // 0-indexed: 0=Baisakh .. 11=Chaitra
  panchang: PanchangData,
  dayInMonth: number,
  totalDays: number
): LunarFestival | null {
  const t = panchang.tithiNumber;

  switch (bsMonth) {
    case 0:
      if (t === 9 && dayInMonth > 2) return { name: "Ram Nawami", nameNp: "रामनवमी", emoji: "🏹", colorClass: "bg-orange-500/15 text-orange-700 dark:text-orange-300" };
      if (t === 15) return { name: "Buddha Jayanti", nameNp: "बुद्ध जयन्ती", emoji: "🪷", colorClass: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300" };
      break;

    case 1:
      if (t === 15 && dayInMonth <= 5) return { name: "Buddha Jayanti", nameNp: "बुद्ध जयन्ती", emoji: "🪷", colorClass: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300" };
      break;

    case 2:
      if (t === 2 && dayInMonth <= 10) return { name: "Rath Yatra", nameNp: "रथ यात्रा", emoji: "🛕", colorClass: "bg-orange-500/15 text-orange-700 dark:text-orange-300" };
      if (t === 15) return { name: "Guru Purnima", nameNp: "गुरु पूर्णिमा", emoji: "🙏", colorClass: "bg-violet-500/15 text-violet-700 dark:text-violet-300" };
      break;

    case 3:
      if (t === 15 && dayInMonth <= 16) return { name: "Guru Purnima", nameNp: "गुरु पूर्णिमा", emoji: "🙏", colorClass: "bg-violet-500/15 text-violet-700 dark:text-violet-300" };
      if (t === 15 && dayInMonth > 16) return { name: "Janai Purnima", nameNp: "जनै पूर्णिमा / रक्षाबन्धन", emoji: "🧵", colorClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300" };
      break;

    case 4:
      if (t === 15 && dayInMonth <= 15) return { name: "Janai Purnima", nameNp: "जनै पूर्णिमा / रक्षाबन्धन", emoji: "🧵", colorClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300" };
      if (t === 16 && dayInMonth <= 16) return { name: "Gai Jatra", nameNp: "गाइजात्रा", emoji: "🐄", colorClass: "bg-teal-500/15 text-teal-700 dark:text-teal-300" };
      if (t === 23) return { name: "Krishna Janmashtami", nameNp: "कृष्ण जन्माष्टमी", emoji: "🦚", colorClass: "bg-blue-500/15 text-blue-700 dark:text-blue-300" };
      if (t === 30 && dayInMonth > 15) return { name: "Kushe Aunsi", nameNp: "कुशे औंसी (बाबुको मुख हेर्ने)", emoji: "🌑", colorClass: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300" };
      if (t === 3 && dayInMonth > 15) return { name: "Haritalika Teej", nameNp: "हरितालिका तीज", emoji: "🔴", colorClass: "bg-red-500/15 text-red-700 dark:text-red-300" };
      if (t === 4 && dayInMonth > 15) return { name: "Ganesh Chaturthi", nameNp: "गणेश चतुर्थी", emoji: "🐘", colorClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300" };
      if (t === 5 && dayInMonth > 15) return { name: "Rishi Panchami", nameNp: "ऋषि पञ्चमी", emoji: "🙏", colorClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" };
      if (t === 14 && dayInMonth > 15) return { name: "Indra Jatra", nameNp: "इन्द्रजात्रा", emoji: "🎭", colorClass: "bg-violet-500/15 text-violet-700 dark:text-violet-300" };
      break;

    case 5:
      if (t === 1 && dayInMonth > 8) return { name: "Ghatasthapana", nameNp: "घटस्थापना (दशैं आरम्भ)", emoji: "🏺", colorClass: "bg-green-500/15 text-green-700 dark:text-green-300" };
      if (t === 7 && dayInMonth > 10) return { name: "Fulpati", nameNp: "फूलपाती", emoji: "💐", colorClass: "bg-pink-500/15 text-pink-700 dark:text-pink-300" };
      if (t === 8 && dayInMonth > 10) return { name: "Maha Ashtami", nameNp: "महाअष्टमी", emoji: "⚔️", colorClass: "bg-red-600/15 text-red-700 dark:text-red-300" };
      if (t === 9 && dayInMonth > 10) return { name: "Maha Nawami", nameNp: "महानवमी", emoji: "🗡️", colorClass: "bg-red-600/15 text-red-700 dark:text-red-300" };
      if (t === 10 && dayInMonth > 10) return { name: "Vijaya Dashami", nameNp: "विजया दशमी (दशैं टीका)", emoji: "🎯", colorClass: "bg-rose-500/15 text-rose-700 dark:text-rose-300" };
      if (t === 15 && dayInMonth > 15) return { name: "Kojagrat Purnima", nameNp: "कोजाग्रत पूर्णिमा", emoji: "🌕", colorClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300" };
      break;

    case 6:
      if (t === 28) return { name: "Kaag Tihar", nameNp: "काग तिहार", emoji: "🐦‍⬛", colorClass: "bg-gray-500/15 text-gray-700 dark:text-gray-300" };
      if (t === 29) return { name: "Kukur Tihar", nameNp: "कुकुर तिहार", emoji: "🐕", colorClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300" };
      if (t === 30) return { name: "Laxmi Puja / Deepawali", nameNp: "लक्ष्मी पूजा / दीपावली", emoji: "🪔", colorClass: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300" };
      if (t === 1 && dayInMonth > 12) return { name: "Govardhan Puja", nameNp: "गोवर्धन पूजा / म्ह: पूजा", emoji: "🐄", colorClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" };
      if (t === 2 && dayInMonth > 12) return { name: "Bhai Tika", nameNp: "भाइ टीका", emoji: "🎨", colorClass: "bg-pink-500/15 text-pink-700 dark:text-pink-300" };
      if (t === 6 && dayInMonth > 15) return { name: "Chhath Parva", nameNp: "छठ पर्व", emoji: "🌅", colorClass: "bg-orange-500/15 text-orange-700 dark:text-orange-300" };
      if (t === 11 && dayInMonth > 15) return { name: "Haribodhini Ekadashi", nameNp: "हरिबोधिनी एकादशी (तुलसी विवाह)", emoji: "🌿", colorClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" };
      break;

    case 9:
      if (dayInMonth === 1) return { name: "Maghe Sankranti", nameNp: "माघे संक्रान्ति", emoji: "🌅", colorClass: "bg-orange-500/15 text-orange-700 dark:text-orange-300" };
      if (t === 29 && dayInMonth > 15) return { name: "Maha Shivaratri", nameNp: "महाशिवरात्रि", emoji: "🔱", colorClass: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300" };
      break;

    case 10:
      if (t === 29 && dayInMonth <= 10) return { name: "Maha Shivaratri", nameNp: "महाशिवरात्रि", emoji: "🔱", colorClass: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300" };
      if (t === 15) return { name: "Fagu Purnima / Holi", nameNp: "फागु पूर्णिमा / होली", emoji: "🎨", colorClass: "bg-pink-500/15 text-pink-700 dark:text-pink-300" };
      if (t === 16) return { name: "Holi (Terai)", nameNp: "तराई होली", emoji: "🎨", colorClass: "bg-rose-500/15 text-rose-700 dark:text-rose-300" };
      break;

    case 11:
      if (t === 15 && dayInMonth <= 3) return { name: "Fagu Purnima / Holi", nameNp: "फागु पूर्णिमा / होली", emoji: "🎨", colorClass: "bg-pink-500/15 text-pink-700 dark:text-pink-300" };
      if (t === 30 && dayInMonth > 15) return { name: "Ghode Jatra", nameNp: "घोडेजात्रा", emoji: "🐎", colorClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300" };
      if (t === 8 && dayInMonth > 5) return { name: "Chaite Dashain", nameNp: "चैते दशैं", emoji: "🎋", colorClass: "bg-green-500/15 text-green-700 dark:text-green-300" };
      if (t === 9 && dayInMonth > 5) return { name: "Ram Nawami", nameNp: "रामनवमी", emoji: "🏹", colorClass: "bg-orange-500/15 text-orange-700 dark:text-orange-300" };
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
  const [legendOpen, setLegendOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Precompute English Gregorian (AD) dates for each day in selected month
  const monthAdDatesMap = useMemo(() => {
    const map = new Map<number, { day: number; monthNameEn: string; year: number; fullAd: string }>();
    for (let d = 1; d <= monthDaysCount; d++) {
      try {
        const nd = new NepaliDate(selectedYear, selectedMonth, d);
        const jsDate = nd.toJsDate();
        map.set(d, {
          day: jsDate.getDate(),
          monthNameEn: jsDate.toLocaleDateString("en-US", { month: "short" }),
          year: jsDate.getFullYear(),
          fullAd: jsDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        });
      } catch {
        // Fallback
      }
    }
    return map;
  }, [selectedYear, selectedMonth, monthDaysCount]);

  // Gregorian date range string for calendar header
  const gregorianRangeText = useMemo(() => {
    const firstAd = monthAdDatesMap.get(1);
    const lastAd = monthAdDatesMap.get(monthDaysCount);
    if (!firstAd || !lastAd) return "";
    if (firstAd.monthNameEn === lastAd.monthNameEn) {
      return `${firstAd.monthNameEn} ${firstAd.year}`;
    }
    return `${firstAd.monthNameEn} – ${lastAd.monthNameEn} ${lastAd.year}`;
  }, [monthAdDatesMap, monthDaysCount]);

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

  // Precompute dynamic lunar festivals for the month WITH STRICT DEDUPLICATION
  const lunarFestivalsMap = useMemo(() => {
    const map = new Map<number, LunarFestival>();
    const assignedFestivalKeys = new Set<string>();

    const normalizeFestName = (name: string) =>
      name.toLowerCase().replace(/[^a-z0-9]/g, "");

    // Pass 1: Verified Festivals for this month take highest precedence
    for (let d = 1; d <= monthDaysCount; d++) {
      const dateKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const verified = VERIFIED_FESTIVALS[dateKey];
      if (verified) {
        const key = normalizeFestName(verified.name);
        if (!assignedFestivalKeys.has(key)) {
          map.set(d, verified);
          assignedFestivalKeys.add(key);
        }
      }
    }

    // Pass 2: Dynamic astronomical festivals for days without verified entry
    for (let d = 1; d <= monthDaysCount; d++) {
      if (map.has(d)) continue; // Day already assigned a verified festival
      const panchang = monthPanchangMap.get(d);
      if (panchang) {
        const dyn = detectLunarFestival(selectedYear, selectedMonth, panchang, d, monthDaysCount);
        if (dyn) {
          const key = normalizeFestName(dyn.name);
          if (!assignedFestivalKeys.has(key)) {
            map.set(d, dyn);
            assignedFestivalKeys.add(key);
          }
        }
      }
    }

    return map;
  }, [selectedYear, selectedMonth, monthDaysCount, monthPanchangMap]);

  // Weeks structure for High-Resolution Print Layout
  const printWeeks = useMemo(() => {
    const weeks: (number | null)[][] = [];
    let currentWeek: (number | null)[] = [];

    // Empty cells before month start
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push(null);
    }

    for (let d = 1; d <= monthDaysCount; d++) {
      currentWeek.push(d);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Fill remaining cells in last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }, [startDayOfWeek, monthDaysCount]);

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

  // Combined list of all events (fixed holidays + dynamic lunar festivals) for sidebar & print
  const monthEventsList = useMemo(() => {
    const events: { day: number; name: string; emoji: string; type: "National" | "Festival" | "Lunar" }[] = [];

    // Add fixed holidays
    monthHolidaysMap.forEach((holiday, day) => {
      const isNat = holiday.type === "National";
      events.push({
        day,
        name: holiday.name,
        emoji: isNat ? "🏛️" : "🎉",
        type: holiday.type,
      });
    });

    // Add dynamic lunar festivals (avoid duplicate if already added as holiday for same day)
    lunarFestivalsMap.forEach((festival, day) => {
      if (!monthHolidaysMap.has(day)) {
        events.push({
          day,
          name: `${festival.nameNp} (${festival.name})`,
          emoji: festival.emoji,
          type: "Festival",
        });
      }
    });

    // Add Ekadashi, Purnima, Aunsi from Panchang
    monthPanchangMap.forEach((panchang, day) => {
      if (!monthHolidaysMap.has(day) && !lunarFestivalsMap.has(day)) {
        if (panchang.isEkadashi) {
          events.push({
            day,
            name: `एकादशी (${panchang.pakshaNp})`,
            emoji: "🌿",
            type: "Lunar",
          });
        } else if (panchang.isPurnima) {
          events.push({
            day,
            name: `पूर्णिमा (Purnima)`,
            emoji: "🌕",
            type: "Lunar",
          });
        } else if (panchang.isAunsi) {
          events.push({
            day,
            name: `औंसी (Aunsi / New Moon)`,
            emoji: "🌑",
            type: "Lunar",
          });
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

  // Nepali numerals helper
  const toNepaliNum = (n: number): string => {
    const digits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
    return String(n).split("").map(d => digits[parseInt(d)] || d).join("");
  };

  // Full day names in Nepali for aria labels
  const DAYS_FULL_NP = ["आइतबार", "सोमबार", "मंगलबार", "बुधबार", "बिहीबार", "शुक्रबार", "शनिबार"];

  return (
    <div className="w-full max-w-5xl mx-auto px-0 sm:px-0 print:max-w-none print:m-0 print:p-0 print:w-full">

      {/* ══════════════════════════════════════════════════════════ */}
      {/* SCREEN LAYOUT                                            */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="print:hidden space-y-4 sm:space-y-5">

        {/* ── CALENDAR HEADER ─────────────────────────────────── */}
        <div className="space-y-3">
          {/* Title row */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#18181B] dark:text-[#F4F4F5] leading-tight">
                {NEPALI_MONTHS_NP[selectedMonth]} {toNepaliNum(selectedYear)}
              </h2>
              <p className="text-xs sm:text-sm text-[#71717A] dark:text-[#A1A1AA] font-medium mt-0.5">
                {NEPALI_MONTHS_EN[selectedMonth]} • {selectedYear} BS
                {gregorianRangeText && <span className="text-[#A1A1AA] dark:text-[#71717A]"> • {gregorianRangeText}</span>}
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="p-2.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-[#71717A] hover:text-[#DC2626] hover:border-[#DC2626]/30 transition-colors shrink-0"
              title="भित्ते पात्रो प्रिन्ट गर्नुहोस्"
              aria-label="प्रिन्ट"
            >
              <Printer size={16} />
            </button>
          </div>

          {/* Navigation row */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="h-11 w-11 shrink-0 flex items-center justify-center rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-[#18181B] dark:text-[#F4F4F5] hover:bg-[#DC2626]/10 hover:text-[#DC2626] hover:border-[#DC2626]/30 transition-colors active:scale-95"
              aria-label="अघिल्लो महिना"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={handleJumpToToday}
              className="h-11 px-4 shrink-0 rounded-xl bg-[#DC2626]/10 text-[#DC2626] font-bold text-sm hover:bg-[#DC2626]/20 transition-colors active:scale-95"
              aria-label="आज"
            >
              आज
            </button>

            <button
              onClick={handleNextMonth}
              className="h-11 w-11 shrink-0 flex items-center justify-center rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-[#18181B] dark:text-[#F4F4F5] hover:bg-[#DC2626]/10 hover:text-[#DC2626] hover:border-[#DC2626]/30 transition-colors active:scale-95"
              aria-label="अर्को महिना"
            >
              <ChevronRight size={18} />
            </button>

            <div className="flex-1" />

            {/* Month/Year selectors */}
            <select
              value={selectedMonth}
              onChange={(e) => { setSelectedMonth(Number(e.target.value)); setActiveDay(null); }}
              className="h-11 px-2 sm:px-3 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#DC2626]/40 min-w-0"
              aria-label="महिना छान्नुहोस्"
            >
              {NEPALI_MONTHS_NP.map((m, idx) => (
                <option key={m} value={idx}>{m}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => { setSelectedYear(Number(e.target.value)); setActiveDay(null); }}
              className="h-11 px-2 sm:px-3 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#DC2626]/40 shrink-0"
              aria-label="वर्ष छान्नुहोस्"
            >
              {[2078,2079,2080,2081,2082,2083,2084,2085,2086].map(y => (
                <option key={y} value={y}>{toNepaliNum(y)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── MAIN CONTENT: Desktop side-by-side ──────────────── */}
        <div className="flex flex-col lg:flex-row lg:gap-5">

          {/* LEFT: Calendar Grid */}
          <div className="lg:flex-1 min-w-0">
            <div className="rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] shadow-sm p-2 sm:p-4 space-y-1">

              {/* Day Names Header */}
              <div className="grid grid-cols-7 gap-px sm:gap-1 text-center mb-1">
                {DAYS_HEADER_NP.map((dayNp, idx) => {
                  const isSat = idx === 6;
                  return (
                    <div
                      key={dayNp}
                      className={`py-1.5 text-[11px] sm:text-xs font-bold ${
                        isSat ? "text-rose-600 dark:text-rose-400" : "text-[#71717A] dark:text-[#A1A1AA]"
                      }`}
                    >
                      {dayNp}
                    </div>
                  );
                })}
              </div>

              {/* Grid Cells */}
              <div className="grid grid-cols-7 gap-px sm:gap-1">
                {/* Empty padding cells */}
                {Array.from({ length: startDayOfWeek }).map((_, idx) => (
                  <div key={`e-${idx}`} className="aspect-square sm:min-h-[72px]" />
                ))}

                {/* Day cells */}
                {Array.from({ length: monthDaysCount }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dow = (startDayOfWeek + idx) % 7;
                  const isSaturday = dow === 6;
                  const isToday = selectedYear === todayYear && selectedMonth === todayMonth && dayNum === todayDate;
                  const isSelected = activeDay === dayNum;
                  const holiday = monthHolidaysMap.get(dayNum);
                  const lunarFestival = lunarFestivalsMap.get(dayNum);
                  const panchang = monthPanchangMap.get(dayNum);
                  const adInfo = monthAdDatesMap.get(dayNum);
                  const hasEvent = !!(holiday || lunarFestival);
                  const hasLunarBadge = !!(panchang?.lunarBadge);
                  const eventNameNp = lunarFestival
                    ? lunarFestival.nameNp
                    : holiday
                      ? (holiday.name.match(/\(([^)]+)\)/)?.[1]?.trim() || holiday.name)
                      : "";
                  const eventEmoji = lunarFestival
                    ? lunarFestival.emoji
                    : (holiday?.type === "National" ? "🏛️" : "🎉");
                  const eventColorClass = lunarFestival
                    ? lunarFestival.colorClass
                    : holiday?.type === "National"
                      ? "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                      : "bg-blue-500/15 text-blue-700 dark:text-blue-300";

                  // Hamro Patro Cell Styling
                  let cellClass = "border border-[#E4E0D8]/60 dark:border-[#2A2F48]/40 bg-[#FAFAF8] dark:bg-[#141829] hover:border-[#DC2626]/40";
                  if (isSelected) {
                    // Solid green/emerald card matching Hamro Patro selected date
                    cellClass = "bg-[#2E7D32] dark:bg-emerald-700 text-white rounded-lg shadow-sm ring-2 ring-[#2E7D32]/40 border-transparent";
                  } else if (isToday) {
                    cellClass = "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/15";
                  } else if (isSaturday) {
                    cellClass = "border-[#E4E0D8]/60 dark:border-[#2A2F48]/40 bg-rose-500/[0.04] dark:bg-rose-500/[0.06]";
                  }

                  return (
                    <button
                      key={dayNum}
                      onClick={() => setActiveDay(dayNum)}
                      aria-label={`${NEPALI_MONTHS_NP[selectedMonth]} ${toNepaliNum(dayNum)}, ${toNepaliNum(selectedYear)}, ${DAYS_FULL_NP[dow]}`}
                      aria-selected={isSelected}
                      className={`relative aspect-square sm:aspect-auto sm:min-h-[72px] rounded-lg p-1 sm:p-1.5 flex flex-col justify-between transition-all active:scale-95 ${cellClass}`}
                    >
                      {/* Top: AD Gregorian Date */}
                      <div className="flex items-center justify-between w-full leading-none">
                        <span className="hidden sm:inline" />
                        {adInfo && (
                          <span
                            className={`text-[8.5px] sm:text-[9.5px] font-medium leading-none ml-auto ${
                              isSelected
                                ? "text-white/80"
                                : "text-[#71717A] dark:text-[#A1A1AA]"
                            }`}
                          >
                            {adInfo.day === 1 || dayNum === 1 ? `${adInfo.monthNameEn} ${adInfo.day}` : adInfo.day}
                          </span>
                        )}
                      </div>

                      {/* Center: Big Nepali Numeral (Hamro Patro style) */}
                      <div className="my-auto text-center w-full">
                        <span
                          className={`text-base sm:text-lg font-black leading-none ${
                            isSelected
                              ? "text-white"
                              : isSaturday || holiday
                                ? "text-[#DC2626] dark:text-rose-400"
                                : "text-[#18181B] dark:text-[#F4F4F5]"
                          }`}
                        >
                          {toNepaliNum(dayNum)}
                        </span>
                      </div>

                      {/* Bottom: Tithi name (visible on mobile like Hamro Patro) + Event Badges */}
                      <div className="w-full space-y-0.5">
                        {/* Tithi name */}
                        {panchang && (
                          <div
                            className={`text-[8px] sm:text-[8.5px] font-medium truncate text-center w-full leading-none ${
                              isSelected
                                ? "text-white/90"
                                : isSaturday || holiday
                                  ? "text-[#DC2626]/80 dark:text-rose-400/80"
                                  : "text-[#71717A] dark:text-[#A1A1AA]"
                            }`}
                          >
                            {panchang.tithiNameNp}
                          </div>
                        )}

                        {/* Event indicator: dot on mobile, pill with emoji+name on desktop */}
                        <div className="flex items-center justify-center w-full">
                          {/* Mobile dot indicator */}
                          <div className="sm:hidden flex items-center justify-center gap-0.5 pt-0.5">
                            {hasEvent && !isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title={eventNameNp} />
                            )}
                            {hasLunarBadge && !hasEvent && !isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" title={panchang?.lunarBadge?.labelNp} />
                            )}
                          </div>

                          {/* Desktop pill badge */}
                          {hasEvent ? (
                            <span
                              title={eventNameNp}
                              className={`hidden sm:flex items-center gap-1 text-[8px] font-bold truncate leading-tight px-1 py-0.5 rounded w-full ${
                                isSelected ? "bg-white/20 text-white" : eventColorClass
                              }`}
                            >
                              <span className="shrink-0 leading-none">{eventEmoji}</span>
                              <span className="truncate leading-none">{eventNameNp}</span>
                            </span>
                          ) : hasLunarBadge ? (
                            <span
                              title={panchang?.lunarBadge?.labelNp || panchang?.tithiNameNp}
                              className={`hidden sm:flex items-center gap-1 text-[8px] font-semibold px-1 py-0.5 rounded w-full truncate leading-tight ${
                                isSelected ? "bg-white/20 text-white" : "text-purple-700 dark:text-purple-300 bg-purple-500/10"
                              }`}
                            >
                              <span className="shrink-0 leading-none">{panchang?.isEkadashi ? "🌿" : panchang?.isPurnima ? "🌕" : "🌑"}</span>
                              <span className="truncate leading-none">
                                {panchang?.lunarBadge?.labelNp || (panchang?.isEkadashi ? "एकादशी" : panchang?.isPurnima ? "पूर्णिमा" : "औंसी")}
                              </span>
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="pt-2 border-t border-[#E4E0D8] dark:border-[#2A2F48]">
                {/* Mobile: collapsible */}
                <button
                  onClick={() => setLegendOpen(!legendOpen)}
                  className="sm:hidden flex items-center gap-1.5 text-[11px] font-semibold text-[#71717A] dark:text-[#A1A1AA] w-full py-1"
                  aria-expanded={legendOpen}
                >
                  Legend {legendOpen ? "▴" : "▾"}
                </button>
                {/* Desktop: always visible; Mobile: toggle */}
                <div className={`flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#71717A] dark:text-[#A1A1AA] ${legendOpen ? "flex" : "hidden sm:flex"}`}>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#2E7D32]" /> छानिएको (Selected)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> आज (Today)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> शनिबार / बिदा</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> चाडपर्व</span>
                  <span className="flex items-center gap-1">🌿 एकादशी</span>
                  <span className="flex items-center gap-1">🌕 पूर्णिमा</span>
                  <span className="flex items-center gap-1">🌑 औंसी</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Selected Day Hero (Hamro Patro Style) + Panchang + Events */}
          <div className="lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 mt-4 lg:mt-0">

            {/* ── SELECTED DAY HERO (HAMRO PATRO STYLE) ───────────── */}
            <div className="rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] shadow-sm overflow-hidden p-4 sm:p-5">
              {activeDayDetails ? (
                <div className="space-y-4">
                  {/* Top Section: Date Stamp & Main Highlights */}
                  <div className="flex items-start gap-4 p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                    {/* Big Date Stamp Numeral */}
                    <div className="text-4xl sm:text-5xl font-black text-[#DC2626] leading-none shrink-0 tracking-tight">
                      {toNepaliNum(activeDay!)}
                    </div>
                    {/* Details Column */}
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-base sm:text-lg font-black text-[#18181B] dark:text-[#F4F4F5] leading-tight truncate">
                        {NEPALI_MONTHS_NP[selectedMonth]} {toNepaliNum(selectedYear)}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">
                        {activeDayDetails.dayNameNp} <span className="font-normal text-[#71717A] dark:text-[#A1A1AA]">({activeDayDetails.dayNameEn})</span>
                      </div>
                      <div className="text-xs text-[#71717A] dark:text-[#A1A1AA] font-medium">
                        {activeDayDetails.adFormatted}
                      </div>
                      {activeDayDetails.panchang && (
                        <div className="flex items-center gap-1.5 pt-1 text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                          <span>{activeDayDetails.panchang.isEkadashi ? "🌿" : activeDayDetails.panchang.isPurnima ? "🌕" : activeDayDetails.panchang.isAunsi ? "🌑" : "🌖"}</span>
                          <span className="truncate">{activeDayDetails.panchang.pakshaNp} {activeDayDetails.panchang.tithiNameNp}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Badges row: Today / Saturday */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {activeDayDetails.isToday && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> आज (Today)
                      </span>
                    )}
                    {activeDayDetails.isSaturday && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-bold">
                        शनिबार (सार्वजनिक बिदा)
                      </span>
                    )}
                  </div>

                  {/* Main Festival / Holiday Title Banner */}
                  {(activeDayDetails.lunarFestival || activeDayDetails.holiday) && (
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-500/20 space-y-1">
                      <div className="text-base sm:text-lg font-black text-[#DC2626] dark:text-rose-400 flex items-center gap-2">
                        <span>{activeDayDetails.lunarFestival?.emoji || "🏛️"}</span>
                        <span>{activeDayDetails.lunarFestival?.nameNp || activeDayDetails.holiday?.name}</span>
                      </div>
                      {activeDayDetails.lunarFestival && (
                        <div className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                          {activeDayDetails.lunarFestival.name}
                        </div>
                      )}
                      {activeDayDetails.holiday?.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {activeDayDetails.holiday.description}
                        </p>
                      )}
                    </div>
                  )}

                  {/* ── DAILY PANCHANG QUICK GRID ─────────────────── */}
                  {activeDayDetails.panchang && (
                    <div className="space-y-2 pt-1 border-t border-[#E4E0D8] dark:border-[#2A2F48]">
                      <h4 className="text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider">
                        दैनिक पञ्चाङ्ग (Daily Panchang)
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {/* Sunrise / Sunset */}
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/60 dark:border-amber-800/30">
                          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1 mb-1">
                            <Sun size={10} /> सूर्योदय / सूर्यास्त
                          </span>
                          <div className="flex items-center gap-1.5 font-bold text-[#18181B] dark:text-[#F4F4F5]">
                            <span className="text-amber-600 dark:text-amber-400">🌅 {activeDayDetails.panchang.sunrise}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-bold text-[#18181B] dark:text-[#F4F4F5] mt-0.5">
                            <span className="text-indigo-500 dark:text-indigo-400">🌇 {activeDayDetails.panchang.sunset}</span>
                          </div>
                        </div>
                        {/* Nakshatra */}
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border border-violet-200/60 dark:border-violet-800/30">
                          <span className="text-[10px] text-violet-700 dark:text-violet-400 font-semibold flex items-center gap-1 mb-1">
                            ⭐ नक्षत्र
                          </span>
                          <span className="font-bold text-[#18181B] dark:text-[#F4F4F5] block truncate">
                            {activeDayDetails.panchang.nakshatraNp}
                          </span>
                          <span className="text-[10px] text-[#71717A] dark:text-[#A1A1AA]">{activeDayDetails.panchang.nakshatraEn}</span>
                        </div>
                        {/* Ritu */}
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border border-emerald-200/60 dark:border-emerald-800/30">
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 mb-1">
                            🍃 ऋतु (Season)
                          </span>
                          <span className="font-bold text-[#18181B] dark:text-[#F4F4F5] block truncate">
                            {activeDayDetails.panchang.rituNp}
                          </span>
                          <span className="text-[10px] text-[#71717A] dark:text-[#A1A1AA] truncate block">{activeDayDetails.panchang.pakshaNp}</span>
                        </div>
                        {/* Chandra Rashi */}
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/60 dark:border-blue-800/30">
                          <span className="text-[10px] text-blue-700 dark:text-blue-400 font-semibold flex items-center gap-1 mb-1">
                            <Moon size={10} /> चन्द्र राशि
                          </span>
                          <span className="font-bold text-[#18181B] dark:text-[#F4F4F5] block">
                            {activeDayDetails.panchang.chandraRashiNp}
                          </span>
                          <span className="text-[10px] text-[#71717A] dark:text-[#A1A1AA]">Chandra Rashi</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="px-4 py-8 text-center">
                  <CalendarDays size={28} className="mx-auto text-[#DC2626]/30 mb-2" />
                  <p className="text-sm text-[#71717A] dark:text-[#A1A1AA]">
                    क्यालेन्डरमा कुनै मिति छान्नुहोस्
                  </p>
                  <p className="text-xs text-[#A1A1AA] dark:text-[#52525B] mt-1">
                    Tap a date to view Panchang details
                  </p>
                </div>
              )}
            </div>

            {/* ── MONTH EVENTS LIST ───────────────────────────── */}
            <div className="rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] shadow-sm">
              <div className="px-4 sm:px-5 py-3 sm:py-4">
                <h4 className="text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider mb-2.5">
                  {NEPALI_MONTHS_NP[selectedMonth]} {toNepaliNum(selectedYear)} का मुख्य चाडपर्व तथा बिदाहरू
                </h4>

                {monthEventsList.length > 0 ? (
                  <div className="space-y-1 max-h-[280px] overflow-y-auto -mr-1 pr-1">
                    {monthEventsList.map(({ day, name, emoji, type }, i) => (
                      <button
                        key={`${day}-${i}`}
                        onClick={() => setActiveDay(day)}
                        className={`w-full text-left px-3 py-2 rounded-xl border transition-colors flex items-center justify-between gap-2 text-xs sm:text-sm ${
                          activeDay === day
                            ? "border-[#DC2626]/40 bg-[#DC2626]/5"
                            : type === "National"
                              ? "border-blue-500/15 hover:border-blue-500/30 bg-transparent"
                              : type === "Festival"
                                ? "border-amber-500/15 hover:border-amber-500/30 bg-transparent"
                                : "border-[#E4E0D8] dark:border-[#2A2F48] hover:border-[#DC2626]/30 bg-transparent"
                        }`}
                      >
                        <span className="font-semibold text-[#18181B] dark:text-[#F4F4F5] truncate min-w-0 flex items-center gap-1.5">
                          <span className="shrink-0">{emoji}</span>
                          <span className="truncate">{name}</span>
                        </span>
                        <span className="text-[10px] sm:text-xs font-bold text-[#DC2626] shrink-0">
                          {toNepaliNum(day)} गते
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#A1A1AA] dark:text-[#52525B] text-center py-4">
                    यस महिना कुनै विशेष कार्यक्रम छैन।
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* PRINT-ONLY CSS OVERRIDE (STRICT 1-PAGE A4 GUARANTEE)       */}
      {/* ══════════════════════════════════════════════════════════ */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 8mm 6mm 8mm !important;
          }
          *, *::before, *::after {
            box-sizing: border-box !important;
            margin: 0;
          }
          html {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: 285mm !important;
            overflow: hidden !important;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: 285mm !important;
            overflow: hidden !important;
            display: block !important;
          }
          /* Hide everything except the portal print root */
          body > *:not(#nepali-calendar-print-root) {
            display: none !important;
            height: 0 !important;
            max-height: 0 !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            visibility: hidden !important;
          }
          #nepali-calendar-print-root {
            display: block !important;
            position: relative !important;
            width: 100% !important;
            max-width: 192mm !important;
            height: auto !important;
            max-height: 283mm !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            margin: 0 auto !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          #nepali-calendar-print-root table {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          #nepali-calendar-print-root tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}} />

      {/* ══════════════════════════════════════════════════════════ */}
      {/* PRINT VIEW (Real Nepali Wall Calendar - STRICT 1 PAGE)     */}
      {/* ══════════════════════════════════════════════════════════ */}
      {mounted && typeof document !== "undefined" && createPortal(
        <div id="nepali-calendar-print-root" className="hidden print:block font-sans text-black bg-white w-full max-w-[192mm] mx-auto" style={{ overflow: 'hidden', maxHeight: '283mm' }}>
          <div className="border-[2px] border-[#DC2626] rounded-lg p-2 bg-white w-full">
            {/* ── TOP HEADER BANNER ── */}
            <div className="border-b-[1.5px] border-[#DC2626] pb-1.5 mb-1.5 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-[#DC2626] leading-none tracking-tight">
                    {NEPALI_MONTHS_NP[selectedMonth]} {toNepaliNum(selectedYear)}
                  </span>
                  <span className="text-xs font-bold text-gray-700">
                    ({NEPALI_MONTHS_EN[selectedMonth]} {selectedYear} BS)
                  </span>
                </div>
                <div className="text-[9px] font-semibold text-gray-600 flex items-center gap-1.5">
                  <span>ईस्वी संवत् (AD): {gregorianRangeText}</span>
                  <span>•</span>
                  <span>ने.सं. {toNepaliNum(selectedYear - 937)}</span>
                  <span>•</span>
                  <span>शाके {toNepaliNum(selectedYear - 135)}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-block px-2 py-0.5 rounded bg-[#DC2626] text-white text-[10px] font-black tracking-wider uppercase">
                  नेपाली भित्ते पात्रो
                </div>
                <div className="text-[8.5px] font-bold text-gray-500 mt-0.5">
                  सजिलो पात्रो • sajilotools
                </div>
              </div>
            </div>

            {/* ── CALENDAR TABLE ── */}
            <table className="w-full border-collapse border border-gray-400 table-fixed">
              <thead>
                <tr className="bg-gray-100 text-center text-[10px]">
                  {DAYS_HEADER_NP.map((nepDay, idx) => {
                    const isSat = idx === 6;
                    return (
                      <th
                        key={nepDay}
                        className={`border border-gray-300 py-0.5 px-0.5 font-black ${
                          isSat ? "bg-rose-100 text-rose-700" : "text-gray-900"
                        }`}
                      >
                        <div>
                          {nepDay} <span className="font-normal text-[8px]">({DAYS_HEADER_EN[idx]})</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {printWeeks.map((week, wIdx) => {
                  return (
                    <tr key={wIdx}>
                      {week.map((dayNum, dIdx) => {
                        const isSaturday = dIdx === 6;
                        if (!dayNum) {
                          return <td key={`e-${dIdx}`} className="border border-gray-200 bg-gray-50/40 p-0.5" />;
                        }
                        const holiday = monthHolidaysMap.get(dayNum);
                        const panchang = monthPanchangMap.get(dayNum);
                        const lunarFestival = lunarFestivalsMap.get(dayNum);
                        const adInfo = monthAdDatesMap.get(dayNum);
                        const isOff = isSaturday || holiday?.type === "National";
                        const holNp = holiday ? (holiday.name.match(/\(([^)]+)\)/)?.[1]?.trim() || holiday.name) : "";

                        return (
                          <td
                            key={`d-${dayNum}`}
                            className={`border border-gray-300 p-1 align-top ${
                              isOff ? "bg-rose-50/40" : "bg-white"
                            }`}
                          >
                            {/* Top: BS Date & AD Date */}
                            <div className="flex items-start justify-between leading-none mb-0.5">
                              <span
                                className={`text-sm font-black ${
                                  isOff ? "text-rose-600" : "text-black"
                                }`}
                              >
                                {toNepaliNum(dayNum)}
                              </span>
                              {adInfo && (
                                <span className="text-[8px] font-bold text-gray-500">
                                  {adInfo.day === 1 || dayNum === 1
                                    ? `${adInfo.monthNameEn} ${adInfo.day}`
                                    : adInfo.day}
                                </span>
                              )}
                            </div>

                            {/* Middle: Tithi Name */}
                            {panchang && (
                              <div className="text-[7px] font-medium text-gray-600 truncate leading-tight">
                                {panchang.tithiNameNp}
                              </div>
                            )}

                            {/* Bottom: Festival or Holiday Badge with clean emoji & name */}
                            {lunarFestival ? (
                              <div className="mt-0.5 text-[6.5px] font-black text-[#DC2626] bg-rose-50 border border-rose-200 rounded px-0.5 py-px truncate leading-none">
                                {lunarFestival.emoji} {lunarFestival.nameNp}
                              </div>
                            ) : holiday ? (
                              <div className="mt-0.5 text-[6.5px] font-black text-blue-700 bg-blue-50 border border-blue-200 rounded px-0.5 py-px truncate leading-none">
                                🏛️ {holNp}
                              </div>
                            ) : panchang?.lunarBadge ? (
                              <div className="mt-0.5 text-[6.5px] font-bold text-gray-700 bg-gray-100 rounded px-0.5 py-px truncate leading-none">
                                {panchang.isEkadashi ? "🌿" : panchang.isPurnima ? "🌕" : "🌑"}{" "}
                                {panchang.lunarBadge.labelNp}
                              </div>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* ── BOTTOM EVENTS & FESTIVALS SUMMARY (REAL WALL CALENDAR 3-COLUMNS) ── */}
            <div className="mt-1.5 pt-1 border-t-[1.5px] border-[#DC2626]">
              <div className="flex items-center justify-between mb-0.5">
                <h4 className="text-[9px] font-black text-[#DC2626] uppercase tracking-wider">
                  यस महिनाका मुख्य चाडपर्व तथा बिदाहरू ({NEPALI_MONTHS_NP[selectedMonth]} {toNepaliNum(selectedYear)})
                </h4>
                <span className="text-[7.5px] font-bold text-gray-500">
                  कुल कार्यक्रम: {monthEventsList.length}
                </span>
              </div>

              {monthEventsList.length > 0 ? (
                <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 text-[7px] text-gray-800">
                  {monthEventsList.slice(0, 18).map((ev, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border-b border-gray-200 py-0.5 min-w-0"
                    >
                      <div className="flex items-center gap-1 truncate mr-1">
                        <span className="text-[7.5px] shrink-0">{ev.emoji}</span>
                        <span className="font-semibold truncate">{ev.name}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {ev.type === "National" && (
                          <span className="text-[5.5px] font-black text-rose-700 bg-rose-100 px-0.5 rounded leading-none">
                            बिदा
                          </span>
                        )}
                        <span className="font-black text-[#DC2626] text-[7px]">
                          {toNepaliNum(ev.day)} गते
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[7.5px] text-gray-500 py-0.5">यस महिना कुनै विशेष बिदा छैन।</p>
              )}
            </div>

            {/* ── FOOTER AUTHENTICITY NOTICE ── */}
            <div className="mt-1 pt-0.5 border-t border-gray-200 text-center text-[6.5px] text-gray-400 font-medium">
              सजिलो पात्रो • sajilotools • नेपाल सरकार र राष्ट्रिय पञ्चाङ्ग निर्णायक विकास समितिको आधिकारिक विवरण अनुसार
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
