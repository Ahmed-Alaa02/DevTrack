"use client";

import { CalendarClock, Clock, Signal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DIFFICULTY_META, PRIORITY_META, STATUS_META } from "@/lib/constants";
import { cn, daysUntil, formatDeadline, formatHours } from "@/lib/utils";
import type { Difficulty, Priority, TaskStatus } from "@/types";

/**
 * The atoms of a task row. Each one reads its colour from the shared meta maps
 * in `lib/constants`, so "critical is red" is defined once and every surface —
 * badge, chart, filter dropdown — agrees.
 */

export function StatusBadge({ status }: { status: TaskStatus }) {
  const meta = STATUS_META[status];
  return (
    <Badge variant={meta.accent}>
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "completed" && "bg-success",
          status === "in-progress" && "bg-warning",
          status === "not-started" && "bg-indigo",
        )}
      />
      {meta.label}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const meta = PRIORITY_META[priority];
  return (
    <Badge variant={meta.accent}>
      <Signal className="size-3" />
      {meta.label}
    </Badge>
  );
}

/**
 * Difficulty as four pips rather than a word — it's scannable at a glance and
 * encodes ordering visually, which a coloured label can't.
 */
export function DifficultyPips({
  difficulty,
  className,
}: {
  difficulty: Difficulty;
  className?: string;
}) {
  const meta = DIFFICULTY_META[difficulty];

  const fill: Record<string, string> = {
    green: "bg-success",
    blue: "bg-info",
    orange: "bg-warning",
    red: "bg-danger",
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn("inline-flex items-center gap-1", className)}
          aria-label={`Difficulty: ${meta.label}`}
        >
          {[1, 2, 3, 4].map((level) => (
            <span
              key={level}
              className={cn(
                "h-3 w-1 rounded-full transition-colors",
                level <= meta.level ? fill[meta.accent] : "bg-secondary",
              )}
            />
          ))}
        </span>
      </TooltipTrigger>
      <TooltipContent>{meta.label}</TooltipContent>
    </Tooltip>
  );
}

export function HoursBadge({ hours }: { hours: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Clock className="size-3" />
      {formatHours(hours)}
    </span>
  );
}

/**
 * Deadline copy escalates on colour as it approaches: muted → orange inside
 * three days → red once overdue. Completed tasks never turn red; the deadline
 * stops being actionable the moment the work is done.
 */
export function DeadlineBadge({
  deadline,
  completed,
}: {
  deadline: string | null;
  completed?: boolean;
}) {
  if (!deadline) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/70">
        <CalendarClock className="size-3" />
        Someday
      </span>
    );
  }

  const days = daysUntil(deadline);
  const overdue = !completed && days < 0;
  const soon = !completed && days >= 0 && days <= 3;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        overdue && "text-danger",
        soon && "text-warning",
        !overdue && !soon && "text-muted-foreground",
      )}
    >
      <CalendarClock className="size-3" />
      {formatDeadline(deadline)}
    </span>
  );
}
