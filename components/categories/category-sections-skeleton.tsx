import { Skeleton } from "@/components/ui/skeleton";

/**
 * Placeholder for the filter bar + category stack.
 *
 * Sized to the real thing's footprint (a 36px control row, then category cards
 * at their collapsed header height) so the gate opening doesn't shove the page
 * around.
 */
export function CategorySectionsSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-32 rounded-xl" />
        ))}
        <Skeleton className="ml-auto h-9 w-36 rounded-xl" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
