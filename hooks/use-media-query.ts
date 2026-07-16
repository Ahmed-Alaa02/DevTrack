"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe media query. Always reports `false` on the server and during the
 * first client render, then corrects itself in an effect — matching the server
 * output first is what keeps hydration quiet.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);

    setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/**
 * Motion honours this in two independent places: `MotionConfig reducedMotion="user"`
 * covers Framer, and this hook covers the imperative cases Framer can't see —
 * canvas confetti and the ripple spawner.
 */
export const usePrefersReducedMotion = () =>
  useMediaQuery("(prefers-reduced-motion: reduce)");
