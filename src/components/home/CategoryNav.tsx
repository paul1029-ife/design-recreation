import type { Route } from "next";
import Link from "next/link";

import type { PatternMeta } from "@/patterns/types";
import { CATEGORY_LABELS } from "@/patterns/types";

/** One-line descriptions, so a category is a promise rather than a bucket. */
const CATEGORY_BLURBS: Record<string, string> = {
  navigation: "Moving between places",
  input: "Entering and editing data",
  feedback: "Telling the user what happened",
  disclosure: "Revealing more without leaving",
  selection: "Choosing from options",
  action: "Committing, safely",
  layout: "Arranging what is on screen",
};

/**
 * Browse by function.
 *
 * Only categories that actually contain patterns are rendered. An empty
 * category is worse than a missing one — it reads as an unfinished library
 * and it wastes a click.
 */
export function CategoryNav({
  patterns,
}: {
  patterns: readonly PatternMeta[];
}) {
  const counts = new Map<string, number>();
  for (const pattern of patterns) {
    counts.set(pattern.category, (counts.get(pattern.category) ?? 0) + 1);
  }

  const populated = [...counts.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  );
  if (populated.length === 0) return null;

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {populated.map(([category, count]) => (
        <li key={category} className="flex">
          <Link
            href={`/patterns/category/${category}` as Route}
            className="focus-ring flex w-full items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-hover"
          >
            <span className="flex flex-col gap-0.5">
              <span className="font-semibold text-content">
                {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
              </span>
              <span className="text-sm text-content-subtle">
                {CATEGORY_BLURBS[category]}
              </span>
            </span>
            <span
              data-tabular
              className="shrink-0 rounded-full bg-surface-subtle px-2 py-0.5 text-sm text-content-muted"
            >
              {count}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default CategoryNav;
