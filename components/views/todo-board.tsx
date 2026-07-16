"use client";

import { AlertTriangle, CalendarClock, ListTodo } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { FilterBar } from "@/components/tasks/filter-bar";
import { TaskList } from "@/components/tasks/task-list";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHydrated } from "@/hooks/use-hydrated";
import { useRoadmap, useVisibleTasks } from "@/hooks/use-roadmap";

/**
 * A flat, cross-category task list — the "just tell me what to do next" view.
 *
 * Deliberately *not* drag-reorderable: order is a per-category concept, and a
 * drop here would have no meaningful place to be saved. `TaskList` enforces
 * that by only enabling DnD when it's given a `categoryId`.
 */
export function TodoBoard() {
  const tasks = useVisibleTasks();
  const { overdue, upcoming } = useRoadmap();
  const hydrated = useHydrated();

  const open = tasks.filter((t) => t.status !== "completed");
  const done = tasks.filter((t) => t.status === "completed");

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-12 w-72" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Execution"
        title="Todo List"
        description="Every task across every track, in one flat list. Filter it down to whatever you can actually finish today."
      />

      {/* Two attention cards before the list: what's late, what's next. */}
      <div className="grid gap-4 sm:grid-cols-2">
        <AttentionCard
          icon={AlertTriangle}
          tone="danger"
          count={overdue.length}
          label="Overdue"
          hint={
            overdue.length
              ? overdue
                  .slice(0, 2)
                  .map((t) => t.title)
                  .join(" · ")
              : "Nothing is late. Rare and excellent."
          }
        />
        <AttentionCard
          icon={CalendarClock}
          tone="warning"
          count={upcoming.length}
          label="Due in 7 days"
          hint={
            upcoming.length
              ? upcoming
                  .slice(0, 2)
                  .map((t) => t.title)
                  .join(" · ")
              : "Clear week ahead."
          }
        />
      </div>

      <FilterBar resultCount={tasks.length} />

      <Tabs defaultValue="open">
        <TabsList>
          <TabsTrigger value="open">
            <ListTodo />
            Open
            <Badge variant="neutral" size="sm" className="ml-1 font-mono">
              {open.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="done">
            Completed
            <Badge variant="green" size="sm" className="ml-1 font-mono">
              {done.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="open">
          <TaskList
            tasks={open}
            showCategory
            emptyTitle="Nothing open"
            emptyDescription="Either you're done, or your filters are hiding the work. Both are worth checking."
          />
        </TabsContent>

        <TabsContent value="done">
          <TaskList
            tasks={done}
            showCategory
            emptyTitle="No completed tasks yet"
            emptyDescription="Finish something small today — the first one is the hardest."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AttentionCard({
  icon: Icon,
  tone,
  count,
  label,
  hint,
}: {
  icon: typeof AlertTriangle;
  tone: "danger" | "warning";
  count: number;
  label: string;
  hint: string;
}) {
  const empty = count === 0;
  const accent = tone === "danger" ? "text-danger" : "text-warning";
  const soft = tone === "danger" ? "bg-danger/10" : "bg-warning/10";
  const ring = tone === "danger" ? "border-danger/25" : "border-warning/25";

  return (
    <Card className="flex items-center gap-4 p-5">
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${
          empty ? "border-border bg-secondary/60" : `${ring} ${soft}`
        }`}
      >
        <Icon className={`size-4 ${empty ? "text-muted-foreground" : accent}`} />
      </div>

      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span
            className={`text-xl font-semibold tabular-nums ${empty ? "" : accent}`}
          >
            {count}
          </span>
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
        </div>
        <p className="truncate text-xs text-muted-foreground/80">{hint}</p>
      </div>
    </Card>
  );
}
