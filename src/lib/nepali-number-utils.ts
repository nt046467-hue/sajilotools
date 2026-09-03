// ─── NEPALI NUMBER UTILS ─────────────────────────────────────────────────────────
// Utilities for converting between Devanagari and Arabic digits, formatting numbers
// according to the Nepali/South Asian system (Lakh/Crore grouping), and cleaning input.

const NEPALI_TO_ARABIC_MAP: Record<string, string> = {
  "०": "0", "१": "1", "२": "2", "३": "3", "४": "4",
  "५": "5", "६": "6", "७": "7", "८": "8", "९": "9",
};

const ARABIC_TO_NEPALI_MAP: Record<string, string> = {
  "0": "०", "1": "१", "2": "२", "3": "३", "4": "४",
  "5": "५", "6": "६", "7": "७", "8": "८", "9": "९",
};

/**
 * Converts Devanagari digits in a string to Arabic digits.
 * e.g. "१२३४५" -> "12345"
 */
export function nepaliDigitsToArabic(str: string): string {
  if (!str) return "";
  return str.replace(/[०-९]/g, (char) => NEPALI_TO_ARABIC_MAP[char] ?? char);
}

/**
 * Converts Arabic digits in a string or number to Devanagari digits.
 * e.g. "12345" or 12345 -> "१२३४५"
 */
export function arabicDigitsToNepali(val: string | number): string {
  if (val === undefined || val === null) return "";
  const str = String(val);
  return str.replace(/[0-9]/g, (char) => ARABIC_TO_NEPALI_MAP[char] ?? char);
}

/**
 * Normalizes user input string:
 * - Trims whitespace
 * - Removes existing commas
 * - Converts Nepali Devanagari digits to standard Arabic digits
 * Returns a clean numeric string (or empty if blank).
 */
export function normalizeNumericInput(input: string): string {
  if (!input) return "";
  let clean = input.trim().replace(/,/g, "");
  clean = nepaliDigitsToArabic(clean);
  // Keep only digits and at most one decimal point, optional leading minus
  clean = clean.replace(/[^0-9.-]/g, "");
  const parts = clean.split(".");
  if (parts.length > 2) {
    clean = parts[0] + "." + parts.slice(1).join("");
  }
  return clean;
}

/**
 * Formats a number with South Asian grouping (last 3 digits, then groups of 2).
 * e.g. 145000 -> "1,45,000"
 * e.g. 12345678.5 -> "1,23,45,678.5"
 */
export function formatNepaliComma(val: string | number): string {
  if (val === undefined || val === null || val === "") return "";
  const str = String(val).trim();
  const isNegative = str.startsWith("-");
  const absStr = isNegative ? str.slice(1) : str;

  const [integerPart, decimalPart] = absStr.split(".");
  if (!integerPart) return str;

  if (integerPart.length <= 3) {
    const formatted = integerPart + (decimalPart !== undefined ? `.${decimalPart}` : "");
    return isNegative ? `-${formatted}` : formatted;
  }

  const lastThree = integerPart.slice(-3);
  const otherDigits = integerPart.slice(0, -3);

  // Group remaining digits by 2 from the right
  const formattedOther = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  const formatted = `${formattedOther},${lastThree}${decimalPart !== undefined ? `.${decimalPart}` : ""}`;
  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Formats a number with South Asian grouping and converts to Nepali digits.
 * e.g. 145000 -> "१,४५,०००"
 */
export function formatNepaliDigitsComma(val: string | number): string {
  const formatted = formatNepaliComma(val);
  return arabicDigitsToNepali(formatted);
}
