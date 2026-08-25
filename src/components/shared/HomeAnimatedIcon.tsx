"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { motion, useAnimation } from "motion/react";

export interface HomeAnimatedIconHandle {
  trigger: () => void;
}

export interface HomeAnimatedIconProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export const HomeAnimatedIcon = forwardRef<HomeAnimatedIconHandle, HomeAnimatedIconProps>(
  ({ size = 18, strokeWidth = 1.75, className = "" }, ref) => {
    const roofControls = useAnimation();
    const baseControls = useAnimation();
    const doorControls = useAnimation();
    const [isAnimating, setIsAnimating] = useState(false);

    useImperativeHandle(ref, () => ({
      trigger: async () => {
        if (isAnimating) return;
        setIsAnimating(true);

        roofControls.set({ pathLength: 0, opacity: 0 });
        baseControls.set({ pathLength: 0, opacity: 0 });
        doorControls.set({ pathLength: 0, opacity: 0 });

        roofControls.start({
          pathLength: 1,
          opacity: 1,
          transition: {
            pathLength: { duration: 0.3, ease: "easeOut" },
            opacity: { duration: 0.01 },
          },
        });

        baseControls.start({
          pathLength: 1,
          opacity: 1,
          transition: {
            pathLength: { duration: 0.35, ease: "easeOut", delay: 0.2 },
            opacity: { duration: 0.01, delay: 0.2 },
          },
        });

        await doorControls.start({
          pathLength: 1,
          opacity: 1,
          transition: {
            pathLength: { duration: 0.3, ease: "easeOut", delay: 0.45 },
            opacity: { duration: 0.01, delay: 0.45 },
          },
        });

        setIsAnimating(false);
      },
    }));

    return (
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        shapeRendering="geometricPrecision"
        style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
        className={`transition-transform duration-200 group-hover:scale-105 ${className}`}
      >
        {/* Roof */}
        <motion.path
          d="M 2 11 L 12 2 L 22 11"
          initial={{ pathLength: 1, opacity: 1 }}
          animate={roofControls}
        />
        {/* Base walls */}
        <motion.path
          d="M 4 11 V 20 C 4 21.1 4.9 22 6 22 H 18 C 19.1 22 20 21.1 20 20 V 11"
          initial={{ pathLength: 1, opacity: 1 }}
          animate={baseControls}
        />
        {/* Door */}
        <motion.path
          d="M 9 22 V 13 H 15 V 22"
          initial={{ pathLength: 1, opacity: 1 }}
          animate={doorControls}
        />
      </motion.svg>
    );
  }
);

HomeAnimatedIcon.displayName = "HomeAnimatedIcon";
export default HomeAnimatedIcon;
