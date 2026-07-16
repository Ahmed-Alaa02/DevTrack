"use client";

import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";

import { ThemeProvider } from "@/components/layout/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

/**
 * Every client-side provider, in one place.
 *
 * - `MotionConfig reducedMotion="user"` makes the OS accessibility setting
 *   authoritative for *all* Framer Motion in the tree, so no component has to
 *   remember to check it.
 * - `LazyMotion` + `domAnimation` swaps the full motion bundle for a ~5kb
 *   feature subset that's loaded once and shared.
 * - `TooltipProvider` at the root gives every tooltip a shared open delay, so
 *   moving between two of them doesn't re-trigger the wait.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict={false}>
        <ThemeProvider>
          <TooltipProvider delayDuration={200} skipDelayDuration={300}>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </LazyMotion>
    </MotionConfig>
  );
}
