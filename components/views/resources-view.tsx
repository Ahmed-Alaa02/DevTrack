"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ExternalLink, Library, Link2 } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { SearchInput } from "@/components/tasks/search-input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useHydrated } from "@/hooks/use-hydrated";
import { useRoadmap } from "@/hooks/use-roadmap";
import { ACCENTS, CATEGORY_MAP } from "@/lib/constants";
import { cardHover, fadeUp, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/use-ui-store";
import type { CategoryId } from "@/types";

interface ResourceEntry {
  url: string;
  label: string;
  categoryId: CategoryId;
  /** Titles of every task that links here — a resource can serve several. */
  usedBy: string[];
}

/**
 * The library, assembled from the roadmap rather than maintained beside it.
 *
 * Resources live on tasks (`Task.resources`); this view derives the catalogue by
 * flattening and de-duplicating them by URL. That means a link is never orphaned
 * from the work it belongs to, and there's no second list to keep in sync.
 */
export function ResourcesView() {
  const { tasks } = useRoadmap();
  const query = useUIStore((s) => s.filters.query);
  const hydrated = useHydrated();

  const resources = React.useMemo(() => {
    const byUrl = new Map<string, ResourceEntry>();

    for (const task of tasks) {
      for (const resource of task.resources) {
        const existing = byUrl.get(resource.url);
        if (existing) {
          existing.usedBy.push(task.title);
        } else {
          byUrl.set(resource.url, {
            url: resource.url,
            label: resource.label,
            categoryId: task.categoryId,
            usedBy: [task.title],
          });
        }
      }
    }

    const all = [...byUrl.values()];
    const q = query.trim().toLowerCase();
    if (!q) return all;

    return all.filter(
      (r) =>
        r.label.toLowerCase().includes(q) ||
        r.url.toLowerCase().includes(q) ||
        r.usedBy.some((t) => t.toLowerCase().includes(q)),
    );
  }, [tasks, query]);

  const grouped = React.useMemo(() => {
    const map = new Map<CategoryId, ResourceEntry[]>();
    for (const resource of resources) {
      const list = map.get(resource.categoryId) ?? [];
      list.push(resource);
      map.set(resource.categoryId, list);
    }
    return [...map.entries()];
  }, [resources]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-12 w-72" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        eyebrow="Library"
        title="Resources"
        description="Every link attached to a task on your roadmap, collected in one place. Add more by attaching them to the work they belong to."
        actions={
          <Badge variant="violet" className="font-mono">
            {resources.length} links
          </Badge>
        }
      />

      <div className="max-w-md sm:hidden">
        <SearchInput />
      </div>

      {grouped.length === 0 ? (
        <EmptyState
          icon={Library}
          title={query ? "No resources match that search" : "No resources yet"}
          description={
            query
              ? "Try a different term, or clear the search to see the whole library."
              : "Resources appear here automatically once you attach links to your tasks."
          }
        />
      ) : (
        <motion.div
          variants={staggerContainer(0.06)}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {grouped.map(([categoryId, entries]) => {
            const category = CATEGORY_MAP[categoryId];
            const accent = ACCENTS[category.accent];
            const Icon = category.icon;

            return (
              <motion.section key={categoryId} variants={fadeUp} className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg border",
                      accent.softBg,
                      accent.border,
                    )}
                  >
                    <Icon className={cn("size-3.5", accent.text)} />
                  </div>
                  <h2 className="text-sm font-semibold tracking-tight">{category.name}</h2>
                  <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {entries.length}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {entries.map((resource) => (
                    <motion.a
                      key={resource.url}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      {...cardHover}
                      className="block"
                    >
                      <Card className="group h-full p-4 transition-colors hover:border-primary/30">
                        <div className="flex items-start gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary/60">
                            <Link2 className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate text-sm font-medium">{resource.label}</p>
                              <ExternalLink className="size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                            </div>
                            <p className="truncate font-mono text-[11px] text-muted-foreground">
                              {hostOf(resource.url)}
                            </p>
                            <p className="mt-1.5 truncate text-[11px] text-muted-foreground/80">
                              {resource.usedBy.join(" · ")}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </motion.a>
                  ))}
                </div>
              </motion.section>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

/** Bare hostname for display. Falls back to the raw string on an unparseable URL. */
function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
