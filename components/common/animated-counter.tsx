"use client";

import * as React from "react";
import { animate, useInView, useMotionValue, useTransform, motion } from "framer-motion";

import { usePrefersReducedMotion } from "@/hooks/use-media-query";

interface AnimatedCounterProps {
  value: number;
  /** Decimal places to render. */
  decimals?: number;
  suffix?: string;
  prefix?: string;
  durationMs?: number;
  className?: string;
}

/**
 * Counts up to `value` when it scrolls into view, and re-animates from the
 * previous number whenever the value changes — so completing a task visibly
 * ticks the stat card rather than silently swapping a digit.
 *
 * The tween runs on a MotionValue, which updates the DOM outside React's render
 * cycle: sixty frames of animation cost zero re-renders.
 */
export function AnimatedCounter({
  value,
  decimals = 0,
  suffix = "",
  prefix = "",
  durationMs = 900,
  className,
}: AnimatedCounterProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reducedMotion = usePrefersReducedMotion();

  const count = useMotionValue(0);
  const text = useTransform(count, (latest) =>
    `${prefix}${latest.toFixed(decimals)}${suffix}`,
  );

  React.useEffect(() => {
    if (!inView) return;

    if (reducedMotion) {
      count.set(value);
      return;
    }

    const controls = animate(count, value, {
      duration: durationMs / 1000,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [inView, value, durationMs, count, reducedMotion]);

  return (
    <span ref={ref} className={className}>
      {/* The visible value is driven by MotionValue; the accessible name comes
          from the aria-label so screen readers announce the final number once
          instead of every intermediate frame. */}
      <motion.span aria-hidden>{text}</motion.span>
      <span className="sr-only">{`${prefix}${value.toFixed(decimals)}${suffix}`}</span>
    </span>
  );
}
