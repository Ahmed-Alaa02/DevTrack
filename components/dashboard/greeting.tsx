"use client";

import { motion } from "framer-motion";

import { useHydrated } from "@/hooks/use-hydrated";
import { useRoadmap } from "@/hooks/use-roadmap";
import { Skeleton } from "@/components/ui/skeleton";
import { EASE_OUT } from "@/lib/motion";
import { greetingFor } from "@/lib/utils";

/**
 * The dashboard's opening line.
 *
 * The wave is `<motion.span>` rather than a CSS keyframe so it can be tied to
 * the same entrance timeline as the heading — it waves once on arrival instead
 * of looping forever and pulling the eye away from the content.
 */
export function Greeting() {
  const { profile } = useRoadmap();
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-80" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      className="space-y-1.5"
    >
      <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
        <span>
          {greetingFor()}, <span className="text-gradient">{profile.name}</span>
        </span>
        <motion.span
          role="img"
          aria-label="waving hand"
          className="inline-block origin-[70%_70%]"
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, 18, -8, 16, 0] }}
          transition={{ delay: 0.5, duration: 1.1, ease: "easeInOut" }}
        >
          👋
        </motion.span>
      </h1>
      <p className="text-sm text-muted-foreground">
        Keep building. One step every day.
      </p>
    </motion.div>
  );
}
