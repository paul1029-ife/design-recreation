import type { PatternMeta } from "@/patterns/types";

export const meta = {
  slug: "command-palette",
  name: "Command Palette",
  problem:
    "A palette that arrives as a modal over the page discards the one piece of context people had — where the search box was, and what it was part of.",
  category: "navigation",
  domains: ["productivity", "search", "dashboard"],
  tags: ["command", "search", "shortcut", "filter"],
  difficulty: "advanced",
  keyboard: true,
  touch: true,
  reducedMotion: true,
  responsive: true,
  featured: true,
  dependencies: ["motion", "lucide-react"],
  credit: {
    author: "ydwndr",
    url: "https://x.com/ydwndr/status/1971241276243956025",
  },
  added: "2026-08-18",
  status: "stable",
} as const satisfies PatternMeta;

export default meta;
