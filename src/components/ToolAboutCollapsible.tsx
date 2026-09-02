"use client";

import { useState } from "react";
import { ChevronDown, BookOpen } from "lucide-react";

interface ToolAboutCollapsibleProps {
  toolName: string;
  children: React.ReactNode;
}

export default function ToolAboutCollapsible({
  toolName,
  children,
}: ToolAboutCollapsibleProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative">
      {/* Mobile Collapsible Wrapper */}
      <div
        className={`transition-all duration-500 ease-in-out sm:max-h-none overflow-hidden ${
          isExpanded ? "max-h-[5000px]" : "max-h-[320px] sm:max-h-none"
        }`}
      >
        {children}
      </div>

      {/* Mobile Fade Overlay when collapsed */}
      {!isExpanded && (
        <div className="sm:hidden absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-[#141829] to-transparent pointer-events-none rounded-b-2xl" />
      )}

      {/* Mobile Toggle Button */}
      <div className="sm:hidden pt-3 text-center relative z-10">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] hover:bg-[#F0EDE8] dark:hover:bg-[#2A2F48] transition-colors shadow-xs cursor-pointer"
          aria-expanded={isExpanded}
        >
          <BookOpen size={14} className="text-[#F5A623]" />
          <span>
            {isExpanded
              ? "Show Less"
              : `Read Full Guide & About ${toolName}`}
          </span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
}
