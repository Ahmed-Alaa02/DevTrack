"use client";

import { DesktopSidebar, MobileSidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

/**
 * The three-region frame: fixed nav rail, sticky command bar, scrolling content.
 *
 * The rail is `position: fixed` and the content is pushed with `lg:pl-64`
 * rather than the two sharing a flex row — that way the main column owns the
 * document scroll (native scrollbar, working `scroll-into-view`, no nested
 * scroll containers) while the rail stays put.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      {/* Ambient mesh wash. Fixed and non-interactive so it never scrolls or
          intercepts a click. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-gradient-mesh"
      />

      <DesktopSidebar />
      <MobileSidebar />

      <div className="lg:pl-64">
        <Topbar />
        <main id="content" className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
