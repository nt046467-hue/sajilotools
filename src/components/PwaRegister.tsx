"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export default function PwaRegister() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW registration failed — fail silently
      });
    }

    // Offline detection
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    setIsOffline(!navigator.onLine);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-amber-500/95 text-white text-sm font-semibold shadow-xl backdrop-blur-sm">
        <WifiOff size={16} className="shrink-0" />
        <span>You&apos;re offline — some features may be limited</span>
      </div>
    </div>
  );
}
