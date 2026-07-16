"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpDown, SlidersHorizontal, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHasActiveFilters } from "@/hooks/use-roadmap";
import { CATEGORIES, DIFFICULTY_META, PRIORITY_META, STATUS_META } from "@/lib/constants";
import { EASE_OUT } from "@/lib/motion";
import { useUIStore } from "@/store/use-ui-store";
import type { SortKey } from "@/types";

const SORT_LABELS: Record<SortKey, string> = {
  manual: "Manual order",
  priority: "Priority",
  deadline: "Deadline",
  difficulty: "Difficulty",
  progress: "Progress",
  title: "Title (A–Z)",
};

interface FilterBarProps {
  /** Hidden on views already scoped to one track (a category page). */
  showCategoryFilter?: boolean;
  /** Count of currently matching tasks, shown as live feedback. */
  resultCount?: number;
}

/**
 * Search / filter / sort controls, backed entirely by the UI store.
 *
 * Sorting by anything other than "manual" disables drag & drop downstream —
 * reordering a list that's already sorted by deadline would silently discard
 * the drop, so `TaskList` reads this same `sort` value to decide.
 */
export function FilterBar({ showCategoryFilter = true, resultCount }: FilterBarProps) {
  const filters = useUIStore((s) => s.filters);
  const setFilter = useUIStore((s) => s.setFilter);
  const resetFilters = useUIStore((s) => s.resetFilters);
  const sort = useUIStore((s) => s.sort);
  const setSort = useUIStore((s) => s.setSort);
  const hasActiveFilters = useHasActiveFilters();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <SlidersHorizontal className="size-4" />
        <span className="hidden text-xs font-medium uppercase tracking-wider sm:inline">
          Filter
        </span>
      </div>

      <Select
        value={filters.status}
        onValueChange={(v) => setFilter("status", v as typeof filters.status)}
      >
        <SelectTrigger className="w-auto min-w-32" aria-label="Filter by status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {Object.entries(STATUS_META).map(([value, meta]) => (
            <SelectItem key={value} value={value}>
              {meta.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.priority}
        onValueChange={(v) => setFilter("priority", v as typeof filters.priority)}
      >
        <SelectTrigger className="w-auto min-w-32" aria-label="Filter by priority">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          {Object.entries(PRIORITY_META).map(([value, meta]) => (
            <SelectItem key={value} value={value}>
              {meta.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.difficulty}
        onValueChange={(v) => setFilter("difficulty", v as typeof filters.difficulty)}
      >
        <SelectTrigger
          className="hidden w-auto min-w-32 sm:flex"
          aria-label="Filter by difficulty"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All levels</SelectItem>
          {Object.entries(DIFFICULTY_META).map(([value, meta]) => (
            <SelectItem key={value} value={value}>
              {meta.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showCategoryFilter && (
        <Select
          value={filters.categoryId}
          onValueChange={(v) => setFilter("categoryId", v as typeof filters.categoryId)}
        >
          <SelectTrigger
            className="hidden w-auto min-w-36 md:flex"
            aria-label="Filter by category"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="ml-auto flex items-center gap-2">
        {typeof resultCount === "number" && (
          <Badge variant="neutral" className="hidden font-mono sm:inline-flex">
            {resultCount} {resultCount === 1 ? "task" : "tasks"}
          </Badge>
        )}

        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-auto min-w-36" aria-label="Sort tasks">
            <ArrowUpDown className="size-3.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, width: 0 }}
              animate={{ opacity: 1, scale: 1, width: "auto" }}
              exit={{ opacity: 0, scale: 0.9, width: 0 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
            >
              <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1.5">
                <X className="size-3.5" />
                Clear
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
