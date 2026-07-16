"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { NAV_ITEMS } from "@/lib/constants";
import { SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface NavLinksProps {
  /** Called after navigation — lets the mobile drawer close itself. */
  onNavigate?: () => void;
}

/**
 * The active-item pill is a single shared `layoutId` element, so moving between
 * routes slides one highlight rather than cross-fading two. Shared by the
 * desktop sidebar and the mobile drawer — one definition of navigation.
 */
export function NavLinks({ onNavigate }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {isActive && (
              <motion.span
                layoutId="nav-active-pill"
                transition={SPRING}
                className="absolute inset-0 -z-10 rounded-xl border border-white/[0.06] bg-gradient-to-r from-violet/[0.18] to-indigo/[0.08]"
              />
            )}

            {isActive && (
              <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gradient-primary" />
            )}

            <Icon
              className={cn(
                "size-[18px] shrink-0 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground group-hover:text-foreground",
              )}
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
