// ─── AGE CALCULATOR ENGINE ──────────────────────────────────────────────────────
// Dual-calendar (BS + AD) exact age calculator with canonical date processing,
// lifetime statistics, and calendar-aware birthday countdown.

import {
  bsToAdDate,
  adToBsDate,
  isValidBsDate,
  getDaysInBsMonth,
  NEPALI_MONTHS_EN,
  NEPALI_MONTHS_NP,
  type BsDateInfo,
} from "./bs-date-utils";
import { arabicDigitsToNepali } from "./nepali-number-utils";

export type CalendarType = "AD" | "BS";

export interface DateInput {
  calendar: CalendarType;
  // If AD
  adDateStr?: string; // "YYYY-MM-DD"
  // If BS
  bsYear?: number;
  bsMonth?: number; // 1-12
  bsDay?: number;
}

export interface NextBirthdayInfo {
  isToday: boolean;
  isTomorrow: boolean;
  daysUntil: number;
  adDate: Date;
  adFormatted: string;
  bsFormattedEn: string;
  bsFormattedNp: string;
}

export interface AgeCalculationResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalHours: number;

  // Normalized dates in both calendars
  dobAd: Date;
  dobAdFormatted: string;
  dobBs: BsDateInfo;

  targetAd: Date;
  targetAdFormatted: string;
  targetBs: BsDateInfo;

  nextBirthday: NextBirthdayInfo;
  calendarUsed: CalendarType;
}

/**
 * Normalizes input date (either AD string or BS components) to canonical JS Date and BS Date info.
 */
function resolveCanonicalDate(input: DateInput): { adDate: Date; bsInfo: BsDateInfo } {
  if (input.calendar === "BS") {
    const y = input.bsYear || 2081;
    const m = input.bsMonth || 1;
    const d = input.bsDay || 1;

    if (!isValidBsDate(y, m, d)) {
      throw new Error(`The selected BS date (${y}-${m}-${d}) is not valid.`);
    }

    const adDate = bsToAdDate(y, m, d);
    const bsInfo: BsDateInfo = {
      year: y,
      month: m,
      day: d,
      monthNameEn: NEPALI_MONTHS_EN[m - 1],
      monthNameNp: NEPALI_MONTHS_NP[m - 1],
      formattedEn: `${d} ${NEPALI_MONTHS_EN[m - 1]} ${y} BS`,
      formattedNp: `${arabicDigitsToNepali(d)} ${NEPALI_MONTHS_NP[m - 1]} ${arabicDigitsToNepali(y)} वि.सं.`,
    };
    return { adDate, bsInfo };
  } else {
    // AD
    if (!input.adDateStr) {
      throw new Error("Please select a valid Gregorian (AD) date.");
    }
    const [y, m, d] = input.adDateStr.split("-").map(Number);
    if (!y || !m || !d || m < 1 || m > 12 || d < 1 || d > 31) {
      throw new Error("Please select a valid Gregorian (AD) date.");
    }
    const adDate = new Date(y, m - 1, d);
    if (isNaN(adDate.getTime()) || adDate.getDate() !== d) {
      throw new Error("Please select a valid Gregorian (AD) date.");
    }
    const bsInfo = adToBsDate(adDate);
    return { adDate, bsInfo };
  }
}

/**
 * Calculates exact age in years, months, days between two canonical AD dates.
 */
function computeCanonicalAge(dob: Date, target: Date): { years: number; months: number; days: number } {
  let years = target.getFullYear() - dob.getFullYear();
  let months = target.getMonth() - dob.getMonth();
  let days = target.getDate() - dob.getDate();

  if (days < 0) {
    months--;
    // Days in previous month of target
    const prevMonthLastDay = new Date(target.getFullYear(), target.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return { years: Math.max(0, years), months: Math.max(0, months), days: Math.max(0, days) };
}

/**
 * Computes exact age in BS calendar terms when birth date is BS.
 */
function computeBsCalendarAge(
  dobBs: BsDateInfo,
  targetBs: BsDateInfo
): { years: number; months: number; days: number } {
  let years = targetBs.year - dobBs.year;
  let months = targetBs.month - dobBs.month;
  let days = targetBs.day - dobBs.day;

  if (days < 0) {
    months--;
    const prevMonth = targetBs.month === 1 ? 12 : targetBs.month - 1;
    const prevYear = targetBs.month === 1 ? targetBs.year - 1 : targetBs.year;
    const daysInPrevMonth = getDaysInBsMonth(prevYear, prevMonth);
    days += daysInPrevMonth;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return { years: Math.max(0, years), months: Math.max(0, months), days: Math.max(0, days) };
}

/**
 * Computes next birthday countdown respecting either BS recurrence or AD recurrence.
 */
function computeNextBirthday(
  dobCalendar: CalendarType,
  dobAd: Date,
  dobBs: BsDateInfo,
  targetAd: Date,
  targetBs: BsDateInfo
): NextBirthdayInfo {
  if (dobCalendar === "BS") {
    // Nepali Birthday recurs on dobBs.month and dobBs.day
    let candYear = targetBs.year;
    const maxDaysInCand = getDaysInBsMonth(candYear, dobBs.month);
    const candDay = Math.min(dobBs.day, maxDaysInCand);
    let candAd = bsToAdDate(candYear, dobBs.month, candDay);

    const diffDaysCurrent = Math.round((candAd.getTime() - targetAd.getTime()) / (1000 * 60 * 60 * 24));

    let nextBsYear = candYear;
    let nextBsDay = candDay;
    let nextAd = candAd;

    if (diffDaysCurrent < 0) {
      // Birthday already passed this BS year, next is next BS year
      nextBsYear = candYear + 1;
      const maxDaysNext = getDaysInBsMonth(nextBsYear, dobBs.month);
      nextBsDay = Math.min(dobBs.day, maxDaysNext);
      nextAd = bsToAdDate(nextBsYear, dobBs.month, nextBsDay);
    }

    const diffMs = nextAd.getTime() - targetAd.getTime();
    const daysUntil = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
    const nextBsInfo = adToBsDate(nextAd);

    return {
      isToday: daysUntil === 0,
      isTomorrow: daysUntil === 1,
      daysUntil,
      adDate: nextAd,
      adFormatted: nextAd.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      bsFormattedEn: `${nextBsDay} ${NEPALI_MONTHS_EN[dobBs.month - 1]} ${nextBsYear} BS`,
      bsFormattedNp: `${arabicDigitsToNepali(nextBsDay)} ${NEPALI_MONTHS_NP[dobBs.month - 1]} ${arabicDigitsToNepali(nextBsYear)} वि.सं.`,
    };
  } else {
    // AD Birthday recurs on dobAd.getMonth() and dobAd.getDate()
    let candYear = targetAd.getFullYear();
    let candMonth = dobAd.getMonth();
    let candDay = dobAd.getDate();

    // Leap day Feb 29 edge case
    if (candMonth === 1 && candDay === 29) {
      const isLeap = (candYear % 4 === 0 && candYear % 100 !== 0) || candYear % 400 === 0;
      if (!isLeap) candDay = 28;
    }

    let candDate = new Date(candYear, candMonth, candDay);
    const diffDaysCurrent = Math.round((candDate.getTime() - targetAd.getTime()) / (1000 * 60 * 60 * 24));

    let nextAd = candDate;
    if (diffDaysCurrent < 0) {
      const nextYear = candYear + 1;
      let nextDay = dobAd.getDate();
      if (candMonth === 1 && nextDay === 29) {
        const isLeap = (nextYear % 4 === 0 && nextYear % 100 !== 0) || nextYear % 400 === 0;
        if (!isLeap) nextDay = 28;
      }
      nextAd = new Date(nextYear, candMonth, nextDay);
    }

    const diffMs = nextAd.getTime() - targetAd.getTime();
    const daysUntil = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
    const nextBsInfo = adToBsDate(nextAd);

    return {
      isToday: daysUntil === 0,
      isTomorrow: daysUntil === 1,
      daysUntil,
      adDate: nextAd,
      adFormatted: nextAd.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      bsFormattedEn: nextBsInfo.formattedEn,
      bsFormattedNp: nextBsInfo.formattedNp,
    };
  }
}

/**
 * Main age calculation function supporting mixed or identical calendar combinations.
 */
export function calculateAge(
  dobInput: DateInput,
  targetInput: DateInput
): AgeCalculationResult {
  const { adDate: dobAd, bsInfo: dobBs } = resolveCanonicalDate(dobInput);
  const { adDate: targetAd, bsInfo: targetBs } = resolveCanonicalDate(targetInput);

  if (dobAd.getTime() > targetAd.getTime()) {
    throw new Error("Birth date cannot be in the future. Please choose a target date after birth date.");
  }

  // Exact age breakdown:
  // If DOB was entered in BS, use authentic BS calendar month/day progression.
  // Otherwise use Gregorian calendar progression.
  const age =
    dobInput.calendar === "BS" && targetInput.calendar === "BS"
      ? computeBsCalendarAge(dobBs, targetBs)
      : computeCanonicalAge(dobAd, targetAd);

  // Total days and hours
  const diffMs = targetAd.getTime() - dobAd.getTime();
  const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = totalDays * 24;

  const nextBirthday = computeNextBirthday(dobInput.calendar, dobAd, dobBs, targetAd, targetBs);

  return {
    years: age.years,
    months: age.months,
    days: age.days,
    totalDays,
    totalWeeks,
    totalHours,
    dobAd,
    dobAdFormatted: dobAd.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    dobBs,
    targetAd,
    targetAdFormatted: targetAd.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    targetBs,
    nextBirthday,
    calendarUsed: dobInput.calendar,
  };
}
