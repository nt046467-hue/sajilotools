"use client";

import React from "react";
import { getCurrencyMeta } from "@/lib/currency-meta";

interface CurrencyFlagProps {
  /** ISO 4217 currency code (e.g. "USD", "AED", "INR") */
  code: string;
  /**
   * Size preset:
   * - "xs"  → 20×13px  (pill / inline chip)
   * - "sm"  → 24×16px  (currency selector pill)
   * - "md"  → 30×20px  (modal list)
   * - "lg"  → 36×24px  (rate card)
   */
  size?: "xs" | "sm" | "md" | "lg";
  /** Extra className for wrapper span */
  className?: string;
  /** Fallback name used if code isn't in our metadata map */
  fallbackName?: string;
}

// Proper 3:2 rectangular flags — the natural shape of most real flags
const sizeMap = {
  xs: { width: "20px", height: "14px", fontSize: "0.55rem" },
  sm: { width: "24px", height: "16px", fontSize: "0.6rem"  },
  md: { width: "30px", height: "20px", fontSize: "0.7rem"  },
  lg: { width: "36px", height: "24px", fontSize: "0.75rem" },
};

/**
 * CurrencyFlag
 *
 * Renders a real rectangular SVG country flag using the `flag-icons` CSS
 * library. Uses the 4:3 rectangular format (NOT the square `fis` variant)
 * so flags look exactly like real country flags.
 *
 * Falls back to a styled 2-letter code for unknown currencies (e.g. new
 * NRB additions not yet in the metadata map).
 */
export default function CurrencyFlag({
  code,
  size = "sm",
  className = "",
  fallbackName,
}: CurrencyFlagProps) {
  const meta = getCurrencyMeta(code, fallbackName);
  const { width, height, fontSize } = sizeMap[size];

  if (meta.iso2) {
    return (
      <span
        // NOTE: NO "fis" — rectangular flag (4:3), not cropped square
        className={`fi fi-${meta.iso2} ${className}`}
        style={{
          width,
          height,
          borderRadius: "3px",
          flexShrink: 0,
          display: "inline-block",
          verticalAlign: "middle",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.10)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          lineHeight: 0,
        }}
        title={`${meta.name} (${code}) — ${meta.country}`}
        aria-label={`${meta.country} flag`}
        role="img"
      />
    );
  }

  // Fallback: styled 2-letter code badge for unknown currencies
  return (
    <span
      className={`inline-flex items-center justify-center bg-[#E4E0D8] dark:bg-[#2A2F48] text-[#52525B] dark:text-[#A1A1AA] font-bold rounded-sm select-none shrink-0 ${className}`}
      style={{ width, height, fontSize, lineHeight: 1 }}
      title={meta.name}
    >
      {code.slice(0, 2)}
    </span>
  );
}
