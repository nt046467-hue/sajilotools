/**
 * currency-meta.ts
 *
 * Single source of truth for currency → country flag + display metadata.
 * Works with the `flag-icons` CSS library (class: `fi fi-{iso2}`)
 *
 * ISO 3166-1 alpha-2 country codes → rendered as real SVG flag icons.
 * Coverage: All current NRB published currencies + major world currencies.
 *
 * When NRB adds a new currency, if it's in this map it gets a real flag.
 * If it's NOT in this map, it gracefully falls back to a globe (🌐) icon.
 */

export interface CurrencyMeta {
  /** ISO 4217 currency code (e.g. "USD") */
  code: string;
  /** Full display name (e.g. "US Dollar") */
  name: string;
  /** Currency symbol for display (e.g. "$") */
  symbol: string;
  /**
   * ISO 3166-1 alpha-2 country code (lowercase) used for flag-icons CSS.
   * For supranational currencies like EUR, use "eu".
   * For unknown currencies, undefined → renders globe fallback.
   */
  iso2?: string;
  /** Country or region name */
  country: string;
  /** Grouping for filter tabs */
  category: "gulf" | "major" | "asia" | "europe" | "oceania" | "other";
  /** Mark as popular/top remittance for Nepali workers */
  popular?: boolean;
}

/**
 * Comprehensive map of currency code → metadata.
 * Covers all NRB-published currencies and most world currencies.
 *
 * To add a new currency: add an entry with code, name, symbol, iso2, country, category.
 */
export const CURRENCY_META_MAP: Record<string, CurrencyMeta> = {
  // ── Major Western ──────────────────────────────────────────
  USD: { code: "USD", name: "US Dollar",          symbol: "$",    iso2: "us", country: "United States",      category: "major",  popular: true },
  EUR: { code: "EUR", name: "Euro",                symbol: "€",    iso2: "eu", country: "European Union",      category: "europe", popular: true },
  GBP: { code: "GBP", name: "British Pound",       symbol: "£",    iso2: "gb", country: "United Kingdom",      category: "major",  popular: true },
  CHF: { code: "CHF", name: "Swiss Franc",          symbol: "CHF",  iso2: "ch", country: "Switzerland",         category: "europe" },
  SEK: { code: "SEK", name: "Swedish Krona",        symbol: "kr",   iso2: "se", country: "Sweden",              category: "europe" },
  DKK: { code: "DKK", name: "Danish Krone",         symbol: "kr",   iso2: "dk", country: "Denmark",             category: "europe" },
  NOK: { code: "NOK", name: "Norwegian Krone",      symbol: "kr",   iso2: "no", country: "Norway",              category: "europe" },

  // ── Oceania ────────────────────────────────────────────────
  AUD: { code: "AUD", name: "Australian Dollar",   symbol: "A$",   iso2: "au", country: "Australia",           category: "oceania", popular: true },
  CAD: { code: "CAD", name: "Canadian Dollar",      symbol: "C$",   iso2: "ca", country: "Canada",              category: "major",  popular: true },
  NZD: { code: "NZD", name: "New Zealand Dollar",   symbol: "NZ$",  iso2: "nz", country: "New Zealand",         category: "oceania" },

  // ── Gulf & Middle East (Top Remittance for Nepal) ──────────
  AED: { code: "AED", name: "UAE Dirham",           symbol: "AED",  iso2: "ae", country: "United Arab Emirates", category: "gulf", popular: true },
  SAR: { code: "SAR", name: "Saudi Riyal",           symbol: "SAR",  iso2: "sa", country: "Saudi Arabia",         category: "gulf", popular: true },
  QAR: { code: "QAR", name: "Qatari Riyal",          symbol: "QAR",  iso2: "qa", country: "Qatar",                category: "gulf", popular: true },
  KWD: { code: "KWD", name: "Kuwaiti Dinar",         symbol: "KWD",  iso2: "kw", country: "Kuwait",               category: "gulf", popular: true },
  BHD: { code: "BHD", name: "Bahraini Dinar",        symbol: "BHD",  iso2: "bh", country: "Bahrain",              category: "gulf" },
  OMR: { code: "OMR", name: "Omani Rial",            symbol: "OMR",  iso2: "om", country: "Oman",                 category: "gulf" },
  JOD: { code: "JOD", name: "Jordanian Dinar",       symbol: "JOD",  iso2: "jo", country: "Jordan",               category: "gulf" },
  ILS: { code: "ILS", name: "Israeli Shekel",        symbol: "₪",    iso2: "il", country: "Israel",               category: "gulf" },

  // ── South & Southeast Asia ─────────────────────────────────
  INR: { code: "INR", name: "Indian Rupee",          symbol: "₹",    iso2: "in", country: "India",               category: "major",  popular: true },
  MYR: { code: "MYR", name: "Malaysian Ringgit",     symbol: "RM",   iso2: "my", country: "Malaysia",             category: "gulf",   popular: true },
  SGD: { code: "SGD", name: "Singapore Dollar",      symbol: "S$",   iso2: "sg", country: "Singapore",           category: "asia" },
  THB: { code: "THB", name: "Thai Baht",             symbol: "฿",    iso2: "th", country: "Thailand",            category: "asia" },
  IDR: { code: "IDR", name: "Indonesian Rupiah",     symbol: "Rp",   iso2: "id", country: "Indonesia",           category: "asia" },
  PHP: { code: "PHP", name: "Philippine Peso",       symbol: "₱",    iso2: "ph", country: "Philippines",         category: "asia" },
  PKR: { code: "PKR", name: "Pakistani Rupee",       symbol: "Rs",   iso2: "pk", country: "Pakistan",            category: "asia" },
  BDT: { code: "BDT", name: "Bangladeshi Taka",      symbol: "৳",    iso2: "bd", country: "Bangladesh",          category: "asia" },
  LKR: { code: "LKR", name: "Sri Lankan Rupee",      symbol: "Rs",   iso2: "lk", country: "Sri Lanka",           category: "asia" },
  VND: { code: "VND", name: "Vietnamese Dong",       symbol: "₫",    iso2: "vn", country: "Vietnam",             category: "asia" },
  MMK: { code: "MMK", name: "Myanmar Kyat",          symbol: "K",    iso2: "mm", country: "Myanmar",             category: "asia" },

  // ── East Asia ─────────────────────────────────────────────
  JPY: { code: "JPY", name: "Japanese Yen",          symbol: "¥",    iso2: "jp", country: "Japan",               category: "asia",   popular: true },
  KRW: { code: "KRW", name: "South Korean Won",      symbol: "₩",    iso2: "kr", country: "South Korea",         category: "asia",   popular: true },
  CNY: { code: "CNY", name: "Chinese Yuan",           symbol: "¥",    iso2: "cn", country: "China",               category: "asia" },
  HKD: { code: "HKD", name: "Hong Kong Dollar",      symbol: "HK$",  iso2: "hk", country: "Hong Kong",           category: "asia" },
  TWD: { code: "TWD", name: "Taiwan Dollar",          symbol: "NT$",  iso2: "tw", country: "Taiwan",              category: "asia" },
  MOP: { code: "MOP", name: "Macanese Pataca",        symbol: "MOP",  iso2: "mo", country: "Macau",               category: "asia" },

  // ── Nepal (base currency, for reference) ──────────────────
  NPR: { code: "NPR", name: "Nepalese Rupee",        symbol: "रु",   iso2: "np", country: "Nepal",               category: "major" },
};

/**
 * Get metadata for any currency code.
 * Returns the known metadata OR a sensible fallback for unknown currencies.
 */
export function getCurrencyMeta(code: string, fallbackName?: string): CurrencyMeta {
  if (CURRENCY_META_MAP[code]) return CURRENCY_META_MAP[code];

  // Graceful fallback for unknown currencies (e.g. new NRB additions)
  return {
    code,
    name: fallbackName || code,
    symbol: code,
    iso2: undefined, // → will render globe icon
    country: "International",
    category: "other",
    popular: false,
  };
}

/**
 * ISO 3166-1 alpha-2 code → currency code mapping.
 * Useful for reverse lookups.
 */
export const COUNTRY_TO_CURRENCY: Record<string, string> = Object.values(
  CURRENCY_META_MAP
).reduce(
  (acc, meta) => {
    if (meta.iso2) acc[meta.iso2] = meta.code;
    return acc;
  },
  {} as Record<string, string>
);

/**
 * Get all "popular" currencies sorted for the top-remittance tab.
 * These are currencies commonly used by Nepali workers abroad.
 */
export function getPopularCurrencies(): CurrencyMeta[] {
  return Object.values(CURRENCY_META_MAP).filter((m) => m.popular);
}
