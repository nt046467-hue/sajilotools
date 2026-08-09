/**
 * Shared watermark positioning logic.
 * Used by both Image Watermark and PDF Watermark tools.
 * Coordinate space: top-left origin (canvas convention).
 * PDF callers should invert Y after calling this.
 */

export type WatermarkPosition =
  | "center"
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  | "left-center"
  | "right-center"
  | "tiled";

/**
 * Resolves watermark placement coordinates for a 9-point grid.
 * Returns { x, y } representing the top-left corner of the content
 * within the container, accounting for padding.
 *
 * For "tiled" position, returns { x: 0, y: 0 } — callers should
 * loop-draw at their own step interval.
 */
export function resolveWatermarkPosition(
  position: WatermarkPosition,
  containerWidth: number,
  containerHeight: number,
  contentWidth: number,
  contentHeight: number,
  paddingPx = 24
): { x: number; y: number } {
  switch (position) {
    case "top-left":
      return { x: paddingPx, y: paddingPx };
    case "top-center":
      return { x: (containerWidth - contentWidth) / 2, y: paddingPx };
    case "top-right":
      return { x: containerWidth - contentWidth - paddingPx, y: paddingPx };
    case "left-center":
      return { x: paddingPx, y: (containerHeight - contentHeight) / 2 };
    case "center":
      return {
        x: (containerWidth - contentWidth) / 2,
        y: (containerHeight - contentHeight) / 2,
      };
    case "right-center":
      return {
        x: containerWidth - contentWidth - paddingPx,
        y: (containerHeight - contentHeight) / 2,
      };
    case "bottom-left":
      return {
        x: paddingPx,
        y: containerHeight - contentHeight - paddingPx,
      };
    case "bottom-center":
      return {
        x: (containerWidth - contentWidth) / 2,
        y: containerHeight - contentHeight - paddingPx,
      };
    case "bottom-right":
      return {
        x: containerWidth - contentWidth - paddingPx,
        y: containerHeight - contentHeight - paddingPx,
      };
    case "tiled":
    default:
      return { x: 0, y: 0 };
  }
}
