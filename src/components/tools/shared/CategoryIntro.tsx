"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Layers,
  Users,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import type { CategoryDef } from "@/lib/tools-registry";

interface CategoryIntroProps {
  category: CategoryDef;
  totalTools: number;
}

export default function CategoryIntro({ category, totalTools }: CategoryIntroProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  if (!category.intro && (!category.popularTasks || category.popularTasks.length === 0)) {
    return null;
  }

  return (
    <section
      aria-labelledby="category-about-heading"
      className="mb-8 rounded-3xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] shadow-sm overflow-hidden transition-all"
    >
      {/* Header Banner */}
      <div className="p-6 sm:p-7 border-b border-[#E4E0D8]/60 dark:border-[#1E2338]/60 bg-gradient-to-r from-zinc-50/70 via-transparent to-zinc-50/40 dark:from-[#171c30]/50 dark:to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#71717A] dark:text-[#A1A1AA] mb-1">
            <Info size={14} className="text-[#DC2626]" />
            <span>Category Guide &amp; Real-World Use Cases</span>
          </div>
          <h2
            id="category-about-heading"
            className="text-xl sm:text-2xl font-bold text-[#18181B] dark:text-[#F4F4F5]"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            About {category.name}
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#DC2626]/10 text-[#DC2626]">
            <Layers size={13} /> {totalTools} Essential Tools
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="sm:hidden p-1.5 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] text-zinc-500"
            aria-label="Toggle section"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className={`p-6 sm:p-7 space-y-6 ${isExpanded ? "block" : "hidden sm:block"}`}>
        {/* Editorial Explanatory Text */}
        {category.intro && (
          <p className="text-sm sm:text-base text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">
            {category.intro}
          </p>
        )}

        {/* Structured Columns: Popular Tasks & Target Audience */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-[#E4E0D8]/60 dark:border-[#1E2338]/60">
          {/* Popular Tasks */}
          {category.popularTasks && category.popularTasks.length > 0 && (
            <div className="md:col-span-7 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-500" /> Popular Tasks in this Category
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#52525B] dark:text-[#A1A1AA]">
                {category.popularTasks.map((task, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 p-2.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] mt-1.5 shrink-0" />
                    <span className="leading-snug">{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Designed For & Highlights */}
          <div className="md:col-span-5 space-y-4">
            {category.designedFor && (
              <div className="p-4 rounded-2xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] space-y-1.5">
                <div className="text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-1.5">
                  <Users size={14} className="text-[#0D9488]" /> Designed For
                </div>
                <p className="text-xs text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">
                  {category.designedFor}
                </p>
              </div>
            )}

            {category.highlights && category.highlights.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {category.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] text-zinc-600 dark:text-zinc-300"
                  >
                    <ShieldCheck size={12} className="text-emerald-500" />
                    {h}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
