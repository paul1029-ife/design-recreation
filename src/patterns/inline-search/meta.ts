import type { PatternMeta } from "@/patterns/types";

export const meta = {
  slug: "inline-search",
  name: "Inline Search",
  problem:
    "Search needs room to type and the browse filters are already using it, so one has to give — and sending search to its own screen takes the filters away with it.",
  category: "navigation",
  domains: ["search", "commerce", "media"],
  tags: ["search", "filters", "expanding", "toolbar"],
  difficulty: "intermediate",
  keyboard: true,
  touch: true,
  reducedMotion: true,
  responsive: true,
  featured: true,
  dependencies: ["motion", "lucide-react"],
  credit: {
    author: "nitishkmrk",
    url: "https://x.com/nitishkmrk/status/1991956289731239936",
  },
  added: "2026-08-11",
  status: "stable",
} as const satisfies PatternMeta;

export default meta;
