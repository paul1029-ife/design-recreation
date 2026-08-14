import type { PatternMeta } from "@/patterns/types";

export const meta = {
  slug: "contextual-toolbar",
  name: "Contextual Toolbar",
  problem:
    "A toolbar serving two jobs is either wide enough to show both at once and too big to sit over content, or split in two so you have to find the right one first.",
  category: "layout",
  domains: ["ai", "media", "editor"],
  tags: ["toolbar", "modes", "adaptive", "tabs"],
  difficulty: "intermediate",
  keyboard: true,
  // The mode tabs are 28px circles in a dense pill. The hit area is pushed to
  // 44px tall, but it is 36px wide — under the library's own bar — and getting
  // there would mean spacing the switcher out until it stopped being the small
  // fixed landmark the pattern depends on. Flagged false rather than claimed.
  touch: false,
  reducedMotion: true,
  responsive: true,
  featured: false,
  dependencies: ["motion", "lucide-react"],
  credit: {
    author: "nitishkmrk",
    url: "https://x.com/nitishkmrk/status/2002747455155405041",
  },
  added: "2026-08-14",
  status: "stable",
} as const satisfies PatternMeta;

export default meta;
