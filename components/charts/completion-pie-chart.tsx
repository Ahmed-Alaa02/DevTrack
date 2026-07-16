"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { CHART_INK, STATUS_COLORS } from "@/lib/chart-palette";
import { percent } from "@/lib/utils";
import type { TaskStatus } from "@/types";

interface CompletionPieChartProps {
  data: { key: TaskStatus; name: string; value: number }[];
  height?: number;
}

/**
 * Task completion by status.
 *
 * A donut rather than a pie: the hole holds the total, turning a chart that's
 * bad at precise comparison into a chart plus a headline number — which is what
 * a reader actually wants here.
 *
 * Three slices is the ceiling for this form. The legend below carries a swatch
 * *and* a label *and* the count, so the required secondary encoding is present
 * and the colours never have to be told apart on their own.
 */
export function CompletionPieChart({ data, height = 200 }: CompletionPieChartProps) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <div className="space-y-4">
      <div className="relative">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="62%"
              outerRadius="88%"
              // A 2px surface-coloured gap between segments; without it adjacent
              // slices fuse into one shape at small sizes.
              paddingAngle={2}
              stroke={CHART_INK.surface}
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
              animationDuration={700}
            >
              {data.map((slice) => (
                <Cell key={slice.key} fill={STATUS_COLORS[slice.key]} />
              ))}
            </Pie>

            <Tooltip
              content={
                <ChartTooltip
                  formatter={(value, name) =>
                    `${name}: ${value} (${percent(value, total)}%)`
                  }
                />
              }
            />
          </PieChart>
        </ResponsiveContainer>

        {/* The hero number lives in the hole. Pointer-events off so it never
            blocks a slice hover. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tabular-nums">{total}</span>
          <span className="text-[11px] text-muted-foreground">tasks</span>
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-1.5">
        {data.map((slice) => (
          <li key={slice.key} className="flex items-center gap-2 text-xs">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[slice.key] }}
            />
            <span className="text-muted-foreground">{slice.name}</span>
            <span className="ml-auto font-mono tabular-nums text-foreground">
              {slice.value}
            </span>
            <span className="w-9 text-right font-mono tabular-nums text-muted-foreground">
              {percent(slice.value, total)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
