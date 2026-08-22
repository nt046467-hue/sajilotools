"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface CalculatorCrossLinkProps {
  icon: LucideIcon;
  title: string;
  desc?: string;
  description?: string;
  href: string;
}

export default function CalculatorCrossLink({
  icon: Icon,
  title,
  desc,
  description,
  href,
}: CalculatorCrossLinkProps) {
  const displayText = desc || description || "";
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 p-4 rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#141829] hover:border-[#22C55E]/40 dark:hover:border-[#22C55E]/40 transition-all duration-200"
    >
      <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center shrink-0">
        <Icon size={20} className="text-[#22C55E]" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider block">
          Related Tool
        </span>
        <span className="text-sm font-bold text-[#18181B] dark:text-[#F4F4F5] block truncate">
          {title}
        </span>
        <span className="text-xs text-[#A1A1AA] block truncate">{displayText}</span>
      </div>
      <ChevronRight
        size={18}
        className="text-[#A1A1AA] group-hover:text-[#22C55E] transition-colors shrink-0"
      />
    </Link>
  );
}
