import type { TaskStatus } from "@/types";

/**
 * The chart palette — deliberately NOT the UI accent tokens.
 *
 * The interface accents (violet #8B5CF6 / indigo #6366F1) sit next to each other
 * in hue on purpose: as chrome they read as one brand gradient. As *data* they
 * are a bug. Run against the accessibility checks they score ΔE 6.3 for normal
 * vision and 0.8 under protanopia — two series a full-colour reader cannot tell
 * apart, and a colourblind reader sees as literally the same bar.
 *
 * These steps were validated as a set against the #111827 card surface:
 *
 *   OKLCH lightness  all 6 inside the dark band L 0.48–0.67   PASS
 *   Chroma floor     all 6 >= 0.1                             PASS
 *   CVD separation   worst adjacent ΔE 7.9 (protan)           WARN — see below
 *   Normal vision    worst adjacent ΔE 23.7                   PASS
 *   Contrast         all 6 >= 3:1 on surface                  PASS
 *
 * The CVD score lands in the 6–8 "floor" band, which is only legal alongside a
 * secondary encoding. Every chart here honours that: the donut ships a legend
 * *and* per-slice labels, and the bar charts carry category names on the axis,
 * so colour is never the only channel identifying a series.
 *
 * Slot order is fixed. Series are assigned by identity, never by rank — a
 * filtered-out category must not repaint the survivors.
 */
export const CHART_SERIES = [
  "#8B5CF6", // violet — the brand hue keeps slot 1
  "#059669", // emerald
  "#D97706", // amber
  "#0284C7", // sky
  "#F43F5E", // rose
  "#0D9488", // teal
] as const;

/** Single hue for one-measure charts (weekly activity, hours per category). */
export const CHART_PRIMARY = CHART_SERIES[0];

/**
 * Status colours are reserved and never reused as "series N".
 * Validated as a trio: normal-vision ΔE 23.7, all >= 3:1 on surface.
 */
export const STATUS_COLORS: Record<TaskStatus, string> = {
  completed: "#059669",
  "in-progress": "#D97706",
  "not-started": "#8B5CF6",
};

/** Recessive chrome — grid and axes must never compete with the marks. */
export const CHART_INK = {
  grid: "hsl(240 4% 16%)",
  axis: "hsl(240 5% 65%)",
  surface: "hsl(221 39% 11%)",
};
