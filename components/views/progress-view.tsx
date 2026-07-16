"use client";

import { motion } from "framer-motion";
import { Activity, Clock, Flame, TrendingUp } from "lucide-react";

import { AnimatedCounter } from "@/components/common/animated-counter";
import { PageHeader } from "@/components/common/page-header";
import { LearningTimeChart } from "@/components/charts/learning-time-chart";
import { WeeklyProgressChart } from "@/components/charts/weekly-progress-chart";
import { PanelCard } from "@/components/panel/panel-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useHydrated } from "@/hooks/use-hydrated";
import { useRoadmap } from "@/hooks/use-roadmap";
import { ACCENTS } from "@/lib/constants";
import { cardHover, fadeUp, staggerContainer } from "@/lib/motion";
import { cn, formatHours } from "@/lib/utils";

/**
 * Learning Progress — the per-track breakdown.
 *
 * Statistics answers "how am I trending"; this answers "which track is lagging".
 * So it leads with a ranked grid of tracks rather than a chart: the comparison
 * *is* the content.
 */
export function ProgressView() {
  const { categories, week, month, timeByCategory, stats, streak } = useRoadmap();
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-12 w-72" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  const monthTotal = month.reduce((sum, d) => sum + d.tasksCompleted, 0);
  const monthHours = month.reduce((sum, d) => sum + d.hoursLogged, 0);
  const ranked = [...categories].filter((c) => c.total > 0).sort((a, b) => b.progress - a.progress);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        eyebrow="Signal"
        title="Learning Progress"
        description="Where the hours actually went, and which track is quietly falling behind."
      />

      <motion.div
        variants={staggerContainer(0.07)}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-3"
      >
        <HeadlineStat
          icon={Activity}
          label="Completed in 30 days"
          value={monthTotal}
          hint="tasks"
          accent="green"
        />
        <HeadlineStat
          icon={Clock}
          label="Hours logged in 30 days"
          value={Math.round(monthHours)}
          hint="hours"
          accent="violet"
        />
        <HeadlineStat
          icon={Flame}
          label="Current streak"
          value={streak}
          hint="days"
          accent="orange"
        />
      </motion.div>

      <motion.div
        variants={staggerContainer(0.07)}
        initial="hidden"
        animate="show"
        className="grid gap-4 lg:grid-cols-2"
      >
        <PanelCard
          title="Weekly progress"
          icon={TrendingUp}
          action={
            <span className="font-mono text-xs text-muted-foreground">
              last 7 days
            </span>
          }
        >
          <WeeklyProgressChart data={week} height={220} />
        </PanelCard>

        <PanelCard
          title="Learning time by track"
          icon={Clock}
          action={
            <span className="font-mono text-xs text-muted-foreground">
              {formatHours(stats.completedHours)} earned
            </span>
          }
        >
          <LearningTimeChart data={timeByCategory} height={220} />
        </PanelCard>
      </motion.div>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-tight">Track breakdown</h2>

        <motion.div
          variants={staggerContainer(0.05)}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {ranked.map((data) => {
            const accent = ACCENTS[data.category.accent];
            const Icon = data.category.icon;

            return (
              <motion.div key={data.category.id} variants={fadeUp} {...cardHover}>
                <Card className="group h-full p-5">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-xl border",
                        accent.softBg,
                        accent.border,
                      )}
                    >
                      <Icon className={cn("size-4", accent.text)} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium">
                        {data.category.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        {data.completed}/{data.total} tasks · {formatHours(data.hours)}
                      </p>
                    </div>

                    <Badge
                      variant={data.progress === 100 ? "green" : data.category.accent}
                      size="sm"
                      className="font-mono"
                    >
                      {data.progress}%
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Progress
                      value={data.progress}
                      gradient={
                        data.progress === 100 ? "from-success to-success" : accent.gradient
                      }
                      className="h-1.5"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      {data.progress === 100
                        ? "Track complete."
                        : data.progress === 0
                          ? "Not started yet."
                          : `${100 - data.progress}% remaining`}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </section>
    </div>
  );
}

function HeadlineStat({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: typeof Activity;
  label: string;
  value: number;
  hint: string;
  accent: keyof typeof ACCENTS;
}) {
  const tokens = ACCENTS[accent];

  return (
    <motion.div variants={fadeUp} {...cardHover}>
      <Card className="flex items-center gap-4 p-5">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl border",
            tokens.softBg,
            tokens.border,
          )}
        >
          <Icon className={cn("size-5", tokens.text)} />
        </div>

        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <AnimatedCounter
              value={value}
              className="text-2xl font-semibold tabular-nums tracking-tight"
            />
            <span className="text-xs text-muted-foreground">{hint}</span>
          </div>
          <p className="truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </Card>
    </motion.div>
  );
}
