import type { PatternMeta } from "@/patterns/types";

export const meta = {
  slug: "quick-select",
  name: "Quick Select",
  problem:
    "A dropdown for two or three choices makes you open a list, read it and aim at a row — three steps to flip something you already understood.",
  category: "selection",
  domains: ["productivity", "files", "editor"],
  tags: ["select", "popover", "segmented", "compact"],
  difficulty: "intermediate",
  keyboard: true,
  touch: true,
  reducedMotion: true,
  responsive: true,
  featured: false,
  dependencies: ["motion", "lucide-react"],
  credit: {
    author: "nitishkmrk",
    url: "https://x.com/nitishkmrk/status/2008234567890123456",
  },
  added: "2026-08-18",
  status: "stable",
} as const satisfies PatternMeta;

export default meta;
