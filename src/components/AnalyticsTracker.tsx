"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    // Do not track admin routes or internal auth/redirect paths as public pageviews
    if (pathname.startsWith("/admin") || pathname.startsWith("/api") || pathname.startsWith("/s/")) {
      return;
    }

    const fullPath = searchParams && searchParams.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    // Prevent immediate duplicate track on same route
    if (lastTrackedPath.current === fullPath) return;
    lastTrackedPath.current = fullPath;

    // Send pageview event to /api/analytics
    trackPageView(pathname);
  }, [pathname, searchParams]);

  return null;
}
