"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Every list surface routes through this when it has nothing to show, so an
 * empty roadmap, a zero-result search and an empty notes page all fail in the
 * same visual language.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/80 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="relative">
        {/* Soft halo — makes the glyph read as lit rather than pasted on. */}
        <div className="absolute inset-0 -z-10 rounded-2xl bg-primary/20 blur-2xl" />
        <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-secondary/60">
          <Icon className="size-5 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-1">
        <p className="font-semibold">{title}</p>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>

      {action}
    </motion.div>
  );
}
