"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useHydrated } from "@/hooks/use-hydrated";
import { useRoadmapStore } from "@/store/use-roadmap-store";

/**
 * The theme switch is fully wired — it writes to the store, which the
 * `ThemeProvider` mirrors onto `<html class>`. The app ships dark-only by
 * design; the light token set exists in `globals.css`, so turning this on is a
 * product decision rather than an engineering task.
 */
export function ThemeToggle() {
  const theme = useRoadmapStore((s) => s.theme);
  const setTheme = useRoadmapStore((s) => s.setTheme);
  const hydrated = useHydrated();

  const isDark = theme === "dark";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
          // Before hydration the store still holds its default, so the icon
          // would be a guess. Hiding it avoids a visible flip on load.
          className={hydrated ? undefined : "pointer-events-none opacity-0"}
        >
          <span className="relative flex size-4 items-center justify-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
                transition={{ duration: 0.2 }}
                className="absolute"
              >
                {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
              </motion.span>
            </AnimatePresence>
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{isDark ? "Dark" : "Light"} theme</TooltipContent>
    </Tooltip>
  );
}
