// ─── BIKRAM SAMBAT (BS) DATE UTILITIES ──────────────────────────────────────────
// High-accuracy Bikram Sambat date helper functions backed by `nepali-date-converter`'s
// authentic calendar map (years 2000 BS to 2090 BS).

import NepaliDate, { dateConfigMap } from "nepali-date-converter";
import { arabicDigitsToNepali } from "./nepali-number-utils";

export const BS_MONTH_KEYS = [
  "Baisakh", "Jestha", "Asar", "Shrawan", "Bhadra", "Aswin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

export const NEPALI_MONTHS_EN = [
  "Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

export const NEPALI_MONTHS_NP = [
  "बैशाख", "जेठ", "असार", "श्रावण", "भाद्र", "आश्विन",
  "कार्तिक", "मंसिर", "पौष", "माघ", "फाल्गुन", "चैत्र"
];

export const MIN_BS_YEAR = 2000;
export const MAX_BS_YEAR = 2090;

export const BS_YEARS_OPTIONS = Array.from(
  { length: MAX_BS_YEAR - MIN_BS_YEAR + 1 },
  (_, i) => MIN_BS_YEAR + i
);

/**
 * Returns the exact number of days in a given BS month and year (29 to 32 days).
 * @param year Bikram Sambat year (e.g. 2081)
 * @param month 1-indexed BS month (1 = Baisakh, 12 = Chaitra)
 */
export function getDaysInBsMonth(year: number, month: number): number {
  if (month < 1 || month > 12) return 30;
  const yearData = (dateConfigMap as Record<string, Record<string, number>>)[String(year)];
  if (!yearData) return 30;
  const key = BS_MONTH_KEYS[month - 1];
  return yearData[key] ?? 30;
}

/**
 * Validates whether a Bikram Sambat date is valid and within supported range.
 */
export function isValidBsDate(year: number, month: number, day: number): boolean {
  if (!year || !month || !day) return false;
  if (year < MIN_BS_YEAR || year > MAX_BS_YEAR) return false;
  if (month < 1 || month > 12) return false;
  const maxDays = getDaysInBsMonth(year, month);
  return day >= 1 && day <= maxDays;
}

/**
 * Converts a Bikram Sambat (BS) date to a canonical JavaScript Date (AD).
 * Normalized to midnight local time for consistent date arithmetic.
 */
export function bsToAdDate(year: number, month: number, day: number): Date {
  if (!isValidBsDate(year, month, day)) {
    throw new Error(`Invalid BS Date: ${year}-${month}-${day}`);
  }
  const npDate = new NepaliDate(year, month - 1, day);
  const rawJs = npDate.toJsDate();
  return new Date(rawJs.getFullYear(), rawJs.getMonth(), rawJs.getDate());
}

export interface BsDateInfo {
  year: number;
  month: number; // 1-indexed
  day: number;
  monthNameEn: string;
  monthNameNp: string;
  formattedEn: string;
  formattedNp: string;
}

/**
 * Converts a Gregorian Date (AD) to Bikram Sambat (BS).
 */
export function adToBsDate(date: Date): BsDateInfo {
  const npDate = NepaliDate.fromAD(date);
  const year = npDate.getYear();
  const month = npDate.getMonth() + 1; // 1-indexed
  const day = npDate.getDate();

  return {
    year,
    month,
    day,
    monthNameEn: NEPALI_MONTHS_EN[month - 1],
    monthNameNp: NEPALI_MONTHS_NP[month - 1],
    formattedEn: `${day} ${NEPALI_MONTHS_EN[month - 1]} ${year} BS`,
    formattedNp: `${arabicDigitsToNepali(day)} ${NEPALI_MONTHS_NP[month - 1]} ${arabicDigitsToNepali(year)} वि.सं.`,
  };
}

/**
 * Returns today's current date in Bikram Sambat.
 */
export function getTodayBs(): BsDateInfo {
  return adToBsDate(new Date());
}
