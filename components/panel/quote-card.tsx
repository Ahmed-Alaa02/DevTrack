"use client";

import * as React from "react";
import { Quote as QuoteIcon } from "lucide-react";

import { PanelCard } from "@/components/panel/panel-card";
import { QUOTES } from "@/lib/constants";

/**
 * Quote of the day.
 *
 * Indexed by day-of-year, not `Math.random()` — a random pick would differ
 * between the server render and the client hydration, and React would replace
 * the text mid-paint. This gives one stable quote per calendar day for free.
 */
export function QuoteCard() {
  const quote = React.useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000,
    );
    return QUOTES[dayOfYear % QUOTES.length];
  }, []);

  return (
    <PanelCard title="Quote of the day" icon={QuoteIcon}>
      <figure className="space-y-3">
        <blockquote className="text-sm leading-relaxed text-foreground/90">
          “{quote.text}”
        </blockquote>
        <figcaption className="flex items-center gap-2">
          <span className="h-px w-6 bg-gradient-primary" />
          <span className="text-xs text-muted-foreground">{quote.author}</span>
        </figcaption>
      </figure>
    </PanelCard>
  );
}
