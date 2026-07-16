"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence } from "framer-motion";
import { SearchX } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { TaskItem } from "@/components/tasks/task-item";
import { useRoadmapStore } from "@/store/use-roadmap-store";
import { useUIStore } from "@/store/use-ui-store";
import type { CategoryId, Task } from "@/types";

interface TaskListProps {
  tasks: Task[];
  /** Enables reordering. Requires a single-category list — order is per-track. */
  categoryId?: CategoryId;
  showCategory?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

/** Wraps a `TaskItem` with dnd-kit's sortable wiring. */
function SortableTaskItem({
  task,
  showCategory,
}: {
  task: Task;
  showCategory?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        // The original stays in the flow as a ghost while the DragOverlay copy
        // follows the cursor — this is what makes the drop target readable.
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      <TaskItem
        task={task}
        showCategory={showCategory}
        dragHandle={{ attributes, listeners, setActivatorNodeRef }}
        isDragging={isDragging}
      />
    </div>
  );
}

/**
 * Renders a list of tasks, with drag & drop reordering when it's meaningful.
 *
 * Reordering is enabled only when the list is scoped to one category *and*
 * sorted manually — dropping a task into position #2 of a deadline-sorted list
 * would be a lie the next render undoes. Outside those conditions the list
 * degrades to a plain, still-animated list.
 *
 * dnd-kit is used over a lighter alternative specifically for `KeyboardSensor`:
 * reordering works with Space + arrow keys, so the feature isn't mouse-only.
 */
export function TaskList({
  tasks,
  categoryId,
  showCategory,
  emptyTitle = "No tasks match your filters",
  emptyDescription = "Try clearing the search or loosening a filter to see more of your roadmap.",
}: TaskListProps) {
  const sort = useUIStore((s) => s.sort);
  const reorder = useRoadmapStore((s) => s.reorderCategoryTasks);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sortable = Boolean(categoryId) && sort === "manual";

  const sensors = useSensors(
    // A small activation distance keeps a click on the handle from being
    // swallowed as a micro-drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ids = React.useMemo(() => tasks.map((t) => t.id), [tasks]);
  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) =>
    setActiveId(String(event.active.id));

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id || !categoryId) return;

    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from === -1 || to === -1) return;

    reorder(categoryId, arrayMove(ids, from, to));
  };

  if (tasks.length === 0) {
    return (
      <EmptyState icon={SearchX} title={emptyTitle} description={emptyDescription} />
    );
  }

  if (!sortable) {
    return (
      <div className="space-y-3">
        <AnimatePresence initial={false} mode="popLayout">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} showCategory={showCategory} />
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          <AnimatePresence initial={false} mode="popLayout">
            {tasks.map((task) => (
              <SortableTaskItem key={task.id} task={task} showCategory={showCategory} />
            ))}
          </AnimatePresence>
        </div>
      </SortableContext>

      {/* Rendered in a portal-like overlay so the dragged card floats above
          every sibling regardless of stacking context. */}
      <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
        {activeTask ? (
          <div className="cursor-grabbing rounded-2xl shadow-lift ring-1 ring-primary/40">
            <TaskItem task={activeTask} showCategory={showCategory} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
