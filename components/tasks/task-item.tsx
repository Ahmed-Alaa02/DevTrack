"use client";

import * as React from "react";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ExternalLink,
  GripVertical,
  MoreHorizontal,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  DeadlineBadge,
  DifficultyPips,
  HoursBadge,
  PriorityBadge,
  StatusBadge,
} from "@/components/tasks/task-badges";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useConfetti } from "@/hooks/use-confetti";
import { ACCENTS, CATEGORY_MAP } from "@/lib/constants";
import { collapse, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useRoadmapStore } from "@/store/use-roadmap-store";
import type { Task } from "@/types";

/**
 * The drag props `TaskList` hands down. Typed against dnd-kit's own types
 * (type-only import — no runtime dependency), so a mismatch is a compile error
 * rather than a handle that silently does nothing.
 */
export interface TaskDragHandleProps {
  attributes?: DraggableAttributes;
  listeners?: SyntheticListenerMap;
  setActivatorNodeRef?: (node: HTMLElement | null) => void;
}

interface TaskItemProps {
  task: Task;
  /** Supplied by `SortableTaskItem`; absent when the list isn't reorderable. */
  dragHandle?: TaskDragHandleProps;
  isDragging?: boolean;
  /** Shows which track a task belongs to on un-grouped views (Todo List). */
  showCategory?: boolean;
}

/**
 * A single roadmap task.
 *
 * Presentational-with-actions: it reads nothing but its own `task` prop and
 * calls store actions directly, so it can be dropped into the dashboard, a
 * category page or a flat list with no adapter layer. Drag behaviour is
 * *injected* (`dragHandle`) rather than hooked here, which keeps the component
 * usable outside a `DndContext`.
 */
export const TaskItem = React.memo(function TaskItem({
  task,
  dragHandle,
  isDragging,
  showCategory,
}: TaskItemProps) {
  const [expanded, setExpanded] = React.useState(false);
  const toggleTask = useRoadmapStore((s) => s.toggleTask);
  const toggleSubtask = useRoadmapStore((s) => s.toggleSubtask);
  const addSubtask = useRoadmapStore((s) => s.addSubtask);
  const deleteSubtask = useRoadmapStore((s) => s.deleteSubtask);
  const deleteTask = useRoadmapStore((s) => s.deleteTask);
  const fireConfetti = useConfetti();

  const checkboxRef = React.useRef<HTMLButtonElement>(null);
  const isDone = task.status === "completed";
  const category = CATEGORY_MAP[task.categoryId];
  const detailsId = `task-details-${task.id}`;

  const handleToggle = () => {
    // Celebrate only on the completing edge — un-checking shouldn't throw a party.
    if (!isDone) fireConfetti(checkboxRef.current);
    toggleTask(task.id);
  };

  const doneSubtasks = task.subtasks.filter((s) => s.done).length;

  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
      transition={{ duration: 0.35, ease: EASE_OUT }}
      className={cn(
        "group relative rounded-2xl border border-border bg-card/60 transition-colors duration-200",
        "hover:border-white/[0.10] hover:bg-card",
        isDone && "opacity-60 hover:opacity-90",
        isDragging && "border-primary/40 shadow-glow",
      )}
    >
      {/* Left accent rail, tinted per category — carries colour identity on
          hover without adding another coloured chip to an already busy row. */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-3 left-0 w-0.5 rounded-full bg-gradient-to-b opacity-0 transition-opacity duration-200 group-hover:opacity-100",
          ACCENTS[category.accent].gradient,
        )}
      />

      <div className="flex items-start gap-3 p-4">
        {dragHandle && (
          <button
            type="button"
            ref={dragHandle.setActivatorNodeRef}
            {...dragHandle.attributes}
            {...dragHandle.listeners}
            aria-label={`Reorder ${task.title}`}
            className="mt-1 hidden cursor-grab touch-none rounded-md p-0.5 text-muted-foreground/40 opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 active:cursor-grabbing group-hover:opacity-100 sm:block"
          >
            <GripVertical className="size-4" />
          </button>
        )}

        <div className="pt-0.5">
          <Checkbox
            ref={checkboxRef}
            checked={isDone}
            onCheckedChange={handleToggle}
            aria-label={`Mark "${task.title}" as ${isDone ? "incomplete" : "complete"}`}
          />
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          {/* ---- Title row ---- */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  className={cn(
                    "text-sm font-medium leading-snug transition-all duration-300",
                    isDone && "text-muted-foreground line-through decoration-muted-foreground/50",
                  )}
                >
                  {task.title}
                </h3>
                {showCategory && (
                  <Badge variant={category.accent} size="sm">
                    {category.name}
                  </Badge>
                )}
              </div>
              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {task.description}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <span className="hidden font-mono text-xs tabular-nums text-muted-foreground sm:inline">
                {task.progress}%
              </span>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setExpanded((v) => !v)}
                    aria-expanded={expanded}
                    aria-controls={detailsId}
                    aria-label={expanded ? "Hide details" : "Show details"}
                  >
                    <ChevronDown
                      className={cn(
                        "size-4 transition-transform duration-300",
                        expanded && "rotate-180",
                      )}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{expanded ? "Hide" : "Show"} details</TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Actions for ${task.title}`}
                    className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100 data-[state=open]:opacity-100"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={handleToggle}>
                    {isDone ? "Mark as not started" : "Mark as complete"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setExpanded((v) => !v)}>
                    {expanded ? "Collapse" : "Expand"} details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem destructive onSelect={() => deleteTask(task.id)}>
                    <Trash2 />
                    Delete task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* ---- Meta row ---- */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            <DifficultyPips difficulty={task.difficulty} />
            <HoursBadge hours={task.estimatedHours} />
            <DeadlineBadge deadline={task.deadline} completed={isDone} />
          </div>

          {/* ---- Progress ---- */}
          <div className="space-y-1.5">
            <Progress
              value={task.progress}
              gradient={isDone ? "from-success to-success" : "from-violet to-indigo"}
              className="h-1.5"
              aria-label={`${task.title} progress`}
            />
            {task.subtasks.length > 0 && (
              <p className="text-[11px] text-muted-foreground">
                {doneSubtasks} of {task.subtasks.length} steps done
              </p>
            )}
          </div>

          {/* ---- Expandable details ---- */}
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                id={detailsId}
                variants={collapse}
                initial="hidden"
                animate="show"
                exit="exit"
                className="overflow-hidden"
              >
                <TaskDetails
                  task={task}
                  onToggleSubtask={toggleSubtask}
                  onAddSubtask={addSubtask}
                  onDeleteSubtask={deleteSubtask}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
});

/**
 * The expanded body: checklist, tags and links. Split out so the collapsed row
 * — by far the common case — doesn't pay to render it.
 */
function TaskDetails({
  task,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
}: {
  task: Task;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
}) {
  const [draft, setDraft] = React.useState("");

  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    const clean = draft.trim();
    if (!clean) return;
    onAddSubtask(task.id, clean);
    setDraft("");
  };

  return (
    <div className="mt-3 space-y-4 border-t border-border/70 pt-4">
      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Checklist
        </p>
        {task.subtasks.length > 0 && (
          <ul className="space-y-1.5">
            {task.subtasks.map((subtask, index) => (
              <motion.li
                key={subtask.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03, duration: 0.25, ease: EASE_OUT }}
                className="group/subtask flex items-center gap-1"
              >
                <label className="flex flex-1 cursor-pointer items-center gap-2.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-secondary/50">
                  <Checkbox
                    checked={subtask.done}
                    onCheckedChange={() => onToggleSubtask(task.id, subtask.id)}
                    className="size-4"
                  />
                  <span
                    className={cn(
                      "text-xs transition-colors",
                      subtask.done
                        ? "text-muted-foreground line-through"
                        : "text-foreground/90",
                    )}
                  >
                    {subtask.title}
                  </span>
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onDeleteSubtask(task.id, subtask.id)}
                  aria-label={`Delete step "${subtask.title}"`}
                  className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover/subtask:opacity-100"
                >
                  <X className="size-3.5" />
                </Button>
              </motion.li>
            ))}
          </ul>
        )}
        <form onSubmit={handleAdd} className="flex items-center gap-2 pt-0.5">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a step…"
            aria-label={`Add a step to ${task.title}`}
            className="h-8 text-xs"
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon-sm"
            disabled={draft.trim().length === 0}
            aria-label="Add step"
          >
            <Plus className="size-4" />
          </Button>
        </form>
      </div>

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {task.tags.map((tag) => (
            <Badge key={tag} variant="outline" size="sm" className="font-mono">
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      {task.resources.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Resources
          </p>
          <div className="flex flex-wrap gap-2">
            {task.resources.map((resource) => (
              <a
                key={resource.url}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/40 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
              >
                {resource.label}
                <ExternalLink className="size-3" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
