"use client";

import { useMemo } from "react";

import {
  computeCategoryProgress,
  computeLongestStreak,
  computeOverallProgress,
  computeStats,
  computeStatusBreakdown,
  computeStreak,
  computeTimeByCategory,
  filterTasks,
  lastNDays,
  overdueTasks,
  sortTasks,
  todaysActivity,
  upcomingTasks,
} from "@/lib/stats";
import { useRoadmapStore } from "@/store/use-roadmap-store";
import { useUIStore } from "@/store/use-ui-store";
import type { CategoryId } from "@/types";

/**
 * The single read-model the UI consumes.
 *
 * Every page needs some slice of the same derived numbers; computing them once
 * here (memoised on `tasks`/`activity`) means a component never re-derives what
 * a sibling already calculated, and there is exactly one definition of
 * "completion rate" in the codebase.
 */
export function useRoadmap() {
  const tasks = useRoadmapStore((s) => s.tasks);
  const activity = useRoadmapStore((s) => s.activity);
  const profile = useRoadmapStore((s) => s.profile);

  const stats = useMemo(() => computeStats(tasks), [tasks]);
  const overall = useMemo(() => computeOverallProgress(tasks), [tasks]);
  const categories = useMemo(() => computeCategoryProgress(tasks), [tasks]);
  const statusBreakdown = useMemo(() => computeStatusBreakdown(tasks), [tasks]);
  const timeByCategory = useMemo(() => computeTimeByCategory(tasks), [tasks]);
  const overdue = useMemo(() => overdueTasks(tasks), [tasks]);
  const upcoming = useMemo(() => upcomingTasks(tasks), [tasks]);

  const streak = useMemo(() => computeStreak(activity), [activity]);
  const longestStreak = useMemo(() => computeLongestStreak(activity), [activity]);
  const week = useMemo(() => lastNDays(activity, 7), [activity]);
  const month = useMemo(() => lastNDays(activity, 30), [activity]);
  const today = useMemo(() => todaysActivity(activity), [activity]);

  return {
    tasks,
    activity,
    profile,
    stats,
    overall,
    categories,
    statusBreakdown,
    timeByCategory,
    overdue,
    upcoming,
    streak,
    longestStreak,
    week,
    month,
    today,
  };
}

/**
 * Tasks passed through the active search / filter / sort controls.
 * `categoryId` scopes the result to one track, which is how category cards
 * render their own list without each one re-filtering the whole roadmap.
 */
export function useVisibleTasks(categoryId?: CategoryId) {
  const tasks = useRoadmapStore((s) => s.tasks);
  const filters = useUIStore((s) => s.filters);
  const sort = useUIStore((s) => s.sort);

  return useMemo(() => {
    const scoped = categoryId ? tasks.filter((t) => t.categoryId === categoryId) : tasks;
    return sortTasks(filterTasks(scoped, filters), sort);
  }, [tasks, filters, sort, categoryId]);
}

/** True when any filter is narrowing the view — drives the "Clear" affordance. */
export function useHasActiveFilters() {
  const filters = useUIStore((s) => s.filters);
  return (
    filters.query.trim() !== "" ||
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.difficulty !== "all" ||
    filters.categoryId !== "all"
  );
}
