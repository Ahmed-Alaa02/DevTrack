import { cn } from "@/lib/utils";

/**
 * Placeholder shown while the persisted store rehydrates. Sized by the caller
 * to match the real content's footprint so nothing shifts when data lands.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-secondary/50",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-white/[0.04] after:to-transparent",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
