"use client";

/**
 * Note: This is a basic custom Consent Management Platform (CMP).
 * For long-term EEA/UK compliance with Google AdSense and IAB TCF v2.2 requirements,
 * it is recommended to swap in a Google-certified CMP vendor (e.g., Google Funding Choices / Privacy & Messaging, Quantcast, or Cookiebot).
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, X } from "lucide-react";

export type ConsentState = "accepted" | "rejected" | "unset";

const CONSENT_STORAGE_KEY = "sajilotools_cookie_consent";
const OPEN_EVENT_NAME = "sajilo_open_cookie_consent";

interface CookieConsentProps {
  adsenseClientId?: string;
}

export default function CookieConsent({ adsenseClientId }: CookieConsentProps) {
  const [consent, setConsent] = useState<ConsentState>("unset");
  const [showBanner, setShowBanner] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY) as ConsentState | null;
    if (stored === "accepted" || stored === "rejected") {
      setConsent(stored);
      setShowBanner(false);
    } else {
      setConsent("unset");
      setShowBanner(true);
    }

    const handleOpenEvent = () => {
      setShowBanner(true);
    };

    window.addEventListener(OPEN_EVENT_NAME, handleOpenEvent);
    return () => {
      window.removeEventListener(OPEN_EVENT_NAME, handleOpenEvent);
    };
  }, []);

  // Dynamically load AdSense script only when consent === "accepted"
  useEffect(() => {
    if (!mounted) return;

    if (consent === "accepted" && adsenseClientId) {
      const existingScript = document.getElementById("adsense-script");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "adsense-script";
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`;
        script.crossOrigin = "anonymous";
        document.head.appendChild(script);
      }
    }
  }, [consent, adsenseClientId, mounted]);

  const handleChoice = (choice: "accepted" | "rejected") => {
    localStorage.setItem(CONSENT_STORAGE_KEY, choice);
    setConsent(choice);
    setShowBanner(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("sajilo_cookie_consent_changed", {
          detail: { consent: choice },
        })
      );
    }
  };

  if (!mounted || !showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="p-5 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] shadow-2xl space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-foreground font-semibold text-sm font-sora">
            <Cookie className="text-[#F5A623] shrink-0" size={18} />
            <span>Cookie & Privacy Preferences</span>
          </div>
          {consent !== "unset" && (
            <button
              onClick={() => setShowBanner(false)}
              className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          We use cookies and analytics to enhance performance and deliver personalized ads. You can accept or decline non-essential cookies. Learn more in our{" "}
          <Link href="/privacy-policy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => handleChoice("accepted")}
            className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <ShieldCheck size={14} /> Accept All
          </button>
          <button
            onClick={() => handleChoice("rejected")}
            className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-[#F0EDE8] dark:bg-[#1E2338] text-foreground hover:bg-[#E4E0D8] dark:hover:bg-[#252A42] transition-colors"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
