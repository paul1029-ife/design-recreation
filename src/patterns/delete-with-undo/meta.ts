import type { PatternMeta } from "@/patterns/types";

export const meta = {
  slug: "delete-with-undo",
  name: "Delete with Undo",
  problem:
    "Confirmation dialogs are answered reflexively, so people click through them and lose the thing anyway; deferring the commit is recoverable where a dialog is not.",
  category: "action",
  domains: ["productivity", "dashboard", "authentication"],
  tags: ["destructive", "undo", "confirmation", "progress"],
  difficulty: "intermediate",
  keyboard: true,
  touch: true,
  reducedMotion: true,
  responsive: true,
  featured: true,
  dependencies: ["motion", "lucide-react"],
  credit: {
    author: "nitishkmrk",
    url: "https://x.com/nitishkmrk/status/1986684038409589227",
  },
  added: "2026-08-07",
  status: "stable",
} as const satisfies PatternMeta;

export default meta;
