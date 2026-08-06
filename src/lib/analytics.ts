"use client";

// ── Privacy-Respecting Analytics Helper ──────────────────────────────────────
// Zero cookies, zero personal data collection, zero invasive fingerprinting.
// Uses an anonymous, rotating session ID stored in localStorage solely for counts.

export interface AnalyticsEvent {
  type: "pageview" | "tool_use" | "search" | "feedback" | "error";
  path?: string;
  toolSlug?: string;
  action?: string;
  query?: string;
  isHelpful?: boolean;
  comment?: string;
  errorMsg?: string;
  sessionId?: string;
  timestamp?: number;
}

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let sid = localStorage.getItem("sajilo_session_id");
    const expiry = localStorage.getItem("sajilo_session_expiry");
    const now = Date.now();

    // Rotate session ID after 24 hours of inactivity
    if (!sid || !expiry || now > parseInt(expiry, 10)) {
      sid = "s_" + Math.random().toString(36).substring(2, 11) + now.toString(36);
      localStorage.setItem("sajilo_session_id", sid);
    }
    // Refresh 24-hour expiry on active usage
    localStorage.setItem("sajilo_session_expiry", (now + 24 * 60 * 60 * 1000).toString());
    return sid;
  } catch {
    return "";
  }
}

export function trackEvent(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;

  const payload: AnalyticsEvent = {
    ...event,
    sessionId: getSessionId(),
    timestamp: Date.now(),
    path: event.path || window.location.pathname,
  };

  try {
    fetch("/api/analytics", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Fail silently — analytics should never block or affect user experience
  }
}

export function trackPageView(path?: string) {
  trackEvent({ type: "pageview", path });
}

export function trackToolUse(toolSlug: string, action?: string) {
  trackEvent({ type: "tool_use", toolSlug, action });
}

export function trackSearch(query: string) {
  if (!query.trim()) return;
  trackEvent({ type: "search", query: query.trim() });
}

export function trackFeedback(toolSlug: string, isHelpful: boolean, comment?: string) {
  trackEvent({ type: "feedback", toolSlug, isHelpful, comment });
}

export function trackError(toolSlug: string, errorMsg: string) {
  if (!errorMsg) return;
  trackEvent({ type: "error", toolSlug, errorMsg });
}
