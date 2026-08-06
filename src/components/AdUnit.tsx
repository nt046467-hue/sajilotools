"use client";

import { useEffect, useRef } from "react";

interface AdUnitProps {
  /** Ad slot ID from your AdSense dashboard, e.g. "1234567890" */
  slot?: string;
  /** "auto" works for most cases; use "rectangle", "horizontal", "banner" etc. if needed */
  format?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Reserved height to avoid Cumulative Layout Shift (CLS) when ad loads */
  minHeight?: number | string;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function AdUnit({
  slot = "auto",
  format = "auto",
  className,
  style,
  minHeight = "90px",
}: AdUnitProps) {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (err) {
      // AdSense script not loaded yet (e.g. no client ID set) — fail silently
      console.warn("AdSense push failed:", err);
    }
  }, []);

  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-3896962422851508";
  if (!clientId) return null; // don't render empty ad slots when not configured

  return (
    <div
      className="adsense-container overflow-hidden flex justify-center items-center w-full my-4"
      style={{ minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight }}
    >
      <ins
        ref={insRef}
        className={`adsbygoogle ${className ?? ""}`}
        style={{ display: "block", width: "100%", ...style }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
