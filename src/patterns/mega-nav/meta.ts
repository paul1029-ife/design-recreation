import type { PatternMeta } from "@/patterns/types";

export const meta = {
  slug: "mega-nav",
  name: "Mega Nav",
  problem:
    "Separate dropdowns per section make each one feel like a different place, so browsing across a product's navigation hides the fact that the sections are siblings.",
  category: "navigation",
  domains: ["productivity", "dashboard", "onboarding"],
  tags: ["nav", "dropdown", "mega-menu", "hover"],
  difficulty: "advanced",
  keyboard: true,
  touch: true,
  reducedMotion: true,
  responsive: false,
  featured: true,
  dependencies: ["motion", "lucide-react"],
  credit: {
    author: "Stripe",
    url: "https://stripe.com",
  },
  added: "2026-08-18",
  status: "stable",
} as const satisfies PatternMeta;

export default meta;
