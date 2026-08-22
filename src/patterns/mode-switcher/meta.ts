import type { PatternMeta } from "@/patterns/types";

export const meta = {
  slug: "mode-switcher",
  name: "Mode Switcher",
  problem:
    "A field that behaves differently depending on a mode set somewhere else lets people type the wrong kind of thing, because nothing in the field said which kind it wanted.",
  category: "input",
  domains: ["ai", "productivity", "search"],
  tags: ["composer", "placeholder", "mode", "gsap"],
  difficulty: "advanced",
  keyboard: true,
  touch: true,
  reducedMotion: true,
  responsive: true,
  featured: false,
  dependencies: ["gsap", "motion", "lucide-react"],
  credit: {
    author: "nitishkmrk",
    url: "https://x.com/nitishkmrk/status/1980523444807635342",
  },
  added: "2026-08-17",
  status: "stable",
} as const satisfies PatternMeta;

export default meta;
