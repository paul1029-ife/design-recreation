import type { PatternMeta } from "@/patterns/types";

export const meta = {
  slug: "expanding-segments",
  name: "Expanding Segments",
  problem:
    "An icon-only row is compact but unlabelled, and labelling every icon will not fit — so people cannot tell what the options are without hovering each one.",
  category: "selection",
  domains: ["productivity", "messaging", "dashboard"],
  tags: ["compact", "adaptive", "selection", "inline"],
  difficulty: "intermediate",
  keyboard: true,
  touch: true,
  reducedMotion: true,
  responsive: true,
  featured: false,
  dependencies: ["motion"],
  credit: {
    author: "nitishkmrk",
    url: "https://x.com/nitishkmrk/status/1997555674411348433",
  },
  added: "2026-08-09",
  status: "stable",
} as const satisfies PatternMeta;

export default meta;
