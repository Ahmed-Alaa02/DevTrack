"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { STORAGE_KEY } from "@/lib/constants";
import {
  DEFAULT_PROFILE,
  createSeedActivity,
  createSeedNotes,
  createSeedTasks,
} from "@/lib/seed";
import { clamp, todayISO, uid } from "@/lib/utils";
import type { ActivityDay, CategoryId, Note, Task, UserProfile } from "@/types";

export type ThemeMode = "dark" | "light";

interface RoadmapState {
  tasks: Task[];
  activity: ActivityDay[];
  notes: Note[];
  profile: UserProfile;
  /** Structure is in place for a light theme; the toggle ships disabled-by-default. */
  theme: ThemeMode;

  toggleTask: (id: string) => void;
  setTaskProgress: (id: string, progress: number) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addTask: (input: NewTaskInput) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  /** Persist a new manual ordering for one category (drag & drop). */
  reorderCategoryTasks: (categoryId: CategoryId, orderedIds: string[]) => void;

  upsertNote: (note: Partial<Note> & { id?: string }) => void;
  deleteNote: (id: string) => void;
  toggleNotePin: (id: string) => void;

  updateProfile: (patch: Partial<UserProfile>) => void;
  setTheme: (theme: ThemeMode) => void;
  resetAll: () => void;
  /** Empty the roadmap entirely. Profile and theme are preferences, not data, so they stay. */
  clearAll: () => void;
}

export interface NewTaskInput {
  title: string;
  description?: string;
  categoryId: CategoryId;
  difficulty?: Task["difficulty"];
  priority?: Task["priority"];
  estimatedHours?: number;
  deadline?: string | null;
}

/** Progress and status are two views of one truth — this keeps them consistent. */
function statusForProgress(progress: number): Task["status"] {
  if (progress >= 100) return "completed";
  if (progress <= 0) return "not-started";
  return "in-progress";
}

/**
 * Record a completion against today's activity bucket, creating it if this is
 * the first action of the day. `delta` is -1 when a task is un-completed so the
 * streak can't be farmed by toggling a checkbox back and forth.
 */
function applyActivityDelta(
  activity: ActivityDay[],
  delta: number,
  hours: number,
): ActivityDay[] {
  const today = todayISO();
  const exists = activity.some((d) => d.date === today);

  const next = exists
    ? activity.map((day) =>
        day.date === today
          ? {
              ...day,
              tasksCompleted: Math.max(0, day.tasksCompleted + delta),
              hoursLogged: Math.max(0, Number((day.hoursLogged + hours).toFixed(1))),
            }
          : day,
      )
    : [
        ...activity,
        {
          date: today,
          tasksCompleted: Math.max(0, delta),
          hoursLogged: Math.max(0, Number(hours.toFixed(1))),
        },
      ];

  return next.sort((a, b) => a.date.localeCompare(b.date));
}

function createInitialState() {
  return {
    tasks: createSeedTasks(),
    activity: createSeedActivity(),
    notes: createSeedNotes(),
    profile: DEFAULT_PROFILE,
    theme: "dark" as ThemeMode,
  };
}

export const useRoadmapStore = create<RoadmapState>()(
  persist(
    (set) => ({
      ...createInitialState(),

      toggleTask: (id) =>
        set((state) => {
          const target = state.tasks.find((t) => t.id === id);
          if (!target) return state;

          const nowCompleted = target.status !== "completed";
          const today = todayISO();

          const tasks = state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  status: nowCompleted ? ("completed" as const) : ("not-started" as const),
                  progress: nowCompleted ? 100 : 0,
                  completedAt: nowCompleted ? today : null,
                  subtasks: task.subtasks.map((s) => ({ ...s, done: nowCompleted })),
                }
              : task,
          );

          // Log a fraction of the estimate so the time chart reacts to real work
          // rather than crediting the whole estimate to a single click.
          const loggedHours = Number((target.estimatedHours * 0.25).toFixed(1));

          return {
            tasks,
            activity: applyActivityDelta(
              state.activity,
              nowCompleted ? 1 : -1,
              nowCompleted ? loggedHours : -loggedHours,
            ),
          };
        }),

      setTaskProgress: (id, progress) =>
        set((state) => {
          const value = clamp(Math.round(progress), 0, 100);
          const target = state.tasks.find((t) => t.id === id);
          if (!target) return state;

          const status = statusForProgress(value);
          const crossedIntoDone = status === "completed" && target.status !== "completed";
          const leftDone = status !== "completed" && target.status === "completed";

          const tasks = state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  progress: value,
                  status,
                  completedAt: status === "completed" ? todayISO() : null,
                }
              : task,
          );

          if (!crossedIntoDone && !leftDone) return { tasks };

          const hours = Number((target.estimatedHours * 0.25).toFixed(1));
          return {
            tasks,
            activity: applyActivityDelta(
              state.activity,
              crossedIntoDone ? 1 : -1,
              crossedIntoDone ? hours : -hours,
            ),
          };
        }),

      toggleSubtask: (taskId, subtaskId) =>
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== taskId) return task;

            const subtasks = task.subtasks.map((s) =>
              s.id === subtaskId ? { ...s, done: !s.done } : s,
            );
            const doneCount = subtasks.filter((s) => s.done).length;
            // Checking subtasks drives the parent's progress — the checklist is
            // the source of truth whenever a task has one.
            const progress = subtasks.length
              ? Math.round((doneCount / subtasks.length) * 100)
              : task.progress;

            return {
              ...task,
              subtasks,
              progress,
              status: statusForProgress(progress),
              completedAt: progress >= 100 ? todayISO() : null,
            };
          }),
        })),

      addTask: (input) =>
        set((state) => {
          const siblings = state.tasks.filter((t) => t.categoryId === input.categoryId);
          const task: Task = {
            id: uid("task"),
            categoryId: input.categoryId,
            title: input.title.trim(),
            description: input.description?.trim() ?? "",
            difficulty: input.difficulty ?? "intermediate",
            estimatedHours: input.estimatedHours ?? 4,
            priority: input.priority ?? "medium",
            deadline: input.deadline ?? null,
            status: "not-started",
            progress: 0,
            subtasks: [],
            resources: [],
            tags: [],
            order: siblings.length,
            createdAt: todayISO(),
            completedAt: null,
          };
          return { tasks: [...state.tasks, task] };
        }),

      updateTask: (id, patch) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...patch } : task)),
        })),

      deleteTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) })),

      reorderCategoryTasks: (categoryId, orderedIds) =>
        set((state) => {
          const rank = new Map(orderedIds.map((id, index) => [id, index]));
          return {
            tasks: state.tasks.map((task) =>
              task.categoryId === categoryId && rank.has(task.id)
                ? { ...task, order: rank.get(task.id)! }
                : task,
            ),
          };
        }),

      upsertNote: (note) =>
        set((state) => {
          const updatedAt = todayISO();
          if (note.id && state.notes.some((n) => n.id === note.id)) {
            return {
              notes: state.notes.map((n) =>
                n.id === note.id ? { ...n, ...note, updatedAt } : n,
              ),
            };
          }
          return {
            notes: [
              {
                id: uid("note"),
                title: note.title?.trim() || "Untitled note",
                body: note.body ?? "",
                categoryId: note.categoryId ?? null,
                pinned: note.pinned ?? false,
                updatedAt,
              },
              ...state.notes,
            ],
          };
        }),

      deleteNote: (id) =>
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),

      toggleNotePin: (id) =>
        set((state) => ({
          notes: state.notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
        })),

      updateProfile: (patch) =>
        set((state) => ({ profile: { ...state.profile, ...patch } })),

      setTheme: (theme) => set({ theme }),

      resetAll: () => set(createInitialState()),

      clearAll: () => set({ tasks: [], activity: [], notes: [] }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Actions are recreated on every load; persisting them would bloat the
      // payload and pin stale closures into storage.
      partialize: (state) => ({
        tasks: state.tasks,
        activity: state.activity,
        notes: state.notes,
        profile: state.profile,
        theme: state.theme,
      }),
    },
  ),
);
