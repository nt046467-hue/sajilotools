"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Copy,
  Check,
  Share2,
  Mail,
  Send,
  Smartphone,
} from "lucide-react";
import Logo from "@/components/shared/Logo";
import { ICON_MAP } from "@/components/home/home-constants";

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  url?: string;
  badge?: string;
  icon?: string;
  color?: string;
  category?: string;
  customPreview?: React.ReactNode;
}

export default function ShareModal({
  isOpen,
  onClose,
  title,
  description = "Check out this free tool on Sajilo Tools — fast, secure, and private!",
  url,
  badge = "Sajilo Tools",
  icon,
  color,
  category,
  customPreview,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  const ToolIcon = (icon && ICON_MAP[icon]) ? ICON_MAP[icon] : null;

  // Determine current active URL (window or prop)
  const activeUrl = typeof window !== "undefined" ? (url || window.location.href) : (url || "https://sajilotools.com");

  // Check for native OS share capability (Mobile Safari, Android Chrome, etc.)
  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setCanNativeShare(true);
    }
  }, []);

  // Close on Escape key press and bulletproof background scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const scrollY = window.scrollY;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;
    const originalOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      document.body.style.overflow = originalOverflow;
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleCopyLink = useCallback(async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(activeUrl);
      } else {
        const input = document.createElement("textarea");
        input.value = activeUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [activeUrl]);

  const handleNativeShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: activeUrl,
        });
      } catch (err: any) {
        if (err?.name === "AbortError") return;
      }
    } else {
      handleCopyLink();
    }
  }, [title, description, activeUrl, handleCopyLink]);

  if (!isOpen) return null;

  // Social sharing link generators
  const shareText = `${title} — ${description}`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(activeUrl);

  const channels = [
    {
      name: "WhatsApp",
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${activeUrl}`)}`,
      bgColor: "bg-[#25D366]",
      hoverBg: "hover:bg-[#25D366]/10 hover:border-[#25D366]",
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-white" viewBox="0 0 24 24">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.32a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 10.23c-.25-.13-1.47-.72-1.7-.81-.23-.08-.4-.13-.57.13-.17.25-.65.81-.8 1-.15.17-.3.19-.55.06-.25-.13-1.07-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44s-.57-1.37-.78-1.88c-.2-.49-.41-.43-.57-.44l-.48-.01c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.71 4.3 3.8.6.26 1.07.42 1.44.53.6.19 1.15.16 1.59.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29" />
        </svg>
      ),
    },
    {
      name: "Email",
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Hi,\n\nI thought you would find this useful:\n${title}\n${description}\n\nLink: ${activeUrl}`)}`,
      bgColor: "bg-[#EA4335]",
      hoverBg: "hover:bg-[#EA4335]/10 hover:border-[#EA4335]",
      icon: <Mail className="w-5 h-5 sm:w-5 sm:h-5 text-white" />,
    },
    {
      name: "X (Twitter)",
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      bgColor: "bg-black dark:bg-white",
      hoverBg: "hover:bg-black/10 dark:hover:bg-white/10 hover:border-black dark:hover:border-white",
      icon: (
        <svg className="w-4 h-4 sm:w-4 sm:h-4 fill-white dark:fill-black" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      bgColor: "bg-[#229ED9]",
      hoverBg: "hover:bg-[#229ED9]/10 hover:border-[#229ED9]",
      icon: <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white -ml-0.5" />,
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      bgColor: "bg-[#0A66C2]",
      hoverBg: "hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]",
      icon: (
        <svg className="w-4 h-4 sm:w-4 sm:h-4 fill-white" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      bgColor: "bg-[#1877F2]",
      hoverBg: "hover:bg-[#1877F2]/10 hover:border-[#1877F2]",
      icon: (
        <svg className="w-4 h-4 sm:w-4 sm:h-4 fill-white" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal / Share Sheet Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-dialog-title"
        className="relative w-[calc(100vw-24px)] sm:w-full max-w-[480px] bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3.5 sm:space-y-4 max-h-[calc(100dvh-24px)] sm:max-h-[calc(100dvh-48px)] overflow-y-auto"
      >
        {/* Header with Title, Subtitle, and 40px Touch Target Close Button */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[#E4E0D8]/60 dark:border-[#1E2338]">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#F5A623]/10 text-[#F5A623] flex items-center justify-center shrink-0">
              <Share2 size={18} />
            </div>
            <div className="min-w-0">
              <h3
                id="share-dialog-title"
                className="text-base sm:text-lg font-bold text-[#18181B] dark:text-[#F4F4F5] leading-tight truncate"
              >
                Share Tool
              </h3>
              <p className="text-[11px] sm:text-xs text-[#71717A] truncate mt-0.5">
                Share with friends, team, or on social apps
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close share dialog"
            className="w-10 h-10 min-w-[40px] rounded-xl flex items-center justify-center text-[#71717A] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-[#F0EDE8] dark:hover:bg-[#1E2338] transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tool Preview Area (Custom or Standard Compact Preview) */}
        {customPreview ? (
          <div>{customPreview}</div>
        ) : (
          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#0C0F1E] flex items-center gap-3">
            {ToolIcon ? (
              <div className="relative shrink-0">
                <div
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xs border"
                  style={{
                    backgroundColor: color ? `${color}18` : "rgba(245, 166, 35, 0.12)",
                    borderColor: color ? `${color}30` : "rgba(245, 166, 35, 0.25)",
                    color: color || "#F5A623",
                  }}
                >
                  <ToolIcon size={22} className="stroke-[2.2]" />
                </div>
                {/* Official SajiloTools mini brand emblem badge on corner */}
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#2A2F48] shadow-xs flex items-center justify-center p-0.5"
                  title="SajiloTools Official"
                >
                  <Logo variant="icon" size={13} priority />
                </div>
              </div>
            ) : (
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white dark:bg-[#1A1F36] border border-[#E4E0D8] dark:border-[#2A2F48] flex items-center justify-center shrink-0 shadow-xs p-2 overflow-hidden">
                <Logo variant="icon" size={26} priority />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-[#18181B] dark:text-[#F4F4F5] truncate">
                  {title}
                </span>
                {category && (
                  <span className="text-[10px] text-[#71717A] dark:text-[#A1A1AA] font-medium hidden sm:inline">
                    • {category}
                  </span>
                )}
                {badge && (
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold bg-[#1F2544]/10 dark:bg-[#F5A623]/20 text-[#1F2544] dark:text-[#F5A623] shrink-0">
                    {badge}
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-[#71717A] line-clamp-1 sm:line-clamp-2 mt-0.5 leading-relaxed">
                {description}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5 text-[10px] sm:text-[11px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 inline-block" />
                <span className="font-bold tracking-tight text-[#18181B] dark:text-[#F4F4F5]">
                  Sajilo<span className="text-[#0D9488] dark:text-[#38BDF8]">Tools</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Social Platforms 2-Column Grid */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider block">
            Share To Apps
          </span>
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            {channels.map((channel) => (
              <a
                key={channel.name}
                href={channel.href}
                target={channel.name === "Email" ? "_self" : "_blank"}
                rel="noopener noreferrer"
                className={`min-h-[50px] sm:min-h-[52px] flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338]/60 transition-all text-xs sm:text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5] group cursor-pointer shadow-2xs ${channel.hoverBg}`}
              >
                <span
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl ${channel.bgColor} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}
                >
                  {channel.icon}
                </span>
                <span className="truncate min-w-0">{channel.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Native Mobile OS Share Sheet Trigger (When available on mobile browsers) */}
        {canNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full min-h-[46px] sm:min-h-[48px] px-4 py-2.5 rounded-xl sm:rounded-2xl bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] font-bold text-xs sm:text-sm hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Smartphone size={16} className="shrink-0" />
            <span className="truncate">Open System Apps (AirDrop, WhatsApp, etc.)</span>
          </button>
        )}

        {/* Direct Shareable Link Bar */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider flex items-center justify-between">
            <span>Direct Link</span>
            <span className="text-[10px] text-[#71717A] font-normal normal-case">
              Click to select all
            </span>
          </label>
          <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-xl sm:rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#0C0F1E]">
            <input
              type="text"
              readOnly
              value={activeUrl}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="min-w-0 flex-1 px-2.5 sm:px-3 py-1.5 bg-transparent font-mono text-xs text-[#18181B] dark:text-[#F4F4F5] truncate focus:outline-none select-all"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`min-h-[40px] px-3.5 sm:px-4 py-1.5 rounded-lg sm:rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] hover:opacity-90 active:scale-95"
              }`}
            >
              {copied ? (
                <>
                  <Check size={14} /> Copied!
                </>
              ) : (
                <>
                  <Copy size={14} /> Copy Link
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer with note and FULL-WIDTH TAPPABLE Close Button */}
        <div className="space-y-2.5 pt-2 border-t border-[#E4E0D8]/60 dark:border-[#1E2338]">
          <p className="text-[11px] text-[#71717A] text-center">
            Free &amp; private on Sajilo Tools
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[44px] sm:min-h-[46px] rounded-xl sm:rounded-2xl border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] hover:bg-[#F0EDE8] dark:hover:bg-[#252A42] text-[#18181B] dark:text-[#F4F4F5] font-semibold text-sm transition-all flex items-center justify-center cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
