"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Complete loading on route change
  useEffect(() => {
    if (loading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Global click interceptor for internal links
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external, hash links, mailto, tel, downloads, or open in new tab
      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target.target === "_blank" ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Ignore if clicking the exact current URL without params change
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl) return;

      // Start progress
      setLoading(true);
      setProgress(25);

      // Smooth step animations
      const step1 = setTimeout(() => setProgress(55), 100);
      const step2 = setTimeout(() => setProgress(75), 350);
      const step3 = setTimeout(() => setProgress(88), 700);

      // Cleanup if needed
      return () => {
        clearTimeout(step1);
        clearTimeout(step2);
        clearTimeout(step3);
      };
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none transition-opacity duration-200"
      style={{ opacity: loading ? 1 : 0 }}
      aria-hidden="true"
    >
      {/* Progress Bar Line */}
      <div
        className="h-[2.5px] bg-gradient-to-r from-[#F5A623] via-[#E8930C] to-[#1F2544] dark:to-[#F5A623] shadow-[0_0_8px_rgba(245,166,35,0.6)] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
        }}
      />
      {/* Leading Glow Dot */}
      <div
        className="absolute top-0 h-[2.5px] w-8 bg-white/60 blur-[1px] -translate-x-full transition-all duration-200 ease-out"
        style={{
          left: `${progress}%`,
        }}
      />
    </div>
  );
}
