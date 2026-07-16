"use client";

import * as React from "react";

import { useRoadmapStore } from "@/store/use-roadmap-store";

/**
 * Mirrors the persisted theme onto `<html class>`, which is what Tailwind's
 * `darkMode: "class"` reads. `layout.tsx` renders `<html class="dark">` up
 * front so the first paint is already dark — this effect only takes over once
 * the store rehydrates, which is why there's no flash of light content.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useRoadmapStore((s) => s.theme);

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
  }, [theme]);

  return <>{children}</>;
}
