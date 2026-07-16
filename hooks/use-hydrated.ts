"use client";

import { useEffect, useState } from "react";

import { useRoadmapStore } from "@/store/use-roadmap-store";

/**
 * True once the persisted store has rehydrated AND React has committed a first
 * pass. Data-driven surfaces show a skeleton until it flips.
 *
 * This MUST start `false` on every render path, server and client alike.
 *
 * The subtlety: `localStorage` is synchronous, so zustand finishes rehydrating
 * during module evaluation — before React renders anything. Seeding this from
 * `persist.hasHydrated()` therefore returns `true` on the client's first render
 * while the server (no localStorage, no `persist` API) rendered `false`. The two
 * trees disagree and React throws a hydration error — the guard against
 * mismatches becomes the cause of one.
 *
 * Starting `false` unconditionally makes the first client render byte-identical
 * to the server's, and the effect below — which only ever runs on the client,
 * after commit — is what safely reveals the real data.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persist = useRoadmapStore.persist;

    // Sync storage: already done before we got here, so just open the gate.
    if (!persist || persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    // Async storage engine: wait for it to land.
    return persist.onFinishHydration(() => setHydrated(true));
  }, []);

  return hydrated;
}
