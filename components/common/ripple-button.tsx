"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Button, type ButtonProps } from "@/components/ui/button";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { uid } from "@/lib/utils";

interface Ripple {
  id: string;
  x: number;
  y: number;
  size: number;
}

/**
 * A Button that emits a material-style ripple from the exact pointer position.
 *
 * Kept separate from `Button` rather than baked in: `Button` supports `asChild`,
 * and Radix's `Slot` requires exactly one child — injecting ripple spans there
 * would break every `<Button asChild><Link/></Button>` call site.
 */
export function RippleButton({
  className,
  children,
  onPointerDown,
  ...props
}: Omit<ButtonProps, "asChild">) {
  const [ripples, setRipples] = React.useState<Ripple[]>([]);
  const reducedMotion = usePrefersReducedMotion();

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    onPointerDown?.(event);
    if (reducedMotion) return;

    const rect = event.currentTarget.getBoundingClientRect();
    // Diameter must reach the furthest corner from the press point.
    const size = Math.max(rect.width, rect.height) * 2;
    setRipples((prev) => [
      ...prev,
      {
        id: uid("ripple"),
        x: event.clientX - rect.left - size / 2,
        y: event.clientY - rect.top - size / 2,
        size,
      },
    ]);
  };

  const removeRipple = (id: string) =>
    setRipples((prev) => prev.filter((r) => r.id !== id));

  return (
    <Button
      className={cn("relative overflow-hidden", className)}
      onPointerDown={handlePointerDown}
      {...props}
    >
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="pointer-events-none absolute rounded-full bg-white/25"
            style={{ left: ripple.x, top: ripple.y, width: ripple.size, height: ripple.size }}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            onAnimationComplete={() => removeRipple(ripple.id)}
          />
        ))}
      </AnimatePresence>
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </Button>
  );
}
