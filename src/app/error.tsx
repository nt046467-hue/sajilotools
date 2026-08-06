"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Router Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#0C0F1E] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-[#18181B] dark:text-[#F4F4F5] mb-2">
          Something went wrong
        </h1>
        <p className="text-xs font-mono text-red-500 mb-4 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-900/50 break-words text-left max-h-48 overflow-auto">
          {error.message || "An unexpected error occurred."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded-xl bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
          <Link
            href="/tools"
            className="px-4 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] text-sm font-medium hover:bg-[#F0EDE8] dark:hover:bg-[#1E2338] transition-colors"
          >
            All Tools
          </Link>
        </div>
      </div>
    </div>
  );
}
