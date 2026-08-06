"use client";

import React from "react";
import Image from "next/image";

export type LogoVariant = "horizontal" | "vertical" | "icon" | "app-icon" | "full";
export type LogoTheme = "light" | "dark" | "auto";

interface LogoProps {
  variant?: LogoVariant;
  theme?: LogoTheme;
  size?: number; // Base icon size in pixels (default: 28)
  className?: string;
  priority?: boolean;
}

/**
 * SajiloTools Official Brand Logo Component
 * Proportional, ultra-crisp brand logo designed to match high-end modern SaaS web design standards.
 * Uses semantic theme color tokens (`text-foreground`) for zero-flash dark mode support.
 */
export default function Logo({
  variant = "horizontal",
  size = 28,
  className = "",
  priority = false,
}: LogoProps) {
  if (variant === "icon" || variant === "app-icon") {
    return (
      <div className={`inline-flex items-center flex-shrink-0 select-none ${className}`}>
        <Image
          src="/branding/logo-icon.svg"
          alt="SajiloTools Icon"
          width={size}
          height={size}
          style={{ height: `${size}px`, width: "auto" }}
          className="object-contain flex-shrink-0"
          priority={priority}
        />
      </div>
    );
  }

  const fontSize = Math.round(size * 0.64);

  return (
    <div className={`inline-flex items-center gap-2 flex-shrink-0 select-none group ${className}`}>
      <Image
        src="/branding/logo-icon.svg"
        alt="SajiloTools Logo Icon"
        width={size}
        height={size}
        style={{ height: `${size}px`, width: "auto" }}
        className="object-contain flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
        priority={priority}
      />
      <span
        className="font-bold text-foreground transition-colors leading-none tracking-[-0.03em]"
        style={{
          fontSize: `${fontSize}px`,
          fontFamily: "var(--font-sora), 'Sora', system-ui, -apple-system, sans-serif",
        }}
      >
        Sajilo<span className="text-[#0D9488] dark:text-[#38BDF8] font-semibold">Tools</span>
      </span>
    </div>
  );
}
