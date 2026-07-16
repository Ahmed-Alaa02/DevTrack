"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface PanelCardProps {
  title: string;
  icon: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * The shell every stats-panel widget wears: identical header rhythm, identical
 * padding, identical entrance. Widgets supply only their content, which is why
 * the panel reads as one column rather than a stack of unrelated boxes.
 */
export function PanelCard({
  title,
  icon: Icon,
  action,
  children,
  className,
}: PanelCardProps) {
  return (
    <motion.div variants={fadeUp}>
      <Card className={cn("p-5", className)}>
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon className="size-3.5 text-muted-foreground" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {title}
            </h3>
          </div>
          {action}
        </div>
        {children}
      </Card>
    </motion.div>
  );
}
