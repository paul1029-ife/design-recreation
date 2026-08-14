import type { PatternCategory, PatternDomain, PatternMeta } from "./types";

import { meta as copyFeedback } from "./copy-feedback/meta";
import { meta as createMenu } from "./create-menu/meta";
import { meta as deleteWithUndo } from "./delete-with-undo/meta";
import { meta as editableLabel } from "./editable-label/meta";
import { meta as expandingSegments } from "./expanding-segments/meta";
import { meta as inlineConfirm } from "./inline-confirm/meta";
import { meta as inlineOverflow } from "./inline-overflow/meta";
import { meta as inlineSearch } from "./inline-search/meta";
import { meta as inviteCard } from "./invite-card/meta";
import { meta as speedDial } from "./speed-dial/meta";
import { meta as splitActions } from "./split-actions/meta";
import { meta as splittingAccordion } from "./splitting-accordion/meta";

/**
 * The single source of truth for the gallery, search, filtering and routing.
 * A pattern absent from here does not exist.
 *
 * Metadata only — deliberately no component references. Keeping this module
 * free of client components lets server components import it for
 * generateMetadata, static params and browse pages without pulling every
 * pattern's JavaScript into the bundle. Demos are resolved separately in
 * `demos.ts`.
 *
 * Ordering is explicit rather than insertion-order, so the list is stable.
 */
const ALL: readonly PatternMeta[] = [
  splittingAccordion,
  inlineConfirm,
  deleteWithUndo,
  splitActions,
  editableLabel,
  copyFeedback,
  expandingSegments,
  createMenu,
  speedDial,
  inlineOverflow,
  inlineSearch,
  inviteCard,
];

/** Public patterns, newest first. Drafts are excluded. */
export const registry: readonly PatternMeta[] = [...ALL]
  .filter((pattern) => pattern.status !== "draft")
  .sort(
    (a, b) => b.added.localeCompare(a.added) || a.name.localeCompare(b.name),
  );

const bySlug = new Map(registry.map((pattern) => [pattern.slug, pattern]));

export function getPattern(slug: string): PatternMeta | undefined {
  return bySlug.get(slug);
}

export function getPatternSlugs(): string[] {
  return registry.map((pattern) => pattern.slug);
}

export function getByCategory(category: PatternCategory): PatternMeta[] {
  return registry.filter((pattern) => pattern.category === category);
}

export function getByDomain(domain: PatternDomain): PatternMeta[] {
  return registry.filter((pattern) => pattern.domains.includes(domain));
}

export function getFeatured(): PatternMeta[] {
  return registry.filter((pattern) => pattern.featured);
}

/** Categories that actually have patterns, so browse never renders an empty one. */
export function getPopulatedCategories(): PatternCategory[] {
  return [...new Set(registry.map((pattern) => pattern.category))].sort();
}

export function getPopulatedDomains(): PatternDomain[] {
  return [...new Set(registry.flatMap((pattern) => pattern.domains))].sort();
}
