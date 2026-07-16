"use client";

import { motion } from "framer-motion";
import {
  CircleDashed,
  CircleDot,
  CheckCircle2,
  Target,
  type LucideIcon,
} from "lucide-react";

import { AnimatedCounter } from "@/components/common/animated-counter";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useHydrated } from "@/hooks/use-hydrated";
import { useRoadmap } from "@/hooks/use-roadmap";
import { ACCENTS } from "@/lib/constants";
import { cardHover, fadeUp, staggerContainer } from "@/lib/motion";
import { cn, percent } from "@/lib/utils";
import type { AccentColor } from "@/types";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  accent: AccentColor;
  /** Share of the total, 0–100. Drawn as the card's footer bar. */
  share: number;
  hint: string;
}

function StatCard({ label, value, icon: Icon, accent, share, hint }: StatCardProps) {
  const tokens = ACCENTS[accent];

  return (
    <motion.div variants={fadeUp} {...cardHover}>
      <Card className="group relative overflow-hidden p-5">
        {/* Accent bloom, revealed on hover — the card is calm at rest and
            responds to attention. */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute -right-10 -top-10 size-28 rounded-full opacity-[0.06] blur-2xl transition-opacity duration-500 group-hover:opacity-[0.16]",
            tokens.bg,
          )}
        />

        <div className="relative space-y-4">
          <div className="flex items-start justify-between">
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-xl border",
                tokens.softBg,
                tokens.border,
              )}
            >
              <Icon className={cn("size-4", tokens.text)} />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
              {hint}
            </span>
          </div>

          <div className="space-y-1">
            <AnimatedCounter
              value={value}
              className="block text-3xl font-semibold tracking-tight tabular-nums"
            />
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>

          <Progress value={share} gradient={tokens.gradient} className="h-1" />
        </div>
      </Card>
    </motion.div>
  );
}

/**
 * The four-number summary at the top of the dashboard.
 *
 * Each card's bar shows that bucket's *share of the total*, which turns four
 * unrelated integers into a readable distribution at a glance.
 */
export function StatCards() {
  const { stats } = useRoadmap();
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[148px] rounded-2xl" />
        ))}
      </div>
    );
  }

  const cards: StatCardProps[] = [
    {
      label: "Total goals",
      value: stats.total,
      icon: Target,
      accent: "violet",
      share: 100,
      hint: `${stats.totalHours}h planned`,
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      accent: "green",
      share: percent(stats.completed, stats.total),
      hint: `${stats.completionRate}%`,
    },
    {
      label: "In progress",
      value: stats.inProgress,
      icon: CircleDot,
      accent: "orange",
      share: percent(stats.inProgress, stats.total),
      hint: "active",
    },
    {
      label: "Not started",
      value: stats.notStarted,
      icon: CircleDashed,
      accent: "indigo",
      share: percent(stats.notStarted, stats.total),
      hint: "queued",
    },
  ];

  return (
    <motion.div
      variants={staggerContainer(0.07)}
      initial="hidden"
      animate="show"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </motion.div>
  );
}
