import type { PatternMeta } from "@/patterns/types";

export const meta = {
  slug: "create-menu",
  name: "Create Menu",
  problem:
    "A create button does not say what you can make, and a dropdown answers as a list you have to read in sequence to find the one item you came for.",
  category: "selection",
  domains: ["productivity", "dashboard", "editor"],
  tags: ["menu", "command", "compact", "stacked"],
  difficulty: "advanced",
  keyboard: true,
  touch: true,
  reducedMotion: true,
  responsive: true,
  featured: false,
  dependencies: ["motion", "lucide-react"],
  credit: {
    author: "Dmitry Elisov",
    url: "https://www.pinterest.com/pin/107523509848495963/",
  },
  added: "2026-08-09",
  status: "stable",
} as const satisfies PatternMeta;

export default meta;
