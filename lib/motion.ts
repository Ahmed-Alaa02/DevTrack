import type { Transition, Variants } from "framer-motion";

/**
 * One motion vocabulary for the whole app.
 *
 * Durations and easings are defined once here rather than inline per component,
 * which is what keeps a page of independently-built cards feeling like a single
 * designed system instead of a collage.
 */

/** Fast, confident ease-out. The default for anything entering the viewport. */
export const EASE_OUT: Transition["ease"] = [0.16, 1, 0.3, 1];

/** Physical response for hover / press / layout shifts. */
export const SPRING: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 26,
  mass: 0.7,
};

export const SOFT_SPRING: Transition = {
  type: "spring",
  stiffness: 120,
  damping: 20,
  mass: 0.6,
};

/** Parent of a staggered list. Children inherit the timing via `variants`. */
export const staggerContainer = (stagger = 0.05, delay = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_OUT },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: EASE_OUT } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: EASE_OUT } },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE_OUT } },
};

/** Expand / collapse for task details and category bodies. */
export const collapse: Variants = {
  hidden: { height: 0, opacity: 0 },
  show: {
    height: "auto",
    opacity: 1,
    transition: { height: { duration: 0.3, ease: EASE_OUT }, opacity: { duration: 0.2, delay: 0.05 } },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { height: { duration: 0.25, ease: EASE_OUT }, opacity: { duration: 0.15 } },
  },
};

/** The shared "card lifts on hover" gesture. */
export const cardHover = {
  whileHover: { y: -3, transition: SPRING },
  whileTap: { scale: 0.995 },
} as const;
