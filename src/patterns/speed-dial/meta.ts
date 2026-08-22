import type { PatternMeta } from "@/patterns/types";

export const meta = {
  slug: "speed-dial",
  name: "Speed Dial",
  problem:
    "A floating action button is reachable one-handed but says nothing about what it does, and a menu that answers that arrives as a detached panel outside the thumb arc.",
  category: "disclosure",
  domains: ["productivity", "media", "files"],
  tags: ["radial", "stacked", "compact", "gesture"],
  difficulty: "intermediate",
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
