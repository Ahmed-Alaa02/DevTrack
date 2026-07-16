"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { CHART_INK, CHART_PRIMARY } from "@/lib/chart-palette";
import { weekdayLabel } from "@/lib/utils";
import type { ActivityDay } from "@/types";

interface WeeklyProgressChartProps {
  data: ActivityDay[];
  height?: number;
}

/**
 * Tasks completed per day over the last week.
 *
 * One measure, so one hue and no legend — the card title names the series.
 * An area (not a line) because the shape communicates "volume of work done",
 * and the gradient fill fades out downward so the mark stays light against
 * a dark surface instead of becoming a heavy block.
 */
export function WeeklyProgressChart({ data, height = 180 }: WeeklyProgressChartProps) {
  const series = data.map((day) => ({
    day: weekdayLabel(day.date),
    date: day.date,
    tasks: day.tasksCompleted,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
        <defs>
          <linearGradient id="weekly-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_PRIMARY} stopOpacity={0.45} />
            <stop offset="100%" stopColor={CHART_PRIMARY} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {/* Horizontal rules only — vertical grid lines add ink without adding
            information when the x-axis is already labelled per point. */}
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={CHART_INK.grid}
          vertical={false}
        />

        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tick={{ fill: CHART_INK.axis, fontSize: 11 }}
          dy={4}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: CHART_INK.axis, fontSize: 11 }}
          allowDecimals={false}
          width={40}
        />

        <Tooltip
          cursor={{ stroke: CHART_INK.grid, strokeWidth: 1 }}
          content={
            <ChartTooltip
              formatter={(value) => `${value} ${value === 1 ? "task" : "tasks"} completed`}
            />
          }
        />

        <Area
          type="monotone"
          dataKey="tasks"
          name="Tasks"
          stroke={CHART_PRIMARY}
          strokeWidth={2}
          fill="url(#weekly-fill)"
          // Dots appear on hover only; a marker on every point is noise at this size.
          dot={false}
          activeDot={{
            r: 4,
            fill: CHART_PRIMARY,
            // 2px surface ring keeps the marker legible where it overlaps the fill.
            stroke: CHART_INK.surface,
            strokeWidth: 2,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
