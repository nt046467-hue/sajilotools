"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { motion, useAnimation } from "motion/react";
import { Braces } from "lucide-react";

export interface CategoryAnimatedIconHandle {
  trigger: () => void;
}

interface CategoryAnimatedIconProps {
  categoryName: string;
  size?: number;
}

// 1. PDF Tools Animated Icon
const PdfAnimatedIcon = forwardRef<CategoryAnimatedIconHandle, { size: number }>(
  ({ size }, ref) => {
    const outlineControls = useAnimation();
    const foldControls = useAnimation();
    const line1Controls = useAnimation();
    const line2Controls = useAnimation();
    const line3Controls = useAnimation();
    const [isAnimating, setIsAnimating] = useState(false);

    useImperativeHandle(ref, () => ({
      trigger: async () => {
        if (isAnimating) return;
        setIsAnimating(true);

        const controls = [outlineControls, foldControls, line1Controls, line2Controls, line3Controls];
        controls.forEach((c) => c.set({ pathLength: 0, opacity: 0 }));

        outlineControls.start({
          pathLength: 1,
          opacity: 1,
          transition: { pathLength: { duration: 0.45, ease: "easeOut" }, opacity: { duration: 0.01 } },
        });

        foldControls.start({
          pathLength: 1,
          opacity: 1,
          transition: { pathLength: { duration: 0.25, ease: "easeOut", delay: 0.25 }, opacity: { duration: 0.01, delay: 0.25 } },
        });

        const lineDuration = 0.25;
        line1Controls.start({
          pathLength: 1,
          opacity: 1,
          transition: { pathLength: { duration: lineDuration, ease: "easeOut", delay: 0.3 }, opacity: { duration: 0.01, delay: 0.3 } },
        });
        line2Controls.start({
          pathLength: 1,
          opacity: 1,
          transition: { pathLength: { duration: lineDuration, ease: "easeOut", delay: 0.38 }, opacity: { duration: 0.01, delay: 0.38 } },
        });
        await line3Controls.start({
          pathLength: 1,
          opacity: 1,
          transition: { pathLength: { duration: lineDuration, ease: "easeOut", delay: 0.46 }, opacity: { duration: 0.01, delay: 0.46 } },
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
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        shapeRendering="geometricPrecision"
        style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
        className="transition-transform duration-200 group-hover:scale-105"
      >
        {/* Document Outline */}
        <motion.path
          d="M 14.5 2 H 6 a 2 2 0 0 0 -2 2 v 16 a 2 2 0 0 0 2 2 h 12 a 2 2 0 0 0 2 -2 V 7.5 L 14.5 2 z"
          initial={{ pathLength: 1, opacity: 1 }}
          animate={outlineControls}
        />
        {/* Folded Corner */}
        <motion.path
          d="M 14 2 v 4 a 2 2 0 0 0 2 2 h 4"
          initial={{ pathLength: 1, opacity: 1 }}
          animate={foldControls}
        />
        {/* Text Lines */}
        <motion.path
          d="M 8 11 h 8"
          initial={{ pathLength: 1, opacity: 1 }}
          animate={line1Controls}
        />
        <motion.path
          d="M 8 15 h 8"
          initial={{ pathLength: 1, opacity: 1 }}
          animate={line2Controls}
        />
        {/* Shorter last line */}
        <motion.path
          d="M 8 19 h 5"
          initial={{ pathLength: 1, opacity: 1 }}
          animate={line3Controls}
        />
      </motion.svg>
    );
  }
);
PdfAnimatedIcon.displayName = "PdfAnimatedIcon";

// 2. Image Processing Animated Icon
const ImageAnimatedIcon = forwardRef<CategoryAnimatedIconHandle, { size: number }>(
  ({ size }, ref) => {
    const frameControls = useAnimation();
    const mountainControls = useAnimation();
    const sunControls = useAnimation();
    const [isAnimating, setIsAnimating] = useState(false);

    useImperativeHandle(ref, () => ({
      trigger: async () => {
        if (isAnimating) return;
        setIsAnimating(true);

        const controls = [frameControls, mountainControls, sunControls];
        controls.forEach((c) => c.set({ pathLength: 0, opacity: 0 }));

        frameControls.start({
          pathLength: 1,
          opacity: 1,
          transition: { pathLength: { duration: 0.45, ease: "easeOut" }, opacity: { duration: 0.01 } },
        });

        mountainControls.start({
          pathLength: 1,
          opacity: 1,
          transition: { pathLength: { duration: 0.35, ease: "easeOut", delay: 0.3 }, opacity: { duration: 0.01, delay: 0.3 } },
        });

        await sunControls.start({
          pathLength: 1,
          opacity: 1,
          transition: { pathLength: { duration: 0.28, ease: "easeOut", delay: 0.55 }, opacity: { duration: 0.01, delay: 0.55 } },
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
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        shapeRendering="geometricPrecision"
        style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
        className="transition-transform duration-200 group-hover:scale-105"
      >
        {/* Frame */}
        <motion.rect
          width="18"
          height="18"
          x="3"
          y="3"
          rx="2"
          ry="2"
          initial={{ pathLength: 1, opacity: 1 }}
          animate={frameControls}
        />
        {/* Mountains */}
        <motion.path
          d="m 21 15 l -3.086 -3.086 a 2 2 0 0 0 -2.828 0 L 6 21"
          initial={{ pathLength: 1, opacity: 1 }}
          animate={mountainControls}
        />
        {/* Sun */}
        <motion.circle
          cx="9"
          cy="9"
          r="2"
          initial={{ pathLength: 1, opacity: 1 }}
          animate={sunControls}
        />
      </motion.svg>
    );
  }
);
ImageAnimatedIcon.displayName = "ImageAnimatedIcon";

// 3. Developer Suite Animated Icon
const DevAnimatedIcon = forwardRef<CategoryAnimatedIconHandle, { size: number }>(
  ({ size }, ref) => {
    const bracketControls = useAnimation();
    const row1Controls = useAnimation();
    const row2Controls = useAnimation();
    const row3Controls = useAnimation();
    const row4Controls = useAnimation();
    const [isAnimating, setIsAnimating] = useState(false);

    useImperativeHandle(ref, () => ({
      trigger: async () => {
        if (isAnimating) return;
        setIsAnimating(true);

        const controls = [bracketControls, row1Controls, row2Controls, row3Controls, row4Controls];
        controls.forEach((c) => c.set({ pathLength: 0, opacity: 0 }));

        bracketControls.start({
          pathLength: 1,
          opacity: 1,
          transition: { pathLength: { duration: 0.45, ease: "easeOut" }, opacity: { duration: 0.01 } },
        });

        const lineDuration = 0.22;
        row1Controls.start({
          pathLength: 1,
          opacity: 1,
          transition: { pathLength: { duration: lineDuration, ease: "easeOut", delay: 0.25 }, opacity: { duration: 0.01, delay: 0.25 } },
        });
        row2Controls.start({
          pathLength: 1,
          opacity: 1,
          transition: { pathLength: { duration: lineDuration, ease: "easeOut", delay: 0.33 }, opacity: { duration: 0.01, delay: 0.33 } },
        });
        row3Controls.start({
          pathLength: 1,
          opacity: 1,
          transition: { pathLength: { duration: lineDuration, ease: "easeOut", delay: 0.41 }, opacity: { duration: 0.01, delay: 0.41 } },
        });
        await row4Controls.start({
          pathLength: 1,
          opacity: 1,
          transition: { pathLength: { duration: lineDuration, ease: "easeOut", delay: 0.49 }, opacity: { duration: 0.01, delay: 0.49 } },
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
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        shapeRendering="geometricPrecision"
        style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
        className="transition-transform duration-200 group-hover:scale-105"
      >
        {/* Left Bracket */}
        <motion.path
          d="M 8 4 C 5.5 4 4.5 5.5 4.5 8 C 4.5 10 3 11 1.5 12 C 3 13 4.5 14 4.5 16 C 4.5 18.5 5.5 20 8 20"
          initial={{ pathLength: 1, opacity: 1 }}
          animate={bracketControls}
        />
        {/* Right Bracket */}
        <motion.path
          d="M 16 4 C 18.5 4 19.5 5.5 19.5 8 C 19.5 10 21 11 22.5 12 C 21 13 19.5 14 19.5 16 C 19.5 18.5 18.5 20 16 20"
          initial={{ pathLength: 1, opacity: 1 }}
          animate={bracketControls}
        />
        {/* Rows */}
        <motion.path d="M 8.5 7 h 0.1 M 11 7 h 3" initial={{ pathLength: 1, opacity: 1 }} animate={row1Controls} />
        <motion.path d="M 8.5 10.5 h 0.1 M 11 10.5 h 4.5" initial={{ pathLength: 1, opacity: 1 }} animate={row2Controls} />
        <motion.path d="M 8.5 14 h 0.1 M 11 14 h 3.5" initial={{ pathLength: 1, opacity: 1 }} animate={row3Controls} />
        <motion.path d="M 8.5 17.5 h 2.5 M 13.5 17.5 h 0.1 M 16 17.5 h 0.1" initial={{ pathLength: 1, opacity: 1 }} animate={row4Controls} />
      </motion.svg>
    );
  }
);
DevAnimatedIcon.displayName = "DevAnimatedIcon";

// 4. Finance & Tax Animated Icon
const FinanceAnimatedIcon = forwardRef<CategoryAnimatedIconHandle, { size: number }>(
  ({ size }, ref) => {
    const frameControls = useAnimation();
    const screenControls = useAnimation();
    const row1Controls = useAnimation();
    const row2Controls = useAnimation();
    const row3Controls = useAnimation();
    const [isAnimating, setIsAnimating] = useState(false);

    useImperativeHandle(ref, () => ({
      trigger: async () => {
        if (isAnimating) return;
        setIsAnimating(true);

        const controls = [frameControls, screenControls, row1Controls, row2Controls, row3Controls];
        controls.forEach((c) => c.set({ pathLength: 0, opacity: 0 }));

        frameControls.start({
          pathLength: 1,
          opacity: 1,
          transition: { pathLength: { duration: 0.45, ease: "easeOut" }, opacity: { duration: 0.01 } },
        });

        screenControls.start({
          pathLength: 1,
          opacity: 1,
          transition: { pathLength: { duration: 0.25, ease: "easeOut", delay: 0.25 }, opacity: { duration: 0.01, delay: 0.25 } },
        });

        row1Controls.start({
          pathLength: 1,
          opacity: 1,
          transition: { pathLength: { duration: 0.18, ease: "easeOut", delay: 0.32 }, opacity: { duration: 0.01, delay: 0.32 } },
        });
        row2Controls.start({
          pathLength: 1,
          opacity: 1,
          transition: { pathLength: { duration: 0.18, ease: "easeOut", delay: 0.4 }, opacity: { duration: 0.01, delay: 0.4 } },
        });
        await row3Controls.start({
          pathLength: 1,
          opacity: 1,
          transition: { pathLength: { duration: 0.18, ease: "easeOut", delay: 0.48 }, opacity: { duration: 0.01, delay: 0.48 } },
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
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        shapeRendering="geometricPrecision"
        style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
        className="transition-transform duration-200 group-hover:scale-105"
      >
        <motion.rect
          x="5"
          y="3"
          width="14"
          height="18"
          rx="3"
          initial={{ pathLength: 1, opacity: 1 }}
          animate={frameControls}
        />
        <motion.path
          d="M 8 7 h 8"
          initial={{ pathLength: 1, opacity: 1 }}
          animate={screenControls}
        />
        <motion.path
          d="M 8 11 h 0.01 M 12 11 h 0.01 M 16 11 h 0.01"
          initial={{ pathLength: 1, opacity: 1 }}
          animate={row1Controls}
        />
        <motion.path
          d="M 8 14 h 0.01 M 12 14 h 0.01 M 16 14 v 3"
          initial={{ pathLength: 1, opacity: 1 }}
          animate={row2Controls}
        />
        <motion.path
          d="M 8 17 h 0.01 M 12 17 h 0.01"
          initial={{ pathLength: 1, opacity: 1 }}
          animate={row3Controls}
        />
      </motion.svg>
    );
  }
);
FinanceAnimatedIcon.displayName = "FinanceAnimatedIcon";

// 5. Text & Writing Animated Icon
const TextAnimatedIcon = forwardRef<CategoryAnimatedIconHandle, { size: number }>(
  ({ size }, ref) => {
    const line1Controls = useAnimation();
    const line2Controls = useAnimation();
    const line3Controls = useAnimation();
    const [isAnimating, setIsAnimating] = useState(false);

    useImperativeHandle(ref, () => ({
      trigger: async () => {
        if (isAnimating) return;
        setIsAnimating(true);

        const controls = [line1Controls, line2Controls, line3Controls];
        controls.forEach((c) => c.set({ pathLength: 0, opacity: 0 }));

        line1Controls.start({
          pathLength: 1,
          opacity: 1,
          transition: { pathLength: { duration: 0.25, ease: "easeOut" }, opacity: { duration: 0.01 } },
        });
        line2Controls.start({
          pathLength: 1,
          opacity: 1,
          transition: { pathLength: { duration: 0.25, ease: "easeOut", delay: 0.12 }, opacity: { duration: 0.01, delay: 0.12 } },
        });
        await line3Controls.start({
          pathLength: 1,
          opacity: 1,
          transition: { pathLength: { duration: 0.25, ease: "easeOut", delay: 0.24 }, opacity: { duration: 0.01, delay: 0.24 } },
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
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        shapeRendering="geometricPrecision"
        style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
        className="transition-transform duration-200 group-hover:scale-105"
      >
        <motion.path
          d="M 5 8 h 14"
          initial={{ pathLength: 1, opacity: 1 }}
          animate={line1Controls}
        />
        <motion.path
          d="M 5 12 h 9"
          initial={{ pathLength: 1, opacity: 1 }}
          animate={line2Controls}
        />
        <motion.path
          d="M 5 16 h 12"
          initial={{ pathLength: 1, opacity: 1 }}
          animate={line3Controls}
        />
      </motion.svg>
    );
  }
);
TextAnimatedIcon.displayName = "TextAnimatedIcon";

// 6. Everyday Utilities Animated Icon
const EverydayAnimatedIcon = forwardRef<CategoryAnimatedIconHandle, { size: number }>(
  ({ size }, ref) => {
    const outlineControls = useAnimation();
    const y1Controls = useAnimation();
    const y2Controls = useAnimation();
    const [isAnimating, setIsAnimating] = useState(false);

    useImperativeHandle(ref, () => ({
      trigger: async () => {
        if (isAnimating) return;
        setIsAnimating(true);

        const controls = [outlineControls, y1Controls, y2Controls];
        controls.forEach((c) => c.set({ pathLength: 0, opacity: 0 }));

        outlineControls.start({
          pathLength: 1,
          opacity: 1,
          transition: { pathLength: { duration: 0.5, ease: "easeOut" }, opacity: { duration: 0.01 } },
        });

        y1Controls.start({
          pathLength: 1,
          opacity: 1,
          transition: { pathLength: { duration: 0.32, ease: "easeOut", delay: 0.32 }, opacity: { duration: 0.01, delay: 0.32 } },
        });

        await y2Controls.start({
          pathLength: 1,
          opacity: 1,
          transition: { pathLength: { duration: 0.32, ease: "easeOut", delay: 0.48 }, opacity: { duration: 0.01, delay: 0.48 } },
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
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        shapeRendering="geometricPrecision"
        style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
        className="transition-transform duration-200 group-hover:scale-105"
      >
        {/* Outer boundary */}
        <motion.path
          d="M 12 3 L 16 5.5 L 16 10.5 L 20 13 L 20 18 L 16 20.5 L 12 18 L 8 20.5 L 4 18 L 4 13 L 8 10.5 L 8 5.5 Z"
          initial={{ pathLength: 1, opacity: 1 }}
          animate={outlineControls}
        />
        {/* Top Y-shape */}
        <motion.path
          d="M 8 5.5 L 12 8 L 16 5.5 M 12 8 L 12 13"
          initial={{ pathLength: 1, opacity: 1 }}
          animate={y1Controls}
        />
        {/* Bottom zig-zag and vertical drops */}
        <motion.path
          d="M 4 13 L 8 15.5 L 12 13 L 16 15.5 L 20 13 M 8 15.5 L 8 20.5 M 12 13 L 12 18 M 16 15.5 L 16 20.5"
          initial={{ pathLength: 1, opacity: 1 }}
          animate={y2Controls}
        />
      </motion.svg>
    );
  }
);
EverydayAnimatedIcon.displayName = "EverydayAnimatedIcon";

// 7. Nepal Tools Animated Icon
const NepalAnimatedIcon = forwardRef<CategoryAnimatedIconHandle, { size: number }>(
  ({ size }, ref) => {
    const pinControls = useAnimation();
    const dotControls = useAnimation();
    const [isAnimating, setIsAnimating] = useState(false);

    useImperativeHandle(ref, () => ({
      trigger: async () => {
        if (isAnimating) return;
        setIsAnimating(true);

        pinControls.set({ pathLength: 0, opacity: 0 });
        dotControls.set({ scale: 0, opacity: 0 });

        pinControls.start({
          pathLength: 1,
          opacity: 1,
          transition: { pathLength: { duration: 0.45, ease: "easeOut" }, opacity: { duration: 0.01 } },
        });

        await dotControls.start({
          scale: 1,
          opacity: 1,
          transition: { duration: 0.28, ease: "backOut", delay: 0.3 },
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
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        shapeRendering="geometricPrecision"
        style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
        className="transition-transform duration-200 group-hover:scale-105"
      >
        <motion.path
          d="M 20 10 c 0 4.993 -5.539 10.193 -7.399 11.799 a 1 1 0 0 1 -1.202 0 C 9.539 20.193 4 14.993 4 10 a 8 8 0 0 1 16 0"
          initial={{ pathLength: 1, opacity: 1 }}
          animate={pinControls}
        />
        <motion.circle
          cx="12"
          cy="10"
          r="3"
          initial={{ scale: 1, opacity: 1 }}
          animate={dotControls}
        />
      </motion.svg>
    );
  }
);
NepalAnimatedIcon.displayName = "NepalAnimatedIcon";

// Main Dispatcher Component
export const CategoryAnimatedIcon = forwardRef<CategoryAnimatedIconHandle, CategoryAnimatedIconProps>(
  ({ categoryName, size = 18 }, ref) => {
    const norm = (categoryName || "").toLowerCase().trim();
    if (norm.includes("pdf")) return <PdfAnimatedIcon ref={ref} size={size} />;
    if (norm.includes("image")) return <ImageAnimatedIcon ref={ref} size={size} />;
    if (norm.includes("dev")) return <DevAnimatedIcon ref={ref} size={size} />;
    if (norm.includes("finance") || norm.includes("tax")) return <FinanceAnimatedIcon ref={ref} size={size} />;
    if (norm.includes("text") || norm.includes("writing")) return <TextAnimatedIcon ref={ref} size={size} />;
    if (norm.includes("nepal")) return <NepalAnimatedIcon ref={ref} size={size} />;
    if (norm.includes("everyday") || norm.includes("util")) return <EverydayAnimatedIcon ref={ref} size={size} />;
    return null;
  }
);
CategoryAnimatedIcon.displayName = "CategoryAnimatedIcon";
