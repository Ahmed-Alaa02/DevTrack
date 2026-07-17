import { CATEGORY_MAP } from "@/lib/constants";
import { clamp, todayISO, uid } from "@/lib/utils";
import type {
  Difficulty,
  Priority,
  Subtask,
  Task,
  TaskResource,
  TaskStatus,
} from "@/types";

/**
 * Task import/export.
 *
 * Tasks are portable: one person exports a `.json` file, another imports it and
 * gets the same roadmap without retyping anything. The format is a small
 * self-describing envelope so an import can reject an unrelated file loudly
 * rather than silently corrupting the store.
 */

const APP_TAG = "dev-roadmap";
const FILE_KIND = "tasks";
export const TRANSFER_VERSION = 1;

export interface TaskTransferFile {
  app: typeof APP_TAG;
  kind: typeof FILE_KIND;
  version: number;
  exportedAt: string;
  tasks: Task[];
}

const DIFFICULTIES: Difficulty[] = ["beginner", "intermediate", "advanced", "expert"];
const PRIORITIES: Priority[] = ["low", "medium", "high", "critical"];
const STATUSES: TaskStatus[] = ["not-started", "in-progress", "completed"];

/** Wrap the current tasks in the transfer envelope, ready to be stringified. */
export function buildTaskExport(tasks: Task[]): TaskTransferFile {
  return {
    app: APP_TAG,
    kind: FILE_KIND,
    version: TRANSFER_VERSION,
    exportedAt: new Date().toISOString(),
    tasks,
  };
}

/** A filename that won't collide across exports. */
export function exportFileName() {
  return `dev-roadmap-tasks-${todayISO()}.json`;
}

function oneOf<T extends string>(value: unknown, allowed: T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function normalizeSubtask(raw: unknown): Subtask | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  if (typeof s.title !== "string" || !s.title.trim()) return null;
  return { id: uid("subtask"), title: s.title.trim(), done: Boolean(s.done) };
}

function normalizeResource(raw: unknown): TaskResource | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.url !== "string" || !r.url.trim()) return null;
  return {
    url: r.url.trim(),
    label: typeof r.label === "string" && r.label.trim() ? r.label.trim() : r.url.trim(),
  };
}

/**
 * Coerce one untrusted record into a valid `Task`, or return null if it's too
 * broken to salvage (no title, or a category this build doesn't know). Ids are
 * regenerated so imported tasks can never collide with what's already stored.
 */
function normalizeTask(raw: unknown, index: number): Task | null {
  if (!raw || typeof raw !== "object") return null;
  const t = raw as Record<string, unknown>;

  if (typeof t.title !== "string" || !t.title.trim()) return null;
  if (typeof t.categoryId !== "string" || !(t.categoryId in CATEGORY_MAP)) return null;

  const subtasks = Array.isArray(t.subtasks)
    ? (t.subtasks.map(normalizeSubtask).filter(Boolean) as Subtask[])
    : [];
  const resources = Array.isArray(t.resources)
    ? (t.resources.map(normalizeResource).filter(Boolean) as TaskResource[])
    : [];
  const tags = Array.isArray(t.tags)
    ? t.tags.filter((x): x is string => typeof x === "string")
    : [];

  const status = oneOf<TaskStatus>(t.status, STATUSES, "not-started");
  const progress =
    typeof t.progress === "number" && Number.isFinite(t.progress)
      ? clamp(Math.round(t.progress), 0, 100)
      : status === "completed"
        ? 100
        : 0;

  return {
    id: uid("task"),
    categoryId: t.categoryId as Task["categoryId"],
    title: t.title.trim(),
    description: typeof t.description === "string" ? t.description : "",
    difficulty: oneOf<Difficulty>(t.difficulty, DIFFICULTIES, "intermediate"),
    estimatedHours:
      typeof t.estimatedHours === "number" && t.estimatedHours > 0 ? t.estimatedHours : 4,
    priority: oneOf<Priority>(t.priority, PRIORITIES, "medium"),
    deadline: typeof t.deadline === "string" ? t.deadline : null,
    status,
    progress,
    subtasks,
    resources,
    tags,
    order: typeof t.order === "number" ? t.order : index,
    createdAt: typeof t.createdAt === "string" ? t.createdAt : todayISO(),
    completedAt: status === "completed" ? (typeof t.completedAt === "string" ? t.completedAt : todayISO()) : null,
  };
}

export class TaskImportError extends Error {}

/**
 * Parse the text of an uploaded file into a clean list of tasks. Throws
 * `TaskImportError` with a human message when the file isn't one of ours or
 * contains no usable tasks — the UI surfaces that message directly.
 */
export function parseTaskImport(text: string): Task[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new TaskImportError("That file isn't valid JSON.");
  }

  if (!data || typeof data !== "object") {
    throw new TaskImportError("Unrecognized file — expected an exported roadmap.");
  }

  const envelope = data as Record<string, unknown>;
  // Accept either the full envelope or a bare array of tasks, so a hand-made or
  // older file still works as long as the tasks are shaped right.
  const rawTasks = Array.isArray(envelope.tasks)
    ? envelope.tasks
    : Array.isArray(data)
      ? (data as unknown[])
      : null;

  if (!rawTasks) {
    throw new TaskImportError("This file doesn't contain any tasks.");
  }

  const tasks = rawTasks
    .map((raw, i) => normalizeTask(raw, i))
    .filter((t): t is Task => t !== null);

  if (tasks.length === 0) {
    throw new TaskImportError("No importable tasks were found in that file.");
  }

  return tasks;
}
