"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ChevronsDownUp, ChevronsUpDown, Layers } from "lucide-react";

import { CategoryCard } from "@/components/categories/category-card";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { useHasActiveFilters, useRoadmap } from "@/hooks/use-roadmap";
import { CATEGORIES } from "@/lib/constants";
import { filterTasks, sortTasks } from "@/lib/stats";
import { staggerContainer } from "@/lib/motion";
import { useRoadmapStore } from "@/store/use-roadmap-store";
import { useUIStore } from "@/store/use-ui-store";
import type { CategoryId } from "@/types";

/**
 * The dashboard's main column: every learning track, each with its own task
 * list.
 *
 * Filtering happens once over the whole task set and the result is bucketed by
 * category — nine cards each running their own `filter()` would be nine passes
 * over the same array on every keystroke of the search box.
 */
export function CategorySections() {
  const { categories } = useRoadmap();
  const tasks = useRoadmapStore((s) => s.tasks);
  const filters = useUIStore((s) => s.filters);
  const sort = useUIStore((s) => s.sort);
  const collapsedIds = useUIStore((s) => s.collapsedCategories);
  const setAllCollapsed = useUIStore((s) => s.setAllCollapsed);
  const hasActiveFilters = useHasActiveFilters();

  const visibleByCategory = React.useMemo(() => {
    const filtered = sortTasks(filterTasks(tasks, filters), sort);
    const buckets = new Map<CategoryId, typeof tasks>();
    for (const category of CATEGORIES) buckets.set(category.id, []);
    for (const task of filtered) buckets.get(task.categoryId)?.push(task);
    return buckets;
  }, [tasks, filters, sort]);

  // While filtering, a track with no matches is noise — hide it rather than
  // showing nine "no results" cards.
  const sections = categories.filter((data) => {
    if (data.total === 0) return false;
    if (!hasActiveFilters) return true;
    return (visibleByCategory.get(data.category.id)?.length ?? 0) > 0;
  });

  const allCollapsed = collapsedIds.length >= sections.length && sections.length > 0;

  if (sections.length === 0) {
    return (
      <EmptyState
        icon={Layers}
        title="No categories match your filters"
        description="Every track is hidden by the current search or filters. Clear them to see your full roadmap."
      />
    );
  }

  return (
    <section aria-label="Learning categories" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold tracking-tight">Learning Categories</h2>
          <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            {sections.length}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={() =>
            setAllCollapsed(allCollapsed ? [] : sections.map((s) => s.category.id))
          }
        >
          {allCollapsed ? (
            <ChevronsUpDown className="size-3.5" />
          ) : (
            <ChevronsDownUp className="size-3.5" />
          )}
          {allCollapsed ? "Expand all" : "Collapse all"}
        </Button>
      </div>

      <motion.div
        variants={staggerContainer(0.06)}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {sections.map((data) => (
          <CategoryCard
            key={data.category.id}
            data={data}
            visibleTasks={visibleByCategory.get(data.category.id) ?? []}
          />
        ))}
      </motion.div>
    </section>
  );
}
