import React from "react";

export interface DeveloperSuiteIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  strokeWidth?: number | string;
}

export default function DeveloperSuiteIcon({
  size = 24,
  strokeWidth = 1.75,
  className = "",
  style,
  ...props
}: DeveloperSuiteIconProps) {
  return (
    <svg
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
      className={className}
      style={{ transform: "translateZ(0)", ...style }}
      {...props}
    >
      {/* Left Bracket */}
      <path d="M 8 4 C 5.5 4 4.5 5.5 4.5 8 C 4.5 10 3 11 1.5 12 C 3 13 4.5 14 4.5 16 C 4.5 18.5 5.5 20 8 20" />
      {/* Right Bracket */}
      <path d="M 16 4 C 18.5 4 19.5 5.5 19.5 8 C 19.5 10 21 11 22.5 12 C 21 13 19.5 14 19.5 16 C 19.5 18.5 18.5 20 16 20" />
      {/* Code Rows */}
      <path d="M 8.5 7 h 0.1 M 11 7 h 3" />
      <path d="M 8.5 10.5 h 0.1 M 11 10.5 h 4.5" />
      <path d="M 8.5 14 h 0.1 M 11 14 h 3.5" />
      <path d="M 8.5 17.5 h 2.5 M 13.5 17.5 h 0.1 M 16 17.5 h 0.1" />
    </svg>
  );
}
