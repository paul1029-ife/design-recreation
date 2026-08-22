"use client";

import { Flame, Heart } from "lucide-react";

import InlineSearch from "./InlineSearch";

/**
 * Gallery demo. Owns the filters and the accent colours — the component takes
 * both as props, because which two views a product browses by, and what colour
 * "selected" is, are its decisions rather than the pattern's.
 */
export default function InlineSearchDemo() {
  return (
    <InlineSearch
      filtersLabel="Browse"
      defaultFilter="favorites"
      filters={[
        {
          id: "popular",
          label: "Popular",
          icon: <Flame fill="currentColor" strokeWidth={1.5} />,
          activeClassName: "bg-rose-100 dark:bg-rose-500/15",
          accentClassName: "text-rose-600 dark:text-rose-400",
        },
        {
          id: "favorites",
          label: "Favorites",
          icon: <Heart fill="currentColor" strokeWidth={1.5} />,
          activeClassName: "bg-rose-100 dark:bg-rose-500/15",
          accentClassName: "text-rose-600 dark:text-rose-400",
        },
      ]}
    />
  );
}
