import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors [&_svg]:size-3",
  {
    variants: {
      /**
       * Accent variants are enumerated rather than generated so Tailwind's
       * JIT can see every class name at build time.
       */
      variant: {
        neutral: "border-border bg-secondary/60 text-muted-foreground",
        violet: "border-violet/25 bg-violet/10 text-violet",
        indigo: "border-indigo/25 bg-indigo/10 text-indigo",
        blue: "border-info/25 bg-info/10 text-info",
        green: "border-success/25 bg-success/10 text-success",
        orange: "border-warning/25 bg-warning/10 text-warning",
        red: "border-danger/25 bg-danger/10 text-danger",
        outline: "border-border text-foreground",
      },
      size: {
        sm: "px-2 py-0 text-[10px]",
        default: "px-2.5 py-0.5 text-xs",
      },
    },
    defaultVariants: { variant: "neutral", size: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
