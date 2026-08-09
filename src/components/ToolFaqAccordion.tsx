"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ToolFAQ } from "@/lib/tool-content";

interface ToolFaqAccordionProps {
  faqs: ToolFAQ[];
}

export default function ToolFaqAccordion({ faqs }: ToolFaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="pt-6 border-t border-[#E4E0D8] dark:border-[#1E2338]">
      <h3 className="text-lg font-bold text-[#18181B] dark:text-[#F4F4F5] mb-4">
        Frequently Asked Questions
      </h3>
      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="border border-[#E4E0D8] dark:border-[#1E2338] rounded-xl overflow-hidden bg-[#FAFAF8] dark:bg-[#141829]/60 transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full text-left p-4 flex items-center justify-between gap-4 font-semibold text-sm text-[#18181B] dark:text-[#F4F4F5] hover:bg-[#F0EDE8]/50 dark:hover:bg-[#1E2338]/50 transition-colors cursor-pointer"
                aria-expanded={isOpen}
              >
                <span>{faq.question}</span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-[#71717A] dark:text-[#A1A1AA] transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-4 pb-4 border-t border-[#E4E0D8]/60 dark:border-[#1E2338]/60 pt-3">
                    <p
                      className={`text-xs sm:text-sm text-[#71717A] dark:text-[#A1A1AA] leading-relaxed transition-opacity duration-300 ${
                        isOpen ? "opacity-100 delay-100" : "opacity-0"
                      }`}
                    >
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
