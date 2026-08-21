import type { PatternMeta } from "@/patterns/types";

export const meta = {
  slug: "inline-overflow",
  name: "Inline Overflow",
  problem:
    "A toolbar with more actions than fit has to hide some, and a dropdown moves them to a different surface where they stop feeling like siblings of the primary actions.",
  category: "disclosure",
  domains: ["productivity", "editor", "files"],
  tags: ["toolbar", "overflow", "actions", "elastic"],
  difficulty: "intermediate",
  keyboard: true,
  touch: false,
  reducedMotion: true,
  responsive: true,
  featured: false,
  dependencies: ["motion", "lucide-react", "react-use-measure"],
  credit: {
    author: "nitishkmrk",
    url: "https://x.com/nitishkmrk/status/1976537178088899045",
  },
  added: "2026-08-11",
  status: "stable",
} as const satisfies PatternMeta;

export default meta;
