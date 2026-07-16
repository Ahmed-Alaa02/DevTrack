"use client";

import { Menu } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SearchInput } from "@/components/tasks/search-input";
import { AddTaskDialog } from "@/components/tasks/add-task-dialog";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/use-ui-store";

/**
 * Slim sticky command bar. Deliberately holds only *global* controls (search,
 * create, theme) — page identity lives in each route's `PageHeader`, which is
 * why this bar never needs to know which route it's on.
 */
export function Topbar() {
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/70 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation"
        >
          <Menu />
        </Button>

        <div className="lg:hidden">
          <Logo className="[&>div:last-child]:hidden sm:[&>div:last-child]:block" />
        </div>

        <div className="ml-auto flex flex-1 items-center justify-end gap-2 sm:ml-0">
          <div className="hidden max-w-md flex-1 sm:block">
            <SearchInput />
          </div>

          <ThemeToggle />
          <AddTaskDialog />
        </div>
      </div>

      {/* Search drops to its own row on phones rather than competing for width. */}
      <div className="px-4 pb-3 sm:hidden">
        <SearchInput />
      </div>
    </header>
  );
}
