import type { PatternMeta } from "@/patterns/types";

export const meta = {
  slug: "invite-card",
  name: "Invite Card",
  problem:
    "An invite sent to the wrong address cannot be taken back by the sender, and a bare text field gives you nothing to check before you commit.",
  category: "input",
  domains: ["forms", "productivity", "onboarding"],
  tags: ["invite", "chips", "share", "validation"],
  difficulty: "advanced",
  keyboard: true,
  touch: true,
  reducedMotion: true,
  responsive: true,
  featured: true,
  dependencies: ["motion", "lucide-react"],
  credit: {
    author: "nitishkmrk",
    url: "https://x.com/nitishkmrk/status/1803335945120514234",
  },
  added: "2026-08-14",
  status: "stable",
} as const satisfies PatternMeta;

export default meta;
