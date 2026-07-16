"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { AnimatedCounter } from "@/components/common/animated-counter";
import { ProgressRing } from "@/components/common/progress-ring";
import { Card } from "@/components/ui/card";
import { useRoadmap } from "@/hooks/use-roadmap";
import { MOTIVATIONS } from "@/lib/constants";
import { fadeUp } from "@/lib/motion";

/**
 * The panel's hero: overall roadmap progress as a gradient ring, wrapped in a
 * line of encouragement.
 *
 * The message is picked from the day-of-year rather than at random, so it's
 * stable across re-renders (no flicker on every keystroke in search) and still
 * changes daily. Random on mount would also mismatch between server and client.
 */
export function MotivationCard() {
  const { overall, stats, profile } = useRoadmap();

  const message = React.useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000,
    );
    return MOTIVATIONS[dayOfYear % MOTIVATIONS.length];
  }, []);

  return (
    <motion.div variants={fadeUp}>
      <Card className="relative overflow-hidden p-6">
        {/* Two offset blooms give the card depth without a background image. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-violet/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -left-10 size-40 rounded-full bg-indigo/20 blur-3xl"
        />

        <div className="relative flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-violet/25 bg-violet/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-violet">
            <Sparkles className="size-3" />
            Overall progress
          </div>

          <ProgressRing value={overall} size={148} strokeWidth={10}>
            <AnimatedCounter
              value={overall}
              suffix="%"
              className="text-3xl font-semibold tabular-nums tracking-tight"
            />
            <span className="mt-0.5 text-[11px] text-muted-foreground">
              {stats.completed} of {stats.total} done
            </span>
          </ProgressRing>

          <p className="mt-5 text-sm font-medium leading-relaxed">
            {message}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Keep going, {profile.name}.
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
