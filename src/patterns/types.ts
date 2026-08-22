/**
 * The metadata contract every pattern must satisfy.
 *
 * This is what powers search, filtering, category and domain browse pages, and
 * the pattern detail routes. Weak metadata makes a pattern undiscoverable,
 * which makes it worthless regardless of how good the interaction is.
 *
 * Enforced mechanically by .claude/skills/library-maintainer/scripts/audit.mjs.
 */

/**
 * What the pattern *does*. Closed set, exactly one per pattern.
 *
 * This is the primary axis because every entry stays populated. Compare
 * PatternDomain, which is the axis people browse by but which would leave
 * several categories empty at this library's size.
 */
export type PatternCategory =
  | "navigation" // moving between places: nav, tabs, breadcrumbs, palettes
  | "input" // entering data: fields, editable chips, pickers
  | "feedback" // system → user: toasts, confirms, progress, status
  | "disclosure" // revealing: accordions, popovers, overflow, expanders
  | "selection" // choosing: menus, listboxes, switchers, filters
  | "action" // committing: buttons, split actions, destructive flows
  | "layout"; // arrangement: cards, panels, adaptive containers

/**
 * What the pattern is *for*. Multi-valued, 1–3 per pattern.
 *
 * Deliberately separate from PatternCategory. Using these 13 as primary
 * categories across ~20 patterns would average 1.3 each and leave several
 * empty, which reads as an unfinished library. As a second axis they give the
 * "show me AI patterns" browse without that collapse, and a pattern can
 * legitimately be both `ai` and `messaging`.
 */
export type PatternDomain =
  | "ai"
  | "commerce"
  | "authentication"
  | "messaging"
  | "forms"
  | "dashboard"
  | "editor"
  | "productivity"
  | "search"
  | "files"
  | "accessibility"
  | "media"
  | "onboarding";

/** Implementation complexity for someone adopting it, not for its author. */
export type PatternDifficulty = "beginner" | "intermediate" | "advanced";

/** `draft` is excluded from the public gallery. */
export type PatternStatus = "draft" | "stable" | "deprecated";

/** Runtime dependencies beyond react and tailwind. */
export type PatternDependency =
  "motion" | "gsap" | "lucide-react" | "react-use-measure";

export interface PatternMeta {
  /** kebab-case, matches the directory name. Stable — it is the URL. */
  readonly slug: string;
  /** Human title, Title Case. */
  readonly name: string;
  /**
   * The UX problem in one sentence a PM would recognise.
   * Not a description of the animation.
   */
  readonly problem: string;
  readonly category: PatternCategory;
  readonly domains: readonly PatternDomain[];
  /** 2–5, lowercase. Free-text search fuel. */
  readonly tags: readonly string[];
  readonly difficulty: PatternDifficulty;

  /*
   * Support flags. These are claims that get audited — setting one true
   * without the support in place is worse than false, because it is a promise
   * the library breaks.
   */
  /** Task completable with the keyboard alone. */
  readonly keyboard: boolean;
  /** ≥44px targets, no hover-only affordance. */
  readonly touch: boolean;
  /** prefers-reduced-motion respected: travel removed, information kept. */
  readonly reducedMotion: boolean;
  /** Works at 320px, at 200% zoom, and inside a 280px container. */
  readonly responsive: boolean;

  /** Surfaced on the homepage. Keep to ~6 across the whole library. */
  readonly featured: boolean;
  readonly dependencies: readonly PatternDependency[];
  /** Original design, where this is a recreation or adaptation. */
  readonly credit?: { readonly author: string; readonly url: string };
  /** ISO date. Powers "Recently added". */
  readonly added: string;
  readonly status: PatternStatus;
}

/** Human labels for the closed category set, for browse UI. */
export const CATEGORY_LABELS: Record<PatternCategory, string> = {
  navigation: "Navigation",
  input: "Input",
  feedback: "Feedback",
  disclosure: "Disclosure",
  selection: "Selection",
  action: "Action",
  layout: "Layout",
};

export const DOMAIN_LABELS: Record<PatternDomain, string> = {
  ai: "AI",
  commerce: "Commerce",
  authentication: "Authentication",
  messaging: "Messaging",
  forms: "Forms",
  dashboard: "Dashboard",
  editor: "Editor",
  productivity: "Productivity",
  search: "Search",
  files: "Files",
  accessibility: "Accessibility",
  media: "Media",
  onboarding: "Onboarding",
};
