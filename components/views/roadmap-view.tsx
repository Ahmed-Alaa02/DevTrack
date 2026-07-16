"use client";

import { motion } from "framer-motion";

import { PageHeader } from "@/components/common/page-header";
import { ProgressRing } from "@/components/common/progress-ring";
import { AnimatedCounter } from "@/components/common/animated-counter";
import { TaskList } from "@/components/tasks/task-list";
import { FilterBar } from "@/components/tasks/filter-bar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useHydrated } from "@/hooks/use-hydrated";
import { useRoadmap } from "@/hooks/use-roadmap";
import { ACCENTS } from "@/lib/constants";
import { EASE_OUT, fadeUp, staggerContainer } from "@/lib/motion";
import { filterTasks, sortTasks } from "@/lib/stats";
import { cn, formatHours } from "@/lib/utils";
import { useUIStore } from "@/store/use-ui-store";
import * as React from "react";

/**
 * The roadmap as a vertical journey.
 *
 * The dashboard answers "what should I do now"; this answers "where am I in the
 * whole plan". Same data, different question — so it's a timeline with one node
 * per track rather than a grid of cards, and the connecting spine is what makes
 * it read as a route instead of a list.
 */
export function RoadmapView() {
  const { categories, overall, stats } = useRoadmap();
  const filters = useUIStore((s) => s.filters);
  const sort = useUIStore((s) => s.sort);
  const hydrated = useHydrated();

  const sections = React.useMemo(
    () =>
      categories
        .filter((c) => c.total > 0)
        .map((c) => ({
          ...c,
          visible: sortTasks(filterTasks(c.tasks, filters), sort),
        })),
    [categories, filters, sort],
  );

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        eyebrow="The long game"
        title="My Roadmap"
        description="Nine tracks from backend depth to interview readiness. Progress compounds — the order is yours to choose."
      />

      {/* ---- Summary ---- */}
      <Card className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-violet/20 blur-3xl"
        />
        <div className="relative flex flex-col items-center gap-8 p-6 sm:flex-row sm:p-8">
          <ProgressRing value={overall} size={132} strokeWidth={10} gradientId="roadmap-ring">
            <AnimatedCounter
              value={overall}
              suffix="%"
              className="text-2xl font-semibold tabular-nums"
            />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              complete
            </span>
          </ProgressRing>

          <div className="grid flex-1 grid-cols-2 gap-6 sm:grid-cols-4">
            <SummaryStat label="Tracks" value={sections.length} />
            <SummaryStat label="Tasks" value={stats.total} />
            <SummaryStat label="Done" value={stats.completed} accent="text-success" />
            <SummaryStat
              label="Hours planned"
              value={stats.totalHours}
              suffix="h"
            />
          </div>
        </div>
      </Card>

      <FilterBar showCategoryFilter={false} />

      {/* ---- Timeline ---- */}
      <motion.div
        variants={staggerContainer(0.08)}
        initial="hidden"
        animate="show"
        className="relative space-y-8"
      >
        {/* The spine. Sits behind the nodes and stops at the last one. */}
        <div
          aria-hidden
          className="absolute bottom-8 left-5 top-4 w-px bg-gradient-to-b from-violet/50 via-indigo/30 to-transparent"
        />

        {sections.map((section, index) => {
          const accent = ACCENTS[section.category.accent];
          const Icon = section.category.icon;
          const isComplete = section.progress === 100;

          return (
            <motion.section key={section.category.id} variants={fadeUp} className="relative pl-14">
              {/* Node */}
              <div className="absolute left-0 top-1">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.06, duration: 0.4, ease: EASE_OUT }}
                  className={cn(
                    "relative flex size-10 items-center justify-center rounded-xl border bg-background",
                    isComplete ? "border-success/40" : accent.border,
                  )}
                >
                  <Icon
                    className={cn("size-4", isComplete ? "text-success" : accent.text)}
                  />
                  {/* Live pulse on the track currently in flight. */}
                  {!isComplete && section.progress > 0 && (
                    <span
                      className={cn(
                        "absolute inset-0 -z-10 animate-pulse-ring rounded-xl",
                        accent.softBg,
                      )}
                    />
                  )}
                </motion.div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h2 className="text-base font-semibold tracking-tight">
                    {section.category.name}
                  </h2>
                  <Badge variant={isComplete ? "green" : section.category.accent} size="sm">
                    {section.completed}/{section.total}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatHours(section.hours)}
                  </span>
                  <div className="ml-auto flex w-full items-center gap-2 sm:w-40">
                    <Progress
                      value={section.progress}
                      gradient={isComplete ? "from-success to-success" : accent.gradient}
                      className="h-1.5"
                    />
                    <span className="w-9 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
                      {section.progress}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  {section.category.description}
                </p>

                <TaskList
                  tasks={section.visible}
                  categoryId={section.category.id}
                  emptyTitle="No matching tasks"
                  emptyDescription="This track has tasks, but none match your current filters."
                />
              </div>
            </motion.section>
          );
        })}
      </motion.div>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  suffix,
  accent,
}: {
  label: string;
  value: number;
  suffix?: string;
  accent?: string;
}) {
  return (
    <div>
      <AnimatedCounter
        value={value}
        suffix={suffix}
        className={cn("block text-2xl font-semibold tabular-nums tracking-tight", accent)}
      />
      <p className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
