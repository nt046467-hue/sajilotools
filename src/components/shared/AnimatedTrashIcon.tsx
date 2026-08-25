"use client";

import React, { useRef, useCallback, useState, useImperativeHandle, forwardRef } from "react";
import { motion, useAnimation } from "motion/react";

export interface AnimatedTrashIconProps {
  /** Pixel size of the icon (width & height). Defaults to 16. */
  size?: number;
  /** Extra CSS classes forwarded to the root <span> wrapper. */
  className?: string;
  /** Stroke colour. Defaults to "currentColor" so it inherits text colour. */
  color?: string;
  /** Stroke width. Defaults to 2 */
  strokeWidth?: number;
  /** Optional callback fired after the delete animation finishes */
  onDelete?: () => void;
  /** Disable hover preview */
  disableHover?: boolean;
}

export interface AnimatedTrashIconHandle {
  openLid: () => void;
  closeLid: () => void;
  play: () => Promise<void>;
}

/**
 * Animated Trash Icon — Realistic pre-delete hover lid opening + click particle eating physics.
 *
 * 1. On Hover / Ready: Lid smoothly pops open to -28° ("ready to delete").
 * 2. On Leave: Lid snaps closed cleanly to 0°.
 * 3. On Click / Delete: Lid pops fully open (-52°), 3 particles tumble inside,
 *    bin body squishes realistically as it consumes them, lid snaps shut, and onDelete triggers.
 */
const AnimatedTrashIcon = forwardRef<AnimatedTrashIconHandle, AnimatedTrashIconProps>(
  function AnimatedTrashIcon(
    {
      size = 16,
      className = "",
      color = "currentColor",
      strokeWidth = 2,
      onDelete,
      disableHover = false,
    },
    ref
  ) {
    const lidControls = useAnimation();
    const bodyControls = useAnimation();
    const dust1 = useAnimation();
    const dust2 = useAnimation();
    const dust3 = useAnimation();
    const isAnimating = useRef(false);
    const isHovered = useRef(false);

    // ── Ready / Hover: Open lid slightly ──
    const openLid = useCallback(() => {
      if (isAnimating.current) return;
      isHovered.current = true;
      lidControls.start({
        rotate: -30,
        transition: { type: "spring", stiffness: 450, damping: 18 },
      });
      bodyControls.start({
        scale: 1.05,
        transition: { type: "spring", stiffness: 400, damping: 20 },
      });
    }, [lidControls, bodyControls]);

    // ── Mouse Leave: Close lid ──
    const closeLid = useCallback(() => {
      if (isAnimating.current) return;
      isHovered.current = false;
      lidControls.start({
        rotate: 0,
        transition: { type: "spring", stiffness: 400, damping: 22 },
      });
      bodyControls.start({
        scale: 1,
        transition: { type: "spring", stiffness: 400, damping: 22 },
      });
    }, [lidControls, bodyControls]);

    // ── Full Click-to-Delete Sequence ──
    const play = useCallback(async () => {
      if (isAnimating.current) return;
      isAnimating.current = true;

      // 1. Pop Lid Fully Open (hinged around left side at 4px, 7px)
      lidControls.start({
        rotate: -52,
        transition: { type: "spring", stiffness: 400, damping: 14 },
      });

      // 2. Initial state for falling particles
      dust1.set({ opacity: 0, y: -16, x: -3, rotate: -45, scale: 0.5 });
      dust2.set({ opacity: 0, y: -20, x: 3, rotate: 45, scale: 0.5 });
      dust3.set({ opacity: 0, y: -24, x: 0, rotate: 0, scale: 0.5 });

      // Particle 1: Shredded Paper Line (tumbles down)
      dust1.start({
        opacity: [0, 1, 1, 0],
        y: [-16, -4, 6, 14],
        x: [-3, -1.5, 0, 0],
        rotate: [-45, 45, 135, 180],
        scale: [0.5, 1, 1, 0.4],
        transition: { duration: 0.42, ease: "easeIn", times: [0, 0.3, 0.8, 1], delay: 0.08 },
      });

      // Particle 2: Data Square (tumbles down)
      dust2.start({
        opacity: [0, 1, 1, 0],
        y: [-20, -4, 6, 14],
        x: [3, 1.5, 0, 0],
        rotate: [45, -45, -135, -180],
        scale: [0.5, 1.2, 1, 0.4],
        transition: { duration: 0.42, ease: "easeIn", times: [0, 0.3, 0.8, 1], delay: 0.18 },
      });

      // Particle 3: Crumpled File Circle (tumbles down)
      await dust3.start({
        opacity: [0, 1, 1, 0],
        y: [-24, -4, 6, 14],
        rotate: [0, 90, 180, 270],
        scale: [0.5, 1, 1, 0.4],
        transition: { duration: 0.42, ease: "easeIn", times: [0, 0.3, 0.8, 1], delay: 0.3 },
      });

      // 3. Bin shakes/squishes as it "eats" the trash
      bodyControls.start({
        scaleY: [1, 1.15, 0.9, 1],
        scaleX: [1, 0.93, 1.06, 1],
        transition: { duration: 0.32, ease: "easeInOut" },
      });

      // 4. Close lid cleanly with snappy spring
      await lidControls.start({
        rotate: 0,
        transition: { type: "spring", stiffness: 450, damping: 20, delay: 0.04 },
      });

      await new Promise((r) => setTimeout(r, 80));

      if (onDelete) {
        onDelete();
      }

      isAnimating.current = false;
      isHovered.current = false;
    }, [lidControls, bodyControls, dust1, dust2, dust3, onDelete]);

    useImperativeHandle(ref, () => ({
      openLid,
      closeLid,
      play,
    }));

    return (
      <span
        onPointerEnter={(e) => {
          if (!disableHover && e.pointerType === "mouse") openLid();
        }}
        onPointerLeave={() => {
          if (!disableHover) closeLid();
        }}
        className={`inline-flex items-center justify-center select-none ${className}`}
        style={{ width: size, height: size }}
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="overflow-visible"
        >
          {/* ── Falling particles (trash entering bin) ── */}

          {/* Particle 1: Shredded paper line */}
          <motion.line
            x1="10" y1="0" x2="14" y2="0"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={dust1}
          />

          {/* Particle 2: Data block (small square) */}
          <motion.rect
            x="10.5" y="-1.5" width="3" height="3" rx="0.5"
            fill={color}
            stroke="none"
            initial={{ opacity: 0 }}
            animate={dust2}
          />

          {/* Particle 3: Crumpled file (small circle) */}
          <motion.circle
            cx="12" cy="0" r="1.5"
            fill={color}
            stroke="none"
            initial={{ opacity: 0 }}
            animate={dust3}
          />

          {/* ── Main Trash Bin ── */}
          <motion.g animate={bodyControls} style={{ originX: "12px", originY: "20px" }}>
            {/* Lid — hinged precisely around left side (4px, 7px) */}
            <motion.g animate={lidControls} style={{ originX: "4px", originY: "7px" }}>
              {/* Flat lid top */}
              <path d="M 4 7 h 16" />
              {/* Top handle */}
              <path d="M 9 7 V 4.5 C 9 4 9.5 3.5 10 3.5 h 4 c 0.5 0 1 0.5 1 1 V 7" />
            </motion.g>

            {/* Body */}
            <path d="M 5.5 7 v 10.5 c 0 2 1.5 3.5 3.5 3.5 h 6 c 2 0 3.5 -1.5 3.5 -3.5 V 7" />

            {/* Inner vertical lines (slots) */}
            <line x1="10" y1="12" x2="10" y2="17" />
            <line x1="14" y1="12" x2="14" y2="17" />
          </motion.g>
        </motion.svg>
      </span>
    );
  }
);

AnimatedTrashIcon.displayName = "AnimatedTrashIcon";
export default AnimatedTrashIcon;

/**
 * Animated Trash Button — Complete button with realistic hover pre-opening ("ready to delete")
 * and click particle eating animation before executing deletion.
 */
export function AnimatedTrashButton({
  onDelete,
  onClick,
  iconSize = 15,
  className = "",
  children,
  disabled,
  type = "button",
  onPointerEnter,
  onPointerLeave,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  onDelete?: () => void | Promise<void>;
  iconSize?: number;
}) {
  const iconRef = useRef<AnimatedTrashIconHandle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePointerEnter = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled || isDeleting) return;
    if (e.pointerType === "mouse") {
      iconRef.current?.openLid();
    }
    if (onPointerEnter) onPointerEnter(e);
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled || isDeleting) return;
    iconRef.current?.closeLid();
    if (onPointerLeave) onPointerLeave(e);
  };

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || isDeleting) return;
    setIsDeleting(true);

    // 1. Play the complete realistic eating animation (~750ms)
    if (iconRef.current) {
      await iconRef.current.play();
    } else {
      await new Promise((r) => setTimeout(r, 750));
    }

    // 2. Call deletion callback ONLY AFTER animation finishes
    if (onDelete) {
      await onDelete();
    } else if (onClick) {
      onClick(e);
    }

    setIsDeleting(false);
  };

  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || isDeleting}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      className={`${className} ${isDeleting ? "pointer-events-none opacity-90" : ""}`}
    >
      <AnimatedTrashIcon
        ref={iconRef}
        size={iconSize}
        disableHover={true} // Controlled by the button parent
      />
      {children}
    </button>
  );
}
