"use client";

import { motion } from "framer-motion";

import { APP_META } from "@/lib/constants";
import { SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * The brand mark. The glyph sits on the primary gradient with a blurred copy of
 * itself behind it, which is what gives the tile its lit, tactile quality.
 */
export function Logo({ className }: { className?: string }) {
  const Icon = APP_META.icon;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <motion.div whileHover={{ rotate: -8, scale: 1.05 }} transition={SPRING} className="relative">
        <div className="absolute inset-0 rounded-xl bg-gradient-primary blur-md opacity-60" />
        <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-primary shadow-[0_2px_10px_-2px_hsl(var(--primary)/0.6)]">
          <Icon className="size-[18px] text-white" />
        </div>
      </motion.div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold leading-tight tracking-tight">
          {APP_META.name}
        </p>
        <p className="truncate text-[11px] leading-tight text-muted-foreground">
          {APP_META.tagline}
        </p>
      </div>
    </div>
  );
}
