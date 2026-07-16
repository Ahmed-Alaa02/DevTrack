"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { CHART_INK, CHART_PRIMARY } from "@/lib/chart-palette";
import { formatHours } from "@/lib/utils";

interface LearningTimeChartProps {
  data: { id: string; name: string; hours: number }[];
  height?: number;
  /** Cap the rows so the panel version stays readable. */
  limit?: number;
}

/**
 * Hours invested per learning track.
 *
 * Horizontal bars because category names are long — a vertical bar chart would
 * force 45° rotated labels, which are measurably slower to read.
 *
 * One hue, not nine. The axis label already names each bar, so colour would be
 * a redundant second encoding of the same variable; nine competing hues would
 * only make the reader work to discover they mean nothing. Opacity carries the
 * ranking instead, which is a legitimate use of magnitude → intensity.
 */
export function LearningTimeChart({ data, height = 200, limit }: LearningTimeChartProps) {
  const rows = (limit ? data.slice(0, limit) : data).map((entry) => ({
    ...entry,
    // Truncate for the axis; the tooltip always shows the full name.
    label: entry.name.length > 18 ? `${entry.name.slice(0, 17)}…` : entry.name,
  }));

  const max = Math.max(...rows.map((r) => r.hours), 1);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={rows}
        layout="vertical"
        margin={{ top: 4, right: 12, bottom: 0, left: 0 }}
        barCategoryGap={6}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={CHART_INK.grid}
          horizontal={false}
        />

        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          tick={{ fill: CHART_INK.axis, fontSize: 11 }}
          tickFormatter={(v) => `${v}h`}
        />
        <YAxis
          type="category"
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: CHART_INK.axis, fontSize: 11 }}
          width={110}
        />

        <Tooltip
          cursor={{ fill: "hsl(240 4% 16% / 0.4)" }}
          content={
            <ChartTooltip
              // The axis label is abbreviated to fit, so the heading is pulled
              // from the untruncated `name` on the row's payload.
              labelFormatter={(_label, entries) =>
                String(entries[0]?.payload?.name ?? "")
              }
              formatter={(value) => `${formatHours(value)} invested`}
            />
          }
        />

        <Bar dataKey="hours" name="Hours" radius={[0, 4, 4, 0]} maxBarSize={14}>
          {rows.map((row) => (
            <Cell
              key={row.id}
              fill={CHART_PRIMARY}
              // Never below 0.45 — the smallest bar must still clear 3:1 contrast.
              fillOpacity={0.45 + (row.hours / max) * 0.55}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
