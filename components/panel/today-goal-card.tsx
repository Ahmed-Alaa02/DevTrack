"use client";

import { CheckCheck, Target } from "lucide-react";

import { PanelCard } from "@/components/panel/panel-card";
import { Progress } from "@/components/ui/progress";
import { useRoadmap } from "@/hooks/use-roadmap";
import { percent } from "@/lib/utils";

/**
 * Today's goal: completions today measured against the user's daily target
 * (editable in Settings).
 *
 * Scoped to *today* on purpose — the rest of the panel is cumulative, and a
 * roadmap this long needs one number that resets every morning and is winnable
 * before bed.
 */
export function TodayGoalCard() {
  const { today, profile } = useRoadmap();

  const goal = Math.max(profile.dailyGoal, 1);
  const done = today.tasksCompleted;
  const share = percent(Math.min(done, goal), goal);
  const achieved = done >= goal;

  return (
    <PanelCard title="Today's goal" icon={Target}>
      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold tabular-nums tracking-tight">
              {done}
            </span>
            <span className="text-sm text-muted-foreground">/ {goal} tasks</span>
          </div>

          {achieved && (
            <span className="inline-flex items-center gap-1 rounded-full border border-success/25 bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
              <CheckCheck className="size-3" />
              Hit
            </span>
          )}
        </div>

        <Progress
          value={share}
          gradient={achieved ? "from-success to-success" : "from-violet to-indigo"}
          className="h-2"
          aria-label="Progress toward today's goal"
        />

        <p className="text-xs text-muted-foreground">
          {achieved
            ? "Goal cleared. Anything else today is a bonus."
            : `${goal - done} more to keep the streak honest.`}
        </p>
      </div>
    </PanelCard>
  );
}
