"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";

import { AnimatedCounter } from "@/components/common/animated-counter";
import { PanelCard } from "@/components/panel/panel-card";
import { useRoadmap } from "@/hooks/use-roadmap";
import { cn, todayISO, weekdayLabel } from "@/lib/utils";

/**
 * Current streak, plus the last 14 days as a contribution-style strip.
 *
 * The number alone is a claim; the strip is the evidence. Today gets a ring so
 * the eye lands on the day the user can still act on.
 */
export function StreakCard() {
  const { streak, longestStreak, activity } = useRoadmap();
  const today = todayISO();

  const recent = activity.slice(-14);
  const max = Math.max(...recent.map((d) => d.tasksCompleted), 1);

  return (
    <PanelCard title="Current streak" icon={Flame}>
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <motion.span
            // A quick pop on mount draws the eye to the number that changes daily.
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 14 }}
            className="text-3xl font-semibold tabular-nums tracking-tight text-warning"
          >
            <AnimatedCounter value={streak} />
          </motion.span>
          <span className="text-sm text-muted-foreground">
            {streak === 1 ? "day" : "days"}
          </span>
        </div>

        <div className="text-right">
          <p className="font-mono text-sm tabular-nums">{longestStreak}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Longest
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-end gap-1" role="img" aria-label={`Activity for the last 14 days. Current streak ${streak} days.`}>
        {recent.map((day) => {
          const isToday = day.date === today;
          const active = day.tasksCompleted > 0;
          // Intensity encodes volume; a flat bar for "any activity" would throw
          // away information the data already has.
          const intensity = active ? 0.35 + (day.tasksCompleted / max) * 0.65 : 0;

          return (
            <div
              key={day.date}
              className={cn(
                "relative h-8 flex-1 overflow-hidden rounded-md bg-secondary/60 transition-transform hover:scale-110",
                isToday && "ring-1 ring-warning/60",
              )}
              title={`${weekdayLabel(day.date)}: ${day.tasksCompleted} completed`}
            >
              {active && (
                <motion.span
                  className="absolute inset-x-0 bottom-0 rounded-md bg-warning"
                  initial={{ height: 0 }}
                  animate={{ height: `${intensity * 100}%` }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{ opacity: 0.35 + intensity * 0.65 }}
                />
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-2 text-[10px] text-muted-foreground">Last 14 days</p>
    </PanelCard>
  );
}
