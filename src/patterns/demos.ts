import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * Slug → demo component.
 *
 * Split out from `registry.ts` so that module stays metadata-only and
 * server-importable. Each demo is loaded with `next/dynamic`, so a page that
 * shows one pattern ships one pattern's JavaScript rather than the whole
 * library's.
 */
export const demos: Record<string, ComponentType> = {
  "splitting-accordion": dynamic(
    () => import("./splitting-accordion/SplittingAccordion.demo"),
  ),
  "inline-confirm": dynamic(() => import("./inline-confirm/InlineConfirm.demo")),
  "delete-with-undo": dynamic(
    () => import("./delete-with-undo/DeleteWithUndo.demo"),
  ),
};

export function getDemo(slug: string): ComponentType | undefined {
  return demos[slug];
}
