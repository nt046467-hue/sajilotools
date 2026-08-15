"use client";

import { useEffect, useRef, useState } from "react";

export interface AdUnitProps {
  /** Ad slot ID from your AdSense dashboard, e.g. "1234567890" */
  slot?: string;
  /** "auto" works for most responsive cases; "rectangle", "horizontal", "vertical" etc. */
  format?: string;
  /** Placement identifier for debugging or custom styling (e.g. 'article', 'footer', 'sidebar') */
  placement?: string;
  /** Additional CSS class names */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** Optional minimum height when ad is verified filled (prevents CLS on filled ads only) */
  minHeight?: number | string;
  /** Whether responsive full-width mode is enabled (default: true) */
  responsive?: boolean;
  /** Master override to enable/disable this specific ad slot */
  enabled?: boolean;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Centralized AdSlot / AdUnit Component
 * 
 * Key Features:
 * - Natural zero-space collapse before AdSense approval or when unfilled
 * - MutationObserver to automatically hide containers when Google returns data-ad-status="unfilled"
 * - Zero artificial minHeight/margins when no ad is active
 * - No fake ads, no third-party ad networks, no layout shift
 * - Safe for mobile and desktop screens
 */
export default function AdUnit({
  slot = "auto",
  format = "auto",
  placement = "default",
  className = "",
  style,
  minHeight,
  responsive = true,
  enabled = true,
}: AdUnitProps) {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const [consent, setConsent] = useState<"accepted" | "rejected" | "unset">("unset");
  const [adStatus, setAdStatus] = useState<"initial" | "filled" | "unfilled" | "error">("initial");

  // Check master AdSense environment variables
  // Set NEXT_PUBLIC_ADSENSE_ENABLED="false" to disable all ad rendering platform-wide
  const adsenseEnabledEnv = process.env.NEXT_PUBLIC_ADSENSE_ENABLED !== "false";
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-3896962422851508";

  const isAdActive = enabled && adsenseEnabledEnv && Boolean(clientId);

  // Sync initial consent state from localStorage and listen to dynamic consent changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("sajilotools_cookie_consent") as "accepted" | "rejected" | null;
    if (stored === "accepted" || stored === "rejected") {
      setConsent(stored);
    }

    const handleConsentChange = (e: Event) => {
      const customEvt = e as CustomEvent<{ consent: "accepted" | "rejected" }>;
      const newConsent = customEvt.detail?.consent;
      if (newConsent === "accepted") {
        setConsent("accepted");
      } else if (newConsent === "rejected") {
        setConsent("rejected");
        setAdStatus("unfilled");
      }
    };

    window.addEventListener("sajilo_cookie_consent_changed", handleConsentChange);
    return () => {
      window.removeEventListener("sajilo_cookie_consent_changed", handleConsentChange);
    };
  }, []);

  useEffect(() => {
    // Strictly do not request ads unless enabled, active, and consent === 'accepted'
    if (!isAdActive || consent !== "accepted" || !insRef.current) return;

    const insElement = insRef.current;

    // Observe Google AdSense status changes on the <ins> tag
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes") {
          const status = insElement.getAttribute("data-ad-status");
          if (status === "unfilled") {
            setAdStatus("unfilled");
          } else if (status === "filled") {
            setAdStatus("filled");
          }

          // Check if style changed to display: none
          if (insElement.style.display === "none") {
            setAdStatus("unfilled");
          }
        }
      }
    });

    observer.observe(insElement, {
      attributes: true,
      attributeFilter: ["data-ad-status", "data-adsbygoogle-status", "style", "class"],
    });

    // Push ad request to Google AdSense queue
    if (!pushed.current) {
      try {
        if (typeof window !== "undefined") {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          pushed.current = true;
        }
      } catch {
        // If AdSense script isn't loaded yet or adblock is active, silently handle without breaking UI
        setAdStatus("unfilled");
      }
    }

    return () => {
      observer.disconnect();
    };
  }, [isAdActive, consent, slot]);

  // If ads are disabled platform-wide, consent is rejected, or Google marked unfilled/error: collapse completely
  if (!isAdActive || consent === "rejected" || adStatus === "unfilled" || adStatus === "error") {
    return null;
  }

  // If consent is unset, do not render or request ads
  if (consent !== "accepted") {
    return null;
  }

  return (
    <div
      data-ad-placement={placement}
      data-ad-status={adStatus}
      className={`adsense-wrapper w-full overflow-hidden transition-all duration-300 ${
        adStatus === "filled" ? "my-6 py-2" : "m-0 p-0 h-0 max-h-0"
      } ${className}`}
      style={{
        height: adStatus === "filled" ? undefined : 0,
        minHeight: adStatus === "filled" && minHeight ? (typeof minHeight === "number" ? `${minHeight}px` : minHeight) : undefined,
      }}
      aria-hidden={adStatus !== "filled"}
    >
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{
          display: "block",
          width: "100%",
          textAlign: "center",
          ...style,
        }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}

// Named alias export for AdSlot
export { AdUnit as AdSlot };
