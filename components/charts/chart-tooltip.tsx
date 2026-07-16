"use client";

import type { TooltipContentProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

/**
 * One tooltip for every chart in the app.
 *
 * Recharts' default tooltip is a white box with a border — it belongs to a
 * different product. This renders on the app's popover surface, with the series
 * swatch beside the label so identity survives even when the reader can't
 * separate two hues.
 *
 * Typed as `TooltipContentProps`, not `TooltipProps`: Recharts 3 moved `active`,
 * `payload` and `label` out of the public `TooltipProps` (they're injected from
 * chart context now) and exposes this type for custom content components.
 */
/**
 * Recharts' own `formatter` is omitted before intersecting: leaving it in makes
 * the two signatures merge into an overload, and call sites end up inferring
 * `ValueType | undefined` for a value we always hand over as a number. Ours
 * replaces it rather than coexisting with it.
 */
type TooltipEntries = NonNullable<
  TooltipContentProps<ValueType, NameType>["payload"]
>;

type ChartTooltipProps = Partial<
  Omit<TooltipContentProps<ValueType, NameType>, "formatter" | "labelFormatter">
> & {
  formatter?: (value: number, name: string) => string;
  /**
   * Overrides the heading. Receives the hovered payload, so a chart whose axis
   * label is abbreviated can show the full value here instead.
   */
  labelFormatter?: (label: unknown, payload: TooltipEntries) => string;
};

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const heading = labelFormatter ? labelFormatter(label, payload) : label;

  return (
    <div className="rounded-xl border border-border bg-popover/95 px-3 py-2 shadow-lift backdrop-blur-xl">
      {heading != null && heading !== "" && (
        <p className="mb-1 text-xs font-medium text-foreground">{String(heading)}</p>
      )}
      <div className="space-y-0.5">
        {payload.map((entry, index) => {
          const value = Number(entry.value ?? 0);
          const name = String(entry.name ?? "");
          return (
            <div key={index} className="flex items-center gap-2 text-xs">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color ?? entry.payload?.fill }}
              />
              <span className="text-muted-foreground">
                {formatter ? formatter(value, name) : `${name}: ${value}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
