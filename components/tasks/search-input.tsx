"use client";

import * as React from "react";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/use-ui-store";

/**
 * Global task search. Writes straight to the UI store, so any list on screen
 * filters live — there's no per-page search state to keep in sync.
 *
 * `⌘K` / `Ctrl+K` focuses it, matching the muscle memory this class of app
 * builds. `/` is deliberately not bound: it would hijack typing in the notes
 * editor.
 */
export function SearchInput({ className }: { className?: string }) {
  const query = useUIStore((s) => s.filters.query);
  const setFilter = useUIStore((s) => s.setFilter);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if (event.key === "Escape" && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className={cn("group relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />

      <Input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setFilter("query", e.target.value)}
        placeholder="Search tasks, tags, subtasks…"
        aria-label="Search tasks"
        className="h-10 pl-9 pr-16 [&::-webkit-search-cancel-button]:appearance-none"
      />

      {query ? (
        <button
          type="button"
          onClick={() => setFilter("query", "")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none items-center gap-0.5 rounded-md border border-border bg-secondary/80 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground md:inline-flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      )}
    </div>
  );
}
