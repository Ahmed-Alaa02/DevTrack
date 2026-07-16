"use client";

import { motion } from "framer-motion";
import { BarChart3, Clock, PieChart } from "lucide-react";

import { CompletionPieChart } from "@/components/charts/completion-pie-chart";
import { LearningTimeChart } from "@/components/charts/learning-time-chart";
import { WeeklyProgressChart } from "@/components/charts/weekly-progress-chart";
import { MotivationCard } from "@/components/panel/motivation-card";
import { PanelCard } from "@/components/panel/panel-card";
import { QuoteCard } from "@/components/panel/quote-card";
import { StreakCard } from "@/components/panel/streak-card";
import { TodayGoalCard } from "@/components/panel/today-goal-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useHydrated } from "@/hooks/use-hydrated";
import { useRoadmap } from "@/hooks/use-roadmap";
import { staggerContainer } from "@/lib/motion";
import { formatHours } from "@/lib/utils";

/**
 * The right rail.
 *
 * Ordered by decision value, not by visual weight: where am I overall → am I
 * still consistent → what do I owe today → the evidence charts → the closing
 * note. On tablet and below it stacks underneath the roadmap rather than being
 * hidden, because none of it is decoration.
 */
export function StatsPanel() {
  const { week, timeByCategory, statusBreakdown, stats } = useRoadmap();
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[340px] rounded-2xl" />
        <Skeleton className="h-[180px] rounded-2xl" />
        <Skeleton className="h-[260px] rounded-2xl" />
      </div>
    );
  }

  const weeklyTotal = week.reduce((sum, day) => sum + day.tasksCompleted, 0);

  return (
    <motion.aside
      aria-label="Statistics"
      variants={staggerContainer(0.06)}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      <MotivationCard />
      <StreakCard />
      <TodayGoalCard />

      <PanelCard
        title="Weekly progress"
        icon={BarChart3}
        action={
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {weeklyTotal} this week
          </span>
        }
      >
        <WeeklyProgressChart data={week} />
      </PanelCard>

      <PanelCard
        title="Learning time"
        icon={Clock}
        action={
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {formatHours(stats.completedHours)}
          </span>
        }
      >
        <LearningTimeChart data={timeByCategory} limit={6} height={190} />
      </PanelCard>

      <PanelCard title="Task completion" icon={PieChart}>
        <CompletionPieChart data={statusBreakdown} />
      </PanelCard>

      <QuoteCard />
    </motion.aside>
  );
}
