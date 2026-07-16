"use client";

import { useCallback } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-media-query";

/** Brand palette for the burst — violet, indigo, green, blue. */
const CONFETTI_COLORS = ["#8B5CF6", "#6366F1", "#22C55E", "#3B82F6", "#A78BFA"];

/**
 * Celebration burst fired when a task is completed.
 *
 * `canvas-confetti` touches `document` at import time, so it's loaded lazily on
 * first use — importing it at module scope would break the server render.
 * The burst originates from the element that triggered it, so the celebration
 * is visually anchored to the checkbox the user actually clicked.
 */
export function useConfetti() {
  const reducedMotion = usePrefersReducedMotion();

  return useCallback(
    async (origin?: HTMLElement | null) => {
      if (reducedMotion) return;

      const confetti = (await import("canvas-confetti")).default;

      let x = 0.5;
      let y = 0.5;

      if (origin) {
        const rect = origin.getBoundingClientRect();
        x = (rect.left + rect.width / 2) / window.innerWidth;
        y = (rect.top + rect.height / 2) / window.innerHeight;
      }

      const shared = {
        origin: { x, y },
        colors: CONFETTI_COLORS,
        disableForReducedMotion: true,
        scalar: 0.9,
        zIndex: 100,
      };

      // Two staggered bursts read as a "pop" rather than a single flat spray.
      void confetti({ ...shared, particleCount: 60, spread: 70, startVelocity: 32 });
      window.setTimeout(() => {
        void confetti({ ...shared, particleCount: 30, spread: 100, startVelocity: 22, decay: 0.92 });
      }, 110);
    },
    [reducedMotion],
  );
}
