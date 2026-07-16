"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { BarChart3, Clock, Flame, PieChart, Table2, Trophy } from "lucide-react";

import { AnimatedCounter } from "@/components/common/animated-counter";
import { PageHeader } from "@/components/common/page-header";
import { CompletionPieChart } from "@/components/charts/completion-pie-chart";
import { LearningTimeChart } from "@/components/charts/learning-time-chart";
import { WeeklyProgressChart } from "@/components/charts/weekly-progress-chart";
import { PanelCard } from "@/components/panel/panel-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useHydrated } from "@/hooks/use-hydrated";
import { useRoadmap } from "@/hooks/use-roadmap";
import { DIFFICULTY_META, PRIORITY_META, ACCENTS } from "@/lib/constants";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { cn, formatHours, percent } from "@/lib/utils";
import type { Difficulty, Priority } from "@/types";

/**
 * The analytics surface.
 *
 * Every chart here has a matching table (toggled below the fold) — that's the
 * accessible fallback for anyone the colour channel doesn't reach, and it
 * doubles as the fastest way to read exact numbers.
 */
export function StatisticsView() {
  const {
    stats,
    week,
    month,
    timeByCategory,
    statusBreakdown,
    categories,
    tasks,
    streak,
    longestStreak,
  } = useRoadmap();
  const hydrated = useHydrated();
  const [showTable, setShowTable] = React.useState(false);

  const byDifficulty = React.useMemo(() => {
    return (Object.keys(DIFFICULTY_META) as Difficulty[]).map((key) => ({
      key,
      meta: DIFFICULTY_META[key],
      count: tasks.filter((t) => t.difficulty === key).length,
    }));
  }, [tasks]);

  const byPriority = React.useMemo(() => {
    return (Object.keys(PRIORITY_META) as Priority[]).map((key) => ({
      key,
      meta: PRIORITY_META[key],
      count: tasks.filter((t) => t.priority === key).length,
    }));
  }, [tasks]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-12 w-72" />
        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  const monthTotal = month.reduce((sum, d) => sum + d.tasksCompleted, 0);
  const activeDays = month.filter((d) => d.tasksCompleted > 0).length;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        eyebrow="Analytics"
        title="Statistics"
        description="The numbers behind the roadmap. Trends first, exact values in the table."
      />

      {/* ---- Hero numbers ---- */}
      <motion.div
        variants={staggerContainer(0.06)}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <MiniStat label="Completion rate" value={stats.completionRate} suffix="%" icon={Trophy} accent="green" />
        <MiniStat label="Hours earned" value={stats.completedHours} suffix="h" icon={Clock} accent="violet" />
        <MiniStat label="Longest streak" value={longestStreak} suffix="d" icon={Flame} accent="orange" />
        <MiniStat label="Active days / 30" value={activeDays} icon={BarChart3} accent="indigo" />
      </motion.div>

      {/* ---- Charts ---- */}
      <motion.div
        variants={staggerContainer(0.07)}
        initial="hidden"
        animate="show"
        className="grid gap-4 lg:grid-cols-3"
      >
        <div className="lg:col-span-2">
          <PanelCard
            title="Weekly progress"
            icon={BarChart3}
            action={
              <span className="font-mono text-xs text-muted-foreground">
                {monthTotal} in 30 days
              </span>
            }
          >
            <WeeklyProgressChart data={week} height={240} />
          </PanelCard>
        </div>

        <PanelCard title="Task completion" icon={PieChart}>
          <CompletionPieChart data={statusBreakdown} height={180} />
        </PanelCard>
      </motion.div>

      <motion.div
        variants={staggerContainer(0.07)}
        initial="hidden"
        animate="show"
        className="grid gap-4 lg:grid-cols-2"
      >
        <PanelCard title="Learning time by track" icon={Clock}>
          <LearningTimeChart data={timeByCategory} height={260} />
        </PanelCard>

        <motion.div variants={fadeUp} className="grid gap-4">
          <DistributionCard title="By difficulty" rows={byDifficulty} total={stats.total} />
          <DistributionCard title="By priority" rows={byPriority} total={stats.total} />
        </motion.div>
      </motion.div>

      {/* ---- Table fallback ---- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight">Raw numbers</h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowTable((v) => !v)}
            aria-expanded={showTable}
          >
            <Table2 />
            {showTable ? "Hide" : "Show"} table
          </Button>
        </div>

        {showTable && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto thin-scrollbar">
              <table className="w-full text-sm">
                <caption className="sr-only">
                  Progress, tasks and hours for every learning track
                </caption>
                <thead>
                  <tr className="border-b border-border text-left">
                    <th scope="col" className="px-4 py-3 text-xs font-medium text-muted-foreground">Track</th>
                    <th scope="col" className="px-4 py-3 text-xs font-medium text-muted-foreground">Tasks</th>
                    <th scope="col" className="px-4 py-3 text-xs font-medium text-muted-foreground">Done</th>
                    <th scope="col" className="px-4 py-3 text-xs font-medium text-muted-foreground">Hours</th>
                    <th scope="col" className="px-4 py-3 text-xs font-medium text-muted-foreground">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {categories
                    .filter((c) => c.total > 0)
                    .map((c) => (
                      <tr key={c.category.id} className="border-b border-border/50 last:border-0">
                        <th scope="row" className="px-4 py-3 text-left font-medium">
                          {c.category.name}
                        </th>
                        <td className="px-4 py-3 font-mono tabular-nums text-muted-foreground">{c.total}</td>
                        <td className="px-4 py-3 font-mono tabular-nums text-muted-foreground">{c.completed}</td>
                        <td className="px-4 py-3 font-mono tabular-nums text-muted-foreground">{formatHours(c.hours)}</td>
                        <td className="px-4 py-3 font-mono tabular-nums">{c.progress}%</td>
                      </tr>
                    ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border bg-secondary/30">
                    <th scope="row" className="px-4 py-3 text-left text-xs font-semibold">Total</th>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums">{stats.total}</td>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums">{stats.completed}</td>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums">{formatHours(stats.totalHours)}</td>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums">{stats.completionRate}%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        )}
      </section>

      <p className="pb-4 text-xs text-muted-foreground">
        Current streak: <span className="font-mono text-foreground">{streak} days</span>.
        All figures are derived from your local data — nothing leaves this browser.
      </p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  suffix,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  suffix?: string;
  icon: typeof Trophy;
  accent: keyof typeof ACCENTS;
}) {
  const tokens = ACCENTS[accent];
  return (
    <motion.div variants={fadeUp}>
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{label}</p>
          <Icon className={cn("size-3.5", tokens.text)} />
        </div>
        <AnimatedCounter
          value={value}
          suffix={suffix}
          className="mt-2 block text-2xl font-semibold tabular-nums tracking-tight"
        />
      </Card>
    </motion.div>
  );
}

/**
 * A labelled distribution. Each row is direct-labelled with its name and count,
 * so the bar is a visual aid rather than the only way to read the value.
 */
function DistributionCard({
  title,
  rows,
  total,
}: {
  title: string;
  rows: { key: string; meta: { label: string; accent: keyof typeof ACCENTS }; count: number }[];
  total: number;
}) {
  return (
    <Card className="p-5">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.key} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground/90">{row.meta.label}</span>
              <span className="font-mono tabular-nums text-muted-foreground">
                {row.count} · {percent(row.count, total)}%
              </span>
            </div>
            <Progress
              value={percent(row.count, total)}
              gradient={ACCENTS[row.meta.accent].gradient}
              className="h-1"
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
