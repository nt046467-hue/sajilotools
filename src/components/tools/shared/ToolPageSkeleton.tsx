"use client";

import React from "react";

export function ToolWorkstationSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-hidden="true">
      {/* Top Action / Config Bar */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#E4E0D8]/60 dark:border-[#1E2338]">
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 bg-[#E4E0D8]/60 dark:bg-[#1E2338] rounded-xl" />
          <div className="h-8 w-24 bg-[#E4E0D8]/40 dark:bg-[#1E2338]/60 rounded-xl" />
        </div>
        <div className="h-8 w-28 bg-[#E4E0D8]/40 dark:bg-[#1E2338]/60 rounded-xl" />
      </div>

      {/* Main Workstation Inputs Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[360px]">
        <div className="lg:col-span-7 space-y-4">
          <div className="h-4 w-32 bg-[#E4E0D8]/60 dark:bg-[#1E2338] rounded-md" />
          <div className="h-48 w-full bg-[#FAFAF8] dark:bg-[#0C0F1E] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl p-4 space-y-3">
            <div className="h-4 w-3/4 bg-[#E4E0D8]/50 dark:bg-[#1E2338] rounded" />
            <div className="h-4 w-1/2 bg-[#E4E0D8]/40 dark:bg-[#1E2338]/60 rounded" />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <div className="h-10 w-32 bg-[#F5A623]/20 dark:bg-[#F5A623]/10 rounded-xl border border-[#F5A623]/30" />
            <div className="h-10 w-24 bg-[#E4E0D8]/50 dark:bg-[#1E2338] rounded-xl" />
          </div>
        </div>

        {/* Output / Preview Pane */}
        <div className="lg:col-span-5 space-y-4">
          <div className="h-4 w-28 bg-[#E4E0D8]/60 dark:bg-[#1E2338] rounded-md" />
          <div className="h-48 w-full bg-[#FAFAF8] dark:bg-[#0C0F1E] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl flex flex-col items-center justify-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#E4E0D8]/60 dark:bg-[#1E2338]" />
            <div className="h-3 w-36 bg-[#E4E0D8]/40 dark:bg-[#1E2338]/60 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ToolPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#0C0F1E] transition-colors duration-300 animate-pulse" aria-busy="true">
      {/* Breadcrumb Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8">
        <div className="flex items-center gap-2">
          <div className="h-4 w-12 bg-[#E4E0D8] dark:bg-[#1E2338] rounded" />
          <span className="text-[#A1A1AA] text-xs">/</span>
          <div className="h-4 w-20 bg-[#E4E0D8] dark:bg-[#1E2338] rounded" />
          <span className="text-[#A1A1AA] text-xs">/</span>
          <div className="h-4 w-28 bg-[#E4E0D8]/80 dark:bg-[#1E2338] rounded" />
        </div>
      </div>

      {/* Header Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-4 sm:pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#E4E0D8] dark:bg-[#1E2338] flex-shrink-0" />
          <div className="space-y-2 flex-1 max-w-lg">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-48 bg-[#E4E0D8] dark:bg-[#1E2338] rounded-lg" />
              <div className="h-5 w-16 bg-[#E4E0D8]/60 dark:bg-[#1E2338]/60 rounded-full" />
            </div>
            <div className="h-4 w-full bg-[#E4E0D8]/60 dark:bg-[#1E2338]/60 rounded" />
          </div>
        </div>
        <div className="mt-3.5 h-6 w-72 bg-[#E4E0D8]/60 dark:bg-[#1E2338]/60 rounded-full" />
      </div>

      {/* Main Tool Container Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-white dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] p-5 sm:p-8 shadow-[0_1px_4px_rgba(0,0,0,0.05)] dark:shadow-none min-h-[420px]">
          <ToolWorkstationSkeleton />
        </div>
      </div>

      {/* SEO On-Page Guide & FAQs Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] p-6 sm:p-8 space-y-4">
            <div className="h-6 w-44 bg-[#E4E0D8] dark:bg-[#1E2338] rounded-md" />
            <div className="space-y-2 pt-2">
              <div className="h-4 w-full bg-[#E4E0D8]/60 dark:bg-[#1E2338]/60 rounded" />
              <div className="h-4 w-5/6 bg-[#E4E0D8]/60 dark:bg-[#1E2338]/60 rounded" />
              <div className="h-4 w-2/3 bg-[#E4E0D8]/60 dark:bg-[#1E2338]/60 rounded" />
            </div>
          </div>
          <div className="bg-white dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] p-6 space-y-4">
            <div className="h-5 w-32 bg-[#E4E0D8] dark:bg-[#1E2338] rounded-md" />
            <div className="space-y-2">
              <div className="h-10 w-full bg-[#FAFAF8] dark:bg-[#0C0F1E] rounded-xl border border-[#E4E0D8] dark:border-[#1E2338]" />
              <div className="h-10 w-full bg-[#FAFAF8] dark:bg-[#0C0F1E] rounded-xl border border-[#E4E0D8] dark:border-[#1E2338]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
