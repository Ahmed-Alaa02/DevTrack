import { CATEGORIES, DIFFICULTY_META, PRIORITY_META } from "@/lib/constants";
import { addDays, percent, toISODate, todayISO } from "@/lib/utils";
import type {
  ActivityDay,
  Category,
  RoadmapStats,
  SortKey,
  Task,
  TaskFilters,
} from "@/types";

/**
 * Pure derivation helpers. Everything the UI displays is computed from the two
 * persisted collections (`tasks`, `activity`) rather than stored twice — there
 * is no cached "completedCount" to fall out of sync.
 */

export function computeStats(tasks: Task[]): RoadmapStats {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  const notStarted = tasks.filter((t) => t.status === "not-started").length;

  const totalHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);
  const completedHours = tasks.reduce(
    (sum, t) => sum + (t.estimatedHours * t.progress) / 100,
    0,
  );

  return {
    total,
    completed,
    inProgress,
    notStarted,
    completionRate: percent(completed, total),
    totalHours,
    completedHours: Math.round(completedHours),
  };
}

/**
 * Overall progress uses *average task progress*, not completed/total — a
 * roadmap that's 60% through every task shouldn't read as 0%.
 */
export function computeOverallProgress(tasks: Task[]) {
  if (tasks.length === 0) return 0;
  const sum = tasks.reduce((acc, t) => acc + t.progress, 0);
  return Math.round(sum / tasks.length);
}

export interface CategoryProgress {
  category: Category;
  tasks: Task[];
  total: number;
  completed: number;
  progress: number;
  hours: number;
}

export function computeCategoryProgress(tasks: Task[]): CategoryProgress[] {
  return CATEGORIES.map((category) => {
    const scoped = tasks.filter((t) => t.categoryId === category.id);
    const completed = scoped.filter((t) => t.status === "completed").length;
    return {
      category,
      tasks: scoped,
      total: scoped.length,
      completed,
      progress: computeOverallProgress(scoped),
      hours: scoped.reduce((sum, t) => sum + t.estimatedHours, 0),
    };
  });
}

/**
 * Consecutive active days ending today *or* yesterday — a streak shouldn't
 * break at midnight before the user has had a chance to work.
 */
export function computeStreak(activity: ActivityDay[]): number {
  const byDate = new Map(activity.map((d) => [d.date, d]));
  const today = new Date(`${todayISO()}T00:00:00`);

  const todayActive = (byDate.get(toISODate(today))?.tasksCompleted ?? 0) > 0;
  let cursor = todayActive ? today : addDays(today, -1);
  let streak = 0;

  // Walk backwards until a day with no completions.
  while ((byDate.get(toISODate(cursor))?.tasksCompleted ?? 0) > 0) {
    streak++;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

export function computeLongestStreak(activity: ActivityDay[]): number {
  let best = 0;
  let run = 0;
  for (const day of activity) {
    if (day.tasksCompleted > 0) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }
  return best;
}

/** The trailing `days` entries, padded with empty days if history is short. */
export function lastNDays(activity: ActivityDay[], days: number): ActivityDay[] {
  const byDate = new Map(activity.map((d) => [d.date, d]));
  const out: ActivityDay[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = toISODate(addDays(now, -i));
    out.push(byDate.get(date) ?? { date, tasksCompleted: 0, hoursLogged: 0 });
  }
  return out;
}

export function todaysActivity(activity: ActivityDay[]): ActivityDay {
  const today = todayISO();
  return (
    activity.find((d) => d.date === today) ?? {
      date: today,
      tasksCompleted: 0,
      hoursLogged: 0,
    }
  );
}

/* ------------------------------------------------------------------ *
 * Filtering & sorting
 * ------------------------------------------------------------------ */

function matchesQuery(task: Task, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    task.title.toLowerCase().includes(q) ||
    task.description.toLowerCase().includes(q) ||
    task.tags.some((tag) => tag.toLowerCase().includes(q)) ||
    task.subtasks.some((s) => s.title.toLowerCase().includes(q))
  );
}

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  return tasks.filter(
    (task) =>
      matchesQuery(task, filters.query) &&
      (filters.status === "all" || task.status === filters.status) &&
      (filters.priority === "all" || task.priority === filters.priority) &&
      (filters.difficulty === "all" || task.difficulty === filters.difficulty) &&
      (filters.categoryId === "all" || task.categoryId === filters.categoryId),
  );
}

/** Sort is stable and never mutates the input array. */
export function sortTasks(tasks: Task[], key: SortKey): Task[] {
  const sorted = tasks.slice();

  switch (key) {
    case "priority":
      return sorted.sort(
        (a, b) => PRIORITY_META[b.priority].weight - PRIORITY_META[a.priority].weight,
      );
    case "difficulty":
      return sorted.sort(
        (a, b) => DIFFICULTY_META[b.difficulty].level - DIFFICULTY_META[a.difficulty].level,
      );
    case "deadline":
      // Tasks without a deadline sink to the bottom rather than sorting as epoch 0.
      return sorted.sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.localeCompare(b.deadline);
      });
    case "progress":
      return sorted.sort((a, b) => b.progress - a.progress);
    case "title":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "manual":
    default:
      return sorted.sort((a, b) => a.order - b.order);
  }
}

/* ------------------------------------------------------------------ *
 * Chart series
 * ------------------------------------------------------------------ */

export interface TimeByCategory {
  name: string;
  hours: number;
  color: string;
}

/** Estimated hours already earned per category — powers the Learning Time chart. */
export function computeTimeByCategory(tasks: Task[]) {
  return computeCategoryProgress(tasks)
    .map(({ category, tasks: scoped }) => ({
      id: category.id,
      name: category.name,
      accent: category.accent,
      hours: Math.round(
        scoped.reduce((sum, t) => sum + (t.estimatedHours * t.progress) / 100, 0),
      ),
    }))
    .filter((entry) => entry.hours > 0)
    .sort((a, b) => b.hours - a.hours);
}

export function computeStatusBreakdown(tasks: Task[]) {
  const stats = computeStats(tasks);
  return [
    { key: "completed" as const, name: "Completed", value: stats.completed },
    { key: "in-progress" as const, name: "In progress", value: stats.inProgress },
    { key: "not-started" as const, name: "Not started", value: stats.notStarted },
  ].filter((slice) => slice.value > 0);
}

/** Tasks past their deadline and still open. */
export function overdueTasks(tasks: Task[]) {
  const today = todayISO();
  return tasks.filter(
    (t) => t.status !== "completed" && t.deadline !== null && t.deadline < today,
  );
}

/** Open tasks due within `days`, soonest first. */
export function upcomingTasks(tasks: Task[], days = 7) {
  const today = todayISO();
  const limit = toISODate(addDays(new Date(), days));
  return tasks
    .filter(
      (t) =>
        t.status !== "completed" &&
        t.deadline !== null &&
        t.deadline >= today &&
        t.deadline <= limit,
    )
    .sort((a, b) => (a.deadline ?? "").localeCompare(b.deadline ?? ""));
}
