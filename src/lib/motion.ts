import type { Transition } from "motion/react";

/**
 * The library's motion vocabulary.
 *
 * Before this file the repo held 14 distinct spring configurations across 12
 * files — 406/22 and 380/22 among them, which are the same animation to any
 * human eye. That variance was drift, not intent, and it is what makes a set
 * of patterns read as a collection of demos rather than one product.
 *
 * Four springs, four curves, four durations. Deviating requires a comment
 * saying what it was tuned against.
 *
 * Tuning intuition: stiffness = how fast it gets there, damping = how cleanly
 * it stops. Critical damping is damping = 2·√(stiffness · mass); below that it
 * overshoots. The ratio is noted on each entry.
 */

export const spring = {
  /**
   * ratio 0.55 — the house default. Toggles, taps, icon swaps, pill swaps.
   *
   * Overshoots visibly and settles in one pass. This is deliberately springy:
   * the median damping ratio across the patterns this library grew from is
   * 0.564, and that bounce is the thing people recognise. An earlier version
   * of this token sat at 0.75, which is the value a generic design system
   * would pick — and it quietly flattened every migrated pattern.
   */
  snappy: { type: "spring", stiffness: 400, damping: 22, mass: 1 },

  /**
   * ratio 0.90 — layout and size changes only.
   *
   * The one place overshoot is wrong: a container that springs past its
   * target distorts the geometry of whatever is inside it, and text visibly
   * stretches. Damped on purpose, not by neglect.
   */
  smooth: { type: "spring", stiffness: 280, damping: 30, mass: 1 },

  /** ratio 0.67 — larger surfaces. Slower, still has life in the tail. */
  gentle: { type: "spring", stiffness: 200, damping: 19, mass: 1 },

  /** ratio 0.45 — pronounced overshoot. Arrival moments only, never exits. */
  bouncy: { type: "spring", stiffness: 400, damping: 18, mass: 1 },
} as const satisfies Record<string, Transition>;

/**
 * Easing curves, matching the CSS custom properties in globals.css.
 * Never `linear` except for continuous loops and progress that reflects real
 * elapsed time.
 */
export const ease = {
  /** Enter, reveal — decelerate into place. */
  out: [0.165, 0.84, 0.44, 1],
  /** Exit — accelerate away. */
  in: [0.895, 0.03, 0.685, 0.22],
  /** Move A→B, both ends anchored. */
  inOut: [0.77, 0, 0.175, 1],
  /** Long travel that must feel fast. */
  expo: [0.19, 1, 0.22, 1],
} as const;

/**
 * Durations in seconds (Motion's unit).
 * Exit is faster than enter — leaving should feel decisive.
 */
export const duration = {
  /** Tap, hover, checkbox. */
  micro: 0.1,
  /** Exit. */
  fast: 0.15,
  /** Enter, blur reveal, standard state change. */
  standard: 0.22,
  /** Panel, large surface, layout change. */
  slow: 0.35,
} as const;

/**
 * Blur-and-fade, the library's signature enter/exit.
 *
 * Position springs (velocity is meaningful under interruption) while opacity
 * and blur tween — spring-driven opacity flickers at the tail because there is
 * no meaningful "velocity" for a fade.
 *
 * Blur is a paint operation: affordable under ~200px, never on a large
 * surface. Cap the radius at 16px, above which the element is an unreadable
 * smear before it is invisible and reads as a rendering bug.
 */
export const blurTransition = {
  duration: duration.standard,
  ease: ease.out,
} as const;

export const stageTransition = {
  layout: spring.smooth,
  opacity: blurTransition,
  filter: blurTransition,
} as const;

/**
 * Stagger step that stays within the 200ms total budget.
 * Past ~5 children, stop staggering and animate the container instead —
 * 8 items at 60ms is 480ms before the interface is usable.
 */
export const STAGGER_STEP = 0.05;
export const STAGGER_MAX_TOTAL = 0.2;

export function staggerStep(count: number): number {
  return Math.min(STAGGER_STEP, STAGGER_MAX_TOTAL / Math.max(count - 1, 1));
}
