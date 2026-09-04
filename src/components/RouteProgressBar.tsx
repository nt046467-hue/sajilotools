"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Real route-change progress bar for Next.js App Router.
 *
 * Flow:
 * 1. User clicks an internal <a> link → bar appears at 0% and smoothly
 *    advances through 25 → 55 → 75 → 88% over ~700ms.
 * 2. When the actual route change completes (pathname/searchParams update),
 *    the bar snaps to 100% and fades out after 300ms.
 * 3. If the user clicks the same link they're already on, nothing happens.
 * 4. External links, buttons, hash-only links, keyboard-modified clicks,
 *    and elements marked data-no-progress="true" are all ignored.
 */
export function triggerProgressBar() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("sajilo:start-progress"));
  }
}

export default function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isNavigatingRef = useRef(false);

  // Helper to clear all queued timers
  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startProgress = () => {
    clearTimers();
    isNavigatingRef.current = true;
    setVisible(true);
    setProgress(25);

    timersRef.current.push(setTimeout(() => setProgress(55), 120));
    timersRef.current.push(setTimeout(() => setProgress(75), 350));
    timersRef.current.push(setTimeout(() => setProgress(88), 700));
  };

  // ── Step 2: Complete the bar when the route actually changes ──
  useEffect(() => {
    if (!isNavigatingRef.current) return;

    // Route has changed — snap to 100%, then fade out
    clearTimers();
    isNavigatingRef.current = false;
    setProgress(100);

    const fadeOut = setTimeout(() => {
      setVisible(false);
      // Reset progress to 0 *after* the opacity transition finishes (300ms)
      const reset = setTimeout(() => setProgress(0), 300);
      timersRef.current.push(reset);
    }, 200);

    timersRef.current.push(fadeOut);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // ── Step 1: Intercept clicks on internal links & custom trigger ──
  useEffect(() => {
    const handleCustomStart = () => {
      startProgress();
    };
    window.addEventListener("sajilo:start-progress", handleCustomStart);

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Skip elements explicitly marked no-progress
      if (target.closest("[data-no-progress='true']")) return;

      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Skip external, hash-only, mailto, tel, download, or new-tab links
      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Skip if it's the exact same URL we're already on
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl) return;

      startProgress();
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("sajilo:start-progress", handleCustomStart);
      clearTimers();
    };
  }, []);

  // Don't render anything when idle
  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 300ms ease-out",
      }}
      aria-hidden="true"
    >
      {/* Progress Bar */}
      <div
        className="h-[2.5px] bg-gradient-to-r from-[#F5A623] via-[#E8930C] to-[#1F2544] dark:to-[#F5A623] shadow-[0_0_8px_rgba(245,166,35,0.6)]"
        style={{
          width: `${progress}%`,
          transition: progress === 0
            ? "none"
            : "width 250ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
      {/* Leading Glow Dot */}
      <div
        className="absolute top-0 h-[2.5px] w-8 bg-white/60 blur-[1px] -translate-x-full"
        style={{
          left: `${progress}%`,
          transition: progress === 0
            ? "none"
            : "left 250ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
    </div>
  );
}
