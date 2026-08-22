import type { PatternMeta } from "@/patterns/types";

export const meta = {
  slug: "inline-confirm",
  name: "Inline Confirm",
  problem:
    "A modal confirmation breaks flow and trains people to dismiss without reading, at which point it has stopped confirming anything.",
  category: "feedback",
  domains: ["productivity", "dashboard"],
  tags: ["confirmation", "async", "status", "inline"],
  difficulty: "intermediate",
  keyboard: true,
  touch: true,
  reducedMotion: true,
  responsive: true,
  featured: true,
  dependencies: ["motion", "lucide-react"],
  credit: {
    author: "nitishkmrk",
    url: "https://x.com/nitishkmrk/status/2054518189019783553",
  },
  added: "2026-08-07",
  status: "stable",
} as const satisfies PatternMeta;

export default meta;
