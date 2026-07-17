"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { RippleButton } from "@/components/common/ripple-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, DIFFICULTY_META, PRIORITY_META } from "@/lib/constants";
import { useRoadmapStore } from "@/store/use-roadmap-store";
import type { CategoryId, Difficulty, Priority, Task } from "@/types";

interface AddTaskDialogProps {
  /** Pre-selects a track when opened from inside a category card. */
  defaultCategoryId?: CategoryId;
  trigger?: React.ReactNode;
  /**
   * When provided, the dialog edits this task instead of creating one. The
   * caller controls visibility via `open`/`onOpenChange` (typically from a
   * task's action menu), so no trigger is rendered.
   */
  task?: Task;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const FIELD_LABEL = "text-xs font-medium text-muted-foreground";

/**
 * Create- or edit-task flow.
 *
 * Form state is local and uncommitted until submit — the store only ever sees a
 * complete, valid task, so a half-typed title can never reach localStorage. Pass
 * a `task` to switch the same form into edit mode.
 */
export function AddTaskDialog({
  defaultCategoryId,
  trigger,
  task,
  open: controlledOpen,
  onOpenChange,
}: AddTaskDialogProps) {
  const addTask = useRoadmapStore((s) => s.addTask);
  const updateTask = useRoadmapStore((s) => s.updateTask);
  const isEdit = Boolean(task);

  // Controlled when the caller manages visibility (edit from a menu),
  // uncontrolled with its own trigger otherwise (the "New task" button).
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  const initial = React.useMemo(
    () => ({
      title: task?.title ?? "",
      description: task?.description ?? "",
      categoryId: task?.categoryId ?? defaultCategoryId ?? "backend",
      difficulty: task?.difficulty ?? "intermediate",
      priority: task?.priority ?? "medium",
      estimatedHours: task ? String(task.estimatedHours) : "4",
      deadline: task?.deadline ?? "",
    }),
    [task, defaultCategoryId],
  );

  const [title, setTitle] = React.useState(initial.title);
  const [description, setDescription] = React.useState(initial.description);
  const [categoryId, setCategoryId] = React.useState<CategoryId>(initial.categoryId);
  const [difficulty, setDifficulty] = React.useState<Difficulty>(initial.difficulty);
  const [priority, setPriority] = React.useState<Priority>(initial.priority);
  const [estimatedHours, setEstimatedHours] = React.useState(initial.estimatedHours);
  const [deadline, setDeadline] = React.useState(initial.deadline);

  const canSubmit = title.trim().length > 0;

  const reset = React.useCallback(() => {
    setTitle(initial.title);
    setDescription(initial.description);
    setCategoryId(initial.categoryId);
    setDifficulty(initial.difficulty);
    setPriority(initial.priority);
    setEstimatedHours(initial.estimatedHours);
    setDeadline(initial.deadline);
  }, [initial]);

  // Re-seed the form whenever it opens, so editing always starts from the task's
  // current values and creating always starts clean.
  React.useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    // An empty or non-numeric field falls back to the default estimate rather
    // than writing NaN into the store and breaking every chart.
    const hours = Number(estimatedHours) > 0 ? Number(estimatedHours) : 4;

    if (isEdit && task) {
      updateTask(task.id, {
        title: title.trim(),
        description: description.trim(),
        categoryId,
        difficulty,
        priority,
        estimatedHours: hours,
        deadline: deadline || null,
      });
    } else {
      addTask({
        title,
        description,
        categoryId,
        difficulty,
        priority,
        estimatedHours: hours,
        deadline: deadline || null,
      });
    }

    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      {!isEdit && (
        <DialogTrigger asChild>
          {trigger ?? (
            <RippleButton size="icon" className="sm:w-auto sm:px-4" aria-label="Add task">
              <Plus />
              <span className="hidden sm:inline">New task</span>
            </RippleButton>
          )}
        </DialogTrigger>
      )}

      <DialogContent className="max-h-[90vh] overflow-y-auto thin-scrollbar sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit task" : "Add a task to your roadmap"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details. Progress and checklist stay as they are."
              : "Small, specific tasks get finished. Vague ones get postponed."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="task-title" className={FIELD_LABEL}>
              Title
            </label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement cursor pagination"
              autoFocus
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="task-description" className={FIELD_LABEL}>
              Description
            </label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does done look like?"
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <span className={FIELD_LABEL}>Category</span>
              <Select
                value={categoryId}
                onValueChange={(v) => setCategoryId(v as CategoryId)}
              >
                <SelectTrigger className="h-10" aria-label="Category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <span className={FIELD_LABEL}>Priority</span>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger className="h-10" aria-label="Priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_META).map(([value, meta]) => (
                    <SelectItem key={value} value={value}>
                      {meta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <span className={FIELD_LABEL}>Difficulty</span>
              <Select
                value={difficulty}
                onValueChange={(v) => setDifficulty(v as Difficulty)}
              >
                <SelectTrigger className="h-10" aria-label="Difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DIFFICULTY_META).map(([value, meta]) => (
                    <SelectItem key={value} value={value}>
                      {meta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="task-hours" className={FIELD_LABEL}>
                Estimated hours
              </label>
              <Input
                id="task-hours"
                type="number"
                min={0.5}
                step={0.5}
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="task-deadline" className={FIELD_LABEL}>
              Deadline <span className="text-muted-foreground/60">(optional)</span>
            </label>
            <Input
              id="task-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <RippleButton type="submit" disabled={!canSubmit}>
              <Plus />
              {isEdit ? "Save changes" : "Add task"}
            </RippleButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
