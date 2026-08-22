import type { PatternMeta } from "@/patterns/types";

export const meta = {
  slug: "copy-feedback",
  name: "Copy Feedback",
  problem:
    "Nothing distinguishes a successful copy from a missed click, so people press Copy repeatedly and still do not trust that it worked.",
  category: "feedback",
  domains: ["productivity", "authentication", "dashboard"],
  tags: ["status", "confirmation", "progress", "inline"],
  difficulty: "beginner",
  keyboard: true,
  touch: true,
  reducedMotion: true,
  responsive: true,
  featured: false,
  dependencies: ["motion", "lucide-react"],
  credit: {
    author: "nitishkmrk",
    url: "https://x.com/nitishkmrk/status/1997641234567890123",
  },
  added: "2026-08-09",
  status: "stable",
} as const satisfies PatternMeta;

export default meta;
