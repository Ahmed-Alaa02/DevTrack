import { CategorySections } from "@/components/categories/category-sections";
import { CategorySectionsSkeleton } from "@/components/categories/category-sections-skeleton";
import { HydrationGate } from "@/components/common/hydration-gate";
import { Greeting } from "@/components/dashboard/greeting";
import { StatCards } from "@/components/dashboard/stat-cards";
import { StatsPanel } from "@/components/panel/stats-panel";
import { FilterBar } from "@/components/tasks/filter-bar";

/**
 * The dashboard.
 *
 * A server component that composes client islands — the page itself ships no
 * JavaScript. The two-column split only engages at `xl`; below that the stats
 * panel stacks under the roadmap instead of disappearing, so a phone still gets
 * the full picture, just linearised.
 */
export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-8">
      <Greeting />
      <StatCards />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Both children read persisted state — the filter bar's sort/filters
            and the category stack's tasks and collapse state — so they share a
            single gate rather than flashing in one at a time. */}
        <div className="min-w-0">
          <HydrationGate fallback={<CategorySectionsSkeleton />}>
            <div className="space-y-5">
              <FilterBar />
              <CategorySections />
            </div>
          </HydrationGate>
        </div>

        {/* Sticky so the panel stays with the reader through a long roadmap;
            it scrolls independently once it outgrows the viewport. */}
        <div className="xl:sticky xl:top-22 xl:h-[calc(100vh-7rem)] xl:overflow-y-auto xl:pr-1 xl:thin-scrollbar">
          <StatsPanel />
        </div>
      </div>
    </div>
  );
}
