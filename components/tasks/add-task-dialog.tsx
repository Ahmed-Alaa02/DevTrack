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
import type { CategoryId, Difficulty, Priority } from "@/types";

interface AddTaskDialogProps {
  /** Pre-selects a track when opened from inside a category card. */
  defaultCategoryId?: CategoryId;
  trigger?: React.ReactNode;
}

const FIELD_LABEL = "text-xs font-medium text-muted-foreground";

/**
 * Create-task flow.
 *
 * Form state is local and uncommitted until submit — the store only ever sees a
 * complete, valid task, so a half-typed title can never reach localStorage.
 */
export function AddTaskDialog({ defaultCategoryId, trigger }: AddTaskDialogProps) {
  const addTask = useRoadmapStore((s) => s.addTask);
  const [open, setOpen] = React.useState(false);

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [categoryId, setCategoryId] = React.useState<CategoryId>(
    defaultCategoryId ?? "backend",
  );
  const [difficulty, setDifficulty] = React.useState<Difficulty>("intermediate");
  const [priority, setPriority] = React.useState<Priority>("medium");
  const [estimatedHours, setEstimatedHours] = React.useState("4");
  const [deadline, setDeadline] = React.useState("");

  const canSubmit = title.trim().length > 0;

  const reset = () => {
    setTitle("");
    setDescription("");
    setCategoryId(defaultCategoryId ?? "backend");
    setDifficulty("intermediate");
    setPriority("medium");
    setEstimatedHours("4");
    setDeadline("");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    addTask({
      title,
      description,
      categoryId,
      difficulty,
      priority,
      // An empty or non-numeric field falls back to the default estimate
      // rather than writing NaN into the store and breaking every chart.
      estimatedHours: Number(estimatedHours) > 0 ? Number(estimatedHours) : 4,
      deadline: deadline || null,
    });

    reset();
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
      <DialogTrigger asChild>
        {trigger ?? (
          <RippleButton size="icon" className="sm:w-auto sm:px-4" aria-label="Add task">
            <Plus />
            <span className="hidden sm:inline">New task</span>
          </RippleButton>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto thin-scrollbar sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add a task to your roadmap</DialogTitle>
          <DialogDescription>
            Small, specific tasks get finished. Vague ones get postponed.
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
              Add task
            </RippleButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
