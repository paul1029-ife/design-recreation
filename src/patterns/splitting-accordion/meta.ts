import type { PatternMeta } from "@/patterns/types";

export const meta = {
  slug: "splitting-accordion",
  name: "Splitting Accordion",
  problem:
    "An open accordion panel shares its container with every other row, so the boundary between the answer you opened and the questions you did not is ambiguous.",
  category: "disclosure",
  domains: ["productivity", "onboarding"],
  tags: ["accordion", "faq", "expand", "grouping"],
  difficulty: "advanced",
  keyboard: true,
  touch: true,
  reducedMotion: true,
  responsive: true,
  featured: true,
  dependencies: ["motion", "lucide-react"],
  added: "2026-08-07",
  status: "stable",
} as const satisfies PatternMeta;

export default meta;
