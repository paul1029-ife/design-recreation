import type { ComponentType } from "react";

import CommandPalette from "@/components/recreations/command-keyboard/CommandPalette";

export interface GalleryEntry {
  id: number;
  name: string;
  source: string;
  url: string;
  component: ComponentType;
}

/**
 * Patterns still in the flat pre-migration layout.
 *
 * Shrinks to nothing as Phase 5 moves each one into `src/patterns/`. The names
 * here are still the old mechanism-first ones; they become problem-first on
 * migration, alongside slug redirects.
 */
export const legacyEntries: readonly GalleryEntry[] = [
  {
    id: 2,
    name: "Command Keyboard",
    source: "ydwndr",
    url: "https://x.com/ydwndr/status/1971241276243956025?s=46",
    component: CommandPalette,
  },
];
