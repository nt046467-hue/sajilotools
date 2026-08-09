import type { CSSProperties } from "react";

/**
 * Returns inline CSS custom properties for tool accent colors and background tints.
 * Read by .tool-accent-text and .tool-accent-bg classes in theme.css.
 */
export function getToolAccentStyle(
  color: string,
  darkColor: string,
  alphaLight = "18",
  alphaDark = "22"
): CSSProperties {
  return {
    "--tc-light": color,
    "--tc-dark": darkColor,
    "--tc-light-bg": color + alphaLight,
    "--tc-dark-bg": darkColor + alphaDark,
  } as CSSProperties;
}
