"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Plus } from "lucide-react";

import { AddTaskDialog } from "@/components/tasks/add-task-dialog";
import { TaskList } from "@/components/tasks/task-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ACCENTS } from "@/lib/constants";
import { collapse, EASE_OUT } from "@/lib/motion";
import type { CategoryProgress } from "@/lib/stats";
import { cn, formatHours } from "@/lib/utils";
import { useUIStore } from "@/store/use-ui-store";
import type { Task } from "@/types";

interface CategoryCardProps {
  data: CategoryProgress;
  /** Already filtered/sorted by the parent — the card never re-filters. */
  visibleTasks: Task[];
}

/**
 * A learning track: header with progress, and a collapsible body of tasks.
 *
 * Collapse state is persisted per category in the UI store, so a developer who
 * only cares about Backend keeps their folded layout across reloads.
 */
export function CategoryCard({ data, visibleTasks }: CategoryCardProps) {
  const { category, total, completed, progress, hours } = data;
  const collapsedIds = useUIStore((s) => s.collapsedCategories);
  const toggleCategory = useUIStore((s) => s.toggleCategory);

  const isCollapsed = collapsedIds.includes(category.id);
  const accent = ACCENTS[category.accent];
  const Icon = category.icon;
  const bodyId = `category-body-${category.id}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
    >
      <Card className="overflow-hidden">
        {/* Accent wash bleeding from the top-left — ties the card to its track
            without tinting the whole surface. */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute -left-16 -top-16 size-40 rounded-full opacity-[0.07] blur-3xl",
            accent.bg,
          )}
        />

        <div className="relative flex flex-wrap items-center gap-4 p-5">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl border",
              accent.softBg,
              accent.border,
            )}
          >
            <Icon className={cn("size-5", accent.text)} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-sm font-semibold tracking-tight">
                {category.name}
              </h2>
              <Badge variant={category.accent} size="sm">
                {completed}/{total}
              </Badge>
            </div>
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {category.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden w-32 items-center gap-2 sm:flex">
              <Progress value={progress} gradient={accent.gradient} className="h-1.5" />
              <span className="w-9 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
                {progress}%
              </span>
            </div>

            <span className="hidden text-xs text-muted-foreground md:inline">
              {formatHours(hours)}
            </span>

            <AddTaskDialog
              defaultCategoryId={category.id}
              trigger={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Add task to ${category.name}`}
                >
                  <Plus />
                </Button>
              }
            />

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => toggleCategory(category.id)}
              aria-expanded={!isCollapsed}
              aria-controls={bodyId}
              aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${category.name}`}
            >
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-300",
                  isCollapsed && "-rotate-90",
                )}
              />
            </Button>
          </div>

          {/* The desktop bar doesn't fit on phones; a full-width one takes over. */}
          <div className="flex w-full items-center gap-2 sm:hidden">
            <Progress value={progress} gradient={accent.gradient} className="h-1.5" />
            <span className="w-9 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
              {progress}%
            </span>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              id={bodyId}
              variants={collapse}
              initial="hidden"
              animate="show"
              exit="exit"
              className="overflow-hidden"
            >
              <div className="border-t border-border/70 p-4">
                <TaskList
                  tasks={visibleTasks}
                  categoryId={category.id}
                  emptyTitle={`Nothing here in ${category.name}`}
                  emptyDescription="No tasks in this track match the current filters."
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
