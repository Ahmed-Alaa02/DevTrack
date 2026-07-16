"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Settings2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage, initialsOf } from "@/components/ui/avatar";
import { useHydrated } from "@/hooks/use-hydrated";
import { useRoadmapStore } from "@/store/use-roadmap-store";
import { Skeleton } from "@/components/ui/skeleton";
import { SPRING } from "@/lib/motion";

/**
 * Sidebar footer. Doubles as the entry point to Settings — the whole card is
 * one link target rather than a card with a small icon button inside it.
 */
export function ProfileCard() {
  const profile = useRoadmapStore((s) => s.profile);
  const hydrated = useHydrated();

  if (!hydrated) {
    return <Skeleton className="h-[68px] w-full rounded-2xl" />;
  }

  return (
    <motion.div whileHover={{ y: -2 }} transition={SPRING}>
      <Link
        href="/settings"
        className="group flex items-center gap-3 rounded-2xl border border-border bg-secondary/40 p-3 transition-colors hover:border-primary/30 hover:bg-secondary/70"
      >
        <div className="relative">
          <Avatar className="size-10 ring-1 ring-white/10">
            {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt="" />}
            <AvatarFallback>{initialsOf(profile.name)}</AvatarFallback>
          </Avatar>
          {/* Presence dot — a small sign of life in an otherwise static card. */}
          <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card bg-success" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-tight">{profile.name}</p>
          <p className="truncate text-xs leading-tight text-muted-foreground">
            {profile.role}
          </p>
        </div>

        <Settings2 className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:rotate-90 group-hover:text-foreground" />
      </Link>
    </motion.div>
  );
}
