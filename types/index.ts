import type { LucideIcon } from "lucide-react";

/** Task lifecycle. `in-progress` is derived on toggle, never set by seed data alone. */
export type TaskStatus = "not-started" | "in-progress" | "completed";

export type Difficulty = "beginner" | "intermediate" | "advanced" | "expert";

export type Priority = "low" | "medium" | "high" | "critical";

/** Stable ids for the nine learning tracks. Used as the FK on `Task.categoryId`. */
export type CategoryId =
  | "backend"
  | "frontend"
  | "devops"
  | "databases"
  | "architecture"
  | "soft-skills"
  | "career"
  | "english"
  | "interview";

/** The six semantic hues a category may paint itself with. */
export type AccentColor =
  | "violet"
  | "indigo"
  | "blue"
  | "green"
  | "orange"
  | "red";

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  categoryId: CategoryId;
  title: string;
  description: string;
  difficulty: Difficulty;
  /** Estimated effort in hours — feeds the "Learning Time" chart. */
  estimatedHours: number;
  priority: Priority;
  /** ISO-8601 date string (`YYYY-MM-DD`). Null means "someday". */
  deadline: string | null;
  status: TaskStatus;
  /** 0–100. Kept in sync with `status` by the store, never set independently. */
  progress: number;
  subtasks: Subtask[];
  resources: TaskResource[];
  tags: string[];
  /** Manual ordering within a category, mutated by drag & drop. */
  order: number;
  createdAt: string;
  completedAt: string | null;
}

export interface TaskResource {
  label: string;
  url: string;
}

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  icon: LucideIcon;
  accent: AccentColor;
}

/** A single day's activity — the substrate for the streak and weekly chart. */
export interface ActivityDay {
  /** ISO-8601 date (`YYYY-MM-DD`). */
  date: string;
  tasksCompleted: number;
  hoursLogged: number;
}

export interface UserProfile {
  name: string;
  role: string;
  avatarUrl: string | null;
  /** Tasks the user intends to close today — powers the "Today's Goal" card. */
  dailyGoal: number;
}

export type SortKey =
  | "manual"
  | "priority"
  | "deadline"
  | "difficulty"
  | "progress"
  | "title";

export type StatusFilter = TaskStatus | "all";
export type PriorityFilter = Priority | "all";
export type DifficultyFilter = Difficulty | "all";

export interface TaskFilters {
  query: string;
  status: StatusFilter;
  priority: PriorityFilter;
  difficulty: DifficultyFilter;
  categoryId: CategoryId | "all";
}

/** Aggregate counters rendered by the header stat cards. */
export interface RoadmapStats {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  completionRate: number;
  totalHours: number;
  completedHours: number;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  categoryId: CategoryId | null;
  pinned: boolean;
  updatedAt: string;
}
