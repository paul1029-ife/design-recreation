import type { PatternMeta } from "@/patterns/types";

export const meta = {
  slug: "order-status",
  name: "Order Status",
  problem:
    "A status that only ever renders its current value makes people re-read the whole card to work out whether anything actually moved since they last looked.",
  category: "feedback",
  domains: ["commerce", "dashboard"],
  tags: ["progress", "timeline", "status", "gsap"],
  difficulty: "advanced",
  keyboard: false,
  touch: true,
  reducedMotion: true,
  responsive: true,
  featured: false,
  dependencies: ["gsap", "motion"],
  credit: {
    author: "tanjim38",
    url: "https://x.com/tanjim38/status/1979876452851183892",
  },
  added: "2026-08-17",
  status: "stable",
} as const satisfies PatternMeta;

export default meta;
