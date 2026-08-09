"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Send, CheckCircle, MessageSquareHeart } from "lucide-react";
import { trackFeedback } from "@/lib/analytics";

interface Props {
  toolSlug: string;
}

export default function ToolFeedbackWidget({ toolSlug }: Props) {
  const [state, setState] = useState<"idle" | "negative" | "submitted">("idle");
  const [comment, setComment] = useState("");

  const handleFeedback = (isHelpful: boolean) => {
    if (isHelpful) {
      trackFeedback(toolSlug, true);
      setState("submitted");
    } else {
      setState("negative");
    }
  };

  const handleSubmitComment = () => {
    trackFeedback(toolSlug, false, comment.trim() || undefined);
    setState("submitted");
    setComment("");
  };

  return (
    <div className="mt-6 pt-6 border-t border-dashed border-[#E4E0D8] dark:border-[#2A2F48]">
      {state === "submitted" ? (
        <div className="flex items-center justify-center gap-2.5 py-4 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
          <CheckCircle size={18} />
          <span>Thank you! Your feedback helps us make SajiloTools better for everyone.</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2 text-[#18181B] dark:text-[#F4F4F5] font-bold text-sm">
            <MessageSquareHeart size={18} className="text-[#DC2626]" />
            <span>Was this tool helpful?</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap justify-center">
            <button
              onClick={() => handleFeedback(true)}
              className="group flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all text-sm font-bold"
            >
              <ThumbsUp size={15} className="group-hover:scale-110 transition-transform" />
              Yes
            </button>
            <button
              onClick={() => handleFeedback(false)}
              className="group flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/25 hover:bg-rose-500/20 hover:border-rose-500/50 transition-all text-sm font-bold"
            >
              <ThumbsDown size={15} className="group-hover:scale-110 transition-transform" />
              No
            </button>
          </div>

          {/* Negative feedback follow-up */}
          {state === "negative" && (
            <div className="w-full max-w-md mt-1 text-left space-y-1.5">
              <label className="block text-xs font-bold text-[#71717A] dark:text-[#A1A1AA]">
                What could we improve? (optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. Calculation seems off..."
                  maxLength={200}
                  className="flex-1 px-3 py-2 rounded-xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] text-sm placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/40"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmitComment();
                  }}
                />
                <button
                  onClick={handleSubmitComment}
                  className="px-3 py-2 rounded-xl bg-[#DC2626] text-white font-bold text-sm hover:bg-[#DC2626]/90 transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Send size={14} />
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
