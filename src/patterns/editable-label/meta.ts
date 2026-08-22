import type { PatternMeta } from "@/patterns/types";

export const meta = {
  slug: "editable-label",
  name: "Editable Label",
  problem:
    "Renaming something usually means leaving for a settings screen, which hides the thing you are renaming at the moment you decide what to call it.",
  category: "input",
  domains: ["productivity", "editor", "forms"],
  tags: ["inline", "rename", "editing", "compact"],
  difficulty: "intermediate",
  keyboard: true,
  touch: true,
  reducedMotion: true,
  responsive: true,
  featured: true,
  dependencies: ["motion", "lucide-react"],
  credit: {
    author: "nitishkmrk",
    url: "https://x.com/nitishkmrk/status/2049797627580207241",
  },
  added: "2026-08-09",
  status: "stable",
} as const satisfies PatternMeta;

export default meta;
