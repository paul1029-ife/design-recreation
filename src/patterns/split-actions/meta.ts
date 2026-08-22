import type { PatternMeta } from "@/patterns/types";

export const meta = {
  slug: "split-actions",
  name: "Split Actions",
  problem:
    "A generic add button hides what you can actually add, and a dropdown costs a click and covers the content underneath.",
  category: "disclosure",
  domains: ["productivity", "dashboard"],
  tags: ["compact", "inline", "stacked", "contextual"],
  difficulty: "beginner",
  keyboard: true,
  touch: true,
  reducedMotion: true,
  responsive: true,
  featured: false,
  dependencies: ["motion", "lucide-react"],
  credit: {
    author: "nitishkmrk",
    url: "https://x.com/nitishkmrk/status/2054152857591419327",
  },
  added: "2026-08-09",
  status: "stable",
} as const satisfies PatternMeta;

export default meta;
