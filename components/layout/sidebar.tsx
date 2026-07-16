"use client";

import { Flame } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { NavLinks } from "@/components/layout/nav-links";
import { ProfileCard } from "@/components/layout/profile-card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { useHydrated } from "@/hooks/use-hydrated";
import { useRoadmap } from "@/hooks/use-roadmap";
import { useUIStore } from "@/store/use-ui-store";

/**
 * Shared sidebar body. Rendered twice — once in the fixed desktop rail, once
 * inside the mobile Sheet — so navigation can never drift between the two.
 */
function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const { streak } = useRoadmap();
  const hydrated = useHydrated();

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="px-2 pt-2">
        <Logo />
      </div>

      <div className="flex-1 overflow-y-auto thin-scrollbar">
        <NavLinks onNavigate={onNavigate} />
      </div>

      {/* Streak nudge — the one piece of state worth carrying on every screen. */}
      {hydrated && streak > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-warning/20 bg-warning/[0.06] p-3">
          <div className="absolute -right-6 -top-6 size-16 rounded-full bg-warning/20 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-warning/15">
              <Flame className="size-4 text-warning" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight">{streak} day streak</p>
              <p className="truncate text-xs text-muted-foreground">Don&apos;t break it today</p>
            </div>
          </div>
        </div>
      )}

      <ProfileCard />
    </div>
  );
}

/** Fixed navigation rail. Hidden below `lg`, where the drawer takes over. */
export function DesktopSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-background/80 backdrop-blur-xl lg:block">
      <SidebarBody />
    </aside>
  );
}

/** The `lg`-and-below drawer. Open state lives in the UI store so the header
 *  trigger and the drawer stay decoupled. */
export function MobileSidebar() {
  const open = useUIStore((s) => s.sidebarOpen);
  const setOpen = useUIStore((s) => s.setSidebarOpen);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-72 border-border p-0" hideClose>
        {/* Radix requires an accessible title on every dialog; it's visually
            redundant next to the logo, so it's screen-reader only. */}
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SheetDescription className="sr-only">
          Main navigation for Developer Goals
        </SheetDescription>
        <SidebarBody onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
