"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F7F5F0] dark:bg-[#0C0F1E] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-[#18181B] dark:text-[#F4F4F5] mb-2">
            Something went wrong
          </h1>
          <p className="text-xs font-mono text-red-500 mb-4 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-900/50 break-words text-left">
            {error?.message || "Application error."}
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded-xl bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] text-sm font-semibold"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
