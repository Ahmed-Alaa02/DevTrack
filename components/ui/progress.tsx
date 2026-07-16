"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number;
  /** Tailwind gradient stops, e.g. `"from-violet to-indigo"`. */
  gradient?: string;
  /** Adds an animated sheen — reserved for the hero "overall progress" bar. */
  shimmer?: boolean;
}

/**
 * The bar animates its own width with Framer Motion (spring, not linear) so a
 * progress change reads as physical movement rather than a jump cut.
 */
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value = 0, gradient = "from-violet to-indigo", shimmer, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    value={value}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-secondary/80",
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator asChild>
      <motion.div
        className={cn(
          "relative h-full rounded-full bg-gradient-to-r",
          gradient,
        )}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 20, mass: 0.6 }}
      >
        {shimmer && value > 0 && (
          <span className="absolute inset-0 overflow-hidden rounded-full">
            <span className="absolute inset-y-0 -left-full w-full animate-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          </span>
        )}
      </motion.div>
    </ProgressPrimitive.Indicator>
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
