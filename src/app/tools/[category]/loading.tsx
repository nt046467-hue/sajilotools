import React from "react";

export default function CategoryLoading() {
  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#0C0F1E] transition-colors duration-300 animate-pulse" aria-busy="true">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8">
        <div className="flex items-center gap-2">
          <div className="h-4 w-12 bg-[#E4E0D8] dark:bg-[#1E2338] rounded" />
          <span className="text-[#A1A1AA] text-xs">/</span>
          <div className="h-4 w-24 bg-[#E4E0D8]/80 dark:bg-[#1E2338] rounded" />
        </div>
      </div>

      {/* Category Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-14 h-14 rounded-2xl bg-[#E4E0D8] dark:bg-[#1E2338]" />
          <div className="space-y-2">
            <div className="h-7 w-48 bg-[#E4E0D8] dark:bg-[#1E2338] rounded-lg" />
            <div className="h-4 w-64 bg-[#E4E0D8]/60 dark:bg-[#1E2338]/60 rounded" />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] p-6 space-y-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
            >
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-[#E4E0D8] dark:bg-[#1E2338]" />
                <div className="h-5 w-14 bg-[#E4E0D8]/60 dark:bg-[#1E2338]/60 rounded-full" />
              </div>
              <div className="h-5 w-3/4 bg-[#E4E0D8] dark:bg-[#1E2338] rounded-md" />
              <div className="h-4 w-full bg-[#E4E0D8]/50 dark:bg-[#1E2338]/60 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
