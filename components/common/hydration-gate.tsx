"use client";

import { useHydrated } from "@/hooks/use-hydrated";

interface HydrationGateProps {
  /** Rendered on the server and on the client's first render — must match. */
  fallback: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Holds back a subtree until the persisted store has rehydrated.
 *
 * Use this when a *composition* of components reads persisted state — it keeps
 * one gate and one skeleton at the boundary, rather than each child gating
 * itself and producing a ragged, piecewise reveal.
 *
 * Children may be server-rendered nodes passed down as a slot; they simply
 * aren't committed until the gate opens.
 */
export function HydrationGate({ fallback, children }: HydrationGateProps) {
  const hydrated = useHydrated();
  return <>{hydrated ? children : fallback}</>;
}
